# 算力保障功能数据库设计

## 📊 数据库表结构

### 1. cloud_providers（云厂商表）

```sql
CREATE TABLE IF NOT EXISTS cloud_providers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL COMMENT '云厂商名称（阿里云、腾讯云、火山云）',
  code VARCHAR(20) NOT NULL UNIQUE COMMENT '厂商代码（aliyun, tencent, huoshan）',
  logo_url VARCHAR(255) COMMENT 'Logo URL',
  description TEXT COMMENT '厂商描述',
  support_voucher BOOLEAN DEFAULT FALSE COMMENT '是否支持算力券',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='云厂商表';
```

### 2. computing_resources（算力资源表）

扩展现有的 `gpu_resources` 表，添加云厂商字段：

```sql
ALTER TABLE gpu_resources 
ADD COLUMN cloud_provider_id INT COMMENT '云厂商ID',
ADD COLUMN cloud_provider_code VARCHAR(20) COMMENT '云厂商代码',
ADD COLUMN original_price DECIMAL(10,2) COMMENT '原价',
ADD COLUMN discount_rate DECIMAL(5,2) DEFAULT 0 COMMENT '折扣率（0-100）',
ADD COLUMN final_price DECIMAL(10,2) COMMENT '最终价格',
ADD COLUMN instance_type VARCHAR(100) COMMENT '实例类型',
ADD COLUMN gpu_driver_version VARCHAR(50) COMMENT 'GPU驱动版本',
ADD COLUMN cuda_version VARCHAR(50) COMMENT 'CUDA版本',
ADD COLUMN network_bandwidth VARCHAR(50) COMMENT '网络带宽',
ADD COLUMN support_spot BOOLEAN DEFAULT FALSE COMMENT '是否支持抢占式实例',
ADD COLUMN spot_discount_rate DECIMAL(5,2) COMMENT '抢占式折扣率',
ADD INDEX idx_cloud_provider (cloud_provider_id),
ADD INDEX idx_cloud_provider_code (cloud_provider_code);
```

### 3. vouchers（算力券表）

```sql
CREATE TABLE IF NOT EXISTS vouchers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL UNIQUE COMMENT '算力券代码',
  name VARCHAR(100) NOT NULL COMMENT '算力券名称',
  cloud_provider_id INT COMMENT '适用的云厂商ID（NULL表示全部）',
  cloud_provider_code VARCHAR(20) COMMENT '适用的云厂商代码',
  type ENUM('amount', 'discount', 'free_hours') NOT NULL COMMENT '类型：金额券、折扣券、免费时长',
  value DECIMAL(10,2) NOT NULL COMMENT '券值（金额/折扣率/小时数）',
  min_amount DECIMAL(10,2) DEFAULT 0 COMMENT '最低消费金额',
  max_discount DECIMAL(10,2) COMMENT '最大优惠金额',
  total_quantity INT DEFAULT 1 COMMENT '总发行数量',
  used_quantity INT DEFAULT 0 COMMENT '已使用数量',
  valid_from DATETIME COMMENT '有效期开始',
  valid_until DATETIME COMMENT '有效期结束',
  status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
  description TEXT COMMENT '使用说明',
  created_by INT COMMENT '创建人（管理员ID）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cloud_provider_id) REFERENCES cloud_providers(id) ON DELETE SET NULL,
  INDEX idx_code (code),
  INDEX idx_cloud_provider (cloud_provider_id),
  INDEX idx_status (status),
  INDEX idx_valid_period (valid_from, valid_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='算力券表';
```

### 4. user_vouchers（用户算力券表）

```sql
CREATE TABLE IF NOT EXISTS user_vouchers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  voucher_id INT NOT NULL COMMENT '算力券ID',
  voucher_code VARCHAR(50) NOT NULL COMMENT '算力券代码',
  status ENUM('unused', 'used', 'expired') DEFAULT 'unused',
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
  used_at TIMESTAMP NULL COMMENT '使用时间',
  order_id INT COMMENT '使用的订单ID',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_voucher_id (voucher_id),
  INDEX idx_status (status),
  INDEX idx_voucher_code (voucher_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户算力券表';
```

### 5. product_discounts（产品折扣表）

