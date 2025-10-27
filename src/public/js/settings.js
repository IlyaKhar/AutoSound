// Функция загрузки компонентов
async function loadComponents() {
    try {
        // Загружаем sidebar
        const sidebarResponse = await fetch('/components/header.html');
        const sidebarHTML = await sidebarResponse.text();
        document.getElementById('sidebar-container').innerHTML = sidebarHTML;
        
        // Загружаем footer
        const footerResponse = await fetch('/components/footer.html');
        const footerHTML = await footerResponse.text();
        document.getElementById('footer-container').innerHTML = footerHTML;
        
        // Загружаем auth modal
        const authModalHTML = `
            <div class="modal-overlay" id="authModal" style="display: none;">
                <!-- Модальное окно будет добавлено через main.js -->
            </div>
        `;
        document.getElementById('auth-modal-container').innerHTML = authModalHTML;
        
        // Инициализируем sidebar
        if (typeof setupSidebar === 'function') {
            setupSidebar();
        }
    } catch (error) {
        console.error('Ошибка загрузки компонентов:', error);
    }
}

// Инициализация страницы настроек
document.addEventListener('DOMContentLoaded', async () => {
    console.log('⚙️ Страница настроек загружена');
    
    // Загружаем компоненты
    await loadComponents();
    
    // Загружаем данные пользователя
    await loadUserSettings();
    
    // Инициализируем переключатели
    initToggles();
    
    console.log('✅ Настройки инициализированы');
});

// Загрузка настроек пользователя
async function loadUserSettings() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('❌ Токен не найден, перенаправление на вход');
            window.location.href = '/profile';
            return;
        }
        
        const response = await fetch('/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            console.log('❌ Ошибка загрузки данных пользователя');
            window.location.href = '/profile';
            return;
        }
        
        const user = await response.json();
        
        // Заполняем поля
        document.getElementById('username').value = user.username || '';
        document.getElementById('email').value = user.email || '';
        
        // Загружаем сохраненные настройки из localStorage
        const savedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
        
        // Применяем настройки
        document.getElementById('theme').value = savedSettings.theme || 'auto';
        document.getElementById('language').value = savedSettings.language || 'ru';
        document.getElementById('profileVisibility').value = savedSettings.profileVisibility || 'public';
        
        // Устанавливаем состояние тогглов
        if (savedSettings.emailNotifications !== undefined) {
            const emailToggle = document.querySelector('[data-setting="emailNotifications"]');
            if (savedSettings.emailNotifications) {
                emailToggle.classList.add('active');
            }
        }
        
        if (savedSettings.pushNotifications !== undefined) {
            const pushToggle = document.querySelector('[data-setting="pushNotifications"]');
            if (savedSettings.pushNotifications) {
                pushToggle.classList.add('active');
            }
        }
        
        console.log('✅ Настройки пользователя загружены');
    } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
    }
}

// Инициализация переключателей
function initToggles() {
    const toggles = document.querySelectorAll('.toggle-switch');
    toggles.forEach(toggle => {
        // Тогглы уже настроены через onclick
    });
}

// Переключение настройки
function toggleSetting(element) {
    element.classList.toggle('active');
    
    const setting = element.getAttribute('data-setting');
    const isActive = element.classList.contains('active');
    
    // Сохраняем настройку в localStorage
    const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
    settings[setting] = isActive;
    localStorage.setItem('userSettings', JSON.stringify(settings));
    
    console.log(`⚙️ Настройка ${setting} изменена на ${isActive}`);
    showNotification(`${isActive ? 'Включено' : 'Выключено'}`, 'success');
}

// Сохранение настройки
async function saveSetting(settingName) {
    try {
        const token = localStorage.getItem('token');
        const value = document.getElementById(settingName).value;
        
        if (!value || value.trim() === '') {
            showNotification('Поле не может быть пустым', 'error');
            return;
        }
        
        const response = await fetch(`/api/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ [settingName]: value })
        });
        
        if (response.ok) {
            showNotification('Настройка сохранена', 'success');
            // Обновляем данные
            await loadUserSettings();
        } else {
            showNotification('Ошибка сохранения', 'error');
        }
    } catch (error) {
        console.error('Ошибка сохранения настройки:', error);
        showNotification('Ошибка сохранения', 'error');
    }
}

// Изменение пароля
function changePassword() {
    showNotification('Функция изменения пароля будет доступна в следующей версии', 'info');
}

// Удаление аккаунта
function deleteAccount() {
    if (confirm('Вы уверены, что хотите удалить аккаунт? Это действие необратимо!')) {
        if (confirm('Последнее предупреждение! Удалить аккаунт?')) {
            showNotification('Функция удаления аккаунта будет доступна в следующей версии', 'info');
        }
    }
}

// Сохранение настроек при изменении селектов
document.addEventListener('DOMContentLoaded', () => {
    const selects = ['theme', 'language', 'profileVisibility'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.addEventListener('change', (e) => {
                const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
                settings[selectId] = e.target.value;
                localStorage.setItem('userSettings', JSON.stringify(settings));
                
                console.log(`⚙️ Настройка ${selectId} изменена на ${e.target.value}`);
                
                // Применяем изменения (если нужно)
                if (selectId === 'theme') {
                    applyTheme(e.target.value);
                }
            });
        }
    });
});

// Применение темы
function applyTheme(theme) {
    const body = document.body;
    
    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        body.classList.add('dark-theme');
        body.classList.remove('light-theme');
    } else {
        body.classList.add('light-theme');
        body.classList.remove('dark-theme');
    }
}

// Показ уведомления
function showNotification(message, type = 'info') {
    // Используем функцию из main.js если доступна
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Fallback уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: rgba(255, 107, 129, 0.9);
            color: white;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}
