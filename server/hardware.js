import express from 'express';
import mysql from 'mysql2/promise';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken'; // 提前导入JWT，避免运行时require

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // 获取当前文件的绝对路径
const __dirname = path.dirname(__filename); // 从文件路径推导目录路径

const router = express.Router();

// 数据库连接配置（从环境变量读取）
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// ========================================
// 文件上传配置
// ========================================

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
const imagesDir = path.join(uploadDir, 'hardware/images');
const pdfsDir = path.join(uploadDir, 'hardware/pdfs');

[uploadDir, imagesDir, pdfsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 图片上传配置
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'hw-img-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件（JPEG, PNG, GIF, WebP）'));
    }
  }
});

// PDF上传配置
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pdfsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'hw-pdf-' + uniqueSuffix + '.pdf');
  }
});

const pdfUpload = multer({
  storage: pdfStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('只允许上传PDF文件'));
    }
  }
});

// ========================================
// 中间件：验证JWT Token
// ========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未提供认证令牌'
    });
  }

  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: '无效的认证令牌'
      });
    }
    req.user = user;
    next();
  });
};

// ========================================
// 中间件：验证管理员权限
// ========================================
const requireAdmin = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT is_admin FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0 || !users[0].is_admin) {
      return res.status(403).json({
        success: false,
        message: '需要管理员权限'
      });
    }

    next();
  } catch (error) {
    console.error('验证管理员权限失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// ========================================
// API路由
// ========================================

/**
 * 获取产品列表
 * GET /api/hardware/products
 * 查询参数：
 *   - category: 硬件品类
 *   - cpu_brand, gpu_brand, memory_size, storage_size: 计算设备筛选
 *   - port_speed: 网络设备筛选
 *   - print_type: 打印机筛选
 *   - screen_size, resolution: 显示器筛选
 *   - status: 状态筛选（默认只返回active）
 *   - all: 是否返回所有状态（管理员使用）
 */
router.get('/products', async (req, res) => {
  let query = 'SELECT * FROM hardware_products WHERE 1=1';
  const params = [];
  try {
    const {
      category,
      cpu_brand,
      gpu_brand,
      memory_size,
      storage_size,
      port_speed,
      print_type,
      screen_size,
      resolution,
      status,
      all
    } = req.query;



    // 状态筛选
    if (!all || all !== 'true') {
      query += ' AND status = ?';
      params.push(status || 'active');
    }

    // 品类筛选
    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    // 计算设备筛选
    if (cpu_brand && cpu_brand !== 'all') {
      query += ' AND cpu_brand = ?';
      params.push(cpu_brand);
    }
    if (gpu_brand && gpu_brand !== 'all') {
      query += ' AND gpu_brand = ?';
      params.push(gpu_brand);
    }
    if (memory_size && memory_size !== 'all') {
      query += ' AND memory_size = ?';
      params.push(memory_size);
    }
    if (storage_size && storage_size !== 'all') {
      query += ' AND storage_size = ?';
      params.push(storage_size);
    }

    // 网络设备筛选
    if (port_speed && port_speed !== 'all') {
      query += ' AND port_speed = ?';
      params.push(port_speed);
    }

    // 打印机筛选
    if (print_type && print_type !== 'all') {
      query += ' AND print_type = ?';
      params.push(print_type);
    }

    // 显示器筛选
    if (screen_size && screen_size !== 'all') {
      query += ' AND screen_size = ?';
      params.push(screen_size);
    }
    if (resolution && resolution !== 'all') {
      query += ' AND resolution = ?';
      params.push(resolution);
    }

    query += ' ORDER BY created_at DESC';

    const [products] = await pool.query(query, params);

    // 解析JSON字段
    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      is_hot: !!product.is_hot,
      is_new: !!product.is_new,
      is_recommended: !!product.is_recommended,
      print_color: product.print_color !== null ? !!product.print_color : undefined
    }));

    res.json({
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    console.error('===== 获取产品列表失败 =====');
    console.error('1. SQL查询语句:', query); // 实际执行的SQL
    console.error('2. 查询参数:', params); // 传入的参数（如 status: 'active'）
    console.error('3. 错误类型:', error.name); // 错误类型（如 SQLError、SyntaxError）
    console.error('4. 错误信息:', error.message); // 具体错误描述（如“表不存在”“字段不存在”）
    console.error('5. 错误堆栈:', error.stack); // 完整调用栈（定位具体哪行出错）
    console.error('获取产品列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取产品列表失败',
      debug: {
        sql: query,
        params: params,
        errorMsg: error.message // 直接返回错误详情，方便前端查看
      }
    });
  }
});

/**
 * 获取产品详情
 * GET /api/hardware/products/:id
 */
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query(
      'SELECT * FROM hardware_products WHERE id = ?',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: '产品不存在'
      });
    }

    // 增加浏览次数
    await pool.query(
      'UPDATE hardware_products SET view_count = view_count + 1 WHERE id = ?',
      [id]
    );

    const product = products[0];
    const formattedProduct = {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      is_hot: !!product.is_hot,
      is_new: !!product.is_new,
      is_recommended: !!product.is_recommended,
      print_color: product.print_color !== null ? !!product.print_color : undefined
    };

    res.json({
      success: true,
      data: formattedProduct
    });
  } catch (error) {
    console.error('获取产品详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取产品详情失败'
    });
  }
});

