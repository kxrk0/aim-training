# 🚀 AIM TRAINER PRO - VPS DEPLOYMENT GUIDE

## 📋 Ön Hazırlık

### 1. DNS Ayarları
Domain panelinde şu A Record'u ekleyin:
```
Tip: A Record
Name: aim
Value: 194.105.5.37
TTL: 3600
```

### 2. GitHub Repository
1. GitHub'da repository oluşturun
2. Bu projeyi push edin
3. `ecosystem.config.js` ve `deploy-vps.sh` dosyalarındaki repository URL'ini güncelleyin

## 🔧 VPS Kurulumu

### 1. Gerekenler (Zaten Kurulu)
- ✅ Node.js, npm, PM2
- ✅ PostgreSQL
- ✅ Caddy

### 2. Database Kurulumu
```bash
# PostgreSQL'e bağlan
sudo -u postgres psql

# Database ve kullanıcı oluştur
CREATE DATABASE aim_trainer;
CREATE USER aim_user WITH PASSWORD 'strong_password_123';
GRANT ALL PRIVILEGES ON DATABASE aim_trainer TO aim_user;
\q
```

### 3. Proje Deployment

#### Yöntem A: Otomatik Script (Önerilen)
```bash
# Repository'yi clone edin
git clone YOUR_GITHUB_REPO_URL /tmp/aim-training
cd /tmp/aim-training

# Deploy script'ini çalıştırın
chmod +x deploy-vps.sh
sudo ./deploy-vps.sh
```

#### Yöntem B: Manuel
```bash
# Proje dizini oluştur
sudo mkdir -p /opt/aim-trainer
sudo chown $USER:$USER /opt/aim-trainer

# Repository clone
git clone YOUR_GITHUB_REPO_URL /opt/aim-trainer
cd /opt/aim-trainer

# Environment dosyası oluştur
cp server/.env.example server/.env
nano server/.env  # Değerleri düzenleyin

# Dependencies ve build
npm install --production
cd server && npm run build && cd ..

# PM2 ile başlat
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 4. Environment Variables (.env dosyası)
```bash
# /opt/aim-trainer/server/.env
NODE_ENV=production
PORT=3002
DATABASE_URL=postgresql://aim_user:strong_password_123@localhost:5432/aim_trainer
JWT_SECRET=your_super_secure_jwt_secret_key_here
CORS_ORIGIN=https://aim.liorabelleleather.com
```

### 5. Caddy Reload
```bash
sudo systemctl reload caddy
```

## ✅ Doğrulama

### 1. Servis Durumu
```bash
# PM2 status
pm2 status

# Application logs
pm2 logs aim-trainer-pro

# Health check
curl https://aim.liorabelleleather.com/health
```

### 2. Test URLs
- **Health Check**: https://aim.liorabelleleather.com/health
- **API Test**: https://aim.liorabelleleather.com/api/users
- **Socket.IO Test**: https://aim.liorabelleleather.com/socket.io/

## 🔄 Güncelleme

### Repository'ye yeni kod push ettikten sonra:
```bash
cd /opt/aim-trainer
git pull origin main
npm install --production
cd server && npm run build && cd ..
pm2 reload aim-trainer-pro
```

## 📊 Monitoring

### PM2 Commands
```bash
pm2 status                    # Servis durumu
pm2 logs aim-trainer-pro      # Logs
pm2 monit                     # Real-time monitoring
pm2 restart aim-trainer-pro   # Restart
pm2 stop aim-trainer-pro      # Stop
pm2 start aim-trainer-pro     # Start
```

### Log Dosyaları
- **Application**: `/var/log/aim-trainer/`
- **Caddy**: `/var/log/caddy/aim-trainer.log`
- **PM2**: `~/.pm2/logs/`

## 🖥️ Desktop App Güncelleme

Desktop app artık otomatik olarak VPS'e bağlanacak:
- **API**: `https://aim.liorabelleleather.com/api`
- **Socket.IO**: `https://aim.liorabelleleather.com`

Yeni desktop build oluşturun:
```bash
npm run electron:pack
```

## 🚨 Troubleshooting

### SSL Sertifika Sorunu
```bash
sudo systemctl restart caddy
```

### Database Bağlantı Sorunu
```bash
# PostgreSQL durumu kontrol et
sudo systemctl status postgresql

# Connection test
psql -h localhost -U aim_user -d aim_trainer -c "\dt"
```

### Port Çakışması
```bash
# Port 3002'yi kullanan process'leri bul
sudo netstat -tlnp | grep :3002
sudo lsof -i :3002
```

## 📞 Destek

Sorun yaşarsanız:
1. PM2 logs kontrol edin: `pm2 logs aim-trainer-pro`
2. Caddy logs kontrol edin: `tail -f /var/log/caddy/aim-trainer.log`
3. Health endpoint test edin: `curl -v https://aim.liorabelleleather.com/health` 