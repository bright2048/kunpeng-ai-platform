import express from 'express';
import fs from 'fs';
import path from 'path';
const router = express.Router();
const USERS_FILE = path.join(process.cwd(), 'users.json');
//2025年11月11日添加
//const express = require('express');
import nodemailer from 'nodemailer';
//const nodemailer = require('nodemailer');
import bcrypt from 'bcrypt';
//const bcrypt = require('bcrypt');
import db from './db';
//const db = require('./db');


//2025年11月11日添加
// 配置邮件发送器
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.163.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
// 生成6位验证码
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 发送验证码
router.post('/send-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: '邮箱不能为空' });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟后过期

    // 保存验证码到数据库
    await db.query(
      'INSERT INTO verification_codes (email, code, expires_at, used) VALUES (?, ?, ?, FALSE)',
      [email, code, expiresAt]
    );

    // 发送邮件
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: '鲲鹏产业源头创新中心 - 邮箱验证码',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>邮箱验证码</h2>
          <p>您的验证码是：</p>
          <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px;">${code}</h1>
          <p>验证码将在10分钟后过期，请尽快使用。</p>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            如果这不是您的操作，请忽略此邮件。
          </p>
        </div>
      `,
    });

    res.json({ success: true, message: '验证码已发送' });
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({ message: '发送失败，请稍后重试' });
  }
});



// 初始化用户文件
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

// 读取用户
function getUsers() {
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

// 保存用户
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}



// 注册
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, code } = req.body;

    // 验证验证码
    const [codes] = await db.query(
      'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [email, code]
    );

    if (codes.length === 0) {
      return res.status(400).json({ message: '验证码无效或已过期' });
    }

    // 检查用户是否已存在
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: '邮箱或用户名已被注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const [result] = await db.query(
      'INSERT INTO users (email, username, password, name) VALUES (?, ?, ?, ?)',
      [email, username, hashedPassword, username]
    );

    // 标记验证码为已使用
    await db.query(
      'UPDATE verification_codes SET used = TRUE WHERE id = ?',
      [codes[0].id]
    );

    const token = Buffer.from(`${result.insertId}:${Date.now()}`).toString('base64');

    res.json({
      success: true,
      message: '注册成功',
      user: {
        id: result.insertId,
        email,
        username,
        name: username,
      },
      token,
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ message: '注册失败' });
  }
});

// // 注册
// router.post('/register', (req, res) => {
//   const { email, password, name } = req.body;

//   if (!email || !password || !name) {
//     return res.status(400).json({ message: '请填写完整信息' });
//   }

//   const users = getUsers();
  
//   // 检查邮箱是否已存在
//   if (users.find(u => u.email === email)) {
//     return res.status(400).json({ message: '该邮箱已被注册' });
//   }

//   // 创建新用户
//   const newUser = {
//     id: Date.now().toString(),
//     email,
//     password, // 生产环境应该加密
//     name,
//     createdAt: new Date().toISOString()
//   };

//   users.push(newUser);
//   saveUsers(users);

//   // 返回用户信息（不包含密码）
//   const { password: _, ...userWithoutPassword } = newUser;
  
//   res.json({
//     message: '注册成功',
//     token: newUser.id, // 简单起见，用 ID 作为 token
//     user: userWithoutPassword
//   });
// });


// 登录（支持邮箱或用户名）
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // 查询用户
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1',
      [identifier, identifier]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: '用户不存在' });
    }

    const user = users[0];

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: '密码错误' });
    }

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    res.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ message: '登录失败' });
  }
});

//module.exports = router;
// // 登录
// router.post('/login', (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: '请填写邮箱和密码' });
//   }

//   const users = getUsers();
//   const user = users.find(u => u.email === email && u.password === password);

//   if (!user) {
//     return res.status(401).json({ message: '邮箱或密码错误' });
//   }

//   // 返回用户信息（不包含密码）
//   const { password: _, ...userWithoutPassword } = user;
  
//   res.json({
//     message: '登录成功',
//     token: user.id,
//     user: userWithoutPassword
//   });
// });

export default router;
