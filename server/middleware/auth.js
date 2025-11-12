import jwt from 'jsonwebtoken';
import db from '../db.js';

// JWT密钥（生产环境应从环境变量读取）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token有效期

/**
 * 生成JWT Token
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * 验证JWT Token中间件
 * 从请求头中提取token并验证
 */
export async function authenticateToken(req, res, next) {
  try {
    // 从请求头获取token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌',
      });
    }

    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 从数据库获取最新用户信息
    const [users] = await db.query(
      'SELECT id, email, username, name, role, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户不存在',
      });
    }

    const user = users[0];

    // 检查账号是否激活
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: '账号已被禁用',
      });
    }

    // 将用户信息附加到请求对象
    req.user = user;

    // 更新最后登录时间（异步，不阻塞请求）
    db.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]).catch(err => {
      console.error('更新登录时间失败:', err);
    });

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '认证令牌已过期',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌',
      });
    }

    console.error('认证失败:', error);
    return res.status(500).json({
      success: false,
      message: '认证失败',
    });
  }
}

/**
 * 验证管理员权限中间件
 * 需要先经过 authenticateToken 中间件
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '未认证',
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: '权限不足，需要管理员权限',
    });
  }

  next();
}

/**
 * 验证超级管理员权限中间件
 * 需要先经过 authenticateToken 中间件
 */
export function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '未认证',
    });
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: '权限不足，需要超级管理员权限',
    });
  }

  next();
}

/**
 * 记录管理员操作日志
 */
export async function logAdminAction(userId, action, resource, resourceId, details, req) {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await db.query(
      `INSERT INTO admin_logs (user_id, action, resource, resource_id, details, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, action, resource, resourceId, JSON.stringify(details), ipAddress, userAgent]
    );
  } catch (error) {
    console.error('记录操作日志失败:', error);
  }
}

/**
 * 可选的角色检查中间件工厂函数
 * 用法: requireRole(['admin', 'super_admin'])
 */
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未认证',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '权限不足',
      });
    }

    next();
  };
}
