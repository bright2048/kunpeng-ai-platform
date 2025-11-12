import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

async function createAdmin() {
  try {
    console.log('========================================');
    console.log('创建管理员账号');
    console.log('========================================');
    console.log('');

    console.log('正在连接数据库...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'szkpic'
    });

    console.log('✓ 数据库连接成功');
    console.log('');

    console.log('正在生成密码hash...');
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    console.log('✓ 密码hash生成成功');
    console.log('');

    console.log('检查admin用户是否存在...');
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE username=?',
      ['admin']
    );

    if (existingUsers.length > 0) {
      console.log('⚠ admin用户已存在，正在更新...');
      await connection.execute(
        'UPDATE users SET password=?, role=?, is_active=? WHERE username=?',
        [hash, 'super_admin', true, 'admin']
      );
      console.log('✓ admin用户已更新');
    } else {
      console.log('正在创建admin用户...');
      await connection.execute(
        'INSERT INTO users (email, username, password, name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin@szkpic.com', 'admin', hash, '系统管理员', 'super_admin', true]
      );
      console.log('✓ admin用户已创建');
    }

    await connection.end();

    console.log('');
    console.log('========================================');
    console.log('管理员账号创建成功！');
    console.log('========================================');
    console.log('');
    console.log('登录信息:');
    console.log('  用户名: admin');
    console.log('  密码: admin123');
    console.log('  角色: 超级管理员');
    console.log('');
    console.log('⚠️  重要提示：请立即登录并修改密码！');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('========================================');
    console.error('❌ 创建失败！');
    console.error('========================================');
    console.error('');
    console.error('错误信息:', error.message);
    console.error('');
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('提示: users表不存在，请先执行数据库迁移脚本:');
      console.error('  mysql -u root -p szkpic < database/add_user_roles.sql');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('提示: 无法连接到MySQL数据库，请检查:');
      console.error('  1. MySQL服务是否运行: systemctl status mysql');
      console.error('  2. .env文件中的数据库配置是否正确');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('提示: 数据库认证失败，请检查.env文件中的数据库密码');
    }
    
    console.error('');
    process.exit(1);
  }
}

createAdmin();