```sql
CREATE TABLE IF NOT EXISTS product_discounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '折扣活动名称',
  cloud_provider_id INT COMMENT '适用的云厂商ID（NULL表示全部）',
  cloud_provider_code VARCHAR(20) COMMENT '适用的云厂商代码',
  resource_id INT COMMENT '适用的资源ID（NULL表示全部）',
  gpu_model VARCHAR(100) COMMENT '适用的GPU型号（NULL表示全部）',
  discount_rate DECIMAL(5,2) NOT NULL COMMENT '折扣率（0-100）',
  priority INT DEFAULT 0 COMMENT '优先级（数字越大优先级越高）',
  valid_from DATETIME COMMENT '有效期开始',
  valid_until DATETIME COMMENT '有效期结束',
  status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
  description TEXT COMMENT '折扣说明',
  created_by INT COMMENT '创建人（管理员ID）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cloud_provider_id) REFERENCES cloud_providers(id) ON DELETE SET NULL,
  INDEX idx_cloud_provider (cloud_provider_id),
  INDEX idx_resource_id (resource_id),
  INDEX idx_status (status),
  INDEX idx_valid_period (valid_from, valid_until),
  INDEX idx_priority (priority DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='产品折扣表';
```

### 6. computing_orders（算力订单表）

```sql
CREATE TABLE IF NOT EXISTS computing_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
  user_id INT NOT NULL COMMENT '用户ID',
  resource_id INT NOT NULL COMMENT '资源ID',
  cloud_provider_id INT NOT NULL COMMENT '云厂商ID',
  cloud_provider_code VARCHAR(20) NOT NULL COMMENT '云厂商代码',
  gpu_model VARCHAR(100) NOT NULL COMMENT 'GPU型号',
  quantity INT DEFAULT 1 COMMENT '数量',
  duration INT NOT NULL COMMENT '租用时长',
  duration_unit ENUM('hour', 'day', 'month', 'year') NOT NULL COMMENT '时长单位',
  original_price DECIMAL(10,2) NOT NULL COMMENT '原价',
  discount_amount DECIMAL(10,2) DEFAULT 0 COMMENT '折扣金额',
  voucher_amount DECIMAL(10,2) DEFAULT 0 COMMENT '算力券抵扣金额',
  final_price DECIMAL(10,2) NOT NULL COMMENT '最终价格',
  voucher_id INT COMMENT '使用的算力券ID',
  discount_id INT COMMENT '使用的折扣ID',
  status ENUM('pending', 'paid', 'deploying', 'running', 'completed', 'cancelled', 'refunded') DEFAULT 'pending',
  instance_info JSON COMMENT '实例信息',
  start_time DATETIME COMMENT '开始时间',
  end_time DATETIME COMMENT '结束时间',
  payment_method VARCHAR(50) COMMENT '支付方式',
  payment_time DATETIME COMMENT '支付时间',
  remark TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (cloud_provider_id) REFERENCES cloud_providers(id),
  FOREIGN KEY (voucher_id) REFERENCES vouchers(id) ON DELETE SET NULL,
  FOREIGN KEY (discount_id) REFERENCES product_discounts(id) ON DELETE SET NULL,
  INDEX idx_order_no (order_no),
  INDEX idx_user_id (user_id),
  INDEX idx_cloud_provider (cloud_provider_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='算力订单表';
```

---

## 🎯 初始数据

### 云厂商初始数据

```sql
INSERT INTO cloud_providers (name, code, description, support_voucher, status) VALUES
('阿里云', 'aliyun', '阿里云提供稳定可靠的AI算力服务', TRUE, 'active'),
('腾讯云', 'tencent', '腾讯云提供高性能GPU计算服务', FALSE, 'active'),
('火山云', 'huoshan', '火山云提供灵活的AI算力解决方案', FALSE, 'active');
```

---

## 📝 API 设计

### 1. 云厂商相关 API

- `GET /api/cloud-providers` - 获取云厂商列表
- `GET /api/cloud-providers/:id` - 获取云厂商详情

### 2. 算力资源相关 API

- `GET /api/computing/resources` - 获取算力资源列表（支持按云厂商筛选）
- `GET /api/computing/resources/:id` - 获取资源详情
- `GET /api/computing/resources/compare` - 对比多个资源

### 3. 算力券相关 API

- `GET /api/vouchers/available` - 获取用户可用的算力券
- `POST /api/vouchers/claim` - 领取算力券
- `POST /api/vouchers/validate` - 验证算力券是否可用
- `GET /api/vouchers/my` - 获取我的算力券列表

### 4. 折扣相关 API

- `GET /api/discounts/active` - 获取当前有效的折扣活动
- `POST /api/discounts/calculate` - 计算订单折扣

### 5. 订单相关 API

- `POST /api/computing/orders` - 创建算力订单
- `GET /api/computing/orders` - 获取我的订单列表
- `GET /api/computing/orders/:id` - 获取订单详情
- `POST /api/computing/orders/:id/pay` - 支付订单
- `POST /api/computing/orders/:id/cancel` - 取消订单

