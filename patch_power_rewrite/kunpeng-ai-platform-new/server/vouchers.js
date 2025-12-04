/**
 * 算力券API
 * 提供算力券的查询、领取、验证等功能
 */

import express from 'express';
import db from './db.js';
import { authenticateToken, requireAdmin } from './middleware/auth.js';

const router = express.Router();

/**
 * GET /api/vouchers/available
 * 获取可领取的算力券列表
 */
router.get('/available', async (req, res) => {
  try {
    const { cloudProviderCode } = req.query;

    let query = `
      SELECT v.*, cp.name as cloud_provider_name
      FROM vouchers v
      LEFT JOIN cloud_providers cp ON v.cloud_provider_id = cp.id
      WHERE v.status = 'active'
        AND v.used_quantity < v.total_quantity
        AND (v.valid_from IS NULL OR v.valid_from <= NOW())
        AND (v.valid_until IS NULL OR v.valid_until >= NOW())
    `;
    const params = [];

    if (cloudProviderCode) {
      query += ' AND (v.cloud_provider_code = ? OR v.cloud_provider_code IS NULL)';
      params.push(cloudProviderCode);
    }

    query += ' ORDER BY v.value DESC';

    const [vouchers] = await db.query(query, params);

    res.json({
      success: true,
      data: vouchers
    });
  } catch (error) {
    console.error('[算力券] 获取可用列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取算力券列表失败'
    });
  }
});

/**
 * GET /api/vouchers/my
 * 获取我的算力券列表
 */
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT 
        uv.*,
        v.name,
        v.type,
        v.value,
        v.min_amount,
        v.max_discount,
        v.valid_from,
        v.valid_until,
        v.description,
        cp.name as cloud_provider_name,
        cp.code as cloud_provider_code
      FROM user_vouchers uv
      JOIN vouchers v ON uv.voucher_id = v.id
      LEFT JOIN cloud_providers cp ON v.cloud_provider_id = cp.id
      WHERE uv.user_id = ?
    `;
    const params = [userId];

    if (status) {
      query += ' AND uv.status = ?';
      params.push(status);
    }

    query += ' ORDER BY uv.received_at DESC';

    const [userVouchers] = await db.query(query, params);

    res.json({
      success: true,
      data: userVouchers
    });
  } catch (error) {
    console.error('[算力券] 获取我的算力券失败:', error);
    res.status(500).json({
      success: false,
      message: '获取我的算力券失败'
    });
  }
});

/**
 * POST /api/vouchers/claim
 * 领取算力券
 */
router.post('/claim', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { voucherCode } = req.body;

    if (!voucherCode) {
      return res.status(400).json({
        success: false,
        message: '请提供算力券代码'
      });
    }

    // 查询算力券信息
    const [vouchers] = await db.query(
      `SELECT * FROM vouchers 
       WHERE code = ? AND status = 'active'`,
      [voucherCode]
    );

    if (vouchers.length === 0) {
      return res.status(404).json({
        success: false,
        message: '算力券不存在或已失效'
      });
    }

    const voucher = vouchers[0];

    // 检查是否已领取
    const [existing] = await db.query(
      'SELECT id FROM user_vouchers WHERE user_id = ? AND voucher_code = ?',
      [userId, voucherCode]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: '您已领取过该算力券'
      });
    }

    // 检查库存
    if (voucher.used_quantity >= voucher.total_quantity) {
      return res.status(400).json({
        success: false,
        message: '算力券已被领完'
      });
    }

    // 检查有效期
    const now = new Date();
    if (voucher.valid_from && new Date(voucher.valid_from) > now) {
      return res.status(400).json({
        success: false,
        message: '算力券尚未生效'
      });
    }

    if (voucher.valid_until && new Date(voucher.valid_until) < now) {
      return res.status(400).json({
        success: false,
        message: '算力券已过期'
      });
    }

    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 创建用户算力券记录
      await connection.query(
        `INSERT INTO user_vouchers (user_id, voucher_id, voucher_code, status)
         VALUES (?, ?, ?, 'unused')`,
        [userId, voucher.id, voucherCode]
      );

      // 更新算力券已使用数量
      await connection.query(
        'UPDATE vouchers SET used_quantity = used_quantity + 1 WHERE id = ?',
        [voucher.id]
      );

      await connection.commit();

      res.json({
        success: true,
        message: '算力券领取成功'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[算力券] 领取失败:', error);
    res.status(500).json({
      success: false,
      message: '领取算力券失败'
    });
  }
});

/**
 * POST /api/vouchers/validate
 * 验证算力券是否可用
 */
router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { userVoucherId, orderAmount, cloudProviderCode } = req.body;

    if (!userVoucherId || !orderAmount) {
      return res.status(400).json({
        success: false,
        message: '参数不完整'
      });
    }

    // 查询用户算力券信息
    const [userVouchers] = await db.query(
      `SELECT 
        uv.*,
        v.type,
        v.value,
        v.min_amount,
        v.max_discount,
        v.valid_from,
        v.valid_until,
        v.cloud_provider_code
      FROM user_vouchers uv
      JOIN vouchers v ON uv.voucher_id = v.id
      WHERE uv.id = ? AND uv.user_id = ? AND uv.status = 'unused'`,
      [userVoucherId, userId]
    );

    if (userVouchers.length === 0) {
      return res.json({
        success: false,
        valid: false,
        message: '算力券不存在或已使用'
      });
    }

    const userVoucher = userVouchers[0];

    // 检查云厂商限制
    if (userVoucher.cloud_provider_code && 
        userVoucher.cloud_provider_code !== cloudProviderCode) {
      return res.json({
        success: false,
        valid: false,
        message: '该算力券不适用于当前云厂商'
      });
    }

    // 检查最低消费金额
    if (orderAmount < userVoucher.min_amount) {
      return res.json({
        success: false,
        valid: false,
        message: `订单金额需满${userVoucher.min_amount}元才能使用该算力券`
      });
    }

    // 检查有效期
    const now = new Date();
    if (userVoucher.valid_from && new Date(userVoucher.valid_from) > now) {
      return res.json({
        success: false,
        valid: false,
        message: '算力券尚未生效'
      });
    }

    if (userVoucher.valid_until && new Date(userVoucher.valid_until) < now) {
      return res.json({
        success: false,
        valid: false,
        message: '算力券已过期'
      });
    }

    // 计算抵扣金额
    let discountAmount = 0;
    if (userVoucher.type === 'amount') {
      discountAmount = userVoucher.value;
      if (userVoucher.max_discount) {
        discountAmount = Math.min(discountAmount, userVoucher.max_discount);
      }
    } else if (userVoucher.type === 'discount') {
      discountAmount = orderAmount * (userVoucher.value / 100);
      if (userVoucher.max_discount) {
        discountAmount = Math.min(discountAmount, userVoucher.max_discount);
      }
    }

    // 确保抵扣金额不超过订单金额
    discountAmount = Math.min(discountAmount, orderAmount);

    res.json({
      success: true,
      valid: true,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      message: '算力券可用'
    });
  } catch (error) {
    console.error('[算力券] 验证失败:', error);
    res.status(500).json({
      success: false,
      message: '验证算力券失败'
    });
  }
});

/**
 * POST /api/admin/vouchers
 * 创建算力券（管理员）
 */
router.post('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      code,
      name,
      cloudProviderId,
      cloudProviderCode,
      type,
      value,
      minAmount = 0,
      maxDiscount,
      totalQuantity = 1,
      validFrom,
      validUntil,
      description
    } = req.body;

    // 验证必填字段
    if (!code || !name || !type || !value) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的算力券信息'
      });
    }

    // 检查代码是否已存在
    const [existing] = await db.query(
      'SELECT id FROM vouchers WHERE code = ?',
      [code]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: '算力券代码已存在'
      });
    }

    const [result] = await db.query(
      `INSERT INTO vouchers 
      (code, name, cloud_provider_id, cloud_provider_code, type, value, 
       min_amount, max_discount, total_quantity, valid_from, valid_until, 
       status, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [code, name, cloudProviderId, cloudProviderCode, type, value,
       minAmount, maxDiscount, totalQuantity, validFrom, validUntil,
       description, req.user.id]
    );

    res.json({
      success: true,
      message: '算力券创建成功',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('[算力券] 创建失败:', error);
    res.status(500).json({
      success: false,
      message: '创建算力券失败'
    });
  }
});

