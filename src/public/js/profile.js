// ===== ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ - JAVASCRIPT =====

// Инициализация профиля при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Инициализация профиля...');
    loadUserProfile();
    
    // Обработчик смены аватара
    const avatarInput = document.getElementById('avatarInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarChange);
    }
    
    // Убедимся, что основной контент виден для авторизованных пользователей
    setTimeout(() => {
        const profileMain = document.querySelector('.profile-main');
        if (profileMain && localStorage.getItem('token')) {
            profileMain.style.display = 'flex';
            console.log('✅ Основной контент профиля отображается');
        }
    }, 500);
});

// Обработка смены аватара
function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('Выберите изображение', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Размер файла должен быть менее 5 МБ', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('profileAvatar').src = e.target.result;
        showNotification('Аватар успешно изменен', 'success');
    };
    reader.readAsDataURL(file);
}

// Загрузка данных профиля пользователя
async function loadUserProfile() {
    console.log('🔄 Начало загрузки профиля...');
    try {
        // Проверяем наличие токена
        const token = localStorage.getItem('token');
        console.log('🔑 Токен:', token ? 'Присутствует' : 'Отсутствует');
        if (!token) {
            // Показываем заглушку для неавторизованных пользователей
            document.getElementById('profileName').textContent = 'Гость';
            document.getElementById('profileTitle').textContent = 'Не авторизован';
            document.getElementById('profileBio').textContent = 'Войдите в систему, чтобы увидеть свой профиль';
            document.getElementById('userEmail').textContent = '-';
            document.getElementById('userRole').textContent = '-';
            document.getElementById('userJoinDate').textContent = '-';
            
            // Показываем кнопку входа, скрываем остальные
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) loginBtn.style.display = 'flex';
            
            document.querySelectorAll('.action-btn').forEach(btn => {
                if (btn.id !== 'loginBtn') {
                    btn.style.display = 'none';
                }
            });
            
            // Скрываем контент вкладок для неавторизованных
            const profileMain = document.querySelector('.profile-main');
            if (profileMain) {
                profileMain.style.display = 'none';
                console.log('❌ Основной контент профиля скрыт для неавторизованных');
            }
            
            return;
        }

        // Получаем данные пользователя
        const response = await fetch('/api/users/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            // Токен невалиден
            console.log('Токен невалиден, показываем гостьевой профиль');
            document.getElementById('profileName').textContent = 'Гость';
            document.getElementById('profileTitle').textContent = 'Сессия истекла';
            document.getElementById('profileBio').textContent = 'Войдите в систему снова';
            return;
        }

        const user = await response.json();
        
        console.log('✅ Данные пользователя получены:', user);

        // Заполняем данные профиля
        document.getElementById('profileName').textContent = user.username;
        
        // Показываем основной контент профиля
        const profileMain = document.querySelector('.profile-main');
        if (profileMain) {
            profileMain.style.display = 'flex';
            console.log('✅ Основной контент профиля отображается');
        }
        document.getElementById('profileTitle').textContent = user.role || 'Музыкальный энтузиаст';
        document.getElementById('profileBio').textContent = user.bio || 'Исследую мир музыки и автозвука. Делимся опытом и открываем новые звуковые горизонты.';
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userRole').textContent = user.role || 'Пользователь';
        
        // Форматируем дату регистрации
        if (user.createdAt) {
            const joinDate = new Date(user.createdAt);
            document.getElementById('userJoinDate').textContent = joinDate.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }

        // Загружаем статистику
        loadUserStats(user._id);
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        showNotification('Ошибка загрузки профиля', 'error');
    }
}

// Загрузка статистики пользователя
async function loadUserStats(userId) {
    try {
        // Заглушка для статистики (в реальном приложении здесь будет запрос к API)
        document.getElementById('statArticles').textContent = '0';
        document.getElementById('statComments').textContent = '0';
        document.getElementById('statLikes').textContent = '0';
        document.getElementById('statRating').textContent = '0';
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// Переключение вкладок
function switchTab(tabName) {
    console.log('🔀 Переключение вкладки:', tabName);
    
    // Убираем активный класс со всех кнопок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Скрываем все панели
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    // Показываем нужную панель
    const targetPanel = document.getElementById(`${tabName}Tab`);
    console.log('🎯 Целевая панель:', targetPanel);
    
    if (targetPanel) {
        targetPanel.classList.add('active');
    }

    // Добавляем активный класс к соответствующей кнопке
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const btnText = btn.textContent.toLowerCase();
        if (tabName === 'articles' && btnText.includes('статьи')) {
            btn.classList.add('active');
        } else if (tabName === 'comments' && btnText.includes('комментарии')) {
            btn.classList.add('active');
        } else if (tabName === 'favorites' && btnText.includes('избранное')) {
            btn.classList.add('active');
        }
    });

    // Загружаем данные для выбранной вкладки
    switch(tabName) {
        case 'articles':
            loadUserArticles();
            break;
        case 'comments':
            loadUserComments();
            break;
        case 'favorites':
            loadUserFavorites();
            break;
    }
}

