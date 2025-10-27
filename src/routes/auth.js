// ===== МАРШРУТЫ АУТЕНТИФИКАЦИИ =====

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ===== РЕГИСТРАЦИЯ =====
router.post('/register', async (req, res) => {
    try {
        console.log('\n🔔 === ЗАПРОС НА РЕГИСТРАЦИЮ ===');
        console.log('📦 Полный body:', JSON.stringify(req.body, null, 2));
        
        const { username, email, password, confirmPassword, agree } = req.body;
        
        // Валидация вручную
        const errors = [];
        
        if (!username || username.length < 3 || username.length > 30) {
            errors.push('Имя пользователя должно содержать от 3 до 30 символов');
        }
        
        if (!email || !email.includes('@')) {
            errors.push('Некорректный email');
        }
        
        if (!password || password.length < 6) {
            errors.push('Пароль должен содержать минимум 6 символов');
        }
        
        if (!confirmPassword || password !== confirmPassword) {
            errors.push('Пароли не совпадают');
        }
        
        if (!agree) {
            errors.push('Необходимо согласиться с условиями использования');
        }
        
        if (errors.length > 0) {
            console.log('❌ Ошибки валидации:', errors);
            const errorMessage = errors.join(', ');
            console.log('📤 Отправляю ответ с ошибкой:', errorMessage);
            return res.status(400).json({
                success: false,
                error: errorMessage
            });
        }
        
        console.log('✅ Валидация пройдена');
        
        // Проверка существования пользователя
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            console.log('❌ Пользователь уже существует:', {
                email: existingUser.email,
                username: existingUser.username
            });
            return res.status(400).json({
                success: false,
                error: 'Пользователь с таким email или именем уже существует'
            });
        }

        console.log('✅ Пользователь не найден, создаю нового');
        
        // Создание пользователя
        const user = new User({
            username,
            email,
            password
        });

        await user.save();
        console.log('✅ Пользователь создан:', user._id);

        // Генерация токенов
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '30d' }
        );

        // Сохранение refresh токена
        user.refreshTokens.push({ token: refreshToken });
        await user.save();

        console.log('✅ Регистрация успешна!\n');
        
        res.status(201).json({
            success: true,
            message: 'Пользователь успешно зарегистрирован',
            data: {
                user: user.toJSON(),
                token,
                refreshToken
            }
        });

    } catch (error) {
        console.error('❌ Ошибка регистрации:', error);
        
        if (error.name === 'MongoServerError' || error.message.includes('connection')) {
            return res.status(503).json({
                success: false,
                error: 'База данных недоступна. Пожалуйста, проверьте подключение.'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Ошибка сервера при регистрации'
        });
    }
});

// ===== ВХОД =====
router.post('/login', [
    body('identifier')
        .notEmpty()
        .withMessage('Email или имя пользователя обязательно'),
    
    body('password')
        .notEmpty()
        .withMessage('Пароль обязателен')
], async (req, res) => {
    try {
        // Проверка валидации
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Ошибки валидации',
                details: errors.array()
            });
        }

        const { identifier, password } = req.body;
        
        console.log('🔍 Поиск пользователя:', identifier);

        // Поиск пользователя
        const user = await User.findByEmailOrUsername(identifier).select('+password');
        
        console.log('👤 Пользователь найден:', user ? `Да, email: ${user.email}, username: ${user.username}` : 'Нет');
        
        if (!user) {
            console.log('❌ Пользователь не найден в базе данных');
            return res.status(401).json({
                success: false,
                error: 'Неверные учетные данные'
            });
        }

        // Проверка блокировки
        if (user.isLocked) {
            return res.status(423).json({
                success: false,
                error: 'Аккаунт временно заблокирован из-за множественных неудачных попыток входа',
                lockUntil: user.lockUntil
            });
        }

        // Проверка активности
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                error: 'Аккаунт заблокирован'
            });
        }

        // Проверка пароля
        console.log('🔐 Проверка пароля...');
        console.log('📥 Полученный пароль:', password);
        console.log('🔑 Хеш пароля в БД:', user.password ? 'Присутствует' : 'Отсутствует');
        const isPasswordValid = await user.comparePassword(password);
        
        console.log('✅ Результат проверки пароля:', isPasswordValid ? 'Пароль верный' : 'Пароль неверный');
        
        if (!isPasswordValid) {
            console.log('❌ Пароль неверный, увеличиваем счетчик неудачных попыток');
            // Увеличение счетчика неудачных попыток
            await user.incLoginAttempts();
            
            return res.status(401).json({
                success: false,
                error: 'Неверные учетные данные'
            });
        }

        // Сброс счетчика неудачных попыток
        await user.resetLoginAttempts();

        // Обновление последнего входа
        await user.updateLastLogin();

        // Генерация токенов
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '30d' }
        );

        // Сохранение refresh токена
        user.refreshTokens.push({ token: refreshToken });
        await user.save();

        res.json({
            success: true,
            message: 'Вход выполнен успешно',
            data: {
                user: user.toJSON(),
                token,
                refreshToken
            }
        });

    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка сервера при входе'
        });
    }
});

