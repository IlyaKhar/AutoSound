// ===== МОДЕЛЬ КАТЕГОРИИ =====

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    // Основная информация
    name: {
        type: String,
        required: [true, 'Название категории обязательно'],
        trim: true,
        maxlength: [50, 'Название категории не должно превышать 50 символов']
    },
    
    slug: {
        type: String,
        lowercase: true,
        trim: true
    },
    
    description: {
        type: String,
        maxlength: [500, 'Описание не должно превышать 500 символов']
    },
    
    // Визуальное оформление
    icon: {
        type: String,
        default: 'fas fa-folder'
    },
    
    color: {
        type: String,
        default: '#ff6b81',
        match: [/^#[0-9A-F]{6}$/i, 'Некорректный цвет']
    },
    
    image: {
        type: String,
        default: null
    },
    
    // Иерархия
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    
    level: {
        type: Number,
        default: 0
    },
    
    path: {
        type: String,
        default: ''
    },
    
    // Настройки
    isActive: {
        type: Boolean,
        default: true
    },
    
    isFeatured: {
        type: Boolean,
        default: false
    },
    
    sortOrder: {
        type: Number,
        default: 0
    },
    
    // SEO
    metaTitle: {
        type: String,
        maxlength: [60, 'Meta заголовок не должен превышать 60 символов']
    },
    
    metaDescription: {
        type: String,
        maxlength: [160, 'Meta описание не должно превышать 160 символов']
    },
    
    keywords: [String],
    
    // Статистика
    stats: {
        articlesCount: {
            type: Number,
            default: 0
        },
        viewsCount: {
            type: Number,
            default: 0
        },
        lastArticleDate: {
            type: Date,
            default: null
        }
    },
    
    // Настройки отображения
    displaySettings: {
        showInMenu: {
            type: Boolean,
            default: true
        },
        showInSidebar: {
            type: Boolean,
            default: true
        },
        showOnHomepage: {
            type: Boolean,
            default: true
        },
        articlesPerPage: {
            type: Number,
            default: 12,
            min: 1,
            max: 50
        }
    }
    
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ===== ВИРТУАЛЬНЫЕ ПОЛЯ =====

categorySchema.virtual('url').get(function() {
    return `/categories/${this.slug}`;
});

categorySchema.virtual('fullPath').get(function() {
    return this.path || this.name;
});

categorySchema.virtual('hasChildren').get(function() {
    return this.children && this.children.length > 0;
});

// ===== ИНДЕКСЫ =====

categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ isFeatured: 1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ level: 1 });

// ===== МЕТОДЫ =====

// Генерация slug
categorySchema.pre('save', function(next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.generateSlug();
    }
    next();
});

categorySchema.methods.generateSlug = function() {
    return this.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Удаляем специальные символы
        .replace(/\s+/g, '-') // Заменяем пробелы на дефисы
        .replace(/-+/g, '-') // Убираем множественные дефисы
        .trim('-'); // Убираем дефисы в начале и конце
};

// Обновление пути
categorySchema.pre('save', async function(next) {
    if (this.isModified('parent')) {
        if (this.parent) {
            const parentCategory = await this.constructor.findById(this.parent);
            if (parentCategory) {
                this.level = parentCategory.level + 1;
                this.path = parentCategory.path ? `${parentCategory.path} > ${this.name}` : this.name;
            }
        } else {
            this.level = 0;
            this.path = this.name;
        }
    }
    next();
});

// Получение дочерних категорий
categorySchema.methods.getChildren = function() {
    return this.constructor.find({ parent: this._id, isActive: true })
        .sort({ sortOrder: 1, name: 1 });
};

// Получение всех потомков
categorySchema.methods.getAllDescendants = function() {
    return this.constructor.find({ path: { $regex: this.name } })
        .sort({ level: 1, sortOrder: 1, name: 1 });
};

// Получение родительской цепочки
categorySchema.methods.getParentChain = function() {
    if (!this.parent) return [];
    
    return this.constructor.findById(this.parent).then(parent => {
        if (!parent) return [];
        return parent.getParentChain().then(chain => [...chain, parent]);
    });
};