// Загрузка статей пользователя
async function loadUserArticles() {
    const articlesGrid = document.getElementById('articlesGrid');
    const loadMoreBtn = document.querySelector('.load-more');
    
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Запрос к API для получения статей пользователя
        const response = await fetch('/api/articles', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const articles = await response.json();
            
            if (articles && articles.length > 0) {
                // Отображаем статьи
                articlesGrid.innerHTML = articles.map(article => `
                    <div class="article-card">
                        <div class="article-image">
                            <img src="${article.image || '/images/placeholder.svg'}" alt="${article.title}">
                        </div>
                        <div class="article-content">
                            <h3 class="article-title">${article.title}</h3>
                            <p class="article-excerpt">${article.excerpt || article.content.substring(0, 100)}...</p>
                            <div class="article-meta">
                                <span class="article-date">${new Date(article.createdAt).toLocaleDateString('ru-RU')}</span>
                                <span class="article-views"><i class="fas fa-eye"></i> ${article.views || 0}</span>
                            </div>
                        </div>
                    </div>
                `).join('');
                
                // Показываем кнопку "Загрузить еще"
                if (loadMoreBtn) loadMoreBtn.style.display = 'flex';
            } else {
                // Нет статей - показываем сообщение
                articlesGrid.innerHTML = '<div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.7); font-size: 1.1rem;">У вас пока нет статей</div>';
                if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            }
        } else {
            articlesGrid.innerHTML = '<div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.7);">Ошибка загрузки статей</div>';
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Ошибка загрузки статей:', error);
        articlesGrid.innerHTML = '<div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.7);">Ошибка загрузки статей</div>';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
    }
}

// Загрузка комментариев пользователя
async function loadUserComments() {
    const commentsList = document.getElementById('commentsList');
    
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Запрос к API (в реальном приложении здесь будет endpoint для комментариев пользователя)
        commentsList.innerHTML = '<div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.7);">У вас пока нет комментариев</div>';
    } catch (error) {
        console.error('Ошибка загрузки комментариев:', error);
        commentsList.innerHTML = '<div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.7);">Ошибка загрузки комментариев</div>';
    }
}

// Загрузка избранного пользователя
async function loadUserFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    
    try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Запрос к API (в реальном приложении здесь будет endpoint для избранного)
        favoritesList.innerHTML = '<div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.7);">У вас пока нет избранного</div>';
    } catch (error) {
        console.error('Ошибка загрузки избранного:', error);
        favoritesList.innerHTML = '<div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.7);">Ошибка загрузки избранного</div>';
    }
}

// Редактирование профиля
function editProfile() {
    showNotification('Функция редактирования профиля будет доступна в следующей версии', 'info');
}

// Открытие модального окна авторизации
function openAuthModal() {
    console.log('🔓 Попытка открыть модальное окно авторизации');
    const modal = document.getElementById('authModal');
    console.log('🔍 Найдено модальное окно:', modal);
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
        console.log('✅ Модальное окно открыто');
        // Переключаем на вкладку входа
        const loginTab = modal.querySelector('.auth-tab');
        const registerTab = modal.querySelectorAll('.auth-tab')[1];
        if (loginTab && registerTab) {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');
            if (loginForm && registerForm) {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
            }
        }
    }
}

// Закрытие модального окна авторизации
function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
    }
}

// Переключение вкладок в модальном окне
function switchAuthTab(tab) {
    const loginTab = document.querySelector('.auth-tab');
    const registerTab = document.querySelectorAll('.auth-tab')[1];
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (tab === 'login') {
        loginTab?.classList.add('active');
        registerTab?.classList.remove('active');
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
    } else {
        loginTab?.classList.remove('active');
        registerTab?.classList.add('active');
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
    }
}

// Выход из аккаунта
async function logout() {
    try {
        const token = localStorage.getItem('token');
        
        // Отправляем запрос на выход (если есть endpoint)
        if (token) {
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.log('Ошибка при выходе на сервере:', error);
            }
        }
    } catch (error) {
        console.error('Ошибка при выходе:', error);
    } finally {
        // Очищаем локальное хранилище
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        showNotification('Вы вышли из аккаунта', 'info');
        
        // Перенаправляем на главную через 1 секунду
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    }
}

// Показ уведомлений
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'error' ? 'rgba(244, 67, 54, 0.9)' : type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(33, 150, 243, 0.9)'};
        color: white;
        border-radius: 8px;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Выносим функции в глобальную область видимости, чтобы они были доступны из HTML
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.switchTab = switchTab;
window.logout = logout;
window.editProfile = editProfile;

// Добавляем стили для анимации уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
