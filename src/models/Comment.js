// ===== МОДЕЛЬ КОММЕНТАРИЯ =====

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    // Основная информация
    content: {
        type: String,
        required: [true, 'Содержание комментария обязательно'],
        trim: true,
        maxlength: [1000, 'Комментарий не должен превышать 1000 символов']
    },
    
    // Связи
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: [true, 'Статья обязательна']
    },
    
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Автор обязателен']
    },
    
    // Иерархия комментариев
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    
    level: {
        type: Number,
        default: 0
    },
    
    // Статус модерации
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'spam'],
        default: 'pending'
    },
    
    // Модерация
    moderation: {
        moderator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        moderatedAt: Date,
        reason: {
            type: String,
            enum: ['spam', 'inappropriate', 'off-topic', 'duplicate', 'other']
        },
        notes: String
    },
    
    // Статистика
    stats: {
        likes: {
            type: Number,
            default: 0
        },
        dislikes: {
            type: Number,
            default: 0
        },
        replies: {
            type: Number,
            default: 0
        }
    },
    
    // Настройки
    isEdited: {
        type: Boolean,
        default: false
    },
    
    editedAt: {
        type: Date,
        default: null
    },
    
    // История редактирования
    editHistory: [{
        content: String,
        editedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // IP и User Agent для модерации
    ipAddress: String,
    userAgent: String,
    
    // Уведомления
    notifications: {
        emailOnReply: {
            type: Boolean,
            default: true
        },
        emailOnLike: {
            type: Boolean,
            default: false
        }
    }
    
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ===== ВИРТУАЛЬНЫЕ ПОЛЯ =====

commentSchema.virtual('isApproved').get(function() {
    return this.status === 'approved';
});

commentSchema.virtual('isPending').get(function() {
    return this.status === 'pending';
});

commentSchema.virtual('isRejected').get(function() {
    return this.status === 'rejected';
});

commentSchema.virtual('isSpam').get(function() {
    return this.status === 'spam';
});

commentSchema.virtual('isReply').get(function() {
    return !!this.parent;
});

commentSchema.virtual('netLikes').get(function() {
    return this.stats.likes - this.stats.dislikes;
});

// ===== ИНДЕКСЫ =====

commentSchema.index({ article: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parent: 1 });
commentSchema.index({ status: 1 });
commentSchema.index({ 'stats.likes': -1 });
commentSchema.index({ createdAt: -1 });

// ===== МЕТОДЫ =====

// Одобрение комментария
commentSchema.methods.approve = function(moderatorId) {
    this.status = 'approved';
    this.moderation.moderator = moderatorId;
    this.moderation.moderatedAt = new Date();
    return this.save();
};

// Отклонение комментария
commentSchema.methods.reject = function(moderatorId, reason, notes) {
    this.status = 'rejected';
    this.moderation.moderator = moderatorId;
    this.moderation.moderatedAt = new Date();
    this.moderation.reason = reason;
    this.moderation.notes = notes;
    return this.save();
};

// Пометить как спам
commentSchema.methods.markAsSpam = function(moderatorId, notes) {
    this.status = 'spam';
    this.moderation.moderator = moderatorId;
    this.moderation.moderatedAt = new Date();
    this.moderation.reason = 'spam';
    this.moderation.notes = notes;
    return this.save();
};

// Редактирование комментария
commentSchema.methods.edit = function(newContent, userId) {
    // Сохраняем предыдущую версию
    this.editHistory.push({
        content: this.content,
        editedAt: new Date()
    });
    
    this.content = newContent;
    this.isEdited = true;
    this.editedAt = new Date();
    
    return this.save();
};

// Лайк комментария
commentSchema.methods.like = function() {
    this.stats.likes += 1;
    return this.save();
};

// Дизлайк комментария
commentSchema.methods.dislike = function() {
    this.stats.dislikes += 1;
    return this.save();
};

// Убрать лайк
commentSchema.methods.unlike = function() {
    this.stats.likes = Math.max(0, this.stats.likes - 1);
    return this.save();
};

// Убрать дизлайк
commentSchema.methods.undislike = function() {
    this.stats.dislikes = Math.max(0, this.stats.dislikes - 1);
    return this.save();
};

// Проверка прав редактирования
commentSchema.methods.canEdit = function(userId, userRole) {
    if (userRole === 'admin' || userRole === 'moderator') return true;
    return this.author.toString() === userId.toString();
};

// Проверка прав удаления
commentSchema.methods.canDelete = function(userId, userRole) {
    if (userRole === 'admin') return true;
    if (userRole === 'moderator') return true;
    return this.author.toString() === userId.toString();
};

// ===== СТАТИЧЕСКИЕ МЕТОДЫ =====

// Получение комментариев к статье
commentSchema.statics.findByArticle = function(articleId, options = {}) {
    const query = {
        article: articleId,
        status: 'approved'
    };
    
    if (options.includeReplies !== false) {
        // Включаем все комментарии
    } else {
        // Только корневые комментарии
        query.parent = null;
    }
    
    return this.find(query)
        .populate('author', 'username firstName lastName avatar')
        .populate('moderation.moderator', 'username')
        .sort({ createdAt: 1 });
};

// Получение ответов к комментарию
commentSchema.statics.findReplies = function(parentId) {
    return this.find({
        parent: parentId,
        status: 'approved'
    })
    .populate('author', 'username firstName lastName avatar')
    .sort({ createdAt: 1 });
};

// Получение комментариев пользователя
commentSchema.statics.findByUser = function(userId, options = {}) {
    const query = { author: userId };
    
    if (options.status) {
        query.status = options.status;
    }
    
    return this.find(query)
        .populate('article', 'title slug')
        .sort({ createdAt: -1 })
        .limit(options.limit || 20);
};

// Получение комментариев на модерации
commentSchema.statics.findPending = function() {
    return this.find({ status: 'pending' })
        .populate('author', 'username firstName lastName avatar')
        .populate('article', 'title slug')
        .sort({ createdAt: -1 });
};

// Получение спам-комментариев
commentSchema.statics.findSpam = function() {
    return this.find({ status: 'spam' })
        .populate('author', 'username firstName lastName avatar')
        .populate('article', 'title slug')
        .sort({ createdAt: -1 });
};

// Массовое одобрение
commentSchema.statics.bulkApprove = function(commentIds, moderatorId) {
    return this.updateMany(
        { _id: { $in: commentIds } },
        {
            status: 'approved',
            'moderation.moderator': moderatorId,
            'moderation.moderatedAt': new Date()
        }
    );
};

// Массовое отклонение
commentSchema.statics.bulkReject = function(commentIds, moderatorId, reason) {
    return this.updateMany(
        { _id: { $in: commentIds } },
        {
            status: 'rejected',
            'moderation.moderator': moderatorId,
            'moderation.moderatedAt': new Date(),
            'moderation.reason': reason
        }
    );
};

// Получение статистики комментариев
commentSchema.statics.getStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalLikes: { $sum: '$stats.likes' },
                totalDislikes: { $sum: '$stats.dislikes' }
            }
        }
    ]);
};

