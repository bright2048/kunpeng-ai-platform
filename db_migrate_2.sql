-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: localhost    Database: kunpeng
-- ------------------------------------------------------
-- Server version	8.0.42-0ubuntu0.20.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_logs`
--

DROP TABLE IF EXISTS `admin_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '操作用户ID',
  `action` varchar(100) NOT NULL COMMENT '操作类型',
  `resource` varchar(100) DEFAULT NULL COMMENT '操作资源',
  `resource_id` int DEFAULT NULL COMMENT '资源ID',
  `details` text COMMENT '操作详情',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` varchar(255) DEFAULT NULL COMMENT '用户代理',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `admin_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员操作日志表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_logs`
--

LOCK TABLES `admin_logs` WRITE;
/*!40000 ALTER TABLE `admin_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gpu_resources`
--

DROP TABLE IF EXISTS `gpu_resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gpu_resources` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `model` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'GPU型号，如RTX 4090',
  `vendor` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NVIDIA' COMMENT '厂商名称',
  `price` decimal(10,2) NOT NULL COMMENT '价格',
  `price_unit` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '小时' COMMENT '计费单位：小时/天/月/季度/年',
  `vram` int NOT NULL COMMENT '显存容量(GB)',
  `card_count` int NOT NULL DEFAULT '1' COMMENT 'GPU卡数',
  `cpu` int NOT NULL COMMENT 'CPU核心数',
  `memory` int NOT NULL COMMENT '内存容量(GB)',
  `storage` int NOT NULL COMMENT '存储容量(GB)',
  `stock` int NOT NULL DEFAULT '0' COMMENT '库存数量',
  `region` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '区域，如华东一区',
  `rental_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'online' COMMENT '租用方案：online/bare-metal/cluster/edge/dedicated',
  `billing_cycle` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hourly' COMMENT '计费周期：hourly/daily/monthly/quarterly/yearly',
  `is_hot` tinyint(1) DEFAULT '0' COMMENT '是否热门',
  `is_special` tinyint(1) DEFAULT '0' COMMENT '是否特惠',
  `status` enum('active','inactive','maintenance') COLLATE utf8mb4_unicode_ci DEFAULT 'active' COMMENT '状态：active-可用/inactive-下线/maintenance-维护中',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '资源描述',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_region` (`region`),
  KEY `idx_model` (`model`),
  KEY `idx_status` (`status`),
  KEY `idx_rental_type` (`rental_type`),
  KEY `idx_billing_cycle` (`billing_cycle`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='GPU算力资源表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gpu_resources`
--