/**
 * POST /api/admin/vouchers/grant
 * 批量赠送算力券（管理员）
 */
router.post('/admin/grant', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { voucherCode, userIds } = req.body;

    if (!voucherCode || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '参数不完整'
      });
    }

    // 查询算力券
    const [vouchers] = await db.query(
      'SELECT * FROM vouchers WHERE code = ? AND status = \'active\'',
      [voucherCode]
    );

    if (vouchers.length === 0) {
      return res.status(404).json({
        success: false,
        message: '算力券不存在'
      });
    }

    const voucher = vouchers[0];

    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      let successCount = 0;
      let failCount = 0;

      for (const userId of userIds) {
        // 检查是否已领取
        const [existing] = await connection.query(
          'SELECT id FROM user_vouchers WHERE user_id = ? AND voucher_code = ?',
          [userId, voucherCode]
        );

        if (existing.length > 0) {
          failCount++;
          continue;
        }

        // 创建用户算力券记录
        await connection.query(
          `INSERT INTO user_vouchers (user_id, voucher_id, voucher_code, status)
           VALUES (?, ?, ?, 'unused')`,
          [userId, voucher.id, voucherCode]
        );

        successCount++;
      }

      // 更新算力券已使用数量
      await connection.query(
        'UPDATE vouchers SET used_quantity = used_quantity + ? WHERE id = ?',
        [successCount, voucher.id]
      );

      await connection.commit();

      res.json({
        success: true,
        message: '算力券赠送完成',
        data: {
          successCount,
          failCount
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[算力券] 赠送失败:', error);
    res.status(500).json({
      success: false,
      message: '赠送算力券失败'
    });
  }
});

/**
 * PUT /api/admin/vouchers/:id
 * 更新算力券（管理员）
 */
router.put('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 检查算力券是否存在
    const [existing] = await db.query(
      'SELECT id FROM vouchers WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '算力券不存在'
      });
    }

    // 构建更新语句
    const allowedFields = [
      'name', 'cloud_provider_id', 'cloud_provider_code', 'type', 'value',
      'min_amount', 'max_discount', 'total_quantity', 'valid_from', 'valid_until',
      'status', 'description'
    ];

    const updates = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (allowedFields.includes(snakeKey)) {
        updates.push(`${snakeKey} = ?`);
        values.push(updateData[key]);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有可更新的字段'
      });
    }

    values.push(id);

    await db.query(
      `UPDATE vouchers SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: '算力券更新成功'
    });
  } catch (error) {
    console.error('[算力券] 更新失败:', error);
    res.status(500).json({
      success: false,
      message: '更新算力券失败'
    });
  }
});

/**
 * DELETE /api/admin/vouchers/:id
 * 删除算力券（管理员）
 */
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM vouchers WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '算力券不存在'
      });
    }

    res.json({
      success: true,
      message: '算力券删除成功'
    });
  } catch (error) {
    console.error('[算力券] 删除失败:', error);
    res.status(500).json({
      success: false,
      message: '删除算力券失败'
    });
  }
});

export default router;
