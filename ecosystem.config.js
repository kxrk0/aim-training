module.exports = {
  apps: [
    {
      // ===============================================
      // AIM TRAINER PRO - PRODUCTION CONFIG
      // ===============================================
      name: 'aim-trainer-pro',
      script: 'server/dist/index.js',
      cwd: '/opt/aim-trainer',
      
      // ===============================================
      // PROCESS MANAGEMENT
      // ===============================================
      instances: 2, // CPU core sayısına göre ayarlanabilir
      exec_mode: 'cluster',
      
      // ===============================================
      // ENVIRONMENT
      // ===============================================
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        HOST: '0.0.0.0'
      },
      
      // ===============================================
      // MONITORING & RESTART
      // ===============================================
      watch: false, // Production'da false
      ignore_watch: [
        'node_modules',
        'logs',
        '.git',
        'uploads'
      ],
      
      // Auto restart settings
      restart_delay: 4000,
      max_restarts: 5,
      min_uptime: '10s',
      
      // Memory management
      max_memory_restart: '1G',
      
      // ===============================================
      // LOGGING
      // ===============================================
      log_file: '/var/log/aim-trainer/combined.log',
      out_file: '/var/log/aim-trainer/out.log',
      error_file: '/var/log/aim-trainer/error.log',
      log_type: 'json',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // ===============================================
      // ADVANCED SETTINGS
      // ===============================================
      // Kill timeout
      kill_timeout: 5000,
      
      // Listen timeout
      listen_timeout: 3000,
      
      // Source map support
      source_map_support: true,
      
      // Node.js options
      node_args: [
        '--max-old-space-size=2048',
        '--optimize-for-size'
      ],
      
      // ===============================================
      // HEALTH CHECK
      // ===============================================
      health_check_url: 'http://localhost:3002/health',
      health_check_grace_period: 3000
    }
  ],
  
  // ===============================================
  // DEPLOYMENT CONFIGURATION
  // ===============================================
  deploy: {
    production: {
      user: 'root',
      host: '194.105.5.37',
      ref: 'origin/main',
      repo: 'https://github.com/username/aim-training.git', // Bu URL'yi güncelleyin
      path: '/opt/aim-trainer',
      
      // Post deployment commands
      'post-deploy': [
        'npm install --production',
        'npm run build',
        'mkdir -p /var/log/aim-trainer',
        'pm2 reload ecosystem.config.js --env production'
      ].join(' && '),
      
      // Pre setup commands
      'pre-setup': [
        'mkdir -p /opt/aim-trainer',
        'mkdir -p /var/log/aim-trainer'
      ].join(' && ')
    }
  }
} 