// ===== МОДЕЛЬ ПОЛЬЗОВАТЕЛЯ =====

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Основная информация
    username: {
        type: String,
        required: [true, 'Имя пользователя обязательно'],
        trim: true,
        minlength: [3, 'Имя пользователя должно содержать минимум 3 символа'],
        maxlength: [30, 'Имя пользователя не должно превышать 30 символов']
    },
    
    email: {
        type: String,
        required: [true, 'Email обязателен'],
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Некорректный email']
    },
    
    password: {
        type: String,
        required: [true, 'Пароль обязателен'],
        minlength: [6, 'Пароль должен содержать минимум 6 символов'],
        select: false // Не возвращаем пароль по умолчанию
    },
    
    // Профиль
    firstName: {
        type: String,
        trim: true,
        maxlength: [50, 'Имя не должно превышать 50 символов']
    },
    
    lastName: {
        type: String,
        trim: true,
        maxlength: [50, 'Фамилия не должна превышать 50 символов']
    },
    
    avatar: {
        type: String,
        default: null
    },
    
    bio: {
        type: String,
        maxlength: [500, 'Биография не должна превышать 500 символов']
    },
    
    location: {
        type: String,
        trim: true,
        maxlength: [100, 'Местоположение не должно превышать 100 символов']
    },
    
    // Роль и права
    role: {
        type: String,
        enum: ['user', 'author', 'moderator', 'admin'],
        default: 'user'
    },
    
    isActive: {
        type: Boolean,
        default: true
    },
    
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    
    // Социальные сети
    socialLinks: {
        youtube: String,
        instagram: String,
        telegram: String,
        vk: String,
        twitter: String
    },
    
    // Статистика
    stats: {
        articlesCount: {
            type: Number,
            default: 0
        },
        commentsCount: {
            type: Number,
            default: 0
        },
        likesReceived: {
            type: Number,
            default: 0
        },
        followersCount: {
            type: Number,
            default: 0
        },
        followingCount: {
            type: Number,
            default: 0
        }
    },
    
    // Настройки
    preferences: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        pushNotifications: {
            type: Boolean,
            default: true
        },
        newsletter: {
            type: Boolean,
            default: false
        },
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'auto'
        }
    },
    
    // Безопасность
    lastLogin: {
        type: Date,
        default: null
    },
    
    loginAttempts: {
        type: Number,
        default: 0
    },
    
    lockUntil: {
        type: Date,
        default: null
    },
    
    // Токены
    refreshTokens: [{
        token: String,
        createdAt: {
            type: Date,
            default: Date.now,
            expires: '7d'
        }
    }],
    
    // Верификация email
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    
    // Сброс пароля
    passwordResetToken: String,
    passwordResetExpires: Date
    
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ===== ВИРТУАЛЬНЫЕ ПОЛЯ =====

userSchema.virtual('fullName').get(function() {
    if (this.firstName && this.lastName) {
        return `${this.firstName} ${this.lastName}`;
    }
    return this.username;
});

userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ===== ИНДЕКСЫ =====

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// ===== МЕТОДЫ =====

// Хеширование пароля
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Проверка пароля
userSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

// Увеличение попыток входа
userSchema.methods.incLoginAttempts = function() {
    // Если у нас есть предыдущая блокировка и она истекла
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Блокировка после 5 неудачных попыток на 2 часа
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 часа
    }
    
    return this.updateOne(updates);
};

// Сброс попыток входа
userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 }
    });
};

// Обновление последнего входа
userSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save();
};

// Проверка прав
userSchema.methods.hasRole = function(role) {
    const roles = ['user', 'author', 'moderator', 'admin'];
    const userRoleIndex = roles.indexOf(this.role);
    const requiredRoleIndex = roles.indexOf(role);
    return userRoleIndex >= requiredRoleIndex;
};

// Проверка возможности публикации
userSchema.methods.canPublish = function() {
    return ['author', 'moderator', 'admin'].includes(this.role);
};

// Проверка прав модератора
userSchema.methods.canModerate = function() {
    return ['moderator', 'admin'].includes(this.role);
};

// Проверка прав администратора
userSchema.methods.isAdmin = function() {
    return this.role === 'admin';
};

// ===== СТАТИЧЕСКИЕ МЕТОДЫ =====

// Поиск по email или username
userSchema.statics.findByEmailOrUsername = function(identifier) {
    return this.findOne({
        $or: [
            { email: identifier },
            { username: identifier }
        ]
    });
};

// Получение статистики пользователей
userSchema.statics.getUserStats = function() {
    return this.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 },
                activeCount: {
                    $sum: { $cond: ['$isActive', 1, 0] }
                }
            }
        }
    ]);
};

// ===== МЕТОДЫ JSON =====

userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.refreshTokens;
    delete user.emailVerificationToken;
    delete user.passwordResetToken;
    delete user.loginAttempts;
    delete user.lockUntil;
    return user;
};

// ===== ВАЛИДАЦИЯ =====

userSchema.pre('validate', function(next) {
    // Проверка уникальности email и username
    if (this.isModified('email') || this.isModified('username')) {
        this.constructor.findOne({
            $and: [
                { _id: { $ne: this._id } },
                { $or: [{ email: this.email }, { username: this.username }] }
            ]
        }).then(user => {
            if (user) {
                if (user.email === this.email) {
                    this.invalidate('email', 'Email уже используется');
                }
                if (user.username === this.username) {
                    this.invalidate('username', 'Имя пользователя уже используется');
                }
            }
            next();
        }).catch(next);
    } else {
        next();
    }
});

module.exports = mongoose.model('User', userSchema);
