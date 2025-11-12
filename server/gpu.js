import express from 'express';
import db from './db.js';
import { authenticateToken, requireAdmin, logAdminAction } from './middleware/auth.js';

const router = express.Router();

/**
 * GET /api/gpu/resources
 * 获取GPU资源列表（支持筛选）
 * 查询参数：
 * - region: 区域筛选
 * - model: GPU型号筛选
 * - rentalType: 租用方案筛选
 * - billingCycle: 计费周期筛选
 * - sortBy: 排序字段（price-asc, price-desc, vram-desc, performance）
 * - status: 状态筛选（默认只返回active）
 */
router.get('/resources', async (req, res) => {
  try {
    const {
      region,
      model,
      rentalType,
      billingCycle,
      sortBy = 'price-asc',
      status = 'active'
    } = req.query;

    // 构建查询条件
    let query = 'SELECT * FROM gpu_resources WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (region) {
      query += ' AND region = ?';
      params.push(region);
    }

    if (model) {
      query += ' AND model LIKE ?';
      params.push(`%${model}%`);
    }

    if (rentalType) {
      query += ' AND rental_type = ?';
      params.push(rentalType);
    }

    if (billingCycle) {
      query += ' AND billing_cycle = ?';
      params.push(billingCycle);
    }

    // 添加排序
    switch (sortBy) {
      case 'price-asc':
        query += ' ORDER BY price ASC';
        break;
      case 'price-desc':
        query += ' ORDER BY price DESC';
        break;
      case 'vram-desc':
        query += ' ORDER BY vram DESC';
        break;
      case 'performance':
        query += ' ORDER BY (vram * card_count) DESC';
        break;
      default:
        query += ' ORDER BY price ASC';
    }

    const [resources] = await db.query(query, params);

    res.json({
      success: true,
      data: resources,
      total: resources.length
    });
  } catch (error) {
    console.error('获取GPU资源失败:', error);
    res.status(500).json({
      success: false,
      message: '获取GPU资源失败'
    });
  }
});

/**
 * GET /api/gpu/resources/:id
 * 获取单个GPU资源详情
 */
router.get('/resources/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [resources] = await db.query(
      'SELECT * FROM gpu_resources WHERE id = ?',
      [id]
    );

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'GPU资源不存在'
      });
    }

    res.json({
      success: true,
      data: resources[0]
    });
  } catch (error) {
    console.error('获取GPU资源详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取GPU资源详情失败'
    });
  }
});

/**
 * POST /api/gpu/resources
 * 创建GPU资源（管理员）
 */
router.post('/resources', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      model,
      vendor = 'NVIDIA',
      price,
      priceUnit = '小时',
      vram,
      cardCount = 1,
      cpu,
      memory,
      storage,
      stock = 0,
      region,
      rentalType = 'online',
      billingCycle = 'hourly',
      isHot = false,
      isSpecial = false,
      status = 'active',
      description = ''
    } = req.body;

    // 验证必填字段
    if (!model || !price || !vram || !cpu || !memory || !storage || !region) {
      return res.status(400).json({
        success: false,
        message: '请填写完整的GPU资源信息'
      });
    }

    const [result] = await db.query(
      `INSERT INTO gpu_resources 
      (model, vendor, price, price_unit, vram, card_count, cpu, memory, storage, 
       stock, region, rental_type, billing_cycle, is_hot, is_special, status, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [model, vendor, price, priceUnit, vram, cardCount, cpu, memory, storage,
       stock, region, rentalType, billingCycle, isHot, isSpecial, status, description]
    );

    res.json({
      success: true,
      message: 'GPU资源创建成功',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('创建GPU资源失败:', error);
    res.status(500).json({
      success: false,
      message: '创建GPU资源失败'
    });
  }
});

/**
 * PUT /api/gpu/resources/:id
 * 更新GPU资源（管理员）
 */
router.put('/resources/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 检查资源是否存在
    const [existing] = await db.query(
      'SELECT id FROM gpu_resources WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'GPU资源不存在'
      });
    }

    // 构建更新语句
    const allowedFields = [
      'model', 'vendor', 'price', 'price_unit', 'vram', 'card_count',
      'cpu', 'memory', 'storage', 'stock', 'region', 'rental_type',
      'billing_cycle', 'is_hot', 'is_special', 'status', 'description'
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
      `UPDATE gpu_resources SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'GPU资源更新成功'
    });
  } catch (error) {
    console.error('更新GPU资源失败:', error);
    res.status(500).json({
      success: false,
      message: '更新GPU资源失败'
    });
  }
});

/**
 * DELETE /api/gpu/resources/:id
 * 删除GPU资源（管理员）
 */
router.delete('/resources/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM gpu_resources WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'GPU资源不存在'
      });
    }

    res.json({
      success: true,
      message: 'GPU资源删除成功'
    });
  } catch (error) {
    console.error('删除GPU资源失败:', error);
    res.status(500).json({
      success: false,
      message: '删除GPU资源失败'
    });
  }
});

/**
 * GET /api/gpu/stats
 * 获取GPU资源统计信息
 */
router.get('/stats', async (req, res) => {
  try {
    // 按区域统计
    const [regionStats] = await db.query(`
      SELECT 
        region AS name,
        COUNT(*) AS count,
        SUM(stock) AS totalStock,
        MIN(price) AS minPrice,
        MAX(price) AS maxPrice
      FROM gpu_resources
      WHERE status = 'active'
      GROUP BY region
      ORDER BY region
    `);

    // 按型号统计
    const [modelStats] = await db.query(`
      SELECT 
        model AS name,
        COUNT(*) AS count,
        SUM(stock) AS totalStock,
        AVG(price) AS avgPrice
      FROM gpu_resources
      WHERE status = 'active'
      GROUP BY model
      ORDER BY totalStock DESC
    `);

    // 总体统计
    const [totalStats] = await db.query(`
      SELECT 
        COUNT(*) AS totalConfigs,
        SUM(stock) AS totalStock,
        COUNT(DISTINCT model) AS totalModels,
        COUNT(DISTINCT region) AS totalRegions
      FROM gpu_resources
      WHERE status = 'active'
    `);

    res.json({
      success: true,
      data: {
        total: totalStats[0],
        byRegion: regionStats,
        byModel: modelStats
      }
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败'
    });
  }
});

/**
 * PATCH /api/gpu/resources/:id/stock
 * 更新库存数量
 */
router.patch('/resources/:id/stock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({
        success: false,
        message: '库存数量必须是非负整数'
      });
    }

    const [result] = await db.query(
      'UPDATE gpu_resources SET stock = ? WHERE id = ?',
      [stock, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'GPU资源不存在'
      });
    }

    res.json({
      success: true,
      message: '库存更新成功'
    });
  } catch (error) {
    console.error('更新库存失败:', error);
    res.status(500).json({
      success: false,
      message: '更新库存失败'
    });
  }
});

export default router;
