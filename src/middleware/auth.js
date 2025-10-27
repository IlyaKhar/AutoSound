// ===== MIDDLEWARE АУТЕНТИФИКАЦИИ =====

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Проверка JWT токена
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                error: 'Токен доступа не предоставлен',
                code: 'NO_TOKEN'
            });
        }

        // Проверяем токен
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Получаем пользователя из базы данных
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({
                error: 'Пользователь не найден',
                code: 'USER_NOT_FOUND'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                error: 'Аккаунт заблокирован',
                code: 'ACCOUNT_BLOCKED'
            });
        }

        // Добавляем пользователя в запрос
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Недействительный токен',
                code: 'INVALID_TOKEN'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Токен истек',
                code: 'TOKEN_EXPIRED'
            });
        }

        console.error('Ошибка аутентификации:', error);
        res.status(500).json({
            error: 'Ошибка сервера при аутентификации',
            code: 'AUTH_ERROR'
        });
    }
};

// Проверка роли пользователя
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Требуется аутентификация',
                code: 'AUTH_REQUIRED'
            });
        }

        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: 'Недостаточно прав доступа',
                code: 'INSUFFICIENT_PERMISSIONS',
                required: allowedRoles,
                current: userRole
            });
        }

        next();
    };
};

// Проверка прав администратора
const requireAdmin = requireRole(['admin']);

// Проверка прав модератора
const requireModerator = requireRole(['admin', 'moderator']);

// Проверка прав автора
const requireAuthor = requireRole(['admin', 'moderator', 'author']);

// Проверка владельца ресурса или прав администратора
const requireOwnershipOrAdmin = (resourceUserIdField = 'author') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Требуется аутентификация',
                code: 'AUTH_REQUIRED'
            });
        }

        const user = req.user;
        const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

        // Администраторы имеют доступ ко всему
        if (user.role === 'admin') {
            return next();
        }

        // Проверяем владельца ресурса
        if (user._id.toString() === resourceUserId) {
            return next();
        }

        return res.status(403).json({
            error: 'Доступ запрещен',
            code: 'ACCESS_DENIED'
        });
    };
};

// Опциональная аутентификация (не блокирует запрос)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password');
            
            if (user && user.isActive) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Игнорируем ошибки при опциональной аутентификации
        next();
    }
};

// Проверка блокировки аккаунта
const checkAccountStatus = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Требуется аутентификация',
            code: 'AUTH_REQUIRED'
        });
    }

    if (!req.user.isActive) {
        return res.status(403).json({
            error: 'Аккаунт заблокирован',
            code: 'ACCOUNT_BLOCKED'
        });
    }

    if (req.user.isLocked) {
        return res.status(423).json({
            error: 'Аккаунт временно заблокирован из-за множественных неудачных попыток входа',
            code: 'ACCOUNT_LOCKED',
            lockUntil: req.user.lockUntil
        });
    }

    next();
};

// Обновление последнего входа
const updateLastLogin = async (req, res, next) => {
    if (req.user) {
        try {
            await req.user.updateLastLogin();
        } catch (error) {
            console.error('Ошибка обновления последнего входа:', error);
        }
    }
    next();
};

// Проверка лимитов API
const checkRateLimit = (req, res, next) => {
    // Здесь можно добавить дополнительную логику проверки лимитов
    // для конкретных пользователей или ролей
    next();
};

// Проверка верификации email
const requireEmailVerification = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Требуется аутентификация',
            code: 'AUTH_REQUIRED'
        });
    }

    if (!req.user.isEmailVerified) {
        return res.status(403).json({
            error: 'Требуется верификация email',
            code: 'EMAIL_NOT_VERIFIED'
        });
    }

    next();
};

// Middleware для логирования действий пользователя
const logUserAction = (action) => {
    return (req, res, next) => {
        if (req.user) {
            console.log(`Пользователь ${req.user.username} выполнил действие: ${action}`);
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    requireRole,
    requireAdmin,
    requireModerator,
    requireAuthor,
    requireOwnershipOrAdmin,
    optionalAuth,
    checkAccountStatus,
    updateLastLogin,
    checkRateLimit,
    requireEmailVerification,
    logUserAction
};
