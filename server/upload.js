import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();
// ========================================
// ✅ 使用统一的上传配置模块
// ========================================
import uploadPaths from './upload-config';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(path.dirname(__filename), '..');
const router = express.Router();



// 配置Multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;

    if (file.mimetype.startsWith('image/')) {
      uploadPath = uploadPaths.hardwareImages;  // ✅ 直接使用
    } else if (file.mimetype === 'application/pdf') {
      uploadPath = uploadPaths.hardwarePdfs;    // ✅ 直接使用
    } else {
      uploadPath = uploadPaths.hardwareRoot;    // ✅ 直接使用
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const prefix = file.mimetype.startsWith('image/') ? 'hw-img' : 'hw-pdf';
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  }
});


// 图片上传配置
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, hardwareImagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `hw-img-${uniqueSuffix}${ext}`);
  }
});

const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只支持图片文件 (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// PDF上传配置
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, hardwarePdfsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `hw-pdf-${uniqueSuffix}.pdf`);
  }
});

const pdfUpload = multer({
  storage: pdfStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('只支持PDF文件'));
    }
  }
});

/**
 * 上传硬件产品图片
 * POST /api/upload/hardware-images
 */
router.post('/hardware-images', imageUpload.array('images', 5), (req, res) => {
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

    console.log(`✓ Uploaded ${urls.length} images:`, urls);

    res.json({
      success: true,
      data: { urls }
    });
  } catch (error) {
    console.error('上传图片失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '上传图片失败'
    });
  }
});

/**
 * 上传硬件产品PDF
 * POST /api/upload/hardware-pdf
 */
router.post('/hardware-pdf', pdfUpload.single('pdf'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      });
    }

    const url = `/uploads/hardware/pdfs/${req.file.filename}`;

    console.log(`✓ Uploaded PDF:`, url);

    res.json({
      success: true,
      data: { url }
    });
  } catch (error) {
    console.error('上传PDF失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '上传PDF失败'
    });
  }
});

export default router;
