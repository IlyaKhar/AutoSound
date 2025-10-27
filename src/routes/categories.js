// ===== МАРШРУТЫ КАТЕГОРИЙ =====

const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Article = require('../models/Article');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ===== ПОЛУЧЕНИЕ ВСЕХ КАТЕГОРИЙ =====
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find()
            .sort({ name: 1 });

        // Добавляем количество статей для каждой категории
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const articleCount = await Article.countDocuments({ 
                    category: category._id, 
                    status: 'published' 
                });
                return {
                    ...category.toObject(),
                    articleCount
                };
            })
        );

        res.json(categoriesWithCount);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения категорий' });
    }
});

// ===== ПОЛУЧЕНИЕ КАТЕГОРИИ ПО ID =====
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({ error: 'Категория не найдена' });
        }

        // Получаем статьи этой категории
        const articles = await Article.find({ 
            category: category._id, 
            status: 'published' 
        })
        .populate('author', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(10);

        res.json({
            category,
            articles
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения категории' });
    }
});

// ===== СОЗДАНИЕ КАТЕГОРИИ =====
router.post('/', authenticateToken, requireRole(['admin', 'moderator']), async (req, res) => {
    try {
        const { name, description, icon, color } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Название категории обязательно' });
        }

        // Проверяем уникальность названия
        const existingCategory = await Category.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') } 
        });
        
        if (existingCategory) {
            return res.status(400).json({ error: 'Категория с таким названием уже существует' });
        }

        // Создаем slug из названия
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');

        const category = new Category({
            name,
            description,
            icon,
            color,
            slug
        });

        await category.save();

        res.status(201).json({
            message: 'Категория создана',
            category
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка создания категории' });
    }
});

// ===== ОБНОВЛЕНИЕ КАТЕГОРИИ =====
router.put('/:id', authenticateToken, requireRole(['admin', 'moderator']), async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({ error: 'Категория не найдена' });
        }

        const { name, description, icon, color } = req.body;

        if (name) {
            // Проверяем уникальность нового названия
            const existingCategory = await Category.findOne({ 
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: category._id }
            });
            
            if (existingCategory) {
                return res.status(400).json({ error: 'Категория с таким названием уже существует' });
            }

            category.name = name;
            // Обновляем slug
            category.slug = name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim('-');
        }

        if (description !== undefined) category.description = description;
        if (icon !== undefined) category.icon = icon;
        if (color !== undefined) category.color = color;

        await category.save();

        res.json({
            message: 'Категория обновлена',
            category
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка обновления категории' });
    }
});

// ===== УДАЛЕНИЕ КАТЕГОРИИ =====
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({ error: 'Категория не найдена' });
        }

        // Проверяем, есть ли статьи в этой категории
        const articleCount = await Article.countDocuments({ category: category._id });
        
        if (articleCount > 0) {
            return res.status(400).json({ 
                error: `Нельзя удалить категорию, в которой есть статьи (${articleCount} статей)` 
            });
        }

        await Category.findByIdAndDelete(req.params.id);

        res.json({ message: 'Категория удалена' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка удаления категории' });
    }
});

// ===== ПОЛУЧЕНИЕ СТАТИСТИКИ КАТЕГОРИЙ =====
router.get('/stats/overview', authenticateToken, requireRole(['admin', 'moderator']), async (req, res) => {
    try {
        const categories = await Category.find();
        
        const stats = await Promise.all(
            categories.map(async (category) => {
                const articleCount = await Article.countDocuments({ 
                    category: category._id, 
                    status: 'published' 
                });
                
                const draftCount = await Article.countDocuments({ 
                    category: category._id, 
                    status: 'draft' 
                });

                return {
                    category: {
                        id: category._id,
                        name: category.name,
                        slug: category.slug
                    },
                    published: articleCount,
                    drafts: draftCount,
                    total: articleCount + draftCount
                };
            })
        );

        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения статистики категорий' });
    }
});

module.exports = router;
