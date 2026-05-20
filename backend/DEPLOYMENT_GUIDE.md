# 🚀 Production Deployment Guide

Complete guide for deploying the Loan Management System to production.

## Pre-Deployment Checklist

- [ ] PostgreSQL database setup
- [ ] Environment variables configured
- [ ] Security settings reviewed
- [ ] Database migrations tested
- [ ] All APIs tested
- [ ] Backup strategy in place
- [ ] Monitoring setup
- [ ] SSL certificate ready

---

## 1. Server Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04+ / CentOS 7+ / Amazon Linux 2

### Recommended Requirements
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 50GB SSD
- **OS**: Ubuntu 22.04 LTS

---

## 2. Database Setup

### PostgreSQL Installation (Ubuntu)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql

CREATE DATABASE loan_management;
CREATE USER loanapp WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE loan_management TO loanapp;
\q
```

### PostgreSQL Configuration
```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf

# Update these settings:
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 2621kB
min_wal_size = 1GB
max_wal_size = 4GB

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## 3. Node.js Setup

### Install Node.js (Ubuntu)
```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

---

## 4. Application Deployment

### Option A: Manual Deployment

```bash
# Create application directory
sudo mkdir -p /var/www/loan-management
cd /var/www/loan-management

# Clone or upload your code
# (Upload via SCP, SFTP, or Git)

# Install dependencies
npm install --production

# Setup environment
cp .env.example .env
nano .env
```

### Production .env Configuration
```env
NODE_ENV=production
PORT=5000

# Database (Use production credentials)
DATABASE_URL="postgresql://loanapp:secure_password@localhost:5432/loan_management?schema=public"

# JWT (Generate strong secrets)
JWT_ACCESS_SECRET=<generate-strong-secret-64-chars>
JWT_REFRESH_SECRET=<generate-strong-secret-64-chars>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS (Your frontend domain)
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,application/pdf
```

### Generate Strong Secrets
```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Run Database Migrations
```bash
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
```

---

## 5. Process Manager (PM2)

### Install PM2
```bash
sudo npm install -g pm2
```

### Create PM2 Ecosystem File
```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'loan-management-api',
    script: './src/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
```

### Start Application with PM2
```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Run the command it outputs

# Monitor application
pm2 monit

# View logs
pm2 logs loan-management-api

# Restart application
pm2 restart loan-management-api

# Stop application
pm2 stop loan-management-api
```

---

## 6. Nginx Reverse Proxy

### Install Nginx
```bash
sudo apt install nginx -y
```

### Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/loan-management
```

```nginx
upstream loan_api {
    server 127.0.0.1:5000;
    keepalive 64;
}

server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Logging
    access_log /var/log/nginx/loan-api-access.log;
    error_log /var/log/nginx/loan-api-error.log;

    # Client body size (for file uploads)
    client_max_body_size 10M;

    location / {
        proxy_pass http://loan_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://loan_api/health;
        access_log off;
    }
}
```

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/loan-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 7. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal (already setup by certbot)
sudo certbot renew --dry-run
```

---

## 8. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow PostgreSQL (only from localhost)
sudo ufw allow from 127.0.0.1 to any port 5432

# Check status
sudo ufw status
```

---

## 9. Security Hardening

### PostgreSQL Security
```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Only allow local connections
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

### File Permissions
```bash
cd /var/www/loan-management

# Set proper ownership
sudo chown -R www-data:www-data .

# Set proper permissions
sudo find . -type d -exec chmod 755 {} \;
sudo find . -type f -exec chmod 644 {} \;

# Protect .env file
sudo chmod 600 .env

# Make uploads directory writable
sudo chmod 775 uploads
```

### Environment Variables Security
```bash
# Never commit .env to git
echo ".env" >> .gitignore

# Use secrets management in production
# Consider using AWS Secrets Manager, HashiCorp Vault, etc.
```

---

## 10. Monitoring & Logging

### Setup Log Rotation
```bash
sudo nano /etc/logrotate.d/loan-management
```

```
/var/www/loan-management/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Monitor with PM2
```bash
# Install PM2 monitoring
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 11. Backup Strategy

### Database Backup Script
```bash
sudo nano /usr/local/bin/backup-loan-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/loan-management"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="loan_management"

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U loanapp $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
```

```bash
sudo chmod +x /usr/local/bin/backup-loan-db.sh
```

### Setup Cron Job
```bash
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-loan-db.sh >> /var/log/db-backup.log 2>&1
```

---

## 12. Health Checks & Monitoring

### Setup Health Check Script
```bash
nano /usr/local/bin/health-check.sh
```

```bash
#!/bin/bash
HEALTH_URL="http://localhost:5000/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "$(date): API is healthy"
else
    echo "$(date): API is down! Response: $RESPONSE"
    # Restart application
    pm2 restart loan-management-api
    # Send alert (configure email/SMS)
fi
```

```bash
sudo chmod +x /usr/local/bin/health-check.sh

# Add to crontab (every 5 minutes)
*/5 * * * * /usr/local/bin/health-check.sh >> /var/log/health-check.log 2>&1
```

---

## 13. Performance Optimization

### Enable Gzip in Nginx
Already included in the Nginx config above.

### Database Connection Pooling
Already configured in Prisma.

### Enable Caching (Optional)
Consider Redis for session management and caching.

---

## 14. Deployment Checklist

- [ ] Server provisioned and secured
- [ ] PostgreSQL installed and configured
- [ ] Node.js installed
- [ ] Application code deployed
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] PM2 configured and running
- [ ] Nginx configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Health checks enabled
- [ ] Log rotation configured
- [ ] DNS configured
- [ ] Load testing completed
- [ ] Security audit done

---

## 15. Post-Deployment

### Test APIs
```bash
# Health check
curl https://api.yourdomain.com/health

# Login test
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@loanmanagement.com","password":"admin123"}'
```

### Monitor Logs
```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/loan-api-access.log
sudo tail -f /var/log/nginx/loan-api-error.log

# Application logs
tail -f /var/www/loan-management/logs/info.log
tail -f /var/www/loan-management/logs/error.log
```

---

## 16. Maintenance

### Update Application
```bash
cd /var/www/loan-management

# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Run migrations
npx prisma migrate deploy

# Restart application
pm2 restart loan-management-api
```

### Database Maintenance
```bash
# Vacuum database
sudo -u postgres psql -d loan_management -c "VACUUM ANALYZE;"

# Check database size
sudo -u postgres psql -d loan_management -c "SELECT pg_size_pretty(pg_database_size('loan_management'));"
```

---

## 17. Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy, AWS ALB)
- Multiple application instances with PM2 cluster mode
- Shared session storage (Redis)

### Database Scaling
- Read replicas for reporting
- Connection pooling
- Query optimization
- Indexing

### File Storage
- Move to S3 or cloud storage
- CDN for static files

---

## 🎉 Deployment Complete!

Your Loan Management System is now running in production!

**Access Points:**
- API: https://api.yourdomain.com
- Health: https://api.yourdomain.com/health
- Docs: https://api.yourdomain.com/api

**Monitoring:**
- PM2: `pm2 monit`
- Logs: `/var/www/loan-management/logs/`
- Nginx: `/var/log/nginx/`

---

**Need Help?**
- Check logs for errors
- Review security settings
- Monitor performance
- Setup alerts

**Happy Deploying! 🚀**