// Поиск комментариев
commentSchema.statics.search = function(query, filters = {}) {
    const searchQuery = {};
    
    // Текстовый поиск
    if (query) {
        searchQuery.content = { $regex: query, $options: 'i' };
    }
    
    // Фильтры
    if (filters.status) {
        searchQuery.status = filters.status;
    }
    
    if (filters.article) {
        searchQuery.article = filters.article;
    }
    
    if (filters.author) {
        searchQuery.author = filters.author;
    }
    
    if (filters.dateFrom || filters.dateTo) {
        const dateFilter = {};
        if (filters.dateFrom) dateFilter.$gte = new Date(filters.dateFrom);
        if (filters.dateTo) dateFilter.$lte = new Date(filters.dateTo);
        searchQuery.createdAt = dateFilter;
    }
    
    return this.find(searchQuery)
        .populate('author', 'username firstName lastName avatar')
        .populate('article', 'title slug')
        .sort({ createdAt: -1 });
};

// ===== ВАЛИДАЦИЯ =====

commentSchema.pre('save', function(next) {
    // Обновляем счетчик ответов у родительского комментария
    if (this.isNew && this.parent) {
        this.constructor.findByIdAndUpdate(
            this.parent,
            { $inc: { 'stats.replies': 1 } }
        ).exec();
    }
    
    next();
});

commentSchema.pre('remove', function(next) {
    // Уменьшаем счетчик ответов у родительского комментария
    if (this.parent) {
        this.constructor.findByIdAndUpdate(
            this.parent,
            { $inc: { 'stats.replies': -1 } }
        ).exec();
    }
    
    next();
});

// Проверка на спам (базовая)
commentSchema.pre('save', function(next) {
    if (this.isNew) {
        // Простая проверка на спам по ключевым словам
        const spamKeywords = ['купить', 'скидка', 'бесплатно', 'заработок', 'кредит'];
        const content = this.content.toLowerCase();
        
        const spamScore = spamKeywords.reduce((score, keyword) => {
            return score + (content.includes(keyword) ? 1 : 0);
        }, 0);
        
        if (spamScore >= 2) {
            this.status = 'spam';
        }
    }
    
    next();
});

module.exports = mongoose.model('Comment', commentSchema);
