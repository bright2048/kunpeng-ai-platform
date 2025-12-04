# 算力保障功能 - 完整部署指南

## 📋 功能概述

本次更新重写了算力保障页面，实现了以下功能：

### ✨ 核心功能

1. **多云厂商支持**
   - 阿里云、腾讯云、火山云等多个云厂商
   - 每个云厂商可配置是否支持算力券

2. **算力资源展示**
   - GPU资源列表展示
   - 按云厂商、GPU型号、区域筛选
   - 价格排序功能
   - 实时库存显示

3. **算力券功能**
   - 用户可使用算力券抵扣
   - 支持金额券、折扣券、免费时长券
   - 可限制云厂商、最低消费
   - 管理员可批量赠送算力券

4. **折扣功能**
   - 产品折扣配置
   - 可按云厂商、GPU型号设置
   - 支持优先级和有效期
   - 自动计算折扣价格

5. **订单管理**
   - 创建算力订单
   - 自动计算价格（原价-折扣-算力券）
   - 订单支付和取消
   - 订单历史查询

---

## 🗂️ 文件清单

### 数据库

- `server/migrations/computing-power-tables.sql` - 数据库表结构

### 后端API

- `server/cloud-providers.js` - 云厂商API
- `server/vouchers.js` - 算力券API
- `server/discounts.js` - 折扣API
- `server/computing-orders.js` - 订单API
- `server/index.ts` - 主服务器（已更新路由）

### 前端页面

- `client/src/pages/ComputingPower.tsx` - 算力保障页面（已重写）
- `client/src/pages/AdminVouchers.tsx` - 管理员算力券管理
- `client/src/pages/AdminDiscounts.tsx` - 管理员折扣管理
- `client/src/App.tsx` - 路由配置（已更新）

---

## 🚀 部署步骤

### 第1步：数据库迁移

```bash
# 连接到数据库
mysql -h your-db-host -u your-db-user -p your-db-name

# 执行迁移脚本
source /path/to/server/migrations/computing-power-tables.sql

# 验证表是否创建成功
SHOW TABLES LIKE '%cloud%';
SHOW TABLES LIKE '%voucher%';
SHOW TABLES LIKE '%discount%';
SHOW TABLES LIKE '%computing_orders%';
```

**预期结果**：
- `cloud_providers` - 云厂商表
- `gpu_resources` - GPU资源表（已存在，会添加新字段）
- `vouchers` - 算力券模板表
- `user_vouchers` - 用户算力券表
- `product_discounts` - 产品折扣表
- `computing_orders` - 算力订单表

### 第2步：初始化云厂商数据

```sql
-- 插入三大云厂商
INSERT INTO cloud_providers (name, code, description, support_voucher, status) VALUES
('阿里云', 'aliyun', '阿里云提供的AI算力资源', 1, 'active'),
('腾讯云', 'tencent', '腾讯云提供的AI算力资源', 0, 'active'),
('火山云', 'volcano', '火山云提供的AI算力资源', 0, 'active');
```

### 第3步：更新现有GPU资源

```sql
-- 为现有GPU资源关联云厂商
UPDATE gpu_resources 
SET cloud_provider_id = (SELECT id FROM cloud_providers WHERE code = 'aliyun' LIMIT 1),
    cloud_provider_code = 'aliyun'
WHERE cloud_provider_id IS NULL;
```

### 第4步：部署后端代码

```bash
cd /opt/kunpeng-ai-platform

# 拉取最新代码
git pull origin main

# 安装依赖（如果有新增）
cd server
npm install

# 重启后端服务
pm2 restart kunpeng-backend

# 查看日志确认启动成功
pm2 logs kunpeng-backend --lines 50
```

**检查日志中是否有**：
```
✓ Backend API server running on http://localhost:3001
✓ API endpoints:
  - http://localhost:3001/api/cloud-providers
  - http://localhost:3001/api/vouchers/available
  - http://localhost:3001/api/discounts/active
  - http://localhost:3001/api/computing/orders
```

### 第5步：部署前端代码

```bash
cd /opt/kunpeng-ai-platform/client

# 构建前端
npm run build

# 重启前端服务（如果使用pm2）
pm2 restart kunpeng-frontend

# 或者重启Nginx
sudo systemctl reload nginx
```

### 第6步：验证部署

1. **访问算力保障页面**
   ```
   http://your-domain.com/services/computing
   ```

2. **检查云厂商选择器**
   - 应该显示：全部、阿里云、腾讯云、火山云

3. **检查管理员页面**
   ```
   http://your-domain.com/admin/vouchers
   http://your-domain.com/admin/discounts
   ```

---

## 🧪 功能测试

### 测试1：云厂商筛选

1. 访问算力保障页面
2. 点击不同的云厂商按钮
3. 确认GPU列表正确筛选

### 测试2：创建算力券（管理员）

