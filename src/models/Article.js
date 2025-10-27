// ===== МОДЕЛЬ СТАТЬИ =====

const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    // Основная информация
    title: {
        type: String,
        required: [true, 'Заголовок обязателен'],
        trim: true,
        maxlength: [200, 'Заголовок не должен превышать 200 символов']
    },
    
    slug: {
        type: String,
        lowercase: true,
        trim: true
    },
    
    content: {
        type: String,
        required: [true, 'Содержание обязательно'],
        minlength: [100, 'Содержание должно содержать минимум 100 символов']
    },
    
    excerpt: {
        type: String,
        maxlength: [500, 'Краткое описание не должно превышать 500 символов']
    },
    
    // Медиа
    featuredImage: {
        type: String,
        default: null
    },
    
    images: [{
        url: String,
        alt: String,
        caption: String
    }],
    
    videos: [{
        url: String,
        title: String,
        duration: Number,
        platform: {
            type: String,
            enum: ['youtube', 'vimeo', 'other'],
            default: 'youtube'
        }
    }],
    
    // Автор и категория
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Автор обязателен']
    },
    
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Категория обязательна']
    },
    
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    
    // Статус и публикация
    status: {
        type: String,
        enum: ['draft', 'pending', 'published', 'archived'],
        default: 'draft'
    },
    
    publishedAt: {
        type: Date,
        default: null
    },
    
    scheduledAt: {
        type: Date,
        default: null
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
        views: {
            type: Number,
            default: 0
        },
        likes: {
            type: Number,
            default: 0
        },
        comments: {
            type: Number,
            default: 0
        },
        shares: {
            type: Number,
            default: 0
        }
    },
    
    // Рейтинг
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    
    // Модерация
    moderation: {
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        moderator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        moderatedAt: Date,
        notes: String
    },
    
    // Связанные статьи
    relatedArticles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    }],
    
    // Настройки
    allowComments: {
        type: Boolean,
        default: true
    },
    
    isFeatured: {
        type: Boolean,
        default: false
    },
    
    isPinned: {
        type: Boolean,
        default: false
    },
    
    // Версионирование
    version: {
        type: Number,
        default: 1
    },
    
    previousVersions: [{
        content: String,
        title: String,
        modifiedAt: Date,
        modifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
    
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ===== ВИРТУАЛЬНЫЕ ПОЛЯ =====

articleSchema.virtual('isPublished').get(function() {
    return this.status === 'published' && this.publishedAt && this.publishedAt <= new Date();
});

articleSchema.virtual('readingTime').get(function() {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
});

articleSchema.virtual('url').get(function() {
    return `/articles/${this.slug}`;
});

// ===== ИНДЕКСЫ =====

articleSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
articleSchema.index({ author: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ status: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ createdAt: -1 });
articleSchema.index({ 'stats.views': -1 });
articleSchema.index({ 'stats.likes': -1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ isFeatured: 1 });
articleSchema.index({ isPinned: 1 });

// ===== МЕТОДЫ =====

// Генерация slug
articleSchema.pre('save', function(next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.generateSlug();
    }
    next();
});

articleSchema.methods.generateSlug = function() {
    return this.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Удаляем специальные символы
        .replace(/\s+/g, '-') // Заменяем пробелы на дефисы
        .replace(/-+/g, '-') // Убираем множественные дефисы
        .trim('-'); // Убираем дефисы в начале и конце
};

// Публикация статьи
articleSchema.methods.publish = function() {
    this.status = 'published';
    this.publishedAt = new Date();
    return this.save();
};

// Архивирование статьи
articleSchema.methods.archive = function() {
    this.status = 'archived';
    return this.save();
};

// Обновление статистики
articleSchema.methods.incrementViews = function() {
    this.stats.views += 1;
    return this.save();
};

articleSchema.methods.incrementLikes = function() {
    this.stats.likes += 1;
    return this.save();
};

articleSchema.methods.decrementLikes = function() {
    this.stats.likes = Math.max(0, this.stats.likes - 1);
    return this.save();
};

// Обновление рейтинга
articleSchema.methods.updateRating = function(newRating) {
    const totalRating = this.rating.average * this.rating.count + newRating;
    this.rating.count += 1;
    this.rating.average = totalRating / this.rating.count;
    return this.save();
};

// Проверка прав редактирования
articleSchema.methods.canEdit = function(userId, userRole) {
    if (userRole === 'admin' || userRole === 'moderator') return true;
    return this.author.toString() === userId.toString();
};

// Проверка прав удаления
articleSchema.methods.canDelete = function(userId, userRole) {
    if (userRole === 'admin') return true;
    if (userRole === 'moderator') return true;
    return this.author.toString() === userId.toString();
};

// ===== СТАТИЧЕСКИЕ МЕТОДЫ =====

// Поиск опубликованных статей
articleSchema.statics.findPublished = function() {
    return this.find({
        status: 'published',
        publishedAt: { $lte: new Date() }
    }).populate('author', 'username firstName lastName avatar')
      .populate('category', 'name slug');
};

// Поиск по категории
articleSchema.statics.findByCategory = function(categoryId) {
    return this.findPublished().where('category', categoryId);
};

// Поиск по автору
articleSchema.statics.findByAuthor = function(authorId) {
    return this.findPublished().where('author', authorId);
};

// Поиск популярных статей
articleSchema.statics.findPopular = function(limit = 10) {
    return this.findPublished()
        .sort({ 'stats.views': -1, 'stats.likes': -1 })
        .limit(limit);
};

// Поиск похожих статей
articleSchema.statics.findSimilar = function(articleId, limit = 5) {
    return this.findById(articleId).then(article => {
        if (!article) return [];
        
        return this.find({
            _id: { $ne: articleId },
            category: article.category,
            status: 'published',
            publishedAt: { $lte: new Date() }
        })
        .sort({ 'stats.views': -1 })
        .limit(limit)
        .populate('author', 'username firstName lastName avatar')
        .populate('category', 'name slug');
    });
};

// Получение статистики статей
articleSchema.statics.getStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalViews: { $sum: '$stats.views' },
                totalLikes: { $sum: '$stats.likes' }
            }
        }
    ]);
};

