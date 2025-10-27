// ===== КОНФИГУРАЦИЯ ПРИЛОЖЕНИЯ =====

const path = require('path');

const config = {
    // Основные настройки
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // База данных
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/autosound'
    },
    
    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production',
        expiresIn: process.env.JWT_EXPIRE || '7d',
        refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret-here'
    },
    
    // Файлы
    uploads: {
        path: process.env.UPLOAD_PATH || './uploads',
        maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
        allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',')
    },
    
    // Безопасность
    security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
        rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15, // минуты
        rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100 // запросов
    },
    
    // CORS
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
        credentials: true
    },
    
    // Пути
    paths: {
        public: path.join(__dirname, '..', '..', 'src', 'public'),
        views: path.join(__dirname, '..', 'views'),
        uploads: path.join(__dirname, '..', '..', 'uploads')
    },
    
    // Email (опционально)
    email: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    },
    
    // Логирование
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || './logs/app.log'
    }
};

module.exports = config;
