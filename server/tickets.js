/**
 * 工单管理API
 * 提供工单的创建、查询、回复、状态更新等功能
 */

import express from 'express';
import db from './db.js';
import { authenticateToken, requireAdmin } from './middleware/auth.js';

const router = express.Router();

/**
 * 生成工单号
 */
function generateTicketNo() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TK${timestamp}${random}`;
}

/**
 * POST /api/tickets
 * 创建工单（用户）
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, category, priority, description, attachments } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: '请填写标题和问题描述'
      });
    }

    const ticketNo = generateTicketNo();

    const [result] = await db.query(
      `INSERT INTO tickets 
      (ticket_no, user_id, title, category, priority, description, attachments, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'open')`,
      [
        ticketNo,
        userId,
        title,
        category || 'other',
        priority || 'medium',
        description,
        attachments ? JSON.stringify(attachments) : null
      ]
    );

    res.json({
      success: true,
      message: '工单提交成功',
      data: {
        id: result.insertId,
        ticketNo
      }
    });
  } catch (error) {
    console.error('[工单] 创建失败:', error);
    res.status(500).json({
      success: false,
      message: '创建工单失败'
    });
  }
});

/**
 * GET /api/tickets
 * 获取我的工单列表（用户）
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, pageSize = 20 } = req.query;

    let query = `
      SELECT t.*, u.username, u.email
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.user_id = ?
    `;
    const params = [userId];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    query += ' ORDER BY t.created_at DESC';

    // 分页
    const offset = (page - 1) * pageSize;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);

    const [tickets] = await db.query(query, params);

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM tickets WHERE user_id = ?';
    const countParams = [userId];
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    const [countResult] = await db.query(countQuery, countParams);

    res.json({
      success: true,
      data: tickets,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: countResult[0].total
      }
    });
  } catch (error) {
    console.error('[工单] 获取列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取工单列表失败'
    });
  }
});

/**
 * GET /api/tickets/:id
 * 获取工单详情
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.is_admin;

    // 查询工单
    const [tickets] = await db.query(
      `SELECT t.*, 
        u.username as user_name, u.email as user_email,
        a.username as assigned_name
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE t.id = ?`,
      [id]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: '工单不存在'
      });
    }

    const ticket = tickets[0];

    // 权限检查：只能查看自己的工单，除非是管理员
    if (ticket.user_id !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: '无权访问此工单'
      });
    }

    // 查询回复
    const [replies] = await db.query(
      `SELECT r.*, u.username, u.is_admin
      FROM ticket_replies r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.ticket_id = ?
      ORDER BY r.created_at ASC`,
      [id]
    );

    ticket.replies = replies;

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('[工单] 获取详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取工单详情失败'
    });
  }
});

/**
 * POST /api/tickets/:id/reply
 * 回复工单
 */
router.post('/:id/reply', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.is_admin;
    const { content, attachments } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: '请填写回复内容'
      });
    }

    // 查询工单
    const [tickets] = await db.query(
      'SELECT user_id, status FROM tickets WHERE id = ?',
      [id]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: '工单不存在'
      });
    }

    const ticket = tickets[0];

    // 权限检查
    if (ticket.user_id !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: '无权回复此工单'
      });
    }

    // 检查工单状态
    if (ticket.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: '工单已关闭，无法回复'
      });
    }

    // 插入回复
    await db.query(
      `INSERT INTO ticket_replies 
      (ticket_id, user_id, content, is_admin, attachments)
      VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        content,
        isAdmin ? 1 : 0,
        attachments ? JSON.stringify(attachments) : null
      ]
    );

    // 如果是管理员回复且工单状态是open，更新为in_progress
    if (isAdmin && ticket.status === 'open') {
      await db.query(
        'UPDATE tickets SET status = \'in_progress\' WHERE id = ?',
        [id]
      );
    }

    res.json({
      success: true,
      message: '回复成功'
    });
  } catch (error) {
    console.error('[工单] 回复失败:', error);
    res.status(500).json({
      success: false,
      message: '回复工单失败'
    });
  }
});

