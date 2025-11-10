import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './auth.js';
import spaceRouter from './space.js';

dotenv.config( );

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// API 路由
app.use('/api', authRouter);
app.use('/api/space', spaceRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 启动服务器
const PORT = process.env.BACKEND_PORT || 3001;
app.listen(PORT, () => {
  console.log(`✓ Backend API server running on http://localhost:${PORT}` );
  console.log(`✓ API endpoints:`);
  console.log(`  - http://localhost:${PORT}/api/space/floors` );
  console.log(`  - http://localhost:${PORT}/api/space/facilities` );
  console.log(`  - http://localhost:${PORT}/api/login` );
  console.log(`  - http://localhost:${PORT}/api/register` );
});