LOCK TABLES `gpu_resources` WRITE;
/*!40000 ALTER TABLE `gpu_resources` DISABLE KEYS */;
INSERT INTO `gpu_resources` VALUES (1,'RTX 4090','NVIDIA',1.80,'小时',24,1,12,60,160,16,'华东一区','online','hourly',1,0,'active','适合深度学习训练和推理','2025-11-11 08:41:06','2025-11-11 08:41:06'),(2,'RTX 4090','NVIDIA',3.60,'小时',24,2,24,120,260,8,'华东一区','online','hourly',0,0,'active','双卡配置，适合大规模训练','2025-11-11 08:41:06','2025-11-11 08:41:06'),(3,'RTX 4090','NVIDIA',7.20,'小时',24,4,48,240,460,0,'华东一区','online','hourly',0,0,'active','四卡配置，高性能计算','2025-11-11 08:41:06','2025-11-11 08:41:06'),(4,'RTX 5090','NVIDIA',2.50,'小时',32,1,16,64,200,12,'华东一区','online','hourly',1,1,'active','最新一代GPU，性能提升30%','2025-11-11 08:41:06','2025-11-11 08:41:06'),(5,'L40','NVIDIA',3.20,'小时',48,1,16,128,500,6,'华南一区','online','hourly',0,0,'active','专业级GPU，适合AI推理','2025-11-11 08:41:06','2025-11-11 08:41:06'),(6,'A100','NVIDIA',8.50,'小时',80,1,32,256,1000,4,'华北一区','online','hourly',0,0,'active','数据中心级GPU，HBM2e显存','2025-11-11 08:41:06','2025-11-11 08:41:06'),(7,'H100','NVIDIA',15.00,'小时',80,1,32,512,2000,2,'华北一区','online','hourly',0,1,'active','最强AI训练GPU，支持Transformer加速','2025-11-11 08:41:06','2025-11-11 08:41:06'),(8,'A800','NVIDIA',7.80,'小时',80,1,32,256,1000,5,'华中一区','online','hourly',0,0,'active','A100中国特供版','2025-11-11 08:41:06','2025-11-11 08:41:06'),(9,'RTX 4090','NVIDIA',5.00,'小时',24,2,24,120,300,10,'华南二区','online','hourly',0,0,'active','双卡RTX 4090，性价比高','2025-11-11 08:41:06','2025-11-11 08:41:06'),(10,'L40S','NVIDIA',4.20,'小时',48,1,20,128,500,8,'华东二区','online','hourly',0,0,'active','L40升级版，推理性能更强','2025-11-11 08:41:06','2025-11-11 08:41:06'),(11,'RTX 4090','NVIDIA',120.00,'天',24,1,12,60,160,20,'华东一区','online','daily',0,0,'active','按天计费更优惠','2025-11-11 08:41:06','2025-11-11 08:41:06'),(12,'A100','NVIDIA',180.00,'天',80,1,32,256,1000,6,'华北一区','online','daily',0,1,'active','A100按天计费特惠','2025-11-11 08:41:06','2025-11-11 08:41:06'),(13,'RTX 4090','NVIDIA',3200.00,'月',24,1,12,60,160,15,'华东一区','online','monthly',0,0,'active','包月更划算','2025-11-11 08:41:06','2025-11-11 08:41:06'),(14,'H100','NVIDIA',12000.00,'月',80,1,32,512,2000,3,'华北一区','online','monthly',0,1,'active','H100包月特惠价','2025-11-11 08:41:06','2025-11-11 08:41:06'),(15,'RTX 4090','NVIDIA',2.20,'小时',24,1,16,64,200,10,'华东一区','bare-metal','hourly',0,0,'active','裸金属服务器，独享物理机','2025-11-11 08:41:06','2025-11-11 08:41:06'),(16,'A100','NVIDIA',10.00,'小时',80,4,64,512,2000,2,'华北一区','cluster','hourly',0,1,'active','4卡A100集群，适合分布式训练','2025-11-11 08:41:06','2025-11-11 08:41:06'),(17,'RTX 4090','NVIDIA',1.50,'小时',24,1,12,60,160,8,'华东三区','edge','hourly',0,1,'active','边缘计算节点，低延迟','2025-11-11 08:41:06','2025-11-12 01:54:40'),(18,'H100','NVIDIA',18.00,'小时',80,2,64,1024,4000,1,'华北一区','dedicated','hourly',0,1,'active','专属资源池，性能保障','2025-11-11 08:41:06','2025-11-11 08:41:06'),(19,'H200','NVIDIA',280000.00,'月',2560,32,1024,64000,4096,1,'华南一区','cluster','monthly',1,1,'active','','2025-11-12 02:00:15','2025-11-12 02:00:15');
/*!40000 ALTER TABLE `gpu_resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `space_facilities`
--

DROP TABLE IF EXISTS `space_facilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `space_facilities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配套名称',
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '图标',
  `price` decimal(10,2) DEFAULT '0.00' COMMENT '额外费用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `space_facilities`
--

LOCK TABLES `space_facilities` WRITE;
/*!40000 ALTER TABLE `space_facilities` DISABLE KEYS */;
INSERT INTO `space_facilities` VALUES (1,'独立办公室','building',500.00,'2025-11-07 09:32:26'),(2,'会议室','users',300.00,'2025-11-07 09:32:26'),(3,'茶水间','coffee',100.00,'2025-11-07 09:32:26'),(4,'打印设备','printer',200.00,'2025-11-07 09:32:26'),(5,'网络专线','wifi',150.00,'2025-11-07 09:32:26'),(6,'停车位','car',400.00,'2025-11-07 09:32:26');
/*!40000 ALTER TABLE `space_facilities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `space_orders`
--

DROP TABLE IF EXISTS `space_orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `space_orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID',
  `space_unit_id` int NOT NULL COMMENT '空间单元ID',
  `start_date` date NOT NULL COMMENT '开始日期',
  `end_date` date NOT NULL COMMENT '结束日期',
  `total_price` decimal(10,2) NOT NULL COMMENT '总价',
  `facilities` json DEFAULT NULL COMMENT '选择的配套设施',
  `status` enum('pending','confirmed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT '订单状态',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `space_unit_id` (`space_unit_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `space_orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `space_orders_ibfk_2` FOREIGN KEY (`space_unit_id`) REFERENCES `space_units` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `space_orders`
--

LOCK TABLES `space_orders` WRITE;
/*!40000 ALTER TABLE `space_orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `space_orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `space_units`
--

DROP TABLE IF EXISTS `space_units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `space_units` (
  `id` int NOT NULL AUTO_INCREMENT,
  `floor` int NOT NULL COMMENT '楼层 1-16',
  `unit_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '单元编号',
  `area` decimal(10,2) NOT NULL COMMENT '面积(平方米)',
  `position_x` int NOT NULL COMMENT 'X坐标(用于平面图显示)',
  `position_y` int NOT NULL COMMENT 'Y坐标',
  `width` int NOT NULL COMMENT '宽度',
  `height` int NOT NULL COMMENT '高度',
  `status` enum('available','occupied','reserved') COLLATE utf8mb4_unicode_ci DEFAULT 'available' COMMENT '状态',
  `price_per_month` decimal(10,2) NOT NULL COMMENT '月租金',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_floor` (`floor`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=161 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `space_units`
--

LOCK TABLES `space_units` WRITE;
/*!40000 ALTER TABLE `space_units` DISABLE KEYS */;
INSERT INTO `space_units` VALUES (1,1,'1-01',177.00,0,0,180,120,'occupied',8488.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(2,1,'1-02',190.00,200,0,180,120,'available',7905.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(3,1,'1-03',53.00,400,0,180,120,'occupied',9299.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(4,1,'1-04',155.00,600,0,180,120,'occupied',3534.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(5,1,'1-05',167.00,800,0,180,120,'occupied',8637.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(6,1,'1-06',226.00,0,150,180,120,'available',5562.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(7,1,'1-07',213.00,200,150,180,120,'occupied',6768.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(8,1,'1-08',188.00,400,150,180,120,'occupied',4271.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(9,1,'1-09',120.00,600,150,180,120,'available',9967.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(10,1,'1-10',119.00,800,150,180,120,'occupied',8060.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(11,2,'2-01',120.00,0,0,180,120,'available',9706.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(12,2,'2-02',245.00,200,0,180,120,'available',3853.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(13,2,'2-03',165.00,400,0,180,120,'available',9226.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(14,2,'2-04',224.00,600,0,180,120,'available',9035.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(15,2,'2-05',94.00,800,0,180,120,'available',9749.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(16,2,'2-06',98.00,0,150,180,120,'available',8979.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(17,2,'2-07',114.00,200,150,180,120,'available',5137.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(18,2,'2-08',122.00,400,150,180,120,'occupied',5575.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(19,2,'2-09',83.00,600,150,180,120,'occupied',4313.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(20,2,'2-10',194.00,800,150,180,120,'available',3511.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(21,3,'3-01',94.00,0,0,180,120,'occupied',8493.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(22,3,'3-02',100.00,200,0,180,120,'occupied',8691.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(23,3,'3-03',114.00,400,0,180,120,'available',8969.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(24,3,'3-04',205.00,600,0,180,120,'available',4920.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(25,3,'3-05',132.00,800,0,180,120,'available',9421.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(26,3,'3-06',229.00,0,150,180,120,'occupied',9872.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(27,3,'3-07',190.00,200,150,180,120,'available',8412.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(28,3,'3-08',76.00,400,150,180,120,'available',5425.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(29,3,'3-09',186.00,600,150,180,120,'available',8891.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(30,3,'3-10',64.00,800,150,180,120,'occupied',9809.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(31,4,'4-01',119.00,0,0,180,120,'occupied',3697.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(32,4,'4-02',51.00,200,0,180,120,'occupied',7943.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(33,4,'4-03',108.00,400,0,180,120,'available',8686.00,'2025-11-07 09:32:26','2025-11-07 09:32:26'),(34,4,'4-04',60.00,600,0,180,120,'occupied',9426.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(35,4,'4-05',79.00,800,0,180,120,'occupied',6558.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(36,4,'4-06',163.00,0,150,180,120,'available',9136.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(37,4,'4-07',136.00,200,150,180,120,'available',5877.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(38,4,'4-08',135.00,400,150,180,120,'occupied',4510.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(39,4,'4-09',126.00,600,150,180,120,'available',4164.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(40,4,'4-10',58.00,800,150,180,120,'occupied',6374.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(41,5,'5-01',98.00,0,0,180,120,'occupied',3503.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(42,5,'5-02',66.00,200,0,180,120,'available',8191.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(43,5,'5-03',72.00,400,0,180,120,'available',5683.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(44,5,'5-04',226.00,600,0,180,120,'available',7551.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(45,5,'5-05',144.00,800,0,180,120,'available',7669.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(46,5,'5-06',66.00,0,150,180,120,'available',8699.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(47,5,'5-07',216.00,200,150,180,120,'occupied',3898.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(48,5,'5-08',142.00,400,150,180,120,'occupied',5017.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(49,5,'5-09',176.00,600,150,180,120,'available',7157.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(50,5,'5-10',64.00,800,150,180,120,'available',8099.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(51,6,'6-01',224.00,0,0,180,120,'available',4700.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(52,6,'6-02',190.00,200,0,180,120,'occupied',8392.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(53,6,'6-03',155.00,400,0,180,120,'available',3454.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(54,6,'6-04',117.00,600,0,180,120,'available',5802.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(55,6,'6-05',161.00,800,0,180,120,'available',4907.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(56,6,'6-06',168.00,0,150,180,120,'available',9953.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(57,6,'6-07',150.00,200,150,180,120,'available',3769.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(58,6,'6-08',246.00,400,150,180,120,'available',9795.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(59,6,'6-09',70.00,600,150,180,120,'available',7839.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(60,6,'6-10',181.00,800,150,180,120,'available',3710.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(61,7,'7-01',222.00,0,0,180,120,'available',6180.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(62,7,'7-02',99.00,200,0,180,120,'occupied',7278.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(63,7,'7-03',139.00,400,0,180,120,'available',7408.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(64,7,'7-04',243.00,600,0,180,120,'occupied',9166.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(65,7,'7-05',156.00,800,0,180,120,'available',6306.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(66,7,'7-06',114.00,0,150,180,120,'available',9994.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(67,7,'7-07',133.00,200,150,180,120,'available',4299.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(68,7,'7-08',183.00,400,150,180,120,'occupied',9122.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(69,7,'7-09',59.00,600,150,180,120,'available',9677.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(70,7,'7-10',231.00,800,150,180,120,'available',7936.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(71,8,'8-01',143.00,0,0,180,120,'available',7605.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(72,8,'8-02',181.00,200,0,180,120,'available',7164.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(73,8,'8-03',56.00,400,0,180,120,'available',8795.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(74,8,'8-04',246.00,600,0,180,120,'available',4218.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(75,8,'8-05',169.00,800,0,180,120,'available',7011.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(76,8,'8-06',138.00,0,150,180,120,'available',4051.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(77,8,'8-07',102.00,200,150,180,120,'occupied',6775.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(78,8,'8-08',69.00,400,150,180,120,'occupied',3634.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(79,8,'8-09',214.00,600,150,180,120,'occupied',7841.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(80,8,'8-10',243.00,800,150,180,120,'occupied',9147.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(81,9,'9-01',75.00,0,0,180,120,'occupied',7111.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(82,9,'9-02',241.00,200,0,180,120,'available',4914.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(83,9,'9-03',105.00,400,0,180,120,'available',3179.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(84,9,'9-04',132.00,600,0,180,120,'occupied',7681.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(85,9,'9-05',130.00,800,0,180,120,'available',8632.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(86,9,'9-06',53.00,0,150,180,120,'available',5235.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(87,9,'9-07',164.00,200,150,180,120,'occupied',8770.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(88,9,'9-08',129.00,400,150,180,120,'available',5282.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(89,9,'9-09',74.00,600,150,180,120,'available',8768.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(90,9,'9-10',90.00,800,150,180,120,'available',3897.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(91,10,'10-01',249.00,0,0,180,120,'available',3025.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(92,10,'10-02',94.00,200,0,180,120,'available',8803.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(93,10,'10-03',219.00,400,0,180,120,'occupied',4571.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(94,10,'10-04',222.00,600,0,180,120,'available',7012.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(95,10,'10-05',244.00,800,0,180,120,'available',8596.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(96,10,'10-06',163.00,0,150,180,120,'available',6414.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(97,10,'10-07',74.00,200,150,180,120,'available',6021.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(98,10,'10-08',184.00,400,150,180,120,'available',5554.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(99,10,'10-09',168.00,600,150,180,120,'occupied',6756.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(100,10,'10-10',69.00,800,150,180,120,'occupied',3532.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(101,11,'11-01',202.00,0,0,180,120,'available',7205.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(102,11,'11-02',104.00,200,0,180,120,'available',3070.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(103,11,'11-03',120.00,400,0,180,120,'occupied',7123.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(104,11,'11-04',201.00,600,0,180,120,'available',8936.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(105,11,'11-05',83.00,800,0,180,120,'available',9627.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(106,11,'11-06',223.00,0,150,180,120,'available',8937.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(107,11,'11-07',204.00,200,150,180,120,'available',5026.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(108,11,'11-08',146.00,400,150,180,120,'available',4841.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(109,11,'11-09',187.00,600,150,180,120,'available',4564.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(110,11,'11-10',78.00,800,150,180,120,'available',8453.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(111,12,'12-01',204.00,0,0,180,120,'available',5021.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(112,12,'12-02',226.00,200,0,180,120,'available',3473.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(113,12,'12-03',192.00,400,0,180,120,'available',7283.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(114,12,'12-04',52.00,600,0,180,120,'available',3862.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(115,12,'12-05',233.00,800,0,180,120,'available',5390.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(116,12,'12-06',60.00,0,150,180,120,'available',9979.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(117,12,'12-07',109.00,200,150,180,120,'available',6778.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(118,12,'12-08',98.00,400,150,180,120,'available',4852.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(119,12,'12-09',155.00,600,150,180,120,'occupied',7149.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(120,12,'12-10',142.00,800,150,180,120,'available',4919.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(121,13,'13-01',204.00,0,0,180,120,'available',9505.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(122,13,'13-02',148.00,200,0,180,120,'available',9609.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(123,13,'13-03',182.00,400,0,180,120,'available',6145.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(124,13,'13-04',206.00,600,0,180,120,'available',6168.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(125,13,'13-05',166.00,800,0,180,120,'available',3538.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(126,13,'13-06',187.00,0,150,180,120,'available',9498.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(127,13,'13-07',60.00,200,150,180,120,'available',4359.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(128,13,'13-08',162.00,400,150,180,120,'available',6282.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(129,13,'13-09',180.00,600,150,180,120,'occupied',4899.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(130,13,'13-10',214.00,800,150,180,120,'available',3368.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(131,14,'14-01',119.00,0,0,180,120,'available',9164.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(132,14,'14-02',179.00,200,0,180,120,'available',3197.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(133,14,'14-03',121.00,400,0,180,120,'occupied',6351.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(134,14,'14-04',102.00,600,0,180,120,'occupied',6794.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(135,14,'14-05',73.00,800,0,180,120,'occupied',6039.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(136,14,'14-06',110.00,0,150,180,120,'available',3712.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(137,14,'14-07',231.00,200,150,180,120,'available',5950.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(138,14,'14-08',134.00,400,150,180,120,'occupied',9785.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(139,14,'14-09',110.00,600,150,180,120,'available',4162.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(140,14,'14-10',246.00,800,150,180,120,'available',3799.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(141,15,'15-01',116.00,0,0,180,120,'available',7545.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(142,15,'15-02',100.00,200,0,180,120,'available',9044.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(143,15,'15-03',118.00,400,0,180,120,'available',6857.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(144,15,'15-04',132.00,600,0,180,120,'available',8398.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(145,15,'15-05',180.00,800,0,180,120,'occupied',8745.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(146,15,'15-06',96.00,0,150,180,120,'occupied',8843.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(147,15,'15-07',60.00,200,150,180,120,'occupied',7353.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(148,15,'15-08',218.00,400,150,180,120,'available',4490.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(149,15,'15-09',54.00,600,150,180,120,'available',4730.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(150,15,'15-10',220.00,800,150,180,120,'available',3200.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(151,16,'16-01',168.00,0,0,180,120,'occupied',7274.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(152,16,'16-02',134.00,200,0,180,120,'available',3579.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(153,16,'16-03',171.00,400,0,180,120,'occupied',3935.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(154,16,'16-04',108.00,600,0,180,120,'available',6220.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(155,16,'16-05',69.00,800,0,180,120,'available',4337.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(156,16,'16-06',183.00,0,150,180,120,'occupied',9021.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(157,16,'16-07',245.00,200,150,180,120,'available',7580.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(158,16,'16-08',113.00,400,150,180,120,'available',3870.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(159,16,'16-09',205.00,600,150,180,120,'available',4929.00,'2025-11-07 09:32:27','2025-11-07 09:32:27'),(160,16,'16-10',212.00,800,150,180,120,'available',7869.00,'2025-11-07 09:32:27','2025-11-07 09:32:27');
/*!40000 ALTER TABLE `space_units` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('user','admin','super_admin') COLLATE utf8mb4_unicode_ci DEFAULT 'user' COMMENT '用户角色：user-普通用户, admin-管理员, super_admin-超级管理员',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '账号是否激活',
  `last_login_at` timestamp NULL DEFAULT NULL COMMENT '最后登录时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'zhangliang.zl@139.com','liang2025','$2b$10$XcCvVYnQQnKiKt35zVEDuuHet5Bdb/Rh5XtIo.CKMpec0Ouqvljeu','liang2025','user',1,NULL,'2025-11-11 04:25:50','2025-11-11 04:25:50'),(2,'admin@szkpic.com','admin','$2b$10$uoOqEibVg2vt0YPTRtUy8.LUeIR1HsCdykC5F9C60/9wKZDMPv7OK','系统管理员','super_admin',1,'2025-11-12 02:00:15','2025-11-11 09:28:11','2025-11-12 02:00:15'),(3,'manager@szkpic.com','manager','$2b$10$rKZMJZqQxGxGxGxGxGxGxOeKqKqKqKqKqKqKqKqKqKqKqKqKqKqKqK','运营管理员','super_admin',1,NULL,'2025-11-11 09:28:11','2025-11-11 09:45:24');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verification_codes`
--

DROP TABLE IF EXISTS `verification_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verification_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email_code` (`email`,`code`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verification_codes`
--

LOCK TABLES `verification_codes` WRITE;
/*!40000 ALTER TABLE `verification_codes` DISABLE KEYS */;
INSERT INTO `verification_codes` VALUES (1,'zhangliang.zl@139.com','440503','2025-11-11 04:16:51',0,'2025-11-11 04:06:50'),(2,'zhangliang.zl@139.com','219062','2025-11-11 04:19:19',0,'2025-11-11 04:09:19'),(3,'zhangliang.zl@139.com','898597','2025-11-11 04:20:29',0,'2025-11-11 04:10:29'),(4,'zhangliang.zl@139.com','365054','2025-11-11 04:22:57',0,'2025-11-11 04:12:57'),(5,'zhangliang.zl@139.com','968803','2025-11-11 04:32:56',0,'2025-11-11 04:22:56'),(6,'zhangliang.zl@139.com','689602','2025-11-11 04:34:52',1,'2025-11-11 04:24:52');
/*!40000 ALTER TABLE `verification_codes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-12 13:51:11
