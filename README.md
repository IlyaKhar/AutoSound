# 🎵 AutoSound CMS

**Профессиональная система управления контентом для музыкального сайта**

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Запуск в продакшене
npm start
```

Откройте браузер и перейдите на `http://localhost:3000`

## ✨ Особенности

- 🎨 **Красивый интерфейс** с боковым хедером и анимациями
- ⚡ **Плавные переходы** и эффекты загрузки
- 📱 **Адаптивный дизайн** для всех устройств
- 🔐 **Система авторизации** с JWT
- 🎵 **Музыкальная тематика** - инструменты и автозвук
- 🏗️ **Чистая архитектура** для легкого развития

## 🛠️ Технологии

- **Backend**: Node.js, Express.js
- **База данных**: MongoDB, Mongoose
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Стили**: CSS Grid, Flexbox, анимации
- **Безопасность**: JWT, bcrypt, helmet, CORS

## 📁 Архитектура

```
autosound-cms/
├── app.js                          # Главный файл приложения
├── config.env                      # Переменные окружения
├── package.json                    # Зависимости
├── README.md                       # Документация
├── README-ARCHITECTURE.md          # Архитектура проекта
│
├── src/                            # Исходный код
│   ├── config/                     # Конфигурация
│   │   ├── app.js                  # Настройки приложения
│   │   └── database.js             # Настройки базы данных
│   │
│   ├── controllers/                # Контроллеры (готово к расширению)
│   │
│   ├── middleware/                 # Middleware
│   │   ├── auth.js                 # Аутентификация
│   │   └── errorHandler.js         # Обработка ошибок
│   │
│   ├── models/                     # Модели данных
│   │   ├── User.js                 # Модель пользователя
│   │   ├── Article.js              # Модель статьи
│   │   ├── Category.js             # Модель категории
│   │   └── Comment.js              # Модель комментария
│   │
│   ├── routes/                     # Маршруты API
│   │   ├── auth.js                 # Авторизация
│   │   ├── users.js                # Пользователи
│   │   ├── articles.js             # Статьи
│   │   ├── categories.js           # Категории
│   │   ├── comments.js             # Комментарии
│   │   └── admin.js                # Админ панель
│   │
│   ├── public/                     # Статические файлы
│   │   ├── css/                    # Стили (12 файлов)
│   │   ├── js/                     # JavaScript (13 файлов)
│   │   └── images/                 # Изображения (5 файлов)
│   │
│   └── views/                      # HTML шаблоны
│       └── pages/                  # Страницы (17 файлов)
│
├── uploads/                        # Загруженные файлы
│   ├── avatars/                    # Аватары пользователей
│   └── images/                     # Изображения статей
│
└── logs/                           # Логи (создается автоматически)
```

## 🔧 Конфигурация

Создайте файл `config.env`:

```env
# Сервер
PORT=3000
NODE_ENV=development

# База данных
MONGODB_URI=mongodb://localhost:27017/autosound

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here

# Файлы
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Безопасность
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# CORS
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000
```

## 📋 API Endpoints

### Основные
- `GET /` - Главная страница
- `GET /api/status` - Статус сервера

### Авторизация
- `POST /api/auth/login` - Вход
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/logout` - Выход

### Контент
- `GET /api/articles` - Получить статьи
- `POST /api/articles` - Создать статью
- `GET /api/articles/:id` - Получить статью
- `PUT /api/articles/:id` - Обновить статью
- `DELETE /api/articles/:id` - Удалить статью

### Категории
- `GET /api/categories` - Получить категории
- `POST /api/categories` - Создать категорию
- `GET /api/categories/:id` - Получить категорию

### Комментарии
- `GET /api/comments` - Получить комментарии
- `POST /api/comments` - Создать комментарий
- `DELETE /api/comments/:id` - Удалить комментарий

## 🎯 Страницы

- `/` - Главная страница
- `/main` - Основная страница
- `/admin` - Админ панель
- `/categories` - Категории
- `/news` - Новости
- `/rating` - Рейтинги
- `/login` - Вход
- `/register` - Регистрация
- `/profile` - Профиль
- `/settings` - Настройки
- `/about` - О нас
- `/contacts` - Контакты
- `/terms` - Условия
- `/policy` - Политика
- `/autozvuk` - Автозвук

## 🚀 Разработка

### Добавление новой страницы
1. Создать HTML файл в `src/views/pages/`
2. Добавить маршрут в `app.js`
3. Создать стили в `src/public/css/`
4. Добавить JavaScript в `src/public/js/`

### Добавление нового API endpoint
1. Создать/обновить контроллер в `src/controllers/`
2. Добавить маршрут в `src/routes/`
3. Обновить модель в `src/models/` (если нужно)

## 📝 TODO

- [ ] Добавить контроллеры
- [ ] Создать систему шаблонов
- [ ] Добавить валидацию данных
- [ ] Настроить логирование
- [ ] Добавить тесты
- [ ] Настроить CI/CD
- [ ] Добавить документацию API

## 📄 Лицензия

MIT License

---

**Создано с ❤️ для музыкального сообщества**