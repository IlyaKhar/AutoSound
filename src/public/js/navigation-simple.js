// ===== ПРОСТАЯ НАВИГАЦИЯ =====

class SimpleNavigation {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }
    
    init() {
        this.setupNavigation();
        this.setupSearch();
        this.setupAuthButtons();
        this.setupUserMenu();
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().split('.')[0];
        return page || 'index';
    }
    
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link[data-page]');
        
        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            
            // Убираем активный класс со всех ссылок
            link.classList.remove('active');
            
            // Добавляем активный класс к текущей странице
            if (page === this.currentPage) {
                link.classList.add('active');
            }
            
            // Обработчик клика
            link.addEventListener('click', (e) => {
                this.handleNavigation(e, page);
            });
        });
    }
    
    handleNavigation(e, page) {
        // Если это внешняя ссылка или якорь, не перехватываем
        if (e.target.href && (e.target.href.includes('http') || e.target.href.includes('#'))) {
            return;
        }
        
        // Плавный переход
        this.animatePageTransition();
    }
    
    animatePageTransition() {
        // Добавляем класс для анимации перехода
        document.body.classList.add('page-transitioning');
        
        // Убираем класс через небольшую задержку
        setTimeout(() => {
            document.body.classList.remove('page-transitioning');
        }, 300);
    }
    
    setupSearch() {
        const searchInputs = document.querySelectorAll('.search-input');
        
        searchInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(input.value);
                }
            });
            
            input.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
        });
    }
    
    performSearch(query) {
        if (!query.trim()) return;
        
        console.log('Поиск:', query);
        
        // Здесь можно добавить логику поиска
        // Например, перенаправление на страницу поиска
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
    
    handleSearchInput(query) {
        // Здесь можно добавить автодополнение или фильтрацию
        console.log('Поисковый запрос:', query);
    }
    
    setupAuthButtons() {
        const loginBtn = document.querySelector('.auth-login-btn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthModal('login');
            });
        }
    }
    
    showAuthModal(type = 'login') {
        // Создаем модальное окно если его нет
        let modal = document.getElementById('authModal');
        
        if (!modal) {
            modal = this.createAuthModal();
            document.body.appendChild(modal);
        }
        
        // Показываем модальное окно
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Переключаем на нужную вкладку
        this.switchAuthTab(type);
    }
    
    createAuthModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'authModal';
        modal.innerHTML = `
            <div class="modal-content auth-modal">
                <div class="modal-header">
                    <h2 class="modal-title">Вход в систему</h2>
                    <button class="modal-close" onclick="closeAuthModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="auth-tabs">
                    <button class="auth-tab active" onclick="switchAuthTab('login')">Вход</button>
                    <button class="auth-tab" onclick="switchAuthTab('register')">Регистрация</button>
                </div>

                <!-- Форма входа -->
                <form class="auth-form active" id="loginForm">
                    <div class="form-group">
                        <label for="loginEmail">Email</label>
                        <input type="email" id="loginEmail" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Пароль</label>
                        <input type="password" id="loginPassword" name="password" required>
                    </div>
                    <div class="form-options">
                        <label class="checkbox-label">
                            <input type="checkbox" name="remember">
                            <span class="checkmark"></span>
                            Запомнить меня
                        </label>
                        <a href="#" class="forgot-link">Забыли пароль?</a>
                    </div>
                    <button type="submit" class="btn btn-primary btn-full">Войти</button>
                </form>

                <!-- Форма регистрации -->
                <form class="auth-form" id="registerForm">
                    <div class="form-group">
                        <label for="registerUsername">Имя пользователя</label>
                        <input type="text" id="registerUsername" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="registerEmail">Email</label>
                        <input type="email" id="registerEmail" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="registerPassword">Пароль</label>
                        <input type="password" id="registerPassword" name="password" required>
                    </div>
                    <div class="form-group">
                        <label for="registerConfirmPassword">Подтвердите пароль</label>
                        <input type="password" id="registerConfirmPassword" name="confirmPassword" required>
                    </div>
                    <div class="form-options">
                        <label class="checkbox-label">
                            <input type="checkbox" name="agree" required>
                            <span class="checkmark"></span>
                            Согласен с условиями использования
                        </label>
                    </div>
                    <button type="submit" class="btn btn-primary btn-full">Зарегистрироваться</button>
                </form>
            </div>
        `;
        
        return modal;
    }
    
    switchAuthTab(type) {
        const tabs = document.querySelectorAll('.auth-tab');
        const forms = document.querySelectorAll('.auth-form');
        
        tabs.forEach(tab => tab.classList.remove('active'));
        forms.forEach(form => form.classList.remove('active'));
        
        const activeTab = document.querySelector(`.auth-tab[onclick*="${type}"]`);
        const activeForm = document.getElementById(`${type}Form`);
        
        if (activeTab) activeTab.classList.add('active');
        if (activeForm) activeForm.classList.add('active');
    }
    
    setupUserMenu() {
        const userBtn = document.querySelector('.user-btn');
        const userMenu = document.querySelector('.user-menu');
        
        if (userBtn && userMenu) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                userMenu.classList.toggle('active');
            });
            
            // Закрываем меню при клике вне его
            document.addEventListener('click', (e) => {
                if (!userMenu.contains(e.target)) {
                    userMenu.classList.remove('active');
                }
            });
        }
    }
}

// Глобальные функции для модального окна
window.closeAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

window.switchAuthTab = function(type) {
    const navigation = window.simpleNavigation;
    if (navigation) {
        navigation.switchAuthTab(type);
    }
};

// Инициализация
function initializeNavigation() {
    window.simpleNavigation = new SimpleNavigation();
}

// Экспорт
window.SimpleNavigation = SimpleNavigation;