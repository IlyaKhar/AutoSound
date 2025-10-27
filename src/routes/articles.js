// ===== МАРШРУТЫ СТАТЕЙ =====

const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const User = require('../models/User');
const Category = require('../models/Category');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ===== ПОИСК СТАТЕЙ =====
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const limit = parseInt(req.query.limit) || 10;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({ 
                success: false, 
                error: 'Поисковый запрос должен содержать минимум 2 символа' 
            });
        }

        const articles = await Article.find({
            $and: [
                { status: 'published' },
                {
                    $or: [
                        { title: { $regex: query, $options: 'i' } },
                        { content: { $regex: query, $options: 'i' } },
                        { excerpt: { $regex: query, $options: 'i' } },
                        { tags: { $in: [new RegExp(query, 'i')] } }
                    ]
                }
            ]
        })
        .populate('author', 'username avatar')
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .limit(limit);

        res.json({
            success: true,
            articles,
            total: articles.length
        });
    } catch (error) {
        console.error('Ошибка поиска:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Ошибка поиска статей' 
        });
    }
});

// ===== ПОЛУЧЕНИЕ ВСЕХ СТАТЕЙ =====
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const category = req.query.category;
        const search = req.query.search;
        const sort = req.query.sort || '-createdAt';

        // Построение фильтра
        const filter = { status: 'published' };
        
        if (category) {
            filter.category = category;
        }
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const articles = await Article.find(filter)
            .populate('author', 'username avatar')
            .populate('category', 'name slug')
            .sort(sort)
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

// ===== ПОЛУЧЕНИЕ СТАТЬИ ПО ID =====
router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
            .populate('author', 'username avatar bio')
            .populate('category', 'name slug');

        if (!article) {
            return res.status(404).json({ error: 'Статья не найдена' });
        }

        // Увеличиваем счетчик просмотров
        article.views += 1;
        await article.save();

        res.json(article);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения статьи' });
    }
});

// ===== СОЗДАНИЕ СТАТЬИ =====
router.post('/', authenticateToken, requireRole(['author', 'admin']), async (req, res) => {
    try {
        const { title, content, category, tags, status = 'draft' } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: 'Заголовок и содержание обязательны' });
        }

        // Проверяем существование категории
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(400).json({ error: 'Категория не найдена' });
            }
        }

        const article = new Article({
            title,
            content,
            author: req.user.id,
            category,
            tags: tags || [],
            status
        });

        await article.save();
        await article.populate('author', 'username avatar');
        await article.populate('category', 'name slug');

        res.status(201).json({
            message: 'Статья создана',
            article
        });
    } catch (error) {
        console.error('Ошибка создания статьи:', error);
        res.status(500).json({ 
            error: 'Ошибка создания статьи',
            details: error.message 
        });
    }
});

// ===== ОБНОВЛЕНИЕ СТАТЬИ =====
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        
        if (!article) {
            return res.status(404).json({ error: 'Статья не найдена' });
        }

        // Проверяем права на редактирование
        if (article.author.toString() !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Нет прав на редактирование статьи' });
        }

        const { title, content, category, tags, status } = req.body;

        if (title) article.title = title;
        if (content) article.content = content;
        if (category) article.category = category;
        if (tags) article.tags = tags;
        if (status) article.status = status;

        article.updatedAt = new Date();
        await article.save();
        await article.populate('author', 'username avatar');
        await article.populate('category', 'name slug');

        res.json({
            message: 'Статья обновлена',
            article
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка обновления статьи' });
    }
});

// ===== УДАЛЕНИЕ СТАТЬИ =====
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        
        if (!article) {
            return res.status(404).json({ error: 'Статья не найдена' });
        }

        // Проверяем права на удаление
        if (article.author.toString() !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Нет прав на удаление статьи' });
        }

        await Article.findByIdAndDelete(req.params.id);

        res.json({ message: 'Статья удалена' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка удаления статьи' });
    }
});

// ===== ЛАЙК СТАТЬИ =====
router.post('/:id/like', authenticateToken, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        
        if (!article) {
            return res.status(404).json({ error: 'Статья не найдена' });
        }

        const userId = req.user.id;
        const likeIndex = article.likes.indexOf(userId);

        if (likeIndex > -1) {
            // Убираем лайк
            article.likes.splice(likeIndex, 1);
        } else {
            // Добавляем лайк
            article.likes.push(userId);
        }

        await article.save();

        res.json({
            message: likeIndex > -1 ? 'Лайк убран' : 'Лайк добавлен',
            likes: article.likes.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка лайка статьи' });
    }
});

// ===== ПОПУЛЯРНЫЕ СТАТЬИ =====
router.get('/popular/trending', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        
        const articles = await Article.find({ status: 'published' })
            .populate('author', 'username avatar')
            .populate('category', 'name slug')
            .sort({ views: -1, likes: -1 })
            .limit(limit);

        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения популярных статей' });
    }
});

// ===== ПОСЛЕДНИЕ СТАТЬИ =====
router.get('/latest/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        
        const articles = await Article.find({ status: 'published' })
            .populate('author', 'username avatar')
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })
            .limit(limit);

        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения последних статей' });
    }
});

module.exports = router;
