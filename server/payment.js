import express from 'express';
import pool from './db.js';
import { authenticateToken } from './middleware/auth.js';

const router = express.Router();

/**
 * 创建订单并支付（支持使用算力券）
 * POST /api/payment/create-order
 * 
 * 请求体：
 * {
 *   "resourceType": "gpu_rental",  // 资源类型
 *   "resourceId": 1,                // 资源ID
 *   "quantity": 1,                  // 数量
 *   "duration": 1,                  // 时长（小时）
 *   "totalAmount": 1.80,            // 总金额
 *   "useVoucher": true              // 是否使用算力券
 * }
 */
router.post('/create-order', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const userId = req.user.id;
    const { resourceType, resourceId, quantity, duration, totalAmount, useVoucher = true } = req.body;

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: '订单金额必须大于0'
      });
    }

    await connection.beginTransaction();

    // 1. 创建订单（这里简化，实际项目中应该有专门的订单表）
    const orderNo = `ORD${Date.now()}${Math.floor(Math.random() * 10000)}`;
    
    let remainingAmount = totalAmount;
    let voucherUsed = 0;
    let balanceUsed = 0;
    const paymentDetails = [];

    // 2. 如果使用算力券，先尝试使用算力券支付
    if (useVoucher && resourceType === 'gpu_rental') {
      // 查询可用算力券
      const [vouchers] = await connection.query(
        `SELECT id, balance FROM compute_vouchers 
         WHERE user_id = ? AND status = 'active' AND balance > 0 
         AND (expire_at IS NULL OR expire_at > NOW())
         ORDER BY expire_at ASC, created_at ASC 
         FOR UPDATE`,
        [userId]
      );

      // 使用算力券
      for (const voucher of vouchers) {
        if (remainingAmount <= 0) break;

        const voucherBalance = parseFloat(voucher.balance);
        const useAmount = Math.min(voucherBalance, remainingAmount);

        // 更新算力券余额
        const newBalance = voucherBalance - useAmount;
        const newStatus = newBalance <= 0 ? 'used' : 'active';

        await connection.query(
          `UPDATE compute_vouchers 
           SET balance = ?, status = ?, used_at = IF(? = 'used', NOW(), used_at) 
           WHERE id = ?`,
          [newBalance, newStatus, newStatus, voucher.id]
        );

        // 记录使用记录
        await connection.query(
          `INSERT INTO voucher_usage_records 
           (user_id, voucher_id, order_id, amount, usage_type, description) 
           VALUES (?, ?, NULL, ?, ?, ?)`,
          [userId, voucher.id, useAmount, resourceType, `订单 ${orderNo} 使用算力券`]
        );

        voucherUsed += useAmount;
        remainingAmount -= useAmount;

        paymentDetails.push({
          type: 'voucher',
          voucherId: voucher.id,
          amount: useAmount
        });
      }
    }

    // 3. 如果还有剩余金额，使用账户余额支付
    if (remainingAmount > 0) {
      // 确保用户账户存在
      await connection.query(
        `INSERT INTO user_accounts (user_id, balance, frozen_balance, total_recharge, total_consumption) 
         VALUES (?, 0, 0, 0, 0) 
         ON DUPLICATE KEY UPDATE user_id = user_id`,
        [userId]
      );

      // 查询账户余额
      const [accounts] = await connection.query(
        'SELECT balance FROM user_accounts WHERE user_id = ? FOR UPDATE',
        [userId]
      );

      const currentBalance = parseFloat(accounts[0].balance);

      if (currentBalance < remainingAmount) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `余额不足，还需 ¥${remainingAmount.toFixed(2)}`,
          data: {
            totalAmount,
            voucherUsed,
            balanceRequired: remainingAmount,
            currentBalance
          }
        });
      }

      // 扣除余额
      const balanceBefore = currentBalance;
      const balanceAfter = currentBalance - remainingAmount;

      await connection.query(
        `UPDATE user_accounts 
         SET balance = balance - ?, total_consumption = total_consumption + ? 
         WHERE user_id = ?`,
        [remainingAmount, remainingAmount, userId]
      );

      // 记录账户流水
      await connection.query(
        `INSERT INTO account_transactions 
         (user_id, transaction_no, type, amount, balance_before, balance_after, related_id, related_type, description) 
         VALUES (?, ?, 'consumption', ?, ?, ?, NULL, ?, ?)`,
        [userId, `CSM-${orderNo}`, remainingAmount, balanceBefore, balanceAfter, resourceType, `订单 ${orderNo} 消费`]
      );

      balanceUsed = remainingAmount;
      remainingAmount = 0;

      paymentDetails.push({
        type: 'balance',
        amount: balanceUsed
      });
    }

    await connection.commit();

    res.json({
      success: true,
      message: '订单创建成功',
      data: {
        orderNo,
        totalAmount,
        voucherUsed,
        balanceUsed,
        paymentDetails,
        status: 'paid'
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('创建订单失败:', error);
    res.status(500).json({
      success: false,
      message: '创建订单失败'
    });
  } finally {
    connection.release();
  }
});

