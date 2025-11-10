import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('测试数据库连接...');
    console.log('配置:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
    });

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('✓ 数据库连接成功！');

    const [rows] = await connection.query('SELECT COUNT(*) as count FROM space_units');
    console.log('✓ 查询成功！空间单元数量:', rows[0].count);

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ 连接失败:', error.message);
    process.exit(1);
  }
}

testConnection();
