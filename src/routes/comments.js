// ===== МАРШРУТЫ КОММЕНТАРИЕВ =====

const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Article = require('../models/Article');
const User = require('../models/User');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ===== ПОЛУЧЕНИЕ КОММЕНТАРИЕВ К СТАТЬЕ =====
router.get('/article/:articleId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const comments = await Comment.find({ 
            article: req.params.articleId,
            status: 'approved'
        })
        .populate('user', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        const total = await Comment.countDocuments({ 
            article: req.params.articleId,
            status: 'approved'
        });

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

// ===== СОЗДАНИЕ КОММЕНТАРИЯ =====
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { articleId, content, parentId } = req.body;

        if (!articleId || !content) {
            return res.status(400).json({ error: 'ID статьи и содержание комментария обязательны' });
        }

        // Проверяем существование статьи
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ error: 'Статья не найдена' });
        }

        // Проверяем родительский комментарий (если это ответ)
        if (parentId) {
            const parentComment = await Comment.findById(parentId);
            if (!parentComment) {
                return res.status(404).json({ error: 'Родительский комментарий не найден' });
            }
        }

        const comment = new Comment({
            article: articleId,
            user: req.user.id,
            content,
            parentId: parentId || null,
            status: 'pending' // Новые комментарии требуют модерации
        });

        await comment.save();
        await comment.populate('user', 'username avatar');

        // Обновляем счетчик комментариев в статье
        article.commentsCount += 1;
        await article.save();

        res.status(201).json({
            message: 'Комментарий добавлен и отправлен на модерацию',
            comment
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка создания комментария' });
    }
});

// ===== ОБНОВЛЕНИЕ КОММЕНТАРИЯ =====
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        
        if (!comment) {
            return res.status(404).json({ error: 'Комментарий не найден' });
        }

        // Проверяем права на редактирование
        if (comment.user.toString() !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Нет прав на редактирование комментария' });
        }

        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({ error: 'Содержание комментария обязательно' });
        }

        comment.content = content;
        comment.updatedAt = new Date();
        await comment.save();

        res.json({
            message: 'Комментарий обновлен',
            comment
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка обновления комментария' });
    }
});

// ===== УДАЛЕНИЕ КОММЕНТАРИЯ =====
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        
        if (!comment) {
            return res.status(404).json({ error: 'Комментарий не найден' });
        }

        // Проверяем права на удаление
        if (comment.user.toString() !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Нет прав на удаление комментария' });
        }

        await Comment.findByIdAndDelete(req.params.id);

        // Обновляем счетчик комментариев в статье
        const article = await Article.findById(comment.article);
        if (article) {
            article.commentsCount = Math.max(0, article.commentsCount - 1);
            await article.save();
        }

        res.json({ message: 'Комментарий удален' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка удаления комментария' });
    }
});

// ===== МОДЕРАЦИЯ КОММЕНТАРИЕВ (ТОЛЬКО ДЛЯ МОДЕРАТОРОВ И АДМИНОВ) =====
router.get('/moderation/pending', authenticateToken, requireRole(['admin', 'moderator']), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const comments = await Comment.find({ status: 'pending' })
            .populate('user', 'username avatar')
            .populate('article', 'title')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Comment.countDocuments({ status: 'pending' });

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
        res.status(500).json({ error: 'Ошибка получения комментариев на модерации' });
    }
});

// ===== ОДОБРЕНИЕ/ОТКЛОНЕНИЕ КОММЕНТАРИЯ =====
router.put('/:id/moderate', authenticateToken, requireRole(['admin', 'moderator']), async (req, res) => {
    try {
        const { status, reason } = req.body;
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Неверный статус модерации' });
        }

        const comment = await Comment.findById(req.params.id);
        
        if (!comment) {
            return res.status(404).json({ error: 'Комментарий не найден' });
        }

        comment.status = status;
        if (reason) comment.moderatorNote = reason;
        comment.moderatedBy = req.user.id;
        comment.moderatedAt = new Date();

        await comment.save();

        res.json({
            message: status === 'approved' ? 'Комментарий одобрен' : 'Комментарий отклонен',
            comment
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка модерации комментария' });
    }
});

// ===== ПОЛУЧЕНИЕ КОММЕНТАРИЕВ ПОЛЬЗОВАТЕЛЯ =====
router.get('/user/:userId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const comments = await Comment.find({ 
            user: req.params.userId,
            status: 'approved'
        })
        .populate('article', 'title slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        const total = await Comment.countDocuments({ 
            user: req.params.userId,
            status: 'approved'
        });

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
        res.status(500).json({ error: 'Ошибка получения комментариев пользователя' });
    }
});

// ===== СТАТИСТИКА КОММЕНТАРИЕВ =====
router.get('/stats/overview', authenticateToken, requireRole(['admin', 'moderator']), async (req, res) => {
    try {
        const total = await Comment.countDocuments();
        const pending = await Comment.countDocuments({ status: 'pending' });
        const approved = await Comment.countDocuments({ status: 'approved' });
        const rejected = await Comment.countDocuments({ status: 'rejected' });

        // Топ пользователей по комментариям
        const topCommenters = await Comment.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: '$user', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    username: '$user.username',
                    avatar: '$user.avatar',
                    commentCount: '$count'
                }
            }
        ]);

        res.json({
            total,
            pending,
            approved,
            rejected,
            topCommenters
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения статистики комментариев' });
    }
});

module.exports = router;
