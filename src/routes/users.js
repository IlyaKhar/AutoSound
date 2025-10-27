// ===== МАРШРУТЫ ПОЛЬЗОВАТЕЛЕЙ =====

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ===== ПОЛУЧЕНИЕ ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ =====
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ===== ПОЛУЧЕНИЕ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ =====
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -refreshTokens');
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json(user);
    } catch (error) {
        console.error('❌ Ошибка при получении профиля:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ===== ОБНОВЛЕНИЕ ПРОФИЛЯ =====
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { username, email, bio, avatar } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Обновляем поля
        if (username) user.username = username;
        if (email) user.email = email;
        if (bio !== undefined) user.bio = bio;
        if (avatar) user.avatar = avatar;

        await user.save();
        
        res.json({
            message: 'Профиль обновлен',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                avatar: user.avatar,
                role: user.role
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Email или имя пользователя уже используется' });
        }
        res.status(500).json({ error: 'Ошибка обновления профиля' });
    }
});

// ===== ПОЛУЧЕНИЕ ИНФОРМАЦИИ О ПОЛЬЗОВАТЕЛЕ =====
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ===== ПОЛУЧЕНИЕ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ (ТОЛЬКО ДЛЯ АДМИНОВ) =====
router.get('/', requireRole(['admin', 'moderator']), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        res.json({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения пользователей' });
    }
});

// ===== ИЗМЕНЕНИЕ РОЛИ ПОЛЬЗОВАТЕЛЯ (ТОЛЬКО ДЛЯ АДМИНОВ) =====
router.put('/:id/role', requireRole(['admin']), async (req, res) => {
    try {
        const { role } = req.body;
        
        if (!['user', 'author', 'moderator', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Неверная роль' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        user.role = role;
        await user.save();

        res.json({
            message: 'Роль пользователя обновлена',
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка обновления роли' });
    }
});

// ===== БЛОКИРОВКА/РАЗБЛОКИРОВКА ПОЛЬЗОВАТЕЛЯ (ТОЛЬКО ДЛЯ АДМИНОВ) =====
router.put('/:id/block', requireRole(['admin', 'moderator']), async (req, res) => {
    try {
        const { blocked } = req.body;
        
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        user.blocked = blocked;
        await user.save();

        res.json({
            message: blocked ? 'Пользователь заблокирован' : 'Пользователь разблокирован',
            user: {
                id: user._id,
                username: user.username,
                blocked: user.blocked
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка блокировки пользователя' });
    }
});

module.exports = router;