// Обновление статистики
categorySchema.methods.updateStats = async function() {
    const Article = mongoose.model('Article');
    
    const stats = await Article.aggregate([
        { $match: { category: this._id, status: 'published' } },
        {
            $group: {
                _id: null,
                articlesCount: { $sum: 1 },
                totalViews: { $sum: '$stats.views' },
                lastArticleDate: { $max: '$publishedAt' }
            }
        }
    ]);
    
    if (stats.length > 0) {
        this.stats.articlesCount = stats[0].articlesCount;
        this.stats.viewsCount = stats[0].totalViews;
        this.stats.lastArticleDate = stats[0].lastArticleDate;
    } else {
        this.stats.articlesCount = 0;
        this.stats.viewsCount = 0;
        this.stats.lastArticleDate = null;
    }
    
    return this.save();
};

// ===== СТАТИЧЕСКИЕ МЕТОДЫ =====

// Получение дерева категорий
categorySchema.statics.getTree = function() {
    return this.find({ isActive: true })
        .sort({ level: 1, sortOrder: 1, name: 1 })
        .then(categories => {
            return this.buildTree(categories);
        });
};

// Построение дерева категорий
categorySchema.statics.buildTree = function(categories, parentId = null) {
    const tree = [];
    
    categories.forEach(category => {
        if ((!parentId && !category.parent) || (parentId && category.parent && category.parent.toString() === parentId.toString())) {
            const children = this.buildTree(categories, category._id);
            if (children.length > 0) {
                category.children = children;
            }
            tree.push(category);
        }
    });
    
    return tree;
};

// Получение категорий для меню
categorySchema.statics.getMenuCategories = function() {
    return this.find({
        isActive: true,
        'displaySettings.showInMenu': true
    })
    .sort({ sortOrder: 1, name: 1 })
    .select('name slug icon color path level');
};

// Получение категорий для сайдбара
categorySchema.statics.getSidebarCategories = function() {
    return this.find({
        isActive: true,
        'displaySettings.showInSidebar': true
    })
    .sort({ sortOrder: 1, name: 1 })
    .select('name slug icon color stats.articlesCount');
};

// Получение популярных категорий
categorySchema.statics.getPopularCategories = function(limit = 10) {
    return this.find({ isActive: true })
        .sort({ 'stats.articlesCount': -1, 'stats.viewsCount': -1 })
        .limit(limit)
        .select('name slug icon color stats.articlesCount');
};

// Поиск категорий
categorySchema.statics.search = function(query) {
    const searchQuery = {
        isActive: true,
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ]
    };
    
    return this.find(searchQuery)
        .sort({ 'stats.articlesCount': -1, name: 1 });
};

// Получение статистики категорий
categorySchema.statics.getStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: null,
                totalCategories: { $sum: 1 },
                activeCategories: {
                    $sum: { $cond: ['$isActive', 1, 0] }
                },
                featuredCategories: {
                    $sum: { $cond: ['$isFeatured', 1, 0] }
                },
                totalArticles: { $sum: '$stats.articlesCount' },
                totalViews: { $sum: '$stats.viewsCount' }
            }
        }
    ]);
};

// ===== ВАЛИДАЦИЯ =====

categorySchema.pre('validate', function(next) {
    // Автоматическое создание metaTitle если не указан
    if (!this.metaTitle && this.name) {
        this.metaTitle = this.name;
    }
    
    // Автоматическое создание metaDescription если не указан
    if (!this.metaDescription && this.description) {
        this.metaDescription = this.description;
    }
    
    next();
});

// Проверка уникальности slug
categorySchema.pre('save', function(next) {
    if (this.isModified('slug')) {
        this.constructor.findOne({ slug: this.slug, _id: { $ne: this._id } })
            .then(existingCategory => {
                if (existingCategory) {
                    this.slug = this.slug + '-' + Date.now();
                }
                next();
            })
            .catch(next);
    } else {
        next();
    }
});

// Проверка циклических ссылок
categorySchema.pre('save', function(next) {
    if (this.isModified('parent') && this.parent) {
        if (this.parent.toString() === this._id.toString()) {
            return next(new Error('Категория не может быть родителем самой себе'));
        }
        
        // Проверяем, не является ли родительская категория потомком текущей
        this.constructor.findById(this.parent).then(parent => {
            if (parent && parent.path && parent.path.includes(this.name)) {
                return next(new Error('Обнаружена циклическая ссылка в иерархии категорий'));
            }
            next();
        }).catch(next);
    } else {
        next();
    }
});

module.exports = mongoose.model('Category', categorySchema);
