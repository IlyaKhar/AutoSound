# 🚀 Инструкция по деплою проекта

## 📦 Подготовка к деплою

### 1. Инициализация Git репозитория
```bash
git init
git add .
git commit -m "Initial commit: AutoSound CMS"
```

### 2. Создание GitHub репозитория
1. Создай новый репозиторий на GitHub
2. Следуй инструкциям:
```bash
git remote add origin https://github.com/YOUR_USERNAME/autosound-cms.git
git branch -M main
git push -u origin main
```

## 🌐 Deploy на Vercel

### 1. Подготовка файлов
- Создай `vercel.json` в корне проекта
- Все готово для деплоя

### 2. Деплой через Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

### 3. Deploy через веб-интерфейс
1. Зайди на https://vercel.com
2. Import GitHub репозиторий
3. Vercel автоматически определит Node.js
4. Добавь Environment Variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT`

## 🔧 Vercel Configuration

Создай файл `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/app.js"
    },
    {
      "src": "/(.*)",
      "dest": "/app.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## ⚙️ Environment Variables (Vercel)

В настройках проекта добавь:
- `MONGODB_URI` - строка подключения к MongoDB
- `JWT_SECRET` - секретный ключ для JWT
- `JWT_REFRESH_SECRET` - секрет для refresh токенов
- `PORT` - порт (по умолчанию 3000)

## 📝 Checklist перед деплоем

- ✅ Код в репозитории
- ✅ `vercel.json` создан
- ✅ Environment variables настроены
- ✅ MongoDB Atlas подключена
- ✅ Деплой протестирован

## 🎉 После деплоя

Сайт будет доступен по адресу:
`https://your-project-name.vercel.app`

Удачи! 🚀
