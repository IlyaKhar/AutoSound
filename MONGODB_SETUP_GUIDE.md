# 🚀 Гайд: Подключение MongoDB Atlas к AutoSound

## Шаг 1: Регистрация и создание кластера

1. Зайди на https://www.mongodb.com/cloud/atlas
2. Нажми **"Try Free"** или **"Sign Up"**
3. Заполни регистрационную форму
4. Выбери план **"Free"** (M0)
5. Выбери cloud provider: **AWS**, регион: **Frankfurt** (или ближайший к тебе)
6. Нажми **"Create Cluster"**

⏱️ **Жди 3-5 минут** пока кластер создается

---

## Шаг 2: Настройка доступа к БД

### 2.1 Создание пользователя БД

1. В левом меню нажми **"Database Access"**
2. Нажми кнопку **"+ ADD NEW DATABASE USER"**
3. Заполни форму:
   - **Authentication Method**: `Password`
   - **Username**: `autosound_user`
   - **Password**: Придумай надежный пароль (запиши его!)
   - **Database User Privileges**: Выбери `Atlas Admin`
4. Нажми **"Add User"**

### 2.2 Настройка сетевого доступа

1. В левом меню нажми **"Network Access"**
2. Нажми кнопку **"+ ADD IP ADDRESS"**
3. Нажми кнопку **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Это разрешает подключение с любого IP
4. Нажми **"Confirm"**

---

## Шаг 3: Получение Connection String

1. Вернись в раздел **"Database"** (левое меню)
2. Нажми кнопку **"Connect"** напротив твоего кластера
3. Выбери **"Connect your application"**
4. Выбери **Driver**: `Node.js` и **Version**: `Latest`
5. Скопируй Connection String:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

## Шаг 4: Настройка проекта

1. Открой файл `config.env` в корне проекта
2. Найди строку:
   ```env
   MONGODB_URI=mongodb://localhost:27017/autosound
   ```
3. Замени её на (используй Connection String из шага 3):
   ```env
   MONGODB_URI=mongodb+srv://autosound_user:ТВОЙ_ПАРОЛЬ@cluster0.xxxxx.mongodb.net/autosound?retryWrites=true&w=majority
   ```

⚠️ **ВАЖНО**: 
- Замени `ТВОЙ_ПАРОЛЬ` на пароль, который ты создал в шаге 2.1
- Не забудь добавить название базы данных `/autosound` перед `?`

Пример:
```env
MONGODB_URI=mongodb+srv://autosound_user:MySecret123@cluster0.abc123.mongodb.net/autosound?retryWrites=true&w=majority
```

---

## Шаг 5: Перезапуск сервера

1. Останови сервер (нажми `Ctrl+C` в терминале)
2. Запусти снова:
   ```bash
   npm start
   ```
3. Должно появиться сообщение:
   ```
   ✅ MongoDB подключена: cluster0.xxxxx.mongodb.net
   ```

---

## Шаг 6: Проверка подключения

1. Зайди на сайт: http://localhost:3000
2. Нажми **"Войти"**
3. Переключись на вкладку **"Регистрация"**
4. Заполни форму и зарегистрируйся
5. Если все работает - готово! 🎉

---

## ❌ Решение проблем

### Ошибка: "Failed to connect to MongoDB"
- Проверь правильность пароля в `config.env`
- Убедись, что IP добавлен в "Network Access"
- Проверь интернет-соединение

### Ошибка: "Authentication failed"
- Проверь username в Connection String
- Убедись, что пароль не содержит спецсимволов (если содержит - закодируй их в URL)

### База данных не создается автоматически
- Это нормально! MongoDB создаст базу при первом обращении
- После регистрации пользователя проверь в Atlas раздел "Browse Collections"

---

## 📝 Полезные ссылки

- Atlas Dashboard: https://cloud.mongodb.com/
- Документация: https://docs.atlas.mongodb.com/
- Support: https://www.mongodb.com/docs/atlas/support/

---

**Готово! Теперь у тебя есть облачная MongoDB для проекта! 🚀**
