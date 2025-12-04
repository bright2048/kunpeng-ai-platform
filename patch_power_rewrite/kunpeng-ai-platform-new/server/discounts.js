/**
 * 折扣API
 * 提供产品折扣的查询、计算等功能
 */

import express from 'express';
import db from './db.js';
import { authenticateToken, requireAdmin } from './middleware/auth.js';

const router = express.Router();

/**
 * GET /api/discounts/active
 * 获取当前有效的折扣活动
 */
router.get('/active', async (req, res) => {
  try {
    const { cloudProviderCode, gpuModel, resourceId } = req.query;

    let query = `
      SELECT d.*, cp.name as cloud_provider_name
      FROM product_discounts d
      LEFT JOIN cloud_providers cp ON d.cloud_provider_id = cp.id
      WHERE d.status = 'active'
        AND (d.valid_from IS NULL OR d.valid_from <= NOW())
        AND (d.valid_until IS NULL OR d.valid_until >= NOW())
    `;
    const params = [];

    if (cloudProviderCode) {
      query += ' AND (d.cloud_provider_code = ? OR d.cloud_provider_code IS NULL)';
      params.push(cloudProviderCode);
    }

    if (gpuModel) {
      query += ' AND (d.gpu_model = ? OR d.gpu_model IS NULL)';
      params.push(gpuModel);
    }

    if (resourceId) {
      query += ' AND (d.resource_id = ? OR d.resource_id IS NULL)';
      params.push(resourceId);
    }

    query += ' ORDER BY d.priority DESC, d.discount_rate DESC';

    const [discounts] = await db.query(query, params);

    res.json({
      success: true,
      data: discounts
    });
  } catch (error) {
    console.error('[折扣] 获取活动列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取折扣活动失败'
    });
  }
});

/**
 * POST /api/discounts/calculate
 * 计算订单折扣
 */
router.post('/calculate', async (req, res) => {
  try {
    const {
      resourceId,
      cloudProviderCode,
      gpuModel,
      originalPrice
    } = req.body;

    if (!originalPrice) {
      return res.status(400).json({
        success: false,
        message: '请提供原价'
      });
    }

    // 查询适用的折扣（按优先级排序，取第一个）
    let query = `
      SELECT *
      FROM product_discounts
      WHERE status = 'active'
        AND (valid_from IS NULL OR valid_from <= NOW())
        AND (valid_until IS NULL OR valid_until >= NOW())
    `;
    const params = [];

    if (cloudProviderCode) {
      query += ' AND (cloud_provider_code = ? OR cloud_provider_code IS NULL)';
      params.push(cloudProviderCode);
    }

    if (gpuModel) {
      query += ' AND (gpu_model = ? OR gpu_model IS NULL)';
      params.push(gpuModel);
    }

    if (resourceId) {
      query += ' AND (resource_id = ? OR resource_id IS NULL)';
      params.push(resourceId);
    }

    query += ' ORDER BY priority DESC, discount_rate DESC LIMIT 1';

    const [discounts] = await db.query(query, params);

    if (discounts.length === 0) {
      return res.json({
        success: true,
        hasDiscount: false,
        discountAmount: 0,
        finalPrice: originalPrice
      });
    }

    const discount = discounts[0];
    const discountAmount = originalPrice * (discount.discount_rate / 100);
    const finalPrice = originalPrice - discountAmount;

    res.json({
      success: true,
      hasDiscount: true,
      discount: {
        id: discount.id,
        name: discount.name,
        rate: discount.discount_rate
      },
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalPrice: parseFloat(finalPrice.toFixed(2))
    });
  } catch (error) {
    console.error('[折扣] 计算失败:', error);
    res.status(500).json({
      success: false,
      message: '计算折扣失败'
    });
  }
});

/**
 * GET /api/admin/discounts
 * 获取所有折扣活动（管理员）
 */
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT d.*, cp.name as cloud_provider_name
      FROM product_discounts d
      LEFT JOIN cloud_providers cp ON d.cloud_provider_id = cp.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND d.status = ?';
      params.push(status);
    }

    query += ' ORDER BY d.created_at DESC';

    const [discounts] = await db.query(query, params);

    res.json({
      success: true,
      data: discounts
    });
  } catch (error) {
    console.error('[折扣] 获取列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取折扣列表失败'
    });
  }
});

/**
 * POST /api/admin/discounts
 * 创建折扣活动（管理员）
 */
router.post('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      cloudProviderId,
      cloudProviderCode,
      resourceId,
      gpuModel,
      discountRate,
      priority = 0,
      validFrom,
      validUntil,
      description
    } = req.body;

    // 验证必填字段
    if (!name || !discountRate) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的折扣信息'
      });
    }

    // 验证折扣率范围
    if (discountRate < 0 || discountRate > 100) {
      return res.status(400).json({
        success: false,
        message: '折扣率必须在0-100之间'
      });
    }

    const [result] = await db.query(
      `INSERT INTO product_discounts 
      (name, cloud_provider_id, cloud_provider_code, resource_id, gpu_model,
       discount_rate, priority, valid_from, valid_until, status, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [name, cloudProviderId, cloudProviderCode, resourceId, gpuModel,
       discountRate, priority, validFrom, validUntil, description, req.user.id]
    );

    res.json({
      success: true,
      message: '折扣活动创建成功',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('[折扣] 创建失败:', error);
    res.status(500).json({
      success: false,
      message: '创建折扣活动失败'
    });
  }
});

/**
 * PUT /api/admin/discounts/:id
 * 更新折扣活动（管理员）
 */
router.put('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 检查折扣是否存在
    const [existing] = await db.query(
      'SELECT id FROM product_discounts WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '折扣活动不存在'
      });
    }

    // 验证折扣率
    if (updateData.discountRate !== undefined) {
      if (updateData.discountRate < 0 || updateData.discountRate > 100) {
        return res.status(400).json({
          success: false,
          message: '折扣率必须在0-100之间'
        });
      }
    }

    // 构建更新语句
    const allowedFields = [
      'name', 'cloud_provider_id', 'cloud_provider_code', 'resource_id', 'gpu_model',
      'discount_rate', 'priority', 'valid_from', 'valid_until', 'status', 'description'
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
      `UPDATE product_discounts SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: '折扣活动更新成功'
    });
  } catch (error) {
    console.error('[折扣] 更新失败:', error);
    res.status(500).json({
      success: false,
      message: '更新折扣活动失败'
    });
  }
});

/**
 * DELETE /api/admin/discounts/:id
 * 删除折扣活动（管理员）
 */
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM product_discounts WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '折扣活动不存在'
      });
    }

    res.json({
      success: true,
      message: '折扣活动删除成功'
    });
  } catch (error) {
    console.error('[折扣] 删除失败:', error);
    res.status(500).json({
      success: false,
      message: '删除折扣活动失败'
    });
  }
});

export default router;