### 6. 管理员 API

- `POST /api/admin/vouchers` - 创建算力券
- `PUT /api/admin/vouchers/:id` - 更新算力券
- `DELETE /api/admin/vouchers/:id` - 删除算力券
- `POST /api/admin/vouchers/grant` - 批量赠送算力券
- `POST /api/admin/discounts` - 创建折扣活动
- `PUT /api/admin/discounts/:id` - 更新折扣活动
- `DELETE /api/admin/discounts/:id` - 删除折扣活动

---

## 🔄 业务流程

### 用户下单流程

1. 用户浏览算力资源列表
2. 选择合适的配置和云厂商
3. 选择租用时长
4. 系统自动计算：
   - 原价
   - 可用折扣
   - 可用算力券
   - 最终价格
5. 用户确认订单
6. 选择支付方式
7. 完成支付
8. 系统自动部署实例

### 算力券使用流程

1. 管理员创建算力券
2. 管理员赠送给用户或用户自行领取
3. 用户在下单时选择可用的算力券
4. 系统验证算力券有效性
5. 自动计算抵扣金额
6. 订单支付成功后标记算力券为已使用

### 折扣计算优先级

1. 产品折扣（按优先级排序）
2. 算力券抵扣
3. 最终价格 = 原价 × (1 - 折扣率) - 算力券金额

---

## 🎨 前端页面设计

### 算力保障页面布局

```
┌─────────────────────────────────────────────────┐
│                   Navbar                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  🎯 算力保障                                     │
│  提供多云厂商AI算力资源                           │
│                                                 │
├─────────────────────────────────────────────────┤
│  云厂商选择                                      │
│  [全部] [阿里云💰] [腾讯云] [火山云]             │
│                                                 │
│  筛选条件                                        │
│  GPU型号 | 区域 | 租用方案 | 计费周期            │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ 资源卡片1 │  │ 资源卡片2 │  │ 资源卡片3 │     │
│  │          │  │          │  │          │     │
│  │ 阿里云    │  │ 腾讯云    │  │ 火山云    │     │
│  │ A100 40GB│  │ V100 32GB│  │ A10 24GB │     │
│  │          │  │          │  │          │     │
│  │ ¥15/小时  │  │ ¥12/小时  │  │ ¥8/小时   │     │
│  │ 💰可用券   │  │          │  │          │     │
│  │          │  │          │  │          │     │
│  │ [立即租用]│  │ [立即租用]│  │ [立即租用]│     │
│  └──────────┘  └──────────┘  └──────────┘     │
│                                                 │
├─────────────────────────────────────────────────┤
│                   Footer                        │
└─────────────────────────────────────────────────┘
```

### 订单确认页面

```
┌─────────────────────────────────────────────────┐
│  订单确认                                        │
│                                                 │
│  资源信息：                                      │
│  - 云厂商：阿里云                                │
│  - GPU型号：A100 40GB                           │
│  - 配置：8核CPU / 32GB内存 / 500GB存储          │
│                                                 │
│  租用时长：                                      │
│  [1小时] [1天] [1周] [1月] [自定义]             │
│                                                 │
│  价格明细：                                      │
│  原价：¥150.00                                  │
│  产品折扣（9折）：-¥15.00                        │
│  算力券抵扣：-¥50.00                             │
│  ────────────────────                           │
│  最终价格：¥85.00                                │
│                                                 │
│  可用算力券：                                    │
│  ○ 阿里云算力券 ¥50（有效期至2024-12-31）        │
│  ○ 通用算力券 ¥30（有效期至2024-11-30）          │
│                                                 │
│  [确认下单]  [取消]                              │
└─────────────────────────────────────────────────┘
```

---

## 🔐 权限设计

### 用户权限

- 浏览算力资源
- 查看自己的算力券
- 创建订单
- 查看自己的订单

### 管理员权限

- 管理算力资源
- 创建和管理算力券
- 赠送算力券给用户
- 创建和管理折扣活动
- 查看所有订单
- 管理云厂商信息

---

## 📊 统计和报表

### 用户端

- 我的算力券（可用/已用/已过期）
- 我的订单（进行中/已完成/已取消）
- 消费统计（按云厂商/按GPU型号）

### 管理员端

- 算力券使用统计
- 折扣活动效果分析
- 各云厂商订单分布
- 用户消费排行

---

## 🎯 下一步实施

1. ✅ 创建数据库迁移脚本
2. ✅ 实现后端 API
3. ✅ 实现前端页面
4. ✅ 实现管理员功能
5. ✅ 测试和优化
