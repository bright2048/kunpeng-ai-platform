# 算力保障功能 - 快速开始

## 🚀 5分钟快速部署

### 第1步：解压文件

```bash
cd /opt/kunpeng-ai-platform
tar -xzf computing-power-complete.tar.gz
```

### 第2步：数据库迁移

```bash
# 执行SQL脚本
mysql -h your-host -u your-user -p your-database < server/migrations/computing-power-tables.sql

# 初始化云厂商数据
mysql -h your-host -u your-user -p your-database << 'EOF'
INSERT INTO cloud_providers (name, code, description, support_voucher, status) VALUES
('阿里云', 'aliyun', '阿里云提供的AI算力资源', 1, 'active'),
('腾讯云', 'tencent', '腾讯云提供的AI算力资源', 0, 'active'),
('火山云', 'volcano', '火山云提供的AI算力资源', 0, 'active');

-- 关联现有GPU资源
UPDATE gpu_resources 
SET cloud_provider_id = (SELECT id FROM cloud_providers WHERE code = 'aliyun' LIMIT 1),
    cloud_provider_code = 'aliyun'
WHERE cloud_provider_id IS NULL;
EOF
```

### 第3步：部署代码

```bash
cd /opt/kunpeng-ai-platform

# 后端
pm2 restart kunpeng-backend
pm2 logs kunpeng-backend --lines 20

# 前端
cd client
npm run build
pm2 restart kunpeng-frontend
# 或
sudo systemctl reload nginx
```

### 第4步：验证

访问：`http://your-domain.com/services/computing`

---

## 🧪 快速测试

### 1. 创建算力券（管理员）

1. 访问：`http://your-domain.com/admin/vouchers`
2. 点击"创建算力券"
3. 填写：
   - 代码: `TEST50`
   - 名称: `测试50元券`
   - 类型: 金额券
   - 值: 50
   - 发行量: 10
4. 创建成功

### 2. 赠送算力券

1. 点击"赠送算力券"
2. 输入：
   - 券代码: `TEST50`
   - 用户ID: `1`
3. 赠送成功

### 3. 用户下单

1. 登录用户账号（ID=1）
2. 访问算力保障页面
3. 选择GPU资源
4. 点击"立即租用"
5. 选择算力券
6. 确认价格计算正确
7. 下单成功

---

## 📊 功能清单

✅ 多云厂商支持（阿里云、腾讯云、火山云）
✅ GPU资源筛选和排序
✅ 算力券功能（金额券、折扣券）
✅ 产品折扣功能
✅ 订单自动计算价格
✅ 管理员算力券管理
✅ 管理员折扣管理
✅ 用户订单管理

---

## 🔗 重要链接

- **用户端**：`/services/computing`
- **管理员算力券**：`/admin/vouchers`
- **管理员折扣**：`/admin/discounts`
- **用户订单**：`/account?tab=orders`

---

## 📞 技术支持

如遇问题，请查看完整部署指南：`COMPUTING_POWER_DEPLOYMENT_GUIDE.md`

或检查：
- 后端日志：`pm2 logs kunpeng-backend`
- 前端控制台：浏览器开发者工具
- 数据库：检查表是否创建成功

---

**祝部署顺利！** 🎉
