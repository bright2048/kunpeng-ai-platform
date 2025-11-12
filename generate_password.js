const bcrypt = require('bcrypt');

async function generatePassword() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('密码: admin123');
  console.log('Hash:', hash);
  console.log('\n执行以下SQL更新密码:');
  console.log(`UPDATE users SET password='${hash}' WHERE username='admin';`);
}

generatePassword();
