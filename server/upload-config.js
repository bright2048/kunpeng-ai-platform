/**
 * 统一的上传目录配置模块
 * 
 * 用途：
 * 1. 统一管理上传目录配置
 * 2. 自动创建所需目录
 * 3. 避免代码重复
 * 
 * 使用方法：
 * const { uploadPaths } = require('./upload-config');
 * console.log(uploadPaths.hardwareImages);
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
/**
 * 获取上传根目录
 * @returns {string} 上传目录的绝对路径
 */
function getUploadDir() {
  const uploadDir = process.env.UPLOAD_DIR || 'client/public/uploads';

  // 如果是绝对路径，直接返回
  if (path.isAbsolute(uploadDir)) {
    console.log(`[上传配置] 使用绝对路径: ${uploadDir}`);
    return uploadDir;
  }

  // 如果是相对路径，相对于项目根目录
  const absolutePath = path.join(__dirname, '..', uploadDir);
  console.log(`[上传配置] 使用相对路径: ${uploadDir} → ${absolutePath}`);
  return absolutePath;
}

/**
 * 确保目录存在，不存在则创建
 * @param {string} dir - 目录路径
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`[上传配置] ✅ 创建目录: ${dir}`);
  }
}

// 获取上传根目录
const uploadRootDir = getUploadDir();

// 定义所有上传路径
const uploadPaths = {
  // 根目录
  root: uploadRootDir,

  // 硬件产品相关
  hardwareRoot: path.join(uploadRootDir, 'hardware'),
  hardwareImages: path.join(uploadRootDir, 'hardware/images'),
  hardwarePdfs: path.join(uploadRootDir, 'hardware/pdfs'),

  // 可以继续添加其他类型的上传路径
  // 例如：用户头像、文档等
  // userAvatars: path.join(uploadRootDir, 'avatars'),
  // documents: path.join(uploadRootDir, 'documents'),
};

// 自动创建所有必需的目录
function initUploadDirs() {
  const dirsToCreate = [
    uploadPaths.root,
    uploadPaths.hardwareRoot,
    uploadPaths.hardwareImages,
    uploadPaths.hardwarePdfs,
  ];

  console.log('[上传配置] 初始化上传目录...');
  dirsToCreate.forEach(ensureDir);
  console.log('[上传配置] 上传目录初始化完成');
}

// 模块加载时自动初始化目录
initUploadDirs();

// 导出其他工具函数
export { uploadPaths, getUploadDir, ensureDir, initUploadDirs };

// 默认导出（如果需要）
export default {
  uploadPaths,
  getUploadDir,
  ensureDir,
  initUploadDirs,
};

// // 导出配置
// module.exports = {
//   uploadPaths,      // 所有上传路径
//   getUploadDir,     // 获取上传根目录的函数
//   ensureDir,        // 确保目录存在的工具函数
//   initUploadDirs,   // 手动初始化目录的函数
// };
