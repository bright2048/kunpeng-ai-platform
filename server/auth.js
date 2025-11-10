import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const USERS_FILE = path.join(process.cwd(), 'users.json');

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
router.post('/register', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: '请填写完整信息' });
  }

  const users = getUsers();
  
  // 检查邮箱是否已存在
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: '该邮箱已被注册' });
  }

  // 创建新用户
  const newUser = {
    id: Date.now().toString(),
    email,
    password, // 生产环境应该加密
    name,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  // 返回用户信息（不包含密码）
  const { password: _, ...userWithoutPassword } = newUser;
  
  res.json({
    message: '注册成功',
    token: newUser.id, // 简单起见，用 ID 作为 token
    user: userWithoutPassword
  });
});

// 登录
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '请填写邮箱和密码' });
  }

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: '邮箱或密码错误' });
  }

  // 返回用户信息（不包含密码）
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    message: '登录成功',
    token: user.id,
    user: userWithoutPassword
  });
});

export default router;
