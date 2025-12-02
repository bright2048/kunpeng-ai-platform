import express from 'express';
import pool from './db.js';
import { authenticateToken } from './middleware/auth.js';

const router = express.Router();

// ========================================
// 工具函数
// ========================================

/**
 * 生成订单号
 */
function generateOrderNo() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RCH${timestamp}${random}`;
}

/**
 * 生成算力券编号
 */
function generateVoucherNo(userId) {
  const timestamp = Date.now();
  const userPad = userId.toString().padStart(6, '0');
  return `VCH${timestamp}${userPad}`;
}

// ========================================
// API路由
// ========================================

/**
 * 获取用户账户信息
 * GET /api/billing/account
 */
router.get('/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 查询用户账户信息
    let [accounts] = await pool.query(
      'SELECT * FROM user_accounts WHERE user_id = ?',
      [userId]
    );

    // 如果账户不存在，创建默认账户
    if (accounts.length === 0) {
      await pool.query(
        'INSERT INTO user_accounts (user_id, balance, frozen_balance, total_recharge, total_consumption) VALUES (?, 0, 0, 0, 0)',
        [userId]
      );
      [accounts] = await pool.query(
        'SELECT * FROM user_accounts WHERE user_id = ?',
        [userId]
      );
    }

    const account = accounts[0];

    // 查询可用算力券
    const [vouchers] = await pool.query(
      `SELECT id, voucher_no, amount, balance, source_type, expire_at, created_at 
       FROM compute_vouchers 
       WHERE user_id = ? AND status = 'active' AND balance > 0 
       AND (expire_at IS NULL OR expire_at > NOW())
       ORDER BY expire_at ASC, created_at ASC`,
      [userId]
    );

    // 计算算力券总余额
    const totalVoucherBalance = vouchers.reduce((sum, v) => sum + parseFloat(v.balance), 0);

    res.json({
      success: true,
      data: {
        balance: parseFloat(account.balance),
        frozenBalance: parseFloat(account.frozen_balance),
        totalRecharge: parseFloat(account.total_recharge),
        totalConsumption: parseFloat(account.total_consumption),
        totalVoucherBalance: totalVoucherBalance,
        vouchers: vouchers.map(v => ({
          id: v.id,
          voucherNo: v.voucher_no,
          amount: parseFloat(v.amount),
          balance: parseFloat(v.balance),
          sourceType: v.source_type,
          expireAt: v.expire_at,
          createdAt: v.created_at
        }))
      }
    });
  } catch (error) {
    console.error('获取账户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取账户信息失败'
    });
  }
});

/**
 * 获取充值配置
 * GET /api/billing/recharge-configs
 */
router.get('/recharge-configs', async (req, res) => {
  try {
    const [configs] = await pool.query(
      `SELECT id, amount, gift_ratio, gift_amount, is_recommended, sort_order 
       FROM recharge_configs 
       WHERE status = 'active' 
       ORDER BY sort_order ASC`
    );

    res.json({
      success: true,
      data: configs.map(c => ({
        id: c.id,
        amount: parseFloat(c.amount),
        giftRatio: parseFloat(c.gift_ratio),
        giftAmount: parseFloat(c.gift_amount),
        isRecommended: !!c.is_recommended,
        sortOrder: c.sort_order
      }))
    });
  } catch (error) {
    console.error('获取充值配置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取充值配置失败'
    });
  }
});

/**
 * 创建充值订单
 * POST /api/billing/recharge
 */
router.post('/recharge', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const userId = req.user.id;
    const { amount, paymentMethod = 'alipay' } = req.body;

    // 验证充值金额
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '充值金额必须大于0'
      });
    }

    await connection.beginTransaction();

    // 生成订单号
    const orderNo = generateOrderNo();

    // 创建充值记录
    const [result] = await connection.query(
      `INSERT INTO recharge_records (user_id, order_no, amount, payment_method, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [userId, orderNo, amount, paymentMethod]
    );

    const rechargeId = result.insertId;

    await connection.commit();

    // 返回充值订单信息（实际项目中这里应该调用支付接口）
    res.json({
      success: true,
      data: {
        rechargeId,
        orderNo,
        amount: parseFloat(amount),
        paymentMethod,
        status: 'pending',
        // 模拟支付二维码URL
        qrCodeUrl: `https://example.com/pay/${orderNo}`,
        message: '充值订单创建成功，请完成支付'
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('创建充值订单失败:', error);
    res.status(500).json({
      success: false,
      message: '创建充值订单失败'
    });
  } finally {
    connection.release();
  }
});

