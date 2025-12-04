import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// @ts-ignore
import authRouter from './auth.js';
// @ts-ignore
import spaceRouter from './space.js';
// @ts-ignore
import gpuRouter from './gpu.js';
// @ts-ignore
import usersRouter from './users.js';
// @ts-ignore
import hardwareRouter from './hardware.js';
// @ts-ignore
import billingRouter from './billing.js';
// @ts-ignore
import paymentRouter from './payment.js';
// @ts-ignore
import uploadRouter from './upload.js';
// @ts-ignore
import cloudProvidersRouter from './cloud-providers.js';
// @ts-ignore
import vouchersRouter from './vouchers.js';
// @ts-ignore
import discountsRouter from './discounts.js';
// @ts-ignore
import computingOrdersRouter from './computing-orders.js';
// @ts-ignore
import ticketsRouter from './tickets.js';

dotenv.config( );

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件服务 - 提供上传的文件访问
app.use('/uploads', express.static('uploads'));

// API 路由
app.use('/api', authRouter);
app.use('/api/space', spaceRouter);
app.use('/api/gpu', gpuRouter);
app.use('/api/users', usersRouter);
app.use('/api/hardware', hardwareRouter);
app.use('/api/billing', billingRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/cloud-providers', cloudProvidersRouter);
app.use('/api/vouchers', vouchersRouter);
app.use('/api/discounts', discountsRouter);
app.use('/api/computing/orders', computingOrdersRouter);
app.use('/api/tickets', ticketsRouter);

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
  console.log(`  - http://localhost:${PORT}/api/gpu/resources` );
  console.log(`  - http://localhost:${PORT}/api/gpu/stats` );
  console.log(`  - http://localhost:${PORT}/api/users` );
  console.log(`  - http://localhost:${PORT}/api/hardware/products` );
  console.log(`  - http://localhost:${PORT}/api/billing/account` );
  console.log(`  - http://localhost:${PORT}/api/payment/create-order` );
    console.log(`  - http://localhost:${PORT}/api/cloud-providers` );
  console.log(`  - http://localhost:${PORT}/api/vouchers/available` );
  console.log(`  - http://localhost:${PORT}/api/discounts/active` );
  console.log(`  - http://localhost:${PORT}/api/computing/orders` );
  console.log(`  - http://localhost:${PORT}/api/tickets` );
});
