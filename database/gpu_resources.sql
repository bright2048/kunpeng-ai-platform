-- GPU资源表
CREATE TABLE IF NOT EXISTS gpu_resources (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  model VARCHAR(50) NOT NULL COMMENT 'GPU型号，如RTX 4090',
  vendor VARCHAR(50) NOT NULL DEFAULT 'NVIDIA' COMMENT '厂商名称',
  price DECIMAL(10, 2) NOT NULL COMMENT '价格',
  price_unit VARCHAR(20) NOT NULL DEFAULT '小时' COMMENT '计费单位：小时/天/月/季度/年',
  vram INT NOT NULL COMMENT '显存容量(GB)',
  card_count INT NOT NULL DEFAULT 1 COMMENT 'GPU卡数',
  cpu INT NOT NULL COMMENT 'CPU核心数',
  memory INT NOT NULL COMMENT '内存容量(GB)',
  storage INT NOT NULL COMMENT '存储容量(GB)',
  stock INT NOT NULL DEFAULT 0 COMMENT '库存数量',
  region VARCHAR(50) NOT NULL COMMENT '区域，如华东一区',
  rental_type VARCHAR(50) NOT NULL DEFAULT 'online' COMMENT '租用方案：online/bare-metal/cluster/edge/dedicated',
  billing_cycle VARCHAR(50) NOT NULL DEFAULT 'hourly' COMMENT '计费周期：hourly/daily/monthly/quarterly/yearly',
  is_hot BOOLEAN DEFAULT FALSE COMMENT '是否热门',
  is_special BOOLEAN DEFAULT FALSE COMMENT '是否特惠',
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active' COMMENT '状态：active-可用/inactive-下线/maintenance-维护中',
  description TEXT COMMENT '资源描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX idx_region (region),
  INDEX idx_model (model),
  INDEX idx_status (status),
  INDEX idx_rental_type (rental_type),
  INDEX idx_billing_cycle (billing_cycle)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='GPU算力资源表';

-- 插入示例数据
INSERT INTO gpu_resources (model, vendor, price, price_unit, vram, card_count, cpu, memory, storage, stock, region, rental_type, billing_cycle, is_hot, is_special, status, description) VALUES
('RTX 4090', 'NVIDIA', 1.80, '小时', 24, 1, 12, 60, 160, 16, '华东一区', 'online', 'hourly', TRUE, FALSE, 'active', '适合深度学习训练和推理'),
('RTX 4090', 'NVIDIA', 3.60, '小时', 24, 2, 24, 120, 260, 8, '华东一区', 'online', 'hourly', FALSE, FALSE, 'active', '双卡配置，适合大规模训练'),
('RTX 4090', 'NVIDIA', 7.20, '小时', 24, 4, 48, 240, 460, 0, '华东一区', 'online', 'hourly', FALSE, FALSE, 'active', '四卡配置，高性能计算'),
('RTX 5090', 'NVIDIA', 2.50, '小时', 32, 1, 16, 64, 200, 12, '华东一区', 'online', 'hourly', TRUE, TRUE, 'active', '最新一代GPU，性能提升30%'),
('L40', 'NVIDIA', 3.20, '小时', 48, 1, 16, 128, 500, 6, '华南一区', 'online', 'hourly', FALSE, FALSE, 'active', '专业级GPU，适合AI推理'),
('A100', 'NVIDIA', 8.50, '小时', 80, 1, 32, 256, 1000, 4, '华北一区', 'online', 'hourly', FALSE, FALSE, 'active', '数据中心级GPU，HBM2e显存'),
('H100', 'NVIDIA', 15.00, '小时', 80, 1, 32, 512, 2000, 2, '华北一区', 'online', 'hourly', FALSE, TRUE, 'active', '最强AI训练GPU，支持Transformer加速'),
('A800', 'NVIDIA', 7.80, '小时', 80, 1, 32, 256, 1000, 5, '华中一区', 'online', 'hourly', FALSE, FALSE, 'active', 'A100中国特供版'),
('RTX 4090', 'NVIDIA', 5.00, '小时', 24, 2, 24, 120, 300, 10, '华南二区', 'online', 'hourly', FALSE, FALSE, 'active', '双卡RTX 4090，性价比高'),
('L40S', 'NVIDIA', 4.20, '小时', 48, 1, 20, 128, 500, 8, '华东二区', 'online', 'hourly', FALSE, FALSE, 'active', 'L40升级版，推理性能更强'),
('RTX 4090', 'NVIDIA', 120.00, '天', 24, 1, 12, 60, 160, 20, '华东一区', 'online', 'daily', FALSE, FALSE, 'active', '按天计费更优惠'),
('A100', 'NVIDIA', 180.00, '天', 80, 1, 32, 256, 1000, 6, '华北一区', 'online', 'daily', FALSE, TRUE, 'active', 'A100按天计费特惠'),
('RTX 4090', 'NVIDIA', 3200.00, '月', 24, 1, 12, 60, 160, 15, '华东一区', 'online', 'monthly', FALSE, FALSE, 'active', '包月更划算'),
('H100', 'NVIDIA', 12000.00, '月', 80, 1, 32, 512, 2000, 3, '华北一区', 'online', 'monthly', FALSE, TRUE, 'active', 'H100包月特惠价'),
('RTX 4090', 'NVIDIA', 2.20, '小时', 24, 1, 16, 64, 200, 10, '华东一区', 'bare-metal', 'hourly', FALSE, FALSE, 'active', '裸金属服务器，独享物理机'),
('A100', 'NVIDIA', 10.00, '小时', 80, 4, 64, 512, 2000, 2, '华北一区', 'cluster', 'hourly', FALSE, TRUE, 'active', '4卡A100集群，适合分布式训练'),
('RTX 4090', 'NVIDIA', 1.50, '小时', 24, 1, 12, 60, 160, 8, '华东三区', 'edge', 'hourly', FALSE, FALSE, 'active', '边缘计算节点，低延迟'),
('H100', 'NVIDIA', 18.00, '小时', 80, 2, 64, 1024, 4000, 1, '华北一区', 'dedicated', 'hourly', FALSE, TRUE, 'active', '专属资源池，性能保障');

-- 查询统计
SELECT 
  region AS '区域',
  COUNT(*) AS '配置数量',
  SUM(stock) AS '总库存',
  MIN(price) AS '最低价格',
  MAX(price) AS '最高价格'
FROM gpu_resources
WHERE status = 'active'
GROUP BY region
ORDER BY region;