/**
 * 模拟支付回调（实际项目中应该是支付平台的回调接口）
 * POST /api/billing/payment-callback
 */
router.post('/payment-callback', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { orderNo, transactionId, status } = req.body;

    if (status !== 'success') {
      return res.json({ success: true, message: '支付未成功' });
    }

    await connection.beginTransaction();

    // 查询充值记录
    const [records] = await connection.query(
      'SELECT * FROM recharge_records WHERE order_no = ? FOR UPDATE',
      [orderNo]
    );

    if (records.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: '充值订单不存在'
      });
    }

    const record = records[0];

    // 检查订单状态
    if (record.status !== 'pending') {
      await connection.rollback();
      return res.json({
        success: true,
        message: '订单已处理'
      });
    }

    const userId = record.user_id;
    const amount = parseFloat(record.amount);

    // 更新充值记录状态
    await connection.query(
      `UPDATE recharge_records 
       SET status = 'success', paid_at = NOW(), transaction_id = ? 
       WHERE id = ?`,
      [transactionId, record.id]
    );

    // 确保用户账户存在
    await connection.query(
      `INSERT INTO user_accounts (user_id, balance, frozen_balance, total_recharge, total_consumption) 
       VALUES (?, 0, 0, 0, 0) 
       ON DUPLICATE KEY UPDATE user_id = user_id`,
      [userId]
    );

    // 获取当前余额
    const [accounts] = await connection.query(
      'SELECT balance FROM user_accounts WHERE user_id = ? FOR UPDATE',
      [userId]
    );
    const balanceBefore = parseFloat(accounts[0].balance);

    // 更新用户余额
    await connection.query(
      `UPDATE user_accounts 
       SET balance = balance + ?, total_recharge = total_recharge + ? 
       WHERE user_id = ?`,
      [amount, amount, userId]
    );

    const balanceAfter = balanceBefore + amount;

    // 记录账户流水
    await connection.query(
      `INSERT INTO account_transactions 
       (user_id, transaction_no, type, amount, balance_before, balance_after, related_id, related_type, description) 
       VALUES (?, ?, 'recharge', ?, ?, ?, ?, 'recharge', ?)`,
      [userId, `RCH-${orderNo}`, amount, balanceBefore, balanceAfter, record.id, `充值 ¥${amount}`]
    );

    // 获取赠送金额配置
    const [configs] = await connection.query(
      'SELECT gift_amount FROM recharge_configs WHERE amount = ? AND status = "active" LIMIT 1',
      [amount]
    );

    let giftAmount = 0;
    if (configs.length > 0) {
      giftAmount = parseFloat(configs[0].gift_amount);
    } else {
      // 默认赠送1.5倍
      giftAmount = amount * 1.5;
    }

    // 生成算力券
    if (giftAmount > 0) {
      const voucherNo = generateVoucherNo(userId);
      const expireAt = new Date();
      expireAt.setFullYear(expireAt.getFullYear() + 1); // 1年有效期

      await connection.query(
        `INSERT INTO compute_vouchers 
         (user_id, voucher_no, amount, balance, source_type, source_id, status, expire_at, remark) 
         VALUES (?, ?, ?, ?, 'recharge_gift', ?, 'active', ?, ?)`,
        [userId, voucherNo, giftAmount, giftAmount, record.id, expireAt, `充值 ¥${amount} 赠送`]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: `充值成功！到账 ¥${amount}，赠送算力券 ¥${giftAmount}`,
      data: {
        amount,
        giftAmount,
        balanceAfter
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('支付回调处理失败:', error);
    res.status(500).json({
      success: false,
      message: '支付回调处理失败'
    });
  } finally {
    connection.release();
  }
});

