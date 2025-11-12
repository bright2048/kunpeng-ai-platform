import express from 'express';
import bcrypt from 'bcrypt';
import db from './db.js';
import { authenticateToken, requireSuperAdmin, logAdminAction } from './middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users
 * 获取用户列表（超级管理员）
 */
router.get('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { role, isActive, search, page = 1, limit = 20 } = req.query;

    let query = 'SELECT id, email, username, name, role, is_active, created_at, last_login_at FROM users WHERE 1=1';
    const params = [];

    // 角色筛选
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    // 激活状态筛选
    if (isActive !== undefined) {
      query += ' AND is_active = ?';
      params.push(isActive === 'true');
    }

    // 搜索
    if (search) {
      query += ' AND (email LIKE ? OR username LIKE ? OR name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // 分页
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [users] = await db.query(query, params);

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];

    if (role) {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }

    if (isActive !== undefined) {
      countQuery += ' AND is_active = ?';
      countParams.push(isActive === 'true');
    }

    if (search) {
      countQuery += ' AND (email LIKE ? OR username LIKE ? OR name LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户列表失败',
    });
  }
});

/**
 * GET /api/users/:id
 * 获取单个用户详情（超级管理员）
 */
router.get('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.query(
      'SELECT id, email, username, name, role, is_active, created_at, last_login_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    res.json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户详情失败',
    });
  }
});

/**
 * PUT /api/users/:id/role
 * 修改用户角色（超级管理员）
 */
router.put('/:id/role', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // 验证角色
    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: '无效的角色',
      });
    }

    // 不能修改自己的角色
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: '不能修改自己的角色',
      });
    }

    const [result] = await db.query(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    // 记录操作日志
    await logAdminAction(req.user.id, 'update_user_role', 'users', id, { role }, req);

    res.json({
      success: true,
      message: '角色修改成功',
    });
  } catch (error) {
    console.error('修改用户角色失败:', error);
    res.status(500).json({
      success: false,
      message: '修改用户角色失败',
    });
  }
});

/**
 * PUT /api/users/:id/status
 * 启用/禁用用户（超级管理员）
 */
router.put('/:id/status', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // 不能禁用自己
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: '不能禁用自己的账号',
      });
    }

    const [result] = await db.query(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [isActive, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    // 记录操作日志
    await logAdminAction(req.user.id, 'update_user_status', 'users', id, { isActive }, req);

    res.json({
      success: true,
      message: isActive ? '用户已启用' : '用户已禁用',
    });
  } catch (error) {
    console.error('修改用户状态失败:', error);
    res.status(500).json({
      success: false,
      message: '修改用户状态失败',
    });
  }
});

/**
 * PUT /api/users/:id/password
 * 重置用户密码（超级管理员）
 */
router.put('/:id/password', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码至少6位',
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    // 记录操作日志
    await logAdminAction(req.user.id, 'reset_user_password', 'users', id, {}, req);

    res.json({
      success: true,
      message: '密码重置成功',
    });
  } catch (error) {
    console.error('重置密码失败:', error);
    res.status(500).json({
      success: false,
      message: '重置密码失败',
    });
  }
});

/**
 * DELETE /api/users/:id
 * 删除用户（超级管理员）
 */
router.delete('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // 不能删除自己
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: '不能删除自己的账号',
      });
    }

    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    // 记录操作日志
    await logAdminAction(req.user.id, 'delete_user', 'users', id, {}, req);

    res.json({
      success: true,
      message: '用户删除成功',
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({
      success: false,
      message: '删除用户失败',
    });
  }
});

/**
 * GET /api/users/stats
 * 获取用户统计信息（超级管理员）
 */
router.get('/stats/overview', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    // 总用户数
    const [totalResult] = await db.query('SELECT COUNT(*) as total FROM users');
    const total = totalResult[0].total;

    // 激活用户数
    const [activeResult] = await db.query('SELECT COUNT(*) as active FROM users WHERE is_active = TRUE');
    const active = activeResult[0].active;

    // 按角色统计
    const [roleStats] = await db.query(`
      SELECT 
        role,
        COUNT(*) as count
      FROM users
      GROUP BY role
    `);

    // 最近7天新增用户
    const [recentResult] = await db.query(`
      SELECT COUNT(*) as recent
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);
    const recent = recentResult[0].recent;

    res.json({
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        recent,
        byRole: roleStats,
      },
    });
  } catch (error) {
    console.error('获取用户统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户统计失败',
    });
  }
});

export default router;