1. 登录管理员账号
2. 访问 `/admin/vouchers`
3. 点击"创建算力券"
4. 填写信息：
   - 代码: `ALIYUN50`
   - 名称: `阿里云50元算力券`
   - 云厂商: 阿里云
   - 类型: 金额券
   - 抵扣金额: 50
   - 最低消费: 100
   - 发行数量: 100
5. 点击"创建"
6. 确认创建成功

### 测试3：赠送算力券（管理员）

1. 在算力券管理页面
2. 点击"赠送算力券"
3. 输入：
   - 算力券代码: `ALIYUN50`
   - 用户ID: `1,2,3`
4. 点击"赠送"
5. 确认赠送成功

### 测试4：创建折扣（管理员）

1. 访问 `/admin/discounts`
2. 点击"创建折扣"
3. 填写信息：
   - 名称: `双十一特惠`
   - 云厂商: 阿里云
   - GPU型号: A100（可选）
   - 折扣率: 10（表示9折）
   - 优先级: 10
4. 点击"创建"
5. 确认创建成功

### 测试5：用户下单流程

1. 登录普通用户账号
2. 访问算力保障页面
3. 选择一个GPU资源
4. 点击"立即租用"
5. 在订单对话框中：
   - 选择租用时长
   - 选择算力券（如果有）
   - 查看价格明细
6. 点击"确认下单"
7. 确认订单创建成功
8. 访问 `/account?tab=orders` 查看订单

### 测试6：价格计算逻辑

**场景**：租用阿里云A100，1小时，原价100元

1. **无折扣无券**：最终价格 = 100元
2. **有9折折扣**：最终价格 = 90元
3. **有9折+50元券**：最终价格 = 40元（90-50）
4. **券不满足最低消费**：不可使用券

---

## 📊 数据库表结构

### cloud_providers（云厂商表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR(100) | 云厂商名称 |
| code | VARCHAR(50) | 云厂商代码 |
| logo_url | VARCHAR(500) | Logo URL |
| description | TEXT | 描述 |
| support_voucher | BOOLEAN | 是否支持算力券 |
| status | ENUM | 状态 |

### vouchers（算力券模板表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| code | VARCHAR(50) | 券代码 |
| name | VARCHAR(200) | 券名称 |
| cloud_provider_id | INT | 云厂商ID（可选） |
| type | ENUM | 类型：amount/discount/free_hours |
| value | DECIMAL | 值 |
| min_amount | DECIMAL | 最低消费 |
| max_discount | DECIMAL | 最大优惠 |
| total_quantity | INT | 总发行量 |
| used_quantity | INT | 已使用数量 |
| valid_from | DATETIME | 有效期开始 |
| valid_until | DATETIME | 有效期结束 |
| status | ENUM | 状态 |

### user_vouchers（用户算力券表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| user_id | INT | 用户ID |
| voucher_id | INT | 券ID |
| status | ENUM | 状态：unused/used/expired |
| received_at | DATETIME | 领取时间 |
| used_at | DATETIME | 使用时间 |
| order_id | INT | 订单ID |

### product_discounts（产品折扣表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR(200) | 折扣名称 |
| cloud_provider_id | INT | 云厂商ID（可选） |
| resource_id | INT | 资源ID（可选） |
| gpu_model | VARCHAR(100) | GPU型号（可选） |
| discount_rate | DECIMAL | 折扣率（%） |
| priority | INT | 优先级 |
| valid_from | DATETIME | 有效期开始 |
| valid_until | DATETIME | 有效期结束 |
| status | ENUM | 状态 |

### computing_orders（算力订单表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| order_no | VARCHAR(50) | 订单号 |
| user_id | INT | 用户ID |
| resource_id | INT | 资源ID |
| cloud_provider_id | INT | 云厂商ID |
| gpu_model | VARCHAR(100) | GPU型号 |
| duration | INT | 时长 |
| duration_unit | ENUM | 时长单位 |
| original_price | DECIMAL | 原价 |
| discount_amount | DECIMAL | 折扣金额 |
| voucher_amount | DECIMAL | 券抵扣金额 |
| final_price | DECIMAL | 最终价格 |
| voucher_id | INT | 使用的券ID |
| discount_id | INT | 使用的折扣ID |
| status | ENUM | 状态 |
| payment_method | VARCHAR(50) | 支付方式 |
| payment_time | DATETIME | 支付时间 |

---

## 🔧 API接口文档

### 云厂商API

#### GET /api/cloud-providers
获取云厂商列表