/**
 * 创建产品（管理员）
 * POST /api/hardware/products
 */
router.post('/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const productData = req.body;

    // 验证必填字段
    if (!productData.product_name || !productData.product_model || !productData.category) {
      return res.status(400).json({
        success: false,
        message: '缺少必填字段'
      });
    }

    // 准备插入数据
    const insertData = {
      product_name: productData.product_name,
      product_model: productData.product_model,
      category: productData.category,
      price: productData.price || 0,
      stock: productData.stock || 0,
      images: JSON.stringify(productData.images || []),
      detail_pdf: productData.detail_pdf || null,
      brief_description: productData.brief_description || null,
      full_description: productData.full_description || null,
      status: productData.status || 'active',
      is_hot: productData.is_hot ? 1 : 0,
      is_new: productData.is_new ? 1 : 0,
      is_recommended: productData.is_recommended ? 1 : 0,
      // 计算设备字段
      cpu_brand: productData.cpu_brand || null,
      cpu_model: productData.cpu_model || null,
      gpu_brand: productData.gpu_brand || null,
      gpu_model: productData.gpu_model || null,
      memory_size: productData.memory_size || null,
      storage_size: productData.storage_size || null,
      // 网络设备字段
      port_count: productData.port_count || null,
      port_speed: productData.port_speed || null,
      network_layer: productData.network_layer || null,
      // 打印机字段
      print_type: productData.print_type || null,
      print_speed: productData.print_speed || null,
      print_color: productData.print_color !== undefined ? (productData.print_color ? 1 : 0) : null,
      // 显示器字段
      screen_size: productData.screen_size || null,
      resolution: productData.resolution || null,
      refresh_rate: productData.refresh_rate || null,
      panel_type: productData.panel_type || null,
    };

    const [result] = await pool.query(
      'INSERT INTO hardware_products SET ?',
      insertData
    );

    res.json({
      success: true,
      data: {
        id: result.insertId,
        ...productData
      }
    });
  } catch (error) {
    console.error('创建产品失败:', error);
    res.status(500).json({
      success: false,
      message: '创建产品失败'
    });
  }
});

/**
 * 更新产品（管理员）
 * PUT /api/hardware/products/:id
 */
router.put('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    // 检查产品是否存在
    const [existing] = await pool.query(
      'SELECT id FROM hardware_products WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '产品不存在'
      });
    }

    // 准备更新数据
    const updateData = {
      product_name: productData.product_name,
      product_model: productData.product_model,
      category: productData.category,
      price: productData.price,
      stock: productData.stock,
      images: JSON.stringify(productData.images || []),
      detail_pdf: productData.detail_pdf || null,
      brief_description: productData.brief_description || null,
      full_description: productData.full_description || null,
      status: productData.status,
      is_hot: productData.is_hot ? 1 : 0,
      is_new: productData.is_new ? 1 : 0,
      is_recommended: productData.is_recommended ? 1 : 0,
      // 计算设备字段
      cpu_brand: productData.cpu_brand || null,
      cpu_model: productData.cpu_model || null,
      gpu_brand: productData.gpu_brand || null,
      gpu_model: productData.gpu_model || null,
      memory_size: productData.memory_size || null,
      storage_size: productData.storage_size || null,
      // 网络设备字段
      port_count: productData.port_count || null,
      port_speed: productData.port_speed || null,
      network_layer: productData.network_layer || null,
      // 打印机字段
      print_type: productData.print_type || null,
      print_speed: productData.print_speed || null,
      print_color: productData.print_color !== undefined ? (productData.print_color ? 1 : 0) : null,
      // 显示器字段
      screen_size: productData.screen_size || null,
      resolution: productData.resolution || null,
      refresh_rate: productData.refresh_rate || null,
      panel_type: productData.panel_type || null,
    };

    await pool.query(
      'UPDATE hardware_products SET ? WHERE id = ?',
      [updateData, id]
    );

    res.json({
      success: true,
      data: {
        id: parseInt(id),
        ...productData
      }
    });
  } catch (error) {
    console.error('更新产品失败:', error);
    res.status(500).json({
      success: false,
      message: '更新产品失败'
    });
  }
});

/**
 * 删除产品（管理员）
 * DELETE /api/hardware/products/:id
 */
router.delete('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM hardware_products WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '产品不存在'
      });
    }

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除产品失败:', error);
    res.status(500).json({
      success: false,
      message: '删除产品失败'
    });
  }
});

/**
 * 上传产品图片（管理员）
 * POST /api/hardware/upload-images
 */
router.post('/upload-images', authenticateToken, requireAdmin, imageUpload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      });
    }

    const urls = req.files.map(file => {
      return `/uploads/hardware/images/${file.filename}`;
    });

    res.json({
      success: true,
      data: { urls }
    });
  } catch (error) {
    console.error('上传图片失败:', error);
    res.status(500).json({
      success: false,
      message: '上传图片失败'
    });
  }
});

/**
 * 上传PDF文件（管理员）
 * POST /api/hardware/upload-pdf
 */
router.post('/upload-pdf', authenticateToken, requireAdmin, pdfUpload.single('pdf'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      });
    }

    const url = `/uploads/hardware/pdfs/${req.file.filename}`;

    res.json({
      success: true,
      data: { url }
    });
  } catch (error) {
    console.error('上传PDF失败:', error);
    res.status(500).json({
      success: false,
      message: '上传PDF失败'
    });
  }
});

export default router;