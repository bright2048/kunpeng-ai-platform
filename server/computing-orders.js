/**
 * 算力订单API
 * 提供算力订单的创建、查询、支付等功能
 */

import express from 'express';
import db from './db.js';
import { authenticateToken, requireAdmin } from './middleware/auth.js';

const router = express.Router();

/**
 * 生成订单号
 */
function generateOrderNo() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CO${timestamp}${random}`;
}

/**
 * POST /api/computing/orders
 * 创建算力订单
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      resourceId,
      duration,
      durationUnit,
      quantity,
      userVoucherId,
      remark
    } = req.body;

    // 备注是可选字段，默认为空字符串
    const orderRemark = remark || '';
    // 数量默认为1
    const orderQuantity = quantity || 1;

    // 验证必填字段
    if (!resourceId || !duration || !durationUnit) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的订单信息'
      });
    }

    // 查询资源信息
    const [resources] = await db.query(
      `SELECT r.*, cp.name as cloud_provider_name, cp.code as cloud_provider_code
       FROM gpu_resources r
       LEFT JOIN cloud_providers cp ON r.cloud_provider_id = cp.id
       WHERE r.id = ? AND r.status = 'active'`,
      [resourceId]
    );

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: '资源不存在或已下架'
      });
    }

    const resource = resources[0];

    // 检查库存
    if (resource.stock === 0) {
      return res.status(400).json({
        success: false,
        message: '该资源已售罄'
      });
    }

    // 计算原价（考虑时长单位和数量）
    let totalHours = duration;
    switch (durationUnit) {
      case 'hour':
        totalHours = duration;
        break;
      case 'day':
        totalHours = duration * 24;
        break;
      case 'month':
        totalHours = duration * 24 * 30;
        break;
      case 'year':
        totalHours = duration * 24 * 365;
        break;
    }

    let originalPrice = resource.price * totalHours * orderQuantity;

    // 查询适用的折扣
    const [discounts] = await db.query(
      `SELECT *
       FROM product_discounts
       WHERE status = 'active'
         AND (valid_from IS NULL OR valid_from <= NOW())
         AND (valid_until IS NULL OR valid_until >= NOW())
         AND (cloud_provider_code = ? OR cloud_provider_code IS NULL)
         AND (gpu_model = ? OR gpu_model IS NULL)
         AND (resource_id = ? OR resource_id IS NULL)
       ORDER BY priority DESC, discount_rate DESC
       LIMIT 1`,
      [resource.cloud_provider_code, resource.model, resourceId]
    );

    let discountAmount = 0;
    let discountId = null;

    if (discounts.length > 0) {
      const discount = discounts[0];
      discountAmount = originalPrice * (discount.discount_rate / 100);
      discountId = discount.id;
    }

    // 计算折扣后价格
    let priceAfterDiscount = originalPrice - discountAmount;

    // 处理算力券
    let voucherAmount = 0;
    let voucherId = null;

    if (userVoucherId) {
      const [userVouchers] = await db.query(
        `SELECT uv.*, v.type, v.value, v.min_amount, v.max_discount, v.cloud_provider_code
         FROM user_vouchers uv
         JOIN vouchers v ON uv.voucher_id = v.id
         WHERE uv.id = ? AND uv.user_id = ? AND uv.status = 'unused'`,
        [userVoucherId, userId]
      );

      if (userVouchers.length > 0) {
        const userVoucher = userVouchers[0];

        // 验证云厂商限制
        if (!userVoucher.cloud_provider_code ||
          userVoucher.cloud_provider_code === resource.cloud_provider_code) {

          // 验证最低消费金额
          if (priceAfterDiscount >= userVoucher.min_amount) {
            // 计算券抵扣金额
            if (userVoucher.type === 'amount') {
              voucherAmount = userVoucher.value;
              if (userVoucher.max_discount) {
                voucherAmount = Math.min(voucherAmount, userVoucher.max_discount);
              }
            } else if (userVoucher.type === 'discount') {
              voucherAmount = priceAfterDiscount * (userVoucher.value / 100);
              if (userVoucher.max_discount) {
                voucherAmount = Math.min(voucherAmount, userVoucher.max_discount);
              }
            }

            // 确保券抵扣金额不超过折扣后价格
            voucherAmount = Math.min(voucherAmount, priceAfterDiscount);
            voucherId = userVoucher.voucher_id;
          }
        }
      }
    }

    // 计算最终价格
    const finalPrice = Math.max(0, priceAfterDiscount - voucherAmount);

    // 生成订单号
    const orderNo = generateOrderNo();

    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 创建订单
      const [result] = await connection.query(
        `INSERT INTO computing_orders 
        (order_no, user_id, resource_id, cloud_provider_id, cloud_provider_code,
         gpu_model, quantity, duration, duration_unit, original_price, discount_amount,
         voucher_amount, final_price, voucher_id, discount_id, status, remark)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [orderNo, userId, resourceId, resource.cloud_provider_id, resource.cloud_provider_code,
          resource.model, orderQuantity, duration, durationUnit, originalPrice, discountAmount,
          voucherAmount, finalPrice, voucherId, discountId, orderRemark]
      );

      const orderId = result.insertId;

      // 如果使用了算力券，标记为已使用
      if (userVoucherId && voucherId) {
        await connection.query(
          'UPDATE user_vouchers SET status = \'used\', used_at = NOW(), order_id = ? WHERE id = ?',
          [orderId, userVoucherId]
        );
      }

      await connection.commit();

      res.json({
        success: true,
        message: '订单创建成功',
        data: {
          orderId,
          orderNo,
          finalPrice
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[算力订单] 创建失败:', error);
    res.status(500).json({
      success: false,
      message: '创建订单失败'
    });
  }
});