// Поиск с фильтрацией
articleSchema.statics.search = function(query, filters = {}) {
    const searchQuery = {
        $and: [
            { status: 'published' },
            { publishedAt: { $lte: new Date() } }
        ]
    };
    
    // Текстовый поиск
    if (query) {
        searchQuery.$and.push({
            $text: { $search: query }
        });
    }
    
    // Фильтры
    if (filters.category) {
        searchQuery.$and.push({ category: filters.category });
    }
    
    if (filters.author) {
        searchQuery.$and.push({ author: filters.author });
    }
    
    if (filters.tags && filters.tags.length > 0) {
        searchQuery.$and.push({ tags: { $in: filters.tags } });
    }
    
    if (filters.dateFrom || filters.dateTo) {
        const dateFilter = {};
        if (filters.dateFrom) dateFilter.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) dateFilter.$lte = new Date(filters.dateTo);
        searchQuery.$and.push({ publishedAt: dateFilter });
    }
    
    return this.find(searchQuery)
        .populate('author', 'username firstName lastName avatar')
        .populate('category', 'name slug')
        .sort({ publishedAt: -1 });
};

// ===== ВАЛИДАЦИЯ =====

articleSchema.pre('validate', function(next) {
    // Автоматическое создание excerpt если не указан
    if (!this.excerpt && this.content) {
        this.excerpt = this.content.substring(0, 200).replace(/<[^>]*>/g, '') + '...';
    }
    
    // Автоматическое создание metaTitle если не указан
    if (!this.metaTitle && this.title) {
        this.metaTitle = this.title;
    }
    
    // Автоматическое создание metaDescription если не указан
    if (!this.metaDescription && this.excerpt) {
        this.metaDescription = this.excerpt.substring(0, 160);
    }
    
    next();
});

// Проверка уникальности slug
articleSchema.pre('save', function(next) {
    if (this.isModified('slug')) {
        this.constructor.findOne({ slug: this.slug, _id: { $ne: this._id } })
            .then(existingArticle => {
                if (existingArticle) {
                    this.slug = this.slug + '-' + Date.now();
                }
                next();
            })
            .catch(next);
    } else {
        next();
    }
});

module.exports = mongoose.model('Article', articleSchema);
