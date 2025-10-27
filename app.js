// ===== ГЛАВНЫЙ ФАЙЛ ПРИЛОЖЕНИЯ =====

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Загружаем конфигурацию
require('dotenv').config({ path: './config.env' });
const config = require('./src/config/app');
const connectDB = require('./src/config/database');

// Импорт маршрутов
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const articleRoutes = require('./src/routes/articles');
const categoryRoutes = require('./src/routes/categories');
const commentRoutes = require('./src/routes/comments');
const adminRoutes = require('./src/routes/admin');

// Импорт middleware
const errorHandler = require('./src/middleware/errorHandler');
const { authenticateToken } = require('./src/middleware/auth');

const app = express();

// ===== TRUST PROXY (ВАЖНО ДЛЯ VERCEL) =====
app.set('trust proxy', true);

// ===== ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ =====
connectDB();

// ===== MIDDLEWARE =====

// Безопасность
app.use(helmet({
    contentSecurityPolicy: false, // Временно отключаем CSP для отладки
    crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors(config.cors));

// Сжатие
app.use(compression());

// Логирование
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
    windowMs: config.security.rateLimitWindow * 60 * 1000,
    max: config.security.rateLimitMax,
    message: {
        error: 'Слишком много запросов с этого IP, попробуйте позже'
    }
});
app.use('/api/', limiter);

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Статические файлы с правильными MIME-типами и отладкой
app.use('/uploads', express.static(config.paths.uploads, {
    setHeaders: (res, filePath) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
}));

// Отладка путей
app.use('/css', express.static(config.paths.public + '/css', {
    setHeaders: (res, filePath) => {
        res.setHeader('Content-Type', 'text/css');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        console.log('📄 Serving CSS:', filePath);
    }
}));

app.use('/js', express.static(config.paths.public + '/js', {
    setHeaders: (res, filePath) => {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
}));

app.use('/images', express.static(config.paths.public + '/images', {
    setHeaders: (res, filePath) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
}));

// Все остальные статические файлы
app.use(express.static(config.paths.public, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
}));

// ===== МАРШРУТЫ =====

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(config.paths.views, 'pages', 'index.html'));
});

// Страницы
app.get('/main', (req, res) => {
    res.sendFile(path.join(config.paths.views, 'pages', 'main.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(config.paths.views, 'pages', 'profile.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(config.paths.views, 'pages', 'admin.html'));
});

app.get('/categories', (req, res) => {
    res.sendFile(path.join(config.paths.views, 'pages', 'categories.html'));
});

app.get('/news', (req, res) => {
    res.sendFile(path.join(config.paths.views, 'pages', 'news.html'));
});

app.get('/rating', (req, res) => {
    res.sendFile(path.join(config.paths.views, 'pages', 'rating.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(config.paths.views, 'pages', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(config.paths.views, 'pages', 'register.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(config.paths.views, 'pages', 'settings.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(config.paths.views, 'pages', 'about.html'));
});

app.get('/contacts', (req, res) => {
    res.sendFile(path.join(config.paths.views, 'pages', 'contacts.html'));
});

app.get('/terms', (req, res) => {
    res.sendFile(path.join(config.paths.views, 'pages', 'terms.html'));
});

app.get('/policy', (req, res) => {
    res.sendFile(path.join(config.paths.views, 'pages', 'policy.html'));
});

app.get('/autozvuk', (req, res) => {
    res.sendFile(path.join(config.paths.views, 'pages', 'autozvuk.html'));
});

// API статус
app.get('/api/status', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: config.nodeEnv
    });
});

// 404 обработчик
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Страница не найдена',
        path: req.originalUrl
    });
});

// Обработчик ошибок
app.use(errorHandler);

// ===== ЗАПУСК СЕРВЕРА =====

const PORT = config.port;

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📱 Локальный адрес: http://localhost:${PORT}`);
    console.log(`🌍 Окружение: ${config.nodeEnv}`);
});

// Обработка необработанных ошибок
process.on('unhandledRejection', (err) => {
    console.error('❌ Необработанная ошибка:', err);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Необработанное исключение:', err);
    process.exit(1);
});

module.exports = app;
