// ===== ПРИМЕНЕНИЕ ЕДИНОЙ ТЕМЫ КО ВСЕМ СТРАНИЦАМ =====

class ThemeApplier {
    constructor() {
        this.init();
    }

    init() {
        // Применяем тему при загрузке страницы
        document.addEventListener('DOMContentLoaded', () => {
            this.applyHeaderTheme();
            this.applyFooterTheme();
            this.updateNavigationLinks();
        });
    }

    applyHeaderTheme() {
        // Проверяем есть ли уже хедер
        if (document.querySelector('.sidebar')) {
            return;
        }

        // Создаем хедер если его нет
        this.createHeader();
    }

    createHeader() {
        const headerHTML = `
            <aside class="sidebar" id="sidebar">
                <!-- Логотип -->
                <div class="sidebar-header">
                    <div class="sidebar-logo">
                        <div class="logo-icon">
                            <i class="fas fa-music"></i>
                        </div>
                        <div class="logo-text">
                            <span class="logo-title">AutoSound</span>
                            <span class="logo-subtitle">Музыка и звук</span>
                        </div>
                    </div>
                    <button class="sidebar-toggle" id="sidebarToggle">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                </div>

                <!-- Навигация -->
                <nav class="sidebar-nav">
                    <ul class="nav-list">
                        <li class="nav-item">
                            <a href="/" class="nav-link" data-page="main">
                                <div class="nav-icon">
                                    <i class="fas fa-home"></i>
                                </div>
                                <span class="nav-text">Главная</span>
                                <div class="nav-indicator"></div>
                            </a>
                        </li>
                        
                        <li class="nav-item">
                            <a href="/categories" class="nav-link" data-page="categories">
                                <div class="nav-icon">
                                    <i class="fas fa-guitar"></i>
                                </div>
                                <span class="nav-text">Инструменты</span>
                                <div class="nav-indicator"></div>
                            </a>
                        </li>
                        
                        <li class="nav-item">
                            <a href="/autozvuk" class="nav-link" data-page="autozvuk">
                                <div class="nav-icon">
                                    <i class="fas fa-car"></i>
                                </div>
                                <span class="nav-text">Автозвук</span>
                                <div class="nav-indicator"></div>
                            </a>
                        </li>
                        
                        <li class="nav-item">
                            <a href="/news" class="nav-link" data-page="news">
                                <div class="nav-icon">
                                    <i class="fas fa-newspaper"></i>
                                </div>
                                <span class="nav-text">Новости</span>
                                <div class="nav-indicator"></div>
                            </a>
                        </li>
                        
                        <li class="nav-item">
                            <a href="/rating" class="nav-link" data-page="rating">
                                <div class="nav-icon">
                                    <i class="fas fa-star"></i>
                                </div>
                                <span class="nav-text">Рейтинги</span>
                                <div class="nav-indicator"></div>
                            </a>
                        </li>
                        
                        <li class="nav-item">
                            <a href="/admin" class="nav-link" data-page="admin">
                                <div class="nav-icon">
                                    <i class="fas fa-cog"></i>
                                </div>
                                <span class="nav-text">Админ</span>
                                <div class="nav-indicator"></div>
                            </a>
                        </li>
                    </ul>
                </nav>

                <!-- Кнопка авторизации -->
                <div class="auth-buttons">
                    <button class="btn-auth btn-primary auth-login-btn">
                        <i class="fas fa-sign-in-alt"></i>
                        <span class="auth-text">Войти</span>
                    </button>
                </div>

                <!-- Пользователь -->
                <div class="sidebar-user" style="display: none;">
                    <div class="user-avatar">
                        <img src="/images/avatar-default.jpg" alt="Аватар">
                    </div>
                    <div class="user-info">
                        <div class="user-name">Пользователь</div>
                        <div class="user-role">VIP</div>
                    </div>
                    <button class="user-menu-btn">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>

                <!-- Поиск -->
                <div class="sidebar-search">
                    <div class="search-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" class="search-input" placeholder="Поиск...">
                        <button class="search-clear">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <!-- Дополнительные ссылки -->
                <div class="sidebar-links">
                    <a href="/about" class="sidebar-link">
                        <i class="fas fa-info-circle"></i>
                        <span>О нас</span>
                    </a>
                    <a href="/contacts" class="sidebar-link">
                        <i class="fas fa-envelope"></i>
                        <span>Контакты</span>
                    </a>
                    <a href="/settings" class="sidebar-link">
                        <i class="fas fa-cog"></i>
                        <span>Настройки</span>
                    </a>
                </div>
            </aside>
        `;

        // Вставляем хедер в начало body
        document.body.insertAdjacentHTML('afterbegin', headerHTML);

        // Добавляем класс к main-content
        const mainContent = document.querySelector('.main-content') || document.querySelector('main') || document.body;
        if (mainContent) {
            mainContent.classList.add('main-content');
            mainContent.style.marginLeft = '280px';
            mainContent.style.transition = 'margin-left 0.3s ease';
        }
    }