/**
 * GET /api/computing/orders
 * 获取我的订单列表
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, pageSize = 20 } = req.query;

    let query = `
      SELECT 
        o.*,
        cp.name as cloud_provider_name,
        r.vram, r.card_count, r.cpu, r.memory, r.storage
      FROM computing_orders o
      LEFT JOIN cloud_providers cp ON o.cloud_provider_id = cp.id
      LEFT JOIN gpu_resources r ON o.resource_id = r.id
      WHERE o.user_id = ?
    `;
    const params = [userId];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    query += ' ORDER BY o.created_at DESC';

    // 分页
    const offset = (page - 1) * pageSize;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);

    const [orders] = await db.query(query, params);

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM computing_orders WHERE user_id = ?';
    const countParams = [userId];
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    const [countResult] = await db.query(countQuery, countParams);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: countResult[0].total
      }
    });
  } catch (error) {
    console.error('[算力订单] 获取列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单列表失败'
    });
  }
});

/**
 * GET /api/computing/orders/:id
 * 获取订单详情
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [orders] = await db.query(
      `SELECT 
        o.*,
        cp.name as cloud_provider_name,
        r.vram, r.card_count, r.cpu, r.memory, r.storage, r.region,
        v.name as voucher_name,
        d.name as discount_name
      FROM computing_orders o
      LEFT JOIN cloud_providers cp ON o.cloud_provider_id = cp.id
      LEFT JOIN gpu_resources r ON o.resource_id = r.id
      LEFT JOIN vouchers v ON o.voucher_id = v.id
      LEFT JOIN product_discounts d ON o.discount_id = d.id
      WHERE o.id = ? AND o.user_id = ?`,
      [id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    res.json({
      success: true,
      data: orders[0]
    });
  } catch (error) {
    console.error('[算力订单] 获取详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单详情失败'
    });
  }
});

/**
 * POST /api/computing/orders/:id/pay
 * 支付订单
 */
router.post('/:id/pay', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { paymentMethod = 'balance' } = req.body;

    // 查询订单
    const [orders] = await db.query(
      'SELECT * FROM computing_orders WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    const order = orders[0];

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '订单状态不正确'
      });
    }

    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 更新订单状态
      await connection.query(
        `UPDATE computing_orders 
         SET status = 'paid', payment_method = ?, payment_time = NOW()
         WHERE id = ?`,
        [paymentMethod, id]
      );

      // 扣减库存
      await connection.query(
        'UPDATE gpu_resources SET stock = stock - 1 WHERE id = ? AND stock > 0',
        [order.resource_id]
      );

      await connection.commit();

      res.json({
        success: true,
        message: '支付成功'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[算力订单] 支付失败:', error);
    res.status(500).json({
      success: false,
      message: '支付订单失败'
    });
  }
});

/**
 * POST /api/computing/orders/:id/cancel
 * 取消订单
 */
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 查询订单
    const [orders] = await db.query(
      'SELECT * FROM computing_orders WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    const order = orders[0];

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '只能取消待支付的订单'
      });
    }

    // 开始事务
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // 更新订单状态
      await connection.query(
        'UPDATE computing_orders SET status = \'cancelled\' WHERE id = ?',
        [id]
      );

      // 如果使用了算力券，释放算力券
      if (order.voucher_id) {
        await connection.query(
          `UPDATE user_vouchers 
           SET status = 'unused', used_at = NULL, order_id = NULL
           WHERE order_id = ?`,
          [id]
        );
      }

      await connection.commit();

      res.json({
        success: true,
        message: '订单已取消'
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[算力订单] 取消失败:', error);
    res.status(500).json({
      success: false,
      message: '取消订单失败'
    });
  }
});

/**
 * GET /api/admin/computing/orders
 * 获取所有订单（管理员）
 */
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, cloudProviderCode, page = 1, pageSize = 20 } = req.query;

    let query = `
      SELECT 
        o.*,
        cp.name as cloud_provider_name,
        u.username, u.email
      FROM computing_orders o
      LEFT JOIN cloud_providers cp ON o.cloud_provider_id = cp.id
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    if (cloudProviderCode) {
      query += ' AND o.cloud_provider_code = ?';
      params.push(cloudProviderCode);
    }

    query += ' ORDER BY o.created_at DESC';

    // 分页
    const offset = (page - 1) * pageSize;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);

    const [orders] = await db.query(query, params);

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM computing_orders WHERE 1=1';
    const countParams = [];
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    if (cloudProviderCode) {
      countQuery += ' AND cloud_provider_code = ?';
      countParams.push(cloudProviderCode);
    }
    const [countResult] = await db.query(countQuery, countParams);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: countResult[0].total
      }
    });
  } catch (error) {
    console.error('[算力订单] 获取列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取订单列表失败'
    });
  }
});

export default router;
