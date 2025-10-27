// ===== СИСТЕМА АУТЕНТИФИКАЦИИ =====

class AuthSystem {
    constructor() {
        this.isAuthenticated = false;
        this.user = null;
        this.token = localStorage.getItem('token') || localStorage.getItem('authToken');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.updateUI();
    }
    
    setupEventListeners() {
        // Обработчики для форм авторизации
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        console.log('🔧 Настройка обработчиков:', { loginForm: !!loginForm, registerForm: !!registerForm });
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            console.log('✅ Обработчик входа установлен');
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
            console.log('✅ Обработчик регистрации установлен');
        }
        
        // Обработчик для кнопки выхода
        const logoutBtn = document.querySelector('[onclick="logout()"]');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }
    
    async checkAuthStatus() {
        if (!this.token) {
            this.isAuthenticated = false;
            return;
        }
        
        try {
            const response = await fetch('/api/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const userData = await response.json();
                this.user = userData.data.user;
                this.isAuthenticated = true;
            } else {
                this.logout();
            }
        } catch (error) {
            console.error('Ошибка проверки авторизации:', error);
            this.logout();
        }
        
        this.updateUI();
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const emailOrUsername = formData.get('email') || formData.get('identifier');
        const loginData = {
            identifier: emailOrUsername,
            password: formData.get('password'),
            remember: formData.get('remember') === 'on'
        };
        
        try {
            console.log('🔐 Попытка входа:', loginData);
            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
            
            const data = await response.json();
            console.log('📥 Ответ сервера:', data);
            
            if (response.ok && data.success) {
                console.log('✅ Вход успешен!', data.data);
                this.token = data.data.token;
                this.user = data.data.user;
                this.isAuthenticated = true;
                
                // Сохраняем токен
                localStorage.setItem('token', this.token);
                if (data.data.refreshToken) {
                    localStorage.setItem('refreshToken', data.data.refreshToken);
                }
                
                this.updateUI();
                this.closeAuthModal();
                this.showNotification('Успешный вход в систему!', 'success');
                
                // Перезагружаем страницу для обновления интерфейса
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                this.showNotification(data.error || 'Ошибка входа', 'error');
            }
        } catch (error) {
            console.error('Ошибка входа:', error);
            this.showNotification('Ошибка соединения с сервером', 'error');
        }
    }
    
    async handleRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const registerData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            agree: formData.get('agree') === 'on'
        };
        
        // Валидация
        if (registerData.password !== registerData.confirmPassword) {
            this.showNotification('Пароли не совпадают', 'error');
            return;
        }
        
        if (!registerData.agree) {
            this.showNotification('Необходимо согласиться с условиями использования', 'error');
            return;
        }
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showNotification('✅ Регистрация успешна! Войдите в аккаунт', 'success');
                
                // Переключаемся на вкладку входа
                this.switchAuthTab('login');
                
                // Очищаем форму регистрации
                e.target.reset();
                
                // Добавляем email в поле входа для удобства
                const loginEmailInput = document.getElementById('loginEmail');
                if (loginEmailInput) {
                    loginEmailInput.value = registerData.email;
                }
                
                // Фокусируемся на поле пароля
                const loginPasswordInput = document.getElementById('loginPassword');
                if (loginPasswordInput) {
                    setTimeout(() => {
                        loginPasswordInput.focus();
                    }, 300);
                }
            } else {
                this.showNotification(data.error || 'Ошибка регистрации', 'error');
            }
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            this.showNotification('Ошибка соединения с сервером', 'error');
        }
    }
    
    logout() {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        
        // Удаляем токены
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('token');
        
        this.updateUI();
        this.showNotification('Вы вышли из системы', 'info');
        
        // Перезагружаем страницу для обновления интерфейса
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
    
    updateUI() {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const sidebarUser = document.querySelector('.sidebar-user');
        const sidebarAuth = document.querySelector('.auth-buttons');
        const sidebarLoginBtn = document.getElementById('sidebarLoginBtn');
        const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
        
        if (this.isAuthenticated) {
            // Показываем меню пользователя
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            if (sidebarUser) sidebarUser.style.display = 'flex';
            if (sidebarAuth) sidebarAuth.style.display = 'none';
            if (sidebarLoginBtn) sidebarLoginBtn.style.display = 'none';
            if (sidebarLogoutBtn) sidebarLogoutBtn.style.display = 'flex';
            
            // Обновляем информацию о пользователе
            this.updateUserInfo();
        } else {
            // Показываем кнопки авторизации
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
            if (sidebarUser) sidebarUser.style.display = 'flex';
            if (sidebarAuth) sidebarAuth.style.display = 'block';
            if (sidebarLoginBtn) sidebarLoginBtn.style.display = 'flex';
            if (sidebarLogoutBtn) sidebarLogoutBtn.style.display = 'none';
        }
    }
    
    updateUserInfo() {
        if (!this.user) return;
        
        const userNameElements = document.querySelectorAll('.user-name');
        const userAvatarElements = document.querySelectorAll('.user-avatar img, .user-avatar');
        const userStatusElements = document.querySelectorAll('.user-status');
        
        const username = this.user.username || this.user.firstName || 'Пользователь';
        const userRole = this.user.role || 'Пользователь';
        
        // Обновляем имена пользователей
        userNameElements.forEach(element => {
            element.textContent = username;
        });
        
        // Обновляем аватары
        if (this.user.avatar) {
            userAvatarElements.forEach(element => {
                if (element.tagName === 'IMG') {
                    element.src = this.user.avatar;
                    element.alt = username;
                }
            });
        }
        
        // Обновляем статус
        userStatusElements.forEach(element => {
            element.textContent = userRole;
        });
    }
    
    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    switchAuthTab(type) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const loginTab = document.querySelector('.auth-tab[onclick="switchAuthTab(\'login\')"]');
        const registerTab = document.querySelector('.auth-tab[onclick="switchAuthTab(\'register\')"]');
        
        if (type === 'login') {
            if (loginForm) loginForm.style.display = 'block';
            if (registerForm) registerForm.style.display = 'none';
            if (loginTab) loginTab.classList.add('active');
            if (registerTab) registerTab.classList.remove('active');
        } else if (type === 'register') {
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'block';
            if (loginTab) loginTab.classList.remove('active');
            if (registerTab) registerTab.classList.add('active');
        }
    }
    
    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Стили для уведомления
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10001',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        // Цвета в зависимости от типа
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            info: '#2196F3',
            warning: '#ff9800'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Автоматическое скрытие
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Публичные методы
    isLoggedIn() {
        return this.isAuthenticated;
    }
    
    getCurrentUser() {
        return this.user;
    }
    
    getToken() {
        return this.token;
    }
}

