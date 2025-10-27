# 🏗️ Архитектура проекта AutoSound CMS

## 📁 Структура проекта

```
autosound-cms/
├── app.js                          # Главный файл приложения
├── config.env                      # Переменные окружения
├── package.json                    # Зависимости и скрипты
├── README.md                       # Основная документация
├── README-ARCHITECTURE.md          # Документация архитектуры
│
├── src/                            # Исходный код
│   ├── config/                     # Конфигурация
│   │   ├── app.js                  # Настройки приложения
│   │   └── database.js             # Настройки базы данных
│   │
│   ├── controllers/                # Контроллеры (пока пусто)
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
│   ├── utils/                      # Утилиты (пока пусто)
│   │
│   ├── public/                     # Статические файлы
│   │   ├── css/                    # Стили
│   │   │   ├── styles.css          # Основные стили
│   │   │   ├── main-styles.css     # Стили главной страницы
│   │   │   ├── sidebar-styles.css  # Стили бокового меню
│   │   │   ├── loading-animation.css # Анимация загрузки
│   │   │   ├── auth-modals.css     # Модальные окна
│   │   │   ├── footer-styles.css   # Стили футера
│   │   │   └── ...                 # Другие стили
│   │   ├── js/                     # JavaScript
│   │   │   ├── main.js             # Основной скрипт
│   │   │   ├── sidebar.js          # Боковое меню
│   │   │   ├── auth-system.js      # Система авторизации
│   │   │   ├── navigation-simple.js # Навигация
│   │   │   └── ...                 # Другие скрипты
│   │   └── images/                 # Изображения
│   │       ├── avatar-default.jpg  # Аватар по умолчанию
│   │       └── ...                 # Другие изображения
│   │
│   └── views/                      # HTML шаблоны
│       ├── layouts/                # Макеты (пока пусто)
│       ├── components/             # Компоненты (пока пусто)
│       └── pages/                  # Страницы
│           ├── index.html          # Главная страница
│           ├── main.html           # Основная страница
│           ├── admin.html          # Админ панель
│           ├── categories.html     # Категории
│           ├── news.html           # Новости
│           ├── rating.html         # Рейтинги
│           ├── login.html          # Вход
│           ├── register.html       # Регистрация
│           ├── profile.html        # Профиль
│           ├── settings.html       # Настройки
│           ├── about.html          # О нас
│           ├── contacts.html       # Контакты
│           ├── terms.html          # Условия
│           ├── policy.html         # Политика
│           └── autozvuk.html       # Автозвук
│
├── uploads/                        # Загруженные файлы
│   ├── avatars/                    # Аватары пользователей
│   └── images/                     # Изображения статей
│
└── logs/                           # Логи (создается автоматически)
```

## 🔧 Конфигурация

### Переменные окружения (config.env)
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

## 🚀 Запуск

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Запуск в продакшене
npm start
```

## 📋 Основные компоненты

### 1. **app.js** - Главный файл
- Инициализация Express приложения
- Подключение middleware
- Настройка маршрутов
- Запуск сервера

### 2. **src/config/** - Конфигурация
- `app.js` - Настройки приложения
- `database.js` - Подключение к MongoDB

### 3. **src/models/** - Модели данных
- Mongoose схемы для MongoDB
- Валидация данных
- Методы моделей

### 4. **src/routes/** - API маршруты
- RESTful API endpoints
- Обработка HTTP запросов
- Интеграция с контроллерами

### 5. **src/middleware/** - Middleware
- Аутентификация и авторизация
- Обработка ошибок
- Валидация данных

### 6. **src/public/** - Статические файлы
- CSS стили
- JavaScript скрипты
- Изображения и медиа

### 7. **src/views/** - HTML шаблоны
- Страницы сайта
- Компоненты (в будущем)
- Макеты (в будущем)

## 🔄 Принципы архитектуры

1. **Разделение ответственности** - каждый модуль отвечает за свою область
2. **Модульность** - легко добавлять новые функции
3. **Масштабируемость** - структура поддерживает рост проекта
4. **Читаемость** - понятная организация файлов
5. **Переиспользование** - общие компоненты вынесены отдельно

## 🛠️ Разработка

### Добавление новой страницы
1. Создать HTML файл в `src/views/pages/`
2. Добавить маршрут в `app.js`
3. Создать стили в `src/public/css/`
4. Добавить JavaScript в `src/public/js/`

### Добавление нового API endpoint
1. Создать/обновить контроллер в `src/controllers/`
2. Добавить маршрут в `src/routes/`
3. Обновить модель в `src/models/` (если нужно)

### Добавление нового middleware
1. Создать файл в `src/middleware/`
2. Подключить в `app.js`
3. Использовать в нужных маршрутах

## 📝 TODO

- [ ] Добавить контроллеры
- [ ] Создать систему шаблонов
- [ ] Добавить валидацию данных
- [ ] Настроить логирование
- [ ] Добавить тесты
- [ ] Настроить CI/CD
- [ ] Добавить документацию API
