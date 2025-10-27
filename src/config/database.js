// ===== КОНФИГУРАЦИЯ БАЗЫ ДАННЫХ =====

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autosound', {
            serverSelectionTimeoutMS: 30000, // Таймаут подключения 30 секунд
            socketTimeoutMS: 45000, // Таймаут сокета
            connectTimeoutMS: 30000, // Таймаут соединения
            maxPoolSize: 10, // Максимум соединений в пуле
            minPoolSize: 0, // Минимум соединений в пуле (0 для Serverless)
            retryWrites: true,
            w: 'majority'
        });

        console.log(`✅ MongoDB подключена: ${conn.connection.host}`);
        
        // Обработка ошибок подключения
        mongoose.connection.on('error', (err) => {
            console.error('❌ Ошибка MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB отключена');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🔌 MongoDB соединение закрыто');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Ошибка подключения к MongoDB:', error.message);
        console.log('⚠️ Продолжаем работу без базы данных...');
        // Не завершаем процесс, продолжаем работу без БД
    }
};

module.exports = connectDB;
