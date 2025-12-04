/**
 * 云厂商API
 * 提供云厂商信息查询功能
 */

import express from 'express';
import db from './db.js';

const router = express.Router();

/**
 * GET /api/cloud-providers
 * 获取云厂商列表
 * 查询参数：
 * - status: 状态筛选（active/inactive）
 * - supportVoucher: 是否支持算力券
 */
router.get('/', async (req, res) => {
  try {
    const { status = 'active', supportVoucher } = req.query;

    let query = 'SELECT * FROM cloud_providers WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (supportVoucher !== undefined) {
      query += ' AND support_voucher = ?';
      params.push(supportVoucher === 'true' || supportVoucher === '1');
    }

    query += ' ORDER BY id ASC';

    const [providers] = await db.query(query, params);

    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('[云厂商] 获取列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取云厂商列表失败'
    });
  }
});

/**
 * GET /api/cloud-providers/:id
 * 获取云厂商详情
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [providers] = await db.query(
      'SELECT * FROM cloud_providers WHERE id = ?',
      [id]
    );

    if (providers.length === 0) {
      return res.status(404).json({
        success: false,
        message: '云厂商不存在'
      });
    }

    res.json({
      success: true,
      data: providers[0]
    });
  } catch (error) {
    console.error('[云厂商] 获取详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取云厂商详情失败'
    });
  }
});

/**
 * GET /api/cloud-providers/code/:code
 * 根据代码获取云厂商信息
 */
router.get('/code/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const [providers] = await db.query(
      'SELECT * FROM cloud_providers WHERE code = ?',
      [code]
    );

    if (providers.length === 0) {
      return res.status(404).json({
        success: false,
        message: '云厂商不存在'
      });
    }

    res.json({
      success: true,
      data: providers[0]
    });
  } catch (error) {
    console.error('[云厂商] 获取详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取云厂商详情失败'
    });
  }
});

/**
 * GET /api/cloud-providers/:id/resources
 * 获取指定云厂商的算力资源
 */
router.get('/:id/resources', async (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'active' } = req.query;

    const [resources] = await db.query(
      `SELECT * FROM gpu_resources 
       WHERE cloud_provider_id = ? AND status = ?
       ORDER BY price ASC`,
      [id, status]
    );

    res.json({
      success: true,
      data: resources,
      total: resources.length
    });
  } catch (error) {
    console.error('[云厂商] 获取资源失败:', error);
    res.status(500).json({
      success: false,
      message: '获取云厂商资源失败'
    });
  }
});

export default router;
