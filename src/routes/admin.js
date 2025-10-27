// ===== АДМИН МАРШРУТЫ =====

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const Category = require('../models/Category');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ===== ОБЩАЯ СТАТИСТИКА =====
router.get('/stats', async (req, res) => {
    try {
        const [
            totalUsers,
            totalArticles,
            totalComments,
            totalCategories,
            publishedArticles,
            draftArticles,
            pendingComments,
            approvedComments
        ] = await Promise.all([
            User.countDocuments(),
            Article.countDocuments(),
            Comment.countDocuments(),
            Category.countDocuments(),
            Article.countDocuments({ status: 'published' }),
            Article.countDocuments({ status: 'draft' }),
            Comment.countDocuments({ status: 'pending' }),
            Comment.countDocuments({ status: 'approved' })
        ]);

        // Статистика за последние 30 дней
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            newUsers,
            newArticles,
            newComments
        ] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Article.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Comment.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
        ]);

        // Топ авторы по статьям
        const topAuthors = await Article.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: '$author', articleCount: { $sum: 1 } } },
            { $sort: { articleCount: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            { $unwind: '$author' },
            {
                $project: {
                    username: '$author.username',
                    avatar: '$author.avatar',
                    articleCount: 1
                }
            }
        ]);

        // Популярные статьи
        const popularArticles = await Article.find({ status: 'published' })
            .populate('author', 'username avatar')
            .populate('category', 'name')
            .sort({ views: -1, likes: -1 })
            .limit(5)
            .select('title views likes author category createdAt');

        res.json({
            overview: {
                totalUsers,
                totalArticles,
                totalComments,
                totalCategories,
                publishedArticles,
                draftArticles,
                pendingComments,
                approvedComments
            },
            recent: {
                newUsers,
                newArticles,
                newComments
            },
            topAuthors,
            popularArticles
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения статистики' });
    }
});

// ===== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ =====
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const role = req.query.role;
        const blocked = req.query.blocked;

        // Построение фильтра
        const filter = {};
        
        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (role) {
            filter.role = role;
        }
        
        if (blocked !== undefined) {
            filter.blocked = blocked === 'true';
        }

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(filter);

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

// ===== УПРАВЛЕНИЕ СТАТЬЯМИ =====
router.get('/articles', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status;
        const category = req.query.category;
        const search = req.query.search;

        // Построение фильтра
        const filter = {};
        
        if (status) {
            filter.status = status;
        }
        
        if (category) {
            filter.category = category;
        }
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const articles = await Article.find(filter)
            .populate('author', 'username avatar')
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Article.countDocuments(filter);

        res.json({
            articles,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения статей' });
    }
});

// ===== МОДЕРАЦИЯ КОММЕНТАРИЕВ =====
router.get('/comments', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status;

        const filter = {};
        if (status) {
            filter.status = status;
        }

        const comments = await Comment.find(filter)
            .populate('user', 'username avatar')
            .populate('article', 'title')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Comment.countDocuments(filter);

        res.json({
            comments,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения комментариев' });
    }
});

// ===== УПРАВЛЕНИЕ КАТЕГОРИЯМИ =====
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find()
            .sort({ name: 1 });

        // Добавляем количество статей для каждой категории
        const categoriesWithStats = await Promise.all(
            categories.map(async (category) => {
                const [published, drafts] = await Promise.all([
                    Article.countDocuments({ category: category._id, status: 'published' }),
                    Article.countDocuments({ category: category._id, status: 'draft' })
                ]);

                return {
                    ...category.toObject(),
                    published,
                    drafts,
                    total: published + drafts
                };
            })
        );

        res.json(categoriesWithStats);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения категорий' });
    }
});

// ===== ИЗМЕНЕНИЕ РОЛИ ПОЛЬЗОВАТЕЛЯ =====
router.put('/users/:id/role', async (req, res) => {
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

// ===== БЛОКИРОВКА/РАЗБЛОКИРОВКА ПОЛЬЗОВАТЕЛЯ =====
router.put('/users/:id/block', async (req, res) => {
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

// ===== ОДОБРЕНИЕ/ОТКЛОНЕНИЕ СТАТЬИ =====
router.put('/articles/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['draft', 'published', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Неверный статус статьи' });
        }

        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ error: 'Статья не найдена' });
        }

        article.status = status;
        await article.save();

        res.json({
            message: `Статус статьи изменен на ${status}`,
            article: {
                id: article._id,
                title: article.title,
                status: article.status
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка изменения статуса статьи' });
    }
});

// ===== МАССОВЫЕ ОПЕРАЦИИ =====
router.post('/bulk/actions', async (req, res) => {
    try {
        const { action, ids, data } = req.body;
        
        if (!action || !ids || !Array.isArray(ids)) {
            return res.status(400).json({ error: 'Неверные параметры массовой операции' });
        }

        let result = {};

        switch (action) {
            case 'deleteUsers':
                result = await User.deleteMany({ _id: { $in: ids } });
                break;
                
            case 'blockUsers':
                result = await User.updateMany(
                    { _id: { $in: ids } },
                    { blocked: true }
                );
                break;
                
            case 'unblockUsers':
                result = await User.updateMany(
                    { _id: { $in: ids } },
                    { blocked: false }
                );
                break;
                
            case 'deleteArticles':
                result = await Article.deleteMany({ _id: { $in: ids } });
                break;
                
            case 'approveComments':
                result = await Comment.updateMany(
                    { _id: { $in: ids } },
                    { status: 'approved' }
                );
                break;
                
            case 'rejectComments':
                result = await Comment.updateMany(
                    { _id: { $in: ids } },
                    { status: 'rejected' }
                );
                break;
                
            default:
                return res.status(400).json({ error: 'Неизвестная операция' });
        }

        res.json({
            message: 'Массовая операция выполнена',
            affected: result.modifiedCount || result.deletedCount || 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка выполнения массовой операции' });
    }
});

module.exports = router;