/**
 * 获取充值记录
 * GET /api/billing/recharge-records
 */
router.get('/recharge-records', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, pageSize = 10, status } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClause = 'WHERE user_id = ?';
    const params = [userId];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    // 查询总数
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM recharge_records ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 查询记录
    const [records] = await pool.query(
      `SELECT * FROM recharge_records ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), parseInt(offset)]
    );

    res.json({
      success: true,
      data: {
        records: records.map(r => ({
          id: r.id,
          orderNo: r.order_no,
          amount: parseFloat(r.amount),
          paymentMethod: r.payment_method,
          status: r.status,
          paidAt: r.paid_at,
          createdAt: r.created_at
        })),
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    });
  } catch (error) {
    console.error('获取充值记录失败:', error);
    res.status(500).json({
      success: false,
      message: '获取充值记录失败'
    });
  }
});

/**
 * 获取账户流水
 * GET /api/billing/transactions
 */
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, pageSize = 20, type } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClause = 'WHERE user_id = ?';
    const params = [userId];

    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }

    // 查询总数
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM account_transactions ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // 查询流水
    const [transactions] = await pool.query(
      `SELECT * FROM account_transactions ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), parseInt(offset)]
    );

    res.json({
      success: true,
      data: {
        transactions: transactions.map(t => ({
          id: t.id,
          transactionNo: t.transaction_no,
          type: t.type,
          amount: parseFloat(t.amount),
          balanceBefore: parseFloat(t.balance_before),
          balanceAfter: parseFloat(t.balance_after),
          description: t.description,
          createdAt: t.created_at
        })),
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    });
  } catch (error) {
    console.error('获取账户流水失败:', error);
    res.status(500).json({
      success: false,
      message: '获取账户流水失败'
    });
  }
});

/**
 * 使用算力券（内部接口，供其他模块调用）
 * POST /api/billing/use-voucher
 */
router.post('/use-voucher', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const userId = req.user.id;
    const { amount, usageType, orderId, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '使用金额必须大于0'
      });
    }

    await connection.beginTransaction();

    // 查询可用算力券
    const [vouchers] = await connection.query(
      `SELECT id, balance FROM compute_vouchers 
       WHERE user_id = ? AND status = 'active' AND balance > 0 
       AND (expire_at IS NULL OR expire_at > NOW())
       ORDER BY expire_at ASC, created_at ASC 
       FOR UPDATE`,
      [userId]
    );

    if (vouchers.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: '没有可用的算力券'
      });
    }

    let remainingAmount = amount;
    const usedVouchers = [];

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
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, voucher.id, orderId, useAmount, usageType, description]
      );

      usedVouchers.push({
        voucherId: voucher.id,
        useAmount
      });

      remainingAmount -= useAmount;
    }

    await connection.commit();

    if (remainingAmount > 0) {
      res.json({
        success: false,
        message: `算力券余额不足，还需支付 ¥${remainingAmount.toFixed(2)}`,
        data: {
          usedAmount: amount - remainingAmount,
          remainingAmount,
          usedVouchers
        }
      });
    } else {
      res.json({
        success: true,
        message: '算力券使用成功',
        data: {
          usedAmount: amount,
          usedVouchers
        }
      });
    }
  } catch (error) {
    await connection.rollback();
    console.error('使用算力券失败:', error);
    res.status(500).json({
      success: false,
      message: '使用算力券失败'
    });
  } finally {
    connection.release();
  }
});

export default router;