// ===== ОБНОВЛЕНИЕ ТОКЕНА =====
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                error: 'Refresh токен не предоставлен'
            });
        }

        // Проверка refresh токена
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        const user = await User.findById(decoded.userId);
        
        if (!user || !user.refreshTokens.some(rt => rt.token === refreshToken)) {
            return res.status(401).json({
                success: false,
                error: 'Недействительный refresh токен'
            });
        }

        // Генерация нового access токена
        const newToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            success: true,
            data: {
                token: newToken
            }
        });

    } catch (error) {
        console.error('Ошибка обновления токена:', error);
        res.status(401).json({
            success: false,
            error: 'Недействительный refresh токен'
        });
    }
});

// ===== ВЫХОД =====
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            // Удаление refresh токена
            await User.findByIdAndUpdate(
                req.user._id,
                { $pull: { refreshTokens: { token: refreshToken } } }
            );
        }

        res.json({
            success: true,
            message: 'Выход выполнен успешно'
        });

    } catch (error) {
        console.error('Ошибка выхода:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка сервера при выходе'
        });
    }
});

// ===== ПРОВЕРКА ТОКЕНА =====
router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        data: {
            user: req.user.toJSON()
        }
    });
});

// ===== СМЕНА ПАРОЛЯ =====
router.post('/change-password', [
    authenticateToken,
    body('currentPassword')
        .notEmpty()
        .withMessage('Текущий пароль обязателен'),
    
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Новый пароль должен содержать минимум 6 символов')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Новый пароль должен содержать минимум одну строчную букву, одну заглавную букву и одну цифру')
], async (req, res) => {
    try {
        // Проверка валидации
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Ошибки валидации',
                details: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Получаем пользователя с паролем
        const user = await User.findById(req.user._id).select('+password');
        
        // Проверяем текущий пароль
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                error: 'Неверный текущий пароль'
            });
        }

        // Обновляем пароль
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Пароль успешно изменен'
        });

    } catch (error) {
        console.error('Ошибка смены пароля:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка сервера при смене пароля'
        });
    }
});

// ===== ЗАБЫЛИ ПАРОЛЬ =====
router.post('/forgot-password', [
    body('email')
        .isEmail()
        .withMessage('Некорректный email')
        .normalizeEmail()
], async (req, res) => {
    try {
        // Проверка валидации
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Ошибки валидации',
                details: errors.array()
            });
        }

        const { email } = req.body;

        const user = await User.findOne({ email });
        
        if (!user) {
            // Не раскрываем информацию о существовании пользователя
            return res.json({
                success: true,
                message: 'Если пользователь с таким email существует, инструкции по сбросу пароля отправлены на email'
            });
        }

        // Генерация токена сброса пароля
        const resetToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Сохранение токена
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = Date.now() + 3600000; // 1 час
        await user.save();

        // Здесь должна быть отправка email с инструкциями
        // TODO: Реализовать отправку email

        res.json({
            success: true,
            message: 'Инструкции по сбросу пароля отправлены на email'
        });

    } catch (error) {
        console.error('Ошибка сброса пароля:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка сервера при сбросе пароля'
        });
    }
});

// ===== СБРОС ПАРОЛЯ =====
router.post('/reset-password', [
    body('token')
        .notEmpty()
        .withMessage('Токен сброса пароля обязателен'),
    
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Новый пароль должен содержать минимум 6 символов')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Новый пароль должен содержать минимум одну строчную букву, одну заглавную букву и одну цифру')
], async (req, res) => {
    try {
        // Проверка валидации
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Ошибки валидации',
                details: errors.array()
            });
        }

        const { token, newPassword } = req.body;

        // Проверка токена
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findOne({
            _id: decoded.userId,
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Недействительный или истекший токен сброса пароля'
            });
        }

        // Обновление пароля
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Пароль успешно сброшен'
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(400).json({
                success: false,
                error: 'Недействительный или истекший токен сброса пароля'
            });
        }

        console.error('Ошибка сброса пароля:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка сервера при сбросе пароля'
        });
    }
});

module.exports = router;