/**
 * PUT /api/tickets/:id/status
 * 更新工单状态（用户可以关闭自己的工单）
 */
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: '请提供状态'
      });
    }

    // 查询工单
    const [tickets] = await db.query(
      'SELECT user_id FROM tickets WHERE id = ?',
      [id]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        message: '工单不存在'
      });
    }

    const ticket = tickets[0];

    // 权限检查：用户只能关闭自己的工单
    if (ticket.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: '无权操作此工单'
      });
    }

    // 用户只能关闭工单
    if (status !== 'closed') {
      return res.status(400).json({
        success: false,
        message: '只能关闭工单'
      });
    }

    await db.query(
      'UPDATE tickets SET status = ?, closed_at = NOW() WHERE id = ?',
      [status, id]
    );

    res.json({
      success: true,
      message: '工单状态更新成功'
    });
  } catch (error) {
    console.error('[工单] 更新状态失败:', error);
    res.status(500).json({
      success: false,
      message: '更新工单状态失败'
    });
  }
});

/**
 * GET /api/admin/tickets
 * 获取所有工单（管理员）
 */
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, category, priority, page = 1, pageSize = 20 } = req.query;

    let query = `
      SELECT t.*, 
        u.username as user_name, u.email as user_email,
        a.username as assigned_name
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }

    if (category) {
      query += ' AND t.category = ?';
      params.push(category);
    }

    if (priority) {
      query += ' AND t.priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY t.created_at DESC';

    // 分页
    const offset = (page - 1) * pageSize;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);

    const [tickets] = await db.query(query, params);

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM tickets WHERE 1=1';
    const countParams = [];
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    if (priority) {
      countQuery += ' AND priority = ?';
      countParams.push(priority);
    }
    const [countResult] = await db.query(countQuery, countParams);

    res.json({
      success: true,
      data: tickets,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: countResult[0].total
      }
    });
  } catch (error) {
    console.error('[工单] 获取列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取工单列表失败'
    });
  }
});

/**
 * PUT /api/admin/tickets/:id
 * 更新工单（管理员）
 */
router.put('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo } = req.body;

    const updates = [];
    const values = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);

      if (status === 'resolved') {
        updates.push('resolved_at = NOW()');
      } else if (status === 'closed') {
        updates.push('closed_at = NOW()');
      }
    }

    if (priority) {
      updates.push('priority = ?');
      values.push(priority);
    }

    if (assignedTo !== undefined) {
      updates.push('assigned_to = ?');
      values.push(assignedTo || null);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有可更新的字段'
      });
    }

    values.push(id);

    await db.query(
      `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({
      success: true,
      message: '工单更新成功'
    });
  } catch (error) {
    console.error('[工单] 更新失败:', error);
    res.status(500).json({
      success: false,
      message: '更新工单失败'
    });
  }
});

/**
 * GET /api/admin/tickets/stats
 * 获取工单统计（管理员）
 */
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // 按状态统计
    const [statusStats] = await db.query(`
      SELECT status, COUNT(*) as count
      FROM tickets
      GROUP BY status
    `);

    // 按类别统计
    const [categoryStats] = await db.query(`
      SELECT category, COUNT(*) as count
      FROM tickets
      GROUP BY category
    `);

    // 按优先级统计
    const [priorityStats] = await db.query(`
      SELECT priority, COUNT(*) as count
      FROM tickets
      GROUP BY priority
    `);

    // 总数
    const [total] = await db.query('SELECT COUNT(*) as count FROM tickets');

    res.json({
      success: true,
      data: {
        total: total[0].count,
        byStatus: statusStats,
        byCategory: categoryStats,
        byPriority: priorityStats
      }
    });
  } catch (error) {
    console.error('[工单] 获取统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取工单统计失败'
    });
  }
});

export default router;
