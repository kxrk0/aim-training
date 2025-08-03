# 🌐 VPS MIGRATION PLAN - AIM TRAINER PRO

## 📋 **MEVCUT DURUM**

### ✅ **Localtunnel (Şu an)**
- **Frontend**: `https://myaimtrainer.loca.lt` (port 3000)
- **Backend**: `https://myaimtrainer-backend.loca.lt` (port 3001)
- **Sorunlar**: 
  - Geçici URL'ler
  - Yavaş bağlantı
  - Güvenlik sınırlamaları
  - Password koruması

### 🎯 **Hedef: VPS Deployment**
- **Domain**: `aimtrainer.pro` (örnek)
- **Frontend**: `https://aimtrainer.pro`
- **Backend**: `https://api.aimtrainer.pro`
- **Database**: PostgreSQL/MongoDB on VPS
- **Benefits**: 
  - Kalıcı domain
  - Hızlı performans
  - Güvenli HTTPS
  - Profesyonel görünüm

## 🛠️ **MIGRATION STEPS**

### **1. VPS Seçimi & Kurulum**

#### **Önerilen VPS Providers:**
```bash
# Budget-Friendly
- Hetzner: 4GB RAM, 2 vCPU, €4.5/ay
- DigitalOcean: 2GB RAM, 1 vCPU, $12/ay
- Vultr: 2GB RAM, 1 vCPU, $12/ay

# Enterprise
- AWS EC2: t3.small, ~$16/ay
- Google Cloud: e2-small, ~$15/ay
```

#### **Server Requirements:**
- **OS**: Ubuntu 22.04 LTS
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 40GB minimum
- **Bandwidth**: 1TB/month

### **2. Domain & DNS Setup**

```bash
# Domain satın al (örnek aimtrainer.pro)
# DNS Records:
A     aimtrainer.pro        → VPS_IP
A     api.aimtrainer.pro    → VPS_IP
A     www.aimtrainer.pro    → VPS_IP
CNAME ws.aimtrainer.pro     → aimtrainer.pro
```

### **3. Server Kurulum**

#### **Initial Setup:**
```bash
# VPS'e SSH bağlantısı
ssh root@YOUR_VPS_IP

# System update
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Install essential tools
apt install -y nginx certbot python3-certbot-nginx git pm2 postgresql

# Create application user
adduser aimtrainer
usermod -aG sudo aimtrainer
```

#### **Nginx Configuration:**
```nginx
# /etc/nginx/sites-available/aimtrainer.pro
server {
    listen 80;
    server_name aimtrainer.pro www.aimtrainer.pro;
    
    # Frontend (React build)
    location / {
        root /home/aimtrainer/app/client/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API Backend
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket for Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### **SSL Certificate:**
```bash
# Enable site
ln -s /etc/nginx/sites-available/aimtrainer.pro /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Get SSL certificate
certbot --nginx -d aimtrainer.pro -d www.aimtrainer.pro -d api.aimtrainer.pro
```

### **4. Database Setup**

#### **PostgreSQL:**
```bash
# Install and configure PostgreSQL
sudo -u postgres createuser aimtrainer
sudo -u postgres createdb aimtrainer_db
sudo -u postgres psql -c "ALTER USER aimtrainer PASSWORD 'strong_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE aimtrainer_db TO aimtrainer;"
```

#### **Environment Variables:**
```bash
# /home/aimtrainer/app/.env
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL="postgresql://aimtrainer:strong_password@localhost:5432/aimtrainer_db"

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@project.iam.gserviceaccount.com

# Security
JWT_SECRET=your_super_secure_jwt_secret
CORS_ORIGIN=https://aimtrainer.pro
```

### **5. Application Deployment**

#### **Deploy Script:**
```bash
#!/bin/bash
# deploy.sh

# Build and deploy AIM TRAINER PRO to VPS
echo "🚀 Deploying AIM TRAINER PRO..."

# Stop services
pm2 stop aimtrainer-server

# Pull latest code
cd /home/aimtrainer/app
git pull origin main

# Install dependencies
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# Build
npm run build

# Database migration
cd server && npx prisma db push && cd ..

# Start services
pm2 start ecosystem.config.js

echo "✅ Deployment complete!"
```

#### **PM2 Configuration:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'aimtrainer-server',
    script: 'server/dist/index.js',
    cwd: '/home/aimtrainer/app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/pm2/aimtrainer-error.log',
    out_file: '/var/log/pm2/aimtrainer-out.log',
    log_file: '/var/log/pm2/aimtrainer.log'
  }]
}
```

### **6. Code Changes Required**

#### **Frontend URL Updates:**
```typescript
// client/src/stores/partyStore.ts
const getWebSocketUrl = () => {
  const hostname = window.location.hostname
  
  // Production
  if (hostname === 'aimtrainer.pro') {
    return 'https://aimtrainer.pro'
  }
  
  // Development
  return 'http://localhost:3001'
}
```

#### **API Base URL:**
```typescript
// client/src/services/api.ts
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://aimtrainer.pro/api'
  : 'http://localhost:3001'
```

### **7. Monitoring & Security**

#### **Firewall:**
```bash
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

#### **Monitoring:**
```bash
# Install monitoring tools
npm install -g pm2-logrotate
pm2 install pm2-server-monit

# Log rotation
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

## 📊 **MIGRATION TIMELINE**

### **Phase 1: Preparation (1-2 Hours)**
- [ ] VPS satın alma
- [ ] Domain satın alma
- [ ] DNS ayarları

### **Phase 2: Server Setup (2-3 Hours)**
- [ ] Server kurulum
- [ ] Nginx configuration
- [ ] SSL certificate
- [ ] Database setup

### **Phase 3: Application Deployment (1-2 Hours)**
- [ ] Code upload
- [ ] Environment configuration
- [ ] Build & deploy
- [ ] Testing

### **Phase 4: DNS Switch (30 Minutes)**
- [ ] Final DNS update
- [ ] Localtunnel → VPS switch
- [ ] Testing & verification

## 💰 **ESTIMATED COSTS**

### **Monthly:**
- **VPS**: $12-16/month
- **Domain**: $1-2/month
- **Total**: ~$15-20/month

### **One-time:**
- **Domain**: $10-15/year
- **Setup**: DIY (Free)

## 🎯 **BENEFITS AFTER MIGRATION**

### **Performance:**
- ✅ **Fast Loading** - Direct server connection
- ✅ **Low Latency** - No tunnel overhead
- ✅ **Reliable** - 99.9% uptime

### **Professional:**
- ✅ **Custom Domain** - aimtrainer.pro
- ✅ **SSL Certificate** - Secure HTTPS
- ✅ **No Password** - Direct access

### **Scalability:**
- ✅ **Database** - Persistent data storage
- ✅ **Backups** - Automated backups
- ✅ **Monitoring** - Real-time monitoring

## 🚀 **READY TO MIGRATE?**

Şu adımları takip edebiliriz:

1. **VPS Provider seç** (Hetzner/DigitalOcean)
2. **Domain satın al** (aimtrainer.pro gibi)
3. **Server kurulum** (Ubuntu + Node.js + Nginx)
4. **Application deploy** (Build + PM2)
5. **DNS switch** (Localtunnel → VPS)

**Hazırsan başlayalım! 🎯** 