/**
 * 查询支付方式（返回可用的支付方式和金额）
 * GET /api/payment/payment-methods
 */
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, resourceType } = req.query;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: '金额必须大于0'
      });
    }

    const totalAmount = parseFloat(amount);

    // 查询账户余额
    const [accounts] = await pool.query(
      'SELECT balance FROM user_accounts WHERE user_id = ?',
      [userId]
    );
    const accountBalance = accounts.length > 0 ? parseFloat(accounts[0].balance) : 0;

    // 查询可用算力券（仅GPU租用可用）
    let voucherBalance = 0;
    if (resourceType === 'gpu_rental') {
      const [vouchers] = await pool.query(
        `SELECT SUM(balance) as total FROM compute_vouchers 
         WHERE user_id = ? AND status = 'active' AND balance > 0 
         AND (expire_at IS NULL OR expire_at > NOW())`,
        [userId]
      );
      voucherBalance = vouchers[0].total ? parseFloat(vouchers[0].total) : 0;
    }

    // 计算支付方案
    let canPayWithVoucher = false;
    let canPayWithBalance = false;
    let canPayWithMixed = false;
    let needRecharge = 0;

    if (resourceType === 'gpu_rental' && voucherBalance >= totalAmount) {
      canPayWithVoucher = true;
    }

    if (accountBalance >= totalAmount) {
      canPayWithBalance = true;
    }

    if (resourceType === 'gpu_rental' && voucherBalance + accountBalance >= totalAmount) {
      canPayWithMixed = true;
    } else if (voucherBalance + accountBalance < totalAmount) {
      needRecharge = totalAmount - voucherBalance - accountBalance;
    }

    res.json({
      success: true,
      data: {
        totalAmount,
        accountBalance,
        voucherBalance: resourceType === 'gpu_rental' ? voucherBalance : 0,
        canPayWithVoucher,
        canPayWithBalance,
        canPayWithMixed,
        needRecharge: needRecharge > 0 ? needRecharge : 0,
        paymentMethods: [
          {
            type: 'voucher',
            name: '算力券',
            available: resourceType === 'gpu_rental',
            balance: voucherBalance,
            canPay: canPayWithVoucher
          },
          {
            type: 'balance',
            name: '账户余额',
            available: true,
            balance: accountBalance,
            canPay: canPayWithBalance
          },
          {
            type: 'mixed',
            name: '算力券+余额',
            available: resourceType === 'gpu_rental',
            balance: voucherBalance + accountBalance,
            canPay: canPayWithMixed
          }
        ]
      }
    });
  } catch (error) {
    console.error('查询支付方式失败:', error);
    res.status(500).json({
      success: false,
      message: '查询支付方式失败'
    });
  }
});

export default router;
