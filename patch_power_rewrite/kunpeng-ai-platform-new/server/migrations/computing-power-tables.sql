-- ========================================
-- 算力保障功能数据库迁移脚本
-- 创建时间：2024-12-02
-- 说明：创建多云厂商算力资源、算力券、折扣等相关表
-- ========================================

-- 1. 云厂商表
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

-- 插入初始云厂商数据
INSERT INTO cloud_providers (name, code, description, support_voucher, status) VALUES
('阿里云', 'aliyun', '阿里云提供稳定可靠的AI算力服务，支持算力券抵扣', TRUE, 'active'),
('腾讯云', 'tencent', '腾讯云提供高性能GPU计算服务', FALSE, 'active'),
('火山云', 'huoshan', '火山云提供灵活的AI算力解决方案', FALSE, 'active');

-- 2. 扩展 gpu_resources 表
ALTER TABLE gpu_resources 
ADD COLUMN  cloud_provider_id INT COMMENT '云厂商ID',
ADD COLUMN  cloud_provider_code VARCHAR(20) COMMENT '云厂商代码',
ADD COLUMN  original_price DECIMAL(10,2) COMMENT '原价',
ADD COLUMN  discount_rate DECIMAL(5,2) DEFAULT 0 COMMENT '折扣率（0-100）',
ADD COLUMN  final_price DECIMAL(10,2) COMMENT '最终价格',
ADD COLUMN  instance_type VARCHAR(100) COMMENT '实例类型',
ADD COLUMN  gpu_driver_version VARCHAR(50) COMMENT 'GPU驱动版本',
ADD COLUMN  cuda_version VARCHAR(50) COMMENT 'CUDA版本',
ADD COLUMN  network_bandwidth VARCHAR(50) COMMENT '网络带宽',
ADD COLUMN  support_spot BOOLEAN DEFAULT FALSE COMMENT '是否支持抢占式实例',
ADD COLUMN  spot_discount_rate DECIMAL(5,2) COMMENT '抢占式折扣率';

-- 添加索引
ALTER TABLE gpu_resources 
ADD INDEX idx_cloud_provider (cloud_provider_id),
ADD INDEX idx_cloud_provider_code (cloud_provider_code);

-- 3. 算力券表
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

-- 4. 用户算力券表
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

-- 5. 产品折扣表
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

-- 6. 算力订单表
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

-- ========================================
-- 插入测试数据
-- ========================================

-- 插入一些测试算力券
INSERT INTO vouchers (code, name, cloud_provider_id, cloud_provider_code, type, value, min_amount, max_discount, total_quantity, valid_from, valid_until, status, description) VALUES
('ALIYUN50', '阿里云50元算力券', 1, 'aliyun', 'amount', 50.00, 100.00, 50.00, 100, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active', '适用于阿里云所有GPU实例，满100元可用'),
('ALIYUN100', '阿里云100元算力券', 1, 'aliyun', 'amount', 100.00, 200.00, 100.00, 50, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active', '适用于阿里云所有GPU实例，满200元可用'),
('UNIVERSAL30', '通用30元算力券', NULL, NULL, 'amount', 30.00, 50.00, 30.00, 200, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active', '适用于所有云厂商，满50元可用');

-- 插入一些测试折扣
INSERT INTO product_discounts (name, cloud_provider_id, cloud_provider_code, gpu_model, discount_rate, priority, valid_from, valid_until, status, description) VALUES
('阿里云A100限时9折', 1, 'aliyun', 'A100', 10.00, 10, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'active', 'A100 GPU限时优惠'),
('腾讯云全场95折', 2, 'tencent', NULL, 5.00, 5, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active', '腾讯云所有GPU实例95折'),
('火山云新用户8折', 3, 'huoshan', NULL, 20.00, 15, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 'active', '新用户首单享8折优惠');

-- ========================================
-- 更新现有GPU资源数据，添加云厂商信息
-- ========================================

-- 将现有的GPU资源随机分配给不同的云厂商（示例）
UPDATE gpu_resources SET 
  cloud_provider_id = 1,
  cloud_provider_code = 'aliyun',
  original_price = price,
  final_price = price
WHERE id % 3 = 1;

UPDATE gpu_resources SET 
  cloud_provider_id = 2,
  cloud_provider_code = 'tencent',
  original_price = price,
  final_price = price
WHERE id % 3 = 2;

UPDATE gpu_resources SET 
  cloud_provider_id = 3,
  cloud_provider_code = 'huoshan',
  original_price = price,
  final_price = price
WHERE id % 3 = 0;

-- ========================================
-- 完成
-- ========================================