**Query参数**：
- `status`: 状态筛选（active/inactive）

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "阿里云",
      "code": "aliyun",
      "support_voucher": true,
      "status": "active"
    }
  ]
}
```

### 算力券API

#### GET /api/vouchers/my
获取我的算力券（需登录）

**Query参数**：
- `status`: 状态筛选（unused/used/expired）

#### POST /api/vouchers/admin
创建算力券（管理员）

**Body**：
```json
{
  "code": "ALIYUN50",
  "name": "阿里云50元算力券",
  "cloudProviderId": 1,
  "type": "amount",
  "value": 50,
  "minAmount": 100,
  "totalQuantity": 100
}
```

#### POST /api/vouchers/admin/grant
赠送算力券（管理员）

**Body**：
```json
{
  "voucherCode": "ALIYUN50",
  "userIds": [1, 2, 3]
}
```

### 折扣API

#### GET /api/discounts/active
获取有效折扣

**Query参数**：
- `cloudProviderCode`: 云厂商代码
- `gpuModel`: GPU型号

#### POST /api/discounts/admin
创建折扣（管理员）

**Body**：
```json
{
  "name": "双十一特惠",
  "cloudProviderId": 1,
  "gpuModel": "A100",
  "discountRate": 10,
  "priority": 10
}
```

### 订单API

#### POST /api/computing/orders
创建订单（需登录）

**Body**：
```json
{
  "resourceId": 1,
  "duration": 1,
  "durationUnit": "hour",
  "userVoucherId": 5
}
```

#### GET /api/computing/orders
获取我的订单（需登录）

**Query参数**：
- `status`: 订单状态
- `page`: 页码
- `pageSize`: 每页数量

---

## ⚠️ 注意事项

### 1. 权限控制

- 算力券和折扣管理页面需要管理员权限
- 确保 `users` 表有 `is_admin` 字段
- 管理员账号的 `is_admin` 字段设置为 1

### 2. 价格计算顺序

```
最终价格 = 原价 - 产品折扣 - 算力券抵扣
```

- 先应用产品折扣
- 再应用算力券
- 算力券抵扣不能超过折扣后价格

### 3. 算力券限制

- 检查云厂商限制
- 检查最低消费金额
- 检查有效期
- 一张券只能使用一次

### 4. 库存管理

- 订单支付成功后才扣减库存
- 订单取消不退还库存（可根据需求调整）

### 5. 环境变量

确保 `.env` 文件中配置了：
```env
VITE_API_URL=http://localhost:3001
```

---

## 🐛 常见问题

### Q1: 页面显示"暂无符合条件的算力资源"

**原因**：GPU资源没有关联云厂商

**解决**：
```sql
UPDATE gpu_resources 
SET cloud_provider_id = 1, 
    cloud_provider_code = 'aliyun'
WHERE cloud_provider_id IS NULL;
```

### Q2: 算力券不可用

**检查**：
1. 券是否已过期
2. 是否满足最低消费
3. 云厂商是否匹配
4. 券是否已被使用

### Q3: 折扣没有生效

**检查**：
1. 折扣状态是否为 active
2. 有效期是否正确
3. 云厂商/GPU型号是否匹配
4. 优先级设置

### Q4: 管理员页面无法访问

**检查**：
1. 用户是否已登录
2. `is_admin` 字段是否为 1
3. 路由是否正确配置

---

## 📝 Git提交建议

```bash
git add .
git commit -m "feat(computing): 重写算力保障页面，支持多云厂商和算力券

新功能：
- 支持阿里云、腾讯云、火山云等多云厂商
- 实现算力券功能（金额券、折扣券、免费时长）
- 实现产品折扣功能
- 管理员可赠送算力券和配置折扣
- 订单自动计算价格（原价-折扣-算力券）

数据库变更：
- 新增 cloud_providers 表
- 新增 vouchers 和 user_vouchers 表
- 新增 product_discounts 表
- 新增 computing_orders 表
- gpu_resources 表添加云厂商关联字段

API变更：
- 新增云厂商API
- 新增算力券API
- 新增折扣API
- 新增算力订单API

前端变更：
- 重写 ComputingPower.tsx
- 新增 AdminVouchers.tsx
- 新增 AdminDiscounts.tsx
- 更新路由配置"

git push origin main
```

---

## ✅ 部署检查清单

- [ ] 数据库迁移脚本执行成功
- [ ] 云厂商数据已初始化
- [ ] 现有GPU资源已关联云厂商
- [ ] 后端服务启动成功
- [ ] 前端构建成功
- [ ] 算力保障页面可访问
- [ ] 云厂商筛选功能正常
- [ ] 管理员算力券页面可访问
- [ ] 管理员折扣页面可访问
- [ ] 创建算力券功能正常
- [ ] 赠送算力券功能正常
- [ ] 创建折扣功能正常
- [ ] 用户下单流程正常
- [ ] 价格计算逻辑正确
- [ ] 订单列表显示正常

---

## 🎉 完成！

算力保障功能已全部实现并部署完成！

如有问题，请查看：
- 后端日志：`pm2 logs kunpeng-backend`
- 数据库日志：检查MySQL错误日志
- 前端控制台：浏览器开发者工具

祝使用愉快！🚀
