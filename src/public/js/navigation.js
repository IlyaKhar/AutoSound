// ===== УНИВЕРСАЛЬНЫЙ НАВИГАЦИОННЫЙ МЕНЕДЖЕР =====
class NavigationManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupSearch();
        this.setupUserMenu();
        this.setupAuth();
        this.setupSmoothTransitions();
        this.checkAuthStatus();
    }

    // ===== ОПРЕДЕЛЕНИЕ ТЕКУЩЕЙ СТРАНИЦЫ =====
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        const pageMap = {
            'index.html': 'home',
            'main.html': 'home', 
            'categories.html': 'categories',
            'autozvuk.html': 'autozvuk',
            'news.html': 'news',
            'rating.html': 'rating',
            'login.html': 'login',
            'register.html': 'register',
            'profile.html': 'profile',
            'settings.html': 'settings',
            'admin.html': 'admin',
            'about.html': 'about',
            'contacts.html': 'contacts',
            'policy.html': 'policy',
            'terms.html': 'terms'
        };

        return pageMap[filename] || 'home';
    }

    // ===== НАСТРОЙКА НАВИГАЦИИ =====
    setupNavigation() {
        // Обновляем активные ссылки
        this.updateActiveLinks();
        
        // Добавляем обработчики для всех навигационных ссылок
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavigation(e, link);
            });
        });

        // Обработчик для логотипа
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo('index.html');
            });
        }
    }

    updateActiveLinks() {
        // Убираем активные классы со всех ссылок
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Добавляем активный класс к текущей странице
        const activeSelectors = {
            'home': 'a[href="index.html"], a[href="main.html"]',
            'categories': 'a[href="categories.html"]',
            'autozvuk': 'a[href="autozvuk.html"]',
            'news': 'a[href="news.html"]',
            'rating': 'a[href="rating.html"]'
        };

        const selector = activeSelectors[this.currentPage];
        if (selector) {
            const activeLink = document.querySelector(selector);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    }

    // ===== ОБРАБОТКА НАВИГАЦИИ =====
    handleNavigation(e, link) {
        const href = link.getAttribute('href');
        
        // Если это якорная ссылка или внешняя ссылка, не перехватываем
        if (href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) {
            return;
        }

        e.preventDefault();
        this.navigateTo(href);
    }

    navigateTo(url) {
        // Добавляем анимацию перехода
        this.addTransitionEffect(() => {
            window.location.href = url;
        });
    }

    // ===== ПОИСК =====
    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        const searchBtn = document.querySelector('.search-btn');

        if (!searchInput || !searchBtn) return;

        // Фокус на поиск при клике на кнопку
        searchBtn.addEventListener('click', () => {
            searchInput.focus();
        });

        // Обработка поиска
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(searchInput.value);
            }
        });

        searchBtn.addEventListener('click', () => {
            this.performSearch(searchInput.value);
        });

        // Поиск при вводе (с задержкой)
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (e.target.value.length > 2) {
                    this.performSearch(e.target.value);
                }
            }, 500);
        });
    }

    async performSearch(query) {
        if (!query.trim()) return;

        try {
            const response = await fetch(`/api/articles/search?q=${encodeURIComponent(query)}`);
            const result = await response.json();

            if (result.success) {
                this.displaySearchResults(result.articles, query);
            } else {
                this.showNotification('Ошибка поиска', 'error');
            }
        } catch (error) {
            console.error('Ошибка поиска:', error);
            // Перенаправляем на страницу поиска с параметром
            window.location.href = `categories.html?search=${encodeURIComponent(query)}`;
        }
    }

    displaySearchResults(articles, query) {
        // Создаем модальное окно с результатами поиска
        const modal = document.createElement('div');
        modal.className = 'modal-overlay search-results-modal';
        modal.innerHTML = `
            <div class="modal-content search-modal">
                <div class="modal-header">
                    <h2 class="modal-title">Результаты поиска: "${query}"</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="search-results">
                    ${articles.length > 0 ? 
                        articles.map(article => `
                            <div class="search-result-item">
                                <div class="result-content">
                                    <h3 class="result-title">${article.title}</h3>
                                    <p class="result-excerpt">${article.excerpt}</p>
                                    <div class="result-meta">
                                        <span class="result-category">${article.category?.name || 'Без категории'}</span>
                                        <span class="result-date">${new Date(article.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <a href="article.html?id=${article._id}" class="result-link">
                                    <i class="fas fa-arrow-right"></i>
                                </a>
                            </div>
                        `).join('') :
                        '<div class="no-results"><i class="fas fa-search"></i><p>Ничего не найдено</p></div>'
                    }
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // ===== МЕНЮ ПОЛЬЗОВАТЕЛЯ =====
    setupUserMenu() {
        const userBtn = document.querySelector('.user-btn');
        const userDropdown = document.querySelector('.user-dropdown');

        if (!userBtn || !userDropdown) return;

        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });

        // Закрытие при клике вне меню
        document.addEventListener('click', (e) => {
            if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }

    // ===== АВТОРИЗАЦИЯ =====
    setupAuth() {
        // Обработка кнопок входа/регистрации
        document.querySelectorAll('a[href="login.html"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo('login.html');
            });
        });

        document.querySelectorAll('a[href="register.html"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo('register.html');
            });
        });
    }

    checkAuthStatus() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            try {
                const userData = JSON.parse(user);
                this.updateAuthUI(userData);
            } catch (error) {
                console.error('Ошибка парсинга пользователя:', error);
                this.logout();
            }
        }
    }

    updateAuthUI(user) {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const userName = userMenu?.querySelector('.user-name');
        const adminLink = userMenu?.querySelector('.admin-link');

        if (authButtons && userMenu) {
            authButtons.style.display = 'none';
            userMenu.style.display = 'block';
            
            if (userName) {
                userName.textContent = user.username;
            }

            // Показываем админ панель для админов
            if (adminLink && (user.role === 'admin' || user.role === 'moderator')) {
                adminLink.style.display = 'block';
            }
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');

        if (authButtons && userMenu) {
            authButtons.style.display = 'flex';
            userMenu.style.display = 'none';
        }

        this.showNotification('Вы вышли из системы', 'info');
        
        // Перенаправляем на главную страницу
        if (this.currentPage !== 'home') {
            this.navigateTo('index.html');
        }
    }

    // ===== ПЛАВНЫЕ ПЕРЕХОДЫ =====
    setupSmoothTransitions() {
        // Добавляем CSS для плавных переходов
        const transitionStyles = `
            <style>
                .page-transition {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: all 0.3s ease;
                }
                
                .page-transition.loaded {
                    opacity: 1;
                    transform: translateY(0);
                }
                
                .search-results-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                
                .search-modal {
                    background: rgba(42, 42, 64, 0.95);
                    backdrop-filter: blur(25px);
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                }
                
                .search-results {
                    max-height: 400px;
                    overflow-y: auto;
                }
                
                .search-result-item {
                    display: flex;
                    align-items: center;
                    padding: 15px;
                    border-radius: 10px;
                    background: rgba(255, 255, 255, 0.05);
                    margin-bottom: 10px;
                    transition: all 0.3s ease;
                }
                
                .search-result-item:hover {
                    background: rgba(255, 255, 255, 0.1);
                    transform: translateX(5px);
                }
                
                .result-content {
                    flex: 1;
                }
                
                .result-title {
                    color: #fff;
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0 0 5px 0;
                }
                
                .result-excerpt {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 14px;
                    margin: 0 0 10px 0;
                }
                
                .result-meta {
                    display: flex;
                    gap: 15px;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                }
                
                .result-link {
                    color: #5b5fef;
                    font-size: 18px;
                    padding: 10px;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }
                
                .result-link:hover {
                    background: rgba(91, 95, 239, 0.2);
                    transform: scale(1.1);
                }
                
                .no-results {
                    text-align: center;
                    padding: 40px;
                    color: rgba(255, 255, 255, 0.6);
                }
                
                .no-results i {
                    font-size: 48px;
                    margin-bottom: 15px;
                    display: block;
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', transitionStyles);
    }

    addTransitionEffect(callback) {
        // Добавляем эффект перехода
        const body = document.body;
        body.style.opacity = '0.8';
        body.style.transform = 'scale(0.98)';
        body.style.transition = 'all 0.2s ease';

        setTimeout(() => {
            callback();
        }, 200);
    }

    // ===== УВЕДОМЛЕНИЯ =====
    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Анимация появления
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ===== ГЛОБАЛЬНЫЕ ФУНКЦИИ =====
function logout() {
    if (window.navigationManager) {
        window.navigationManager.logout();
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
    
    // Добавляем класс для плавной загрузки страницы
    document.body.classList.add('page-transition');
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
    
    console.log('🧭 Navigation Manager загружен!');
});