    applyFooterTheme() {
        // Проверяем есть ли уже футер
        if (document.querySelector('.footer')) {
            return;
        }

        // Создаем футер если его нет
        this.createFooter();
    }

    createFooter() {
        const footerHTML = `
            <footer class="footer">
                <div class="footer-container">
                    <div class="footer-content">
                        <!-- О компании -->
                        <div class="footer-section">
                            <h3 class="footer-title">AutoSound</h3>
                            <p class="footer-description">
                                Ваш надежный партнер в мире музыки и автозвука. 
                                Мы предлагаем качественные инструменты, оборудование 
                                и профессиональные услуги.
                            </p>
                            <div class="social-links">
                                <a href="https://youtube.com/@autosound" class="social-link" target="_blank">
                                    <i class="fab fa-youtube"></i>
                                </a>
                                <a href="https://instagram.com/autosound" class="social-link" target="_blank">
                                    <i class="fab fa-instagram"></i>
                                </a>
                                <a href="https://t.me/autosound" class="social-link" target="_blank">
                                    <i class="fab fa-telegram"></i>
                                </a>
                                <a href="https://vk.com/autosound" class="social-link" target="_blank">
                                    <i class="fab fa-vk"></i>
                                </a>
                            </div>
                        </div>
                        
                        <!-- Каталог -->
                        <div class="footer-section">
                            <h4 class="footer-subtitle">Каталог</h4>
                            <ul class="footer-links">
                                <li><a href="/categories">Музыкальные инструменты</a></li>
                                <li><a href="/autozvuk">Автозвук</a></li>
                                <li><a href="/news">Новости</a></li>
                                <li><a href="/rating">Рейтинги</a></li>
                            </ul>
                        </div>
                        
                        <!-- Поддержка -->
                        <div class="footer-section">
                            <h4 class="footer-subtitle">Поддержка</h4>
                            <ul class="footer-links">
                                <li><a href="/about">О нас</a></li>
                                <li><a href="/contacts">Контакты</a></li>
                                <li><a href="/terms">Условия использования</a></li>
                                <li><a href="/policy">Политика конфиденциальности</a></li>
                            </ul>
                        </div>
                        
                        <!-- Контакты -->
                        <div class="footer-section">
                            <h4 class="footer-subtitle">Контакты</h4>
                            <div class="contact-info">
                                <div class="contact-item">
                                    <i class="fas fa-phone"></i>
                                    <span>+7 (999) 123-45-67</span>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-envelope"></i>
                                    <span>info@autosound.ru</span>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>Москва, ул. Музыкальная, 1</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer-bottom">
                        <div class="footer-bottom-content">
                            <p>&copy; 2024 AutoSound. Все права защищены.</p>
                            <div class="footer-bottom-links">
                                <a href="/terms">Условия</a>
                                <a href="/policy">Политика</a>
                                <a href="/contacts">Контакты</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        `;

        // Вставляем футер в конец body
        document.body.insertAdjacentHTML('beforeend', footerHTML);
    }

    updateNavigationLinks() {
        // Обновляем активную ссылку в навигации
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPath || 
                (currentPath === '/' && link.getAttribute('href') === '/') ||
                (currentPath.includes(link.getAttribute('href')) && link.getAttribute('href') !== '/')) {
                link.classList.add('active');
            }
        });
    }
}

// Инициализируем приложение темы
new ThemeApplier();