// Глобальная функция для выхода
window.logout = function() {
    if (window.authSystem) {
        window.authSystem.logout();
    }
};

// Функция для открытия модального окна авторизации
function openAuthModal() {
    const modal = document.getElementById('authModal');
    
    if (modal) {
        modal.classList.add('active');
        // Принудительно устанавливаем display: flex
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Функция для закрытия модального окна авторизации
function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Функция для переключения между вкладками входа и регистрации
function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.querySelector('.auth-tab[onclick="switchAuthTab(\'login\')"]');
    const registerTab = document.querySelector('.auth-tab[onclick="switchAuthTab(\'register\')"]');
    
    if (tab === 'login') {
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');
    } else if (tab === 'register') {
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
        if (loginTab) loginTab.classList.remove('active');
        if (registerTab) registerTab.classList.add('active');
    }
}

// Инициализация
function initializeAuth() {
    // Небольшая задержка чтобы убедиться что все элементы загружены
    setTimeout(() => {
        window.authSystem = new AuthSystem();
    }, 100);
}

// Автоматическая инициализация при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    initializeAuth();
}

// Функция для переключения видимости пароля
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.parentElement.querySelector('.password-toggle');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.classList.remove('fa-eye');
        toggle.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        toggle.classList.remove('fa-eye-slash');
        toggle.classList.add('fa-eye');
    }
}

// Экспорт
window.AuthSystem = AuthSystem;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.togglePassword = togglePassword;
