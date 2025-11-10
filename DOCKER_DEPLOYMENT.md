# Docker 部署指南

本文档介绍如何使用 Docker 将鲲鹏产业源头创新中心网站部署到您自己的服务器。

## 前置要求

在开始之前，请确保您的服务器已安装：

- Docker (版本 20.10 或更高)
- Docker Compose (版本 2.0 或更高)

### 安装 Docker

如果您还没有安装 Docker，可以使用以下命令：

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 部署步骤

### 方式一：使用 Docker Compose（推荐）

1. **下载项目文件**

   从 Manus 平台下载所有项目文件到您的服务器：

   ```bash
   # 假设您已将文件上传到 /opt/kunpeng-ai-platform
   cd /opt/kunpeng-ai-platform
   ```

2. **构建并启动容器**

   ```bash
   docker-compose up -d
   ```

   这个命令会：
   - 自动构建 Docker 镜像
   - 启动容器
   - 在后台运行服务

3. **查看运行状态**

   ```bash
   docker-compose ps
   ```

4. **访问网站**

   在浏览器中访问 `http://您的服务器IP`

### 方式二：使用 Docker 命令

1. **构建镜像**

   ```bash
   docker build -t kunpeng-ai-platform:latest .
   ```

2. **运行容器**

   ```bash
   docker run -d \
     --name kunpeng-ai-platform \
     -p 80:80 \
     --restart unless-stopped \
     kunpeng-ai-platform:latest
   ```

3. **查看容器状态**

   ```bash
   docker ps
   ```

## 常用管理命令

### 查看日志

```bash
# 使用 Docker Compose
docker-compose logs -f

# 使用 Docker
docker logs -f kunpeng-ai-platform
```

### 停止服务

```bash
# 使用 Docker Compose
docker-compose down

# 使用 Docker
docker stop kunpeng-ai-platform
```

### 重启服务

```bash
# 使用 Docker Compose
docker-compose restart

# 使用 Docker
docker restart kunpeng-ai-platform
```

### 更新部署

当您更新了代码后，需要重新构建和部署：

```bash
# 使用 Docker Compose
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 使用 Docker
docker stop kunpeng-ai-platform
docker rm kunpeng-ai-platform
docker build -t kunpeng-ai-platform:latest .
docker run -d --name kunpeng-ai-platform -p 80:80 --restart unless-stopped kunpeng-ai-platform:latest
```

## 自定义配置

### 修改端口

如果您想使用其他端口（例如 8080），可以修改 `docker-compose.yml`：

```yaml
ports:
  - "8080:80"  # 将 80 改为您想要的端口
```

或者在 Docker 命令中修改：

```bash
docker run -d --name kunpeng-ai-platform -p 8080:80 kunpeng-ai-platform:latest
```

### 配置 HTTPS

要启用 HTTPS，建议使用反向代理（如 Nginx 或 Traefik）配合 Let's Encrypt 证书。

#### 使用 Nginx 反向代理示例

1. 安装 Nginx：

   ```bash
   sudo apt install nginx certbot python3-certbot-nginx
   ```

2. 创建 Nginx 配置文件 `/etc/nginx/sites-available/kunpeng`：

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:80;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. 启用配置并获取 SSL 证书：

   ```bash
   sudo ln -s /etc/nginx/sites-available/kunpeng /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   sudo certbot --nginx -d your-domain.com
   ```

## 性能优化

### 资源限制

您可以限制容器使用的资源：

```yaml
# docker-compose.yml
services:
  kunpeng-web:
    # ... 其他配置
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 健康检查

添加健康检查以确保服务正常运行：

```yaml
# docker-compose.yml
services:
  kunpeng-web:
    # ... 其他配置
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## 故障排查

### 容器无法启动

1. 查看日志：
   ```bash
   docker-compose logs
   ```

2. 检查端口是否被占用：
   ```bash
   sudo netstat -tulpn | grep :80
   ```

### 网站无法访问

1. 检查容器是否运行：
   ```bash
   docker ps
   ```

2. 检查防火墙规则：
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   ```

3. 测试容器内部服务：
   ```bash
   docker exec kunpeng-ai-platform curl http://localhost
   ```

## 备份与恢复

### 备份镜像

```bash
docker save kunpeng-ai-platform:latest | gzip > kunpeng-backup.tar.gz
```

### 恢复镜像

```bash
docker load < kunpeng-backup.tar.gz
```

## 监控

建议使用以下工具监控容器运行状态：

- **Portainer**: Docker 容器管理界面
- **cAdvisor**: 容器资源使用监控
- **Prometheus + Grafana**: 完整的监控解决方案

## 安全建议

1. **定期更新镜像**: 保持基础镜像（node、nginx）为最新版本
2. **使用非 root 用户**: 在 Dockerfile 中添加非 root 用户运行应用
3. **限制容器权限**: 使用 `--security-opt` 限制容器权限
4. **网络隔离**: 使用 Docker 网络隔离不同的服务
5. **定期备份**: 定期备份镜像和配置文件

## 支持

如有问题，请联系技术支持或查看项目文档。
