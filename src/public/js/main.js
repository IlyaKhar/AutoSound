// ===== ОСНОВНЫЕ ФУНКЦИИ ДЛЯ ГЛАВНОЙ СТРАНИЦЫ =====

class MainPageManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupScrollEffects();
        this.setupSearch();
        this.setupUserMenu();
        this.setupVideoPlayers();
        this.setupAnimations();
        this.setupNewsletter();
        this.setupAuth();
        this.checkAuthStatus();
        this.loadArticles();
    }

    // ===== ЭФФЕКТЫ ПРИ СКРОЛЛЕ =====
    setupScrollEffects() {
        // Прозрачность шапки при скролле
        const header = document.querySelector('.header');
        let lastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            if (!header) return; // Проверяем наличие элемента
            
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                header.style.background = 'rgba(42, 42, 64, 0.95)';
                header.style.backdropFilter = 'blur(25px)';
            } else {
                header.style.background = 'rgba(42, 42, 64, 0.8)';
                header.style.backdropFilter = 'blur(15px)';
            }

            lastScrollY = currentScrollY;
        });
    }

    // ===== АНИМАЦИИ ПОЯВЛЕНИЯ =====
    setupAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Наблюдаем за карточками статей
        document.querySelectorAll('.article-card, .review-card, .new-item-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease';
            observer.observe(card);
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
            this.showNotification('Ошибка соединения', 'error');
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

    // ===== ВИДЕО ПЛЕЕРЫ =====
    setupVideoPlayers() {
        const videoThumbnails = document.querySelectorAll('.video-thumbnail');
        
        videoThumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', () => {
                const videoContainer = thumbnail.closest('.review-video');
                if (videoContainer) {
                    this.playVideo(videoContainer);
                }
            });
        });
    }

    playVideo(container) {
        // Создаем iframe для YouTube видео
        const iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
        iframe.frameBorder = '0';
        iframe.allow = 'autoplay; encrypted-media';
        iframe.allowFullscreen = true;
        
        // Заменяем содержимое контейнера
        container.innerHTML = '';
        container.appendChild(iframe);
    }

    // ===== РАССЫЛКА =====
    setupNewsletter() {
        const newsletterForm = document.querySelector('.newsletter-form');
        
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletter(e.target);
            });
        }
    }

    handleNewsletter(form) {
        const email = form.querySelector('input[type="email"]').value;
        
        if (email) {
            // Проверяем формат email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                this.showNotification('Пожалуйста, введите корректный email', 'error');
                return;
            }
            
            this.showNotification('Спасибо за подписку!', 'success');
            form.reset();
        }
    }

    // ===== АВТОРИЗАЦИЯ =====
    setupAuth() {
        // Обработка форм входа и регистрации перенесена в auth-system.js
        // Здегь только проверка статуса авторизации
    }

    async handleLogin(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('user', JSON.stringify(result.data.user));
                this.updateAuthUI(result.data.user);
                this.closeAuthModal();
                this.showNotification('Успешный вход!', 'success');
            } else {
                this.showNotification(result.error || 'Ошибка входа', 'error');
            }
        } catch (error) {
            console.error('Ошибка входа:', error);
            this.showNotification('Ошибка соединения', 'error');
        }
    }

    async handleRegister(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (data.password !== data.confirmPassword) {
            this.showNotification('Пароли не совпадают', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: data.username,
                    email: data.email,
                    password: data.password
                })
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('user', JSON.stringify(result.data.user));
                this.updateAuthUI(result.data.user);
                this.closeAuthModal();
                this.showNotification('Регистрация успешна!', 'success');
            } else {
                this.showNotification(result.error || 'Ошибка регистрации', 'error');
            }
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            this.showNotification('Ошибка соединения', 'error');
        }
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
    }

    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

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

    // ===== ЗАГРУЗКА СТАТЕЙ =====
    async loadArticles() {
        try {
                            const response = await fetch('/api/articles');
            const result = await response.json();

            if (result.articles && result.articles.length > 0) {
                this.displayArticles(result.articles);
            } else {
                // Показываем демо-статьи для остальных страниц
                this.displayDefaultArticles();
            }
        } catch (error) {
            console.error('Ошибка загрузки статей:', error);
            // При ошибке тоже показываем демо-статьи
            this.displayDefaultArticles();
        }
    }

    displayArticles(articles) {
        const articlesGrid = document.getElementById('articlesGrid');
        if (!articlesGrid) return;

        articlesGrid.innerHTML = articles.map(article => `
            <article class="article-card">
                <div class="article-image">
                    <img src="/images/guitar1.jpg" alt="${article.title}" loading="lazy">
                    <div class="article-category">${article.category?.name || 'Без категории'}</div>
                </div>
                <div class="article-content">
                    <div class="article-meta">
                        <span class="article-date">${new Date(article.createdAt).toLocaleDateString()}</span>
                        <span class="article-author">
                            <i class="fas fa-user"></i>
                            ${article.author?.username || 'Автор'}
                        </span>
                    </div>
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <div class="article-stats">
                        <span class="article-views">
                            <i class="fas fa-eye"></i>
                            ${article.stats?.views || 0}
                        </span>
                        <span class="article-likes">
                            <i class="fas fa-heart"></i>
                            ${article.stats?.likes || 0}
                        </span>
                    </div>
                </div>
            </article>
        `).join('');
    }

    displayDefaultArticles() {
        const articlesGrid = document.getElementById('articlesGrid');
        if (!articlesGrid) return;

        articlesGrid.innerHTML = `
            <article class="article-card">
                <div class="article-image">
                    <img src="/images/guitar1.jpg" alt="Fender Stratocaster 2024" loading="lazy">
                    <div class="article-category">Популярное</div>
                </div>
                <div class="article-content">
                    <div class="article-meta">
                        <span class="article-date">15 декабря 2024</span>
                        <span class="article-author">
                            <i class="fas fa-user"></i>
                            Алексей Музыкантов
                        </span>
                    </div>
                    <h3 class="article-title">Обзор Fender Stratocaster 2024: Лучшая гитара года</h3>
                    <p class="article-excerpt">Подробный обзор легендарной модели Fender Stratocaster с анализом звука, качества сборки и сравнением с предыдущими версиями.</p>
                    <div class="article-stats">
                        <span class="article-views">
                            <i class="fas fa-eye"></i>
                            2.5k
                        </span>
                        <span class="article-likes">
                            <i class="fas fa-heart"></i>
                            156
                        </span>
                    </div>
                </div>
            </article>

            <article class="article-card">
                <div class="article-image">
                    <img src="/images/synthesizer.jpg" alt="Moog Subsequent 37" loading="lazy">
                    <div class="article-category">Музыкальные инструменты</div>
                </div>
                <div class="article-content">
                    <div class="article-meta">
                        <span class="article-date">12 декабря 2024</span>
                        <span class="article-author">
                            <i class="fas fa-user"></i>
                            Мария Синтез
                        </span>
                    </div>
                    <h3 class="article-title">Moog Subsequent 37: Аналоговый синтез нового поколения</h3>
                    <p class="article-excerpt">Изучаем возможности нового аналогового синтезатора от Moog и его применение в современной музыке.</p>
                    <div class="article-stats">
                        <span class="article-views">
                            <i class="fas fa-eye"></i>
                            1.8k
                        </span>
                        <span class="article-likes">
                            <i class="fas fa-heart"></i>
                            89
                        </span>
                    </div>
                </div>
            </article>

            <article class="article-card">
                <div class="article-image">
                    <img src="/images/car-audio.jpg" alt="Автозвук" loading="lazy">
                    <div class="article-category">Автозвук</div>
                </div>
                <div class="article-content">
                    <div class="article-meta">
                        <span class="article-date">10 декабря 2024</span>
                        <span class="article-author">
                            <i class="fas fa-user"></i>
                            Сергей Звук
                        </span>
                    </div>
                    <h3 class="article-title">Лучшие сабвуферы 2024: Топ-10 моделей</h3>
                    <p class="article-excerpt">Сравнительный обзор самых мощных и качественных сабвуферов для автомобиля в разных ценовых категориях.</p>
                    <div class="article-stats">
                        <span class="article-views">
                            <i class="fas fa-eye"></i>
                            3.2k
                        </span>
                        <span class="article-likes">
                            <i class="fas fa-heart"></i>
                            234
                        </span>
                    </div>
                </div>
            </article>
        `;
    }
}

// ===== ГЛОБАЛЬНЫЕ ФУНКЦИИ =====
function showAuthModal(type = 'login') {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
        switchAuthTab(type);
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function switchAuthTab(type) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.auth-tab');
    const modalTitle = document.querySelector('.modal-title');

    if (type === 'login') {
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
        if (modalTitle) modalTitle.textContent = 'Вход в систему';
        tabs.forEach(tab => tab.classList.remove('active'));
        tabs[0].classList.add('active');
    } else {
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
        if (modalTitle) modalTitle.textContent = 'Регистрация';
        tabs.forEach(tab => tab.classList.remove('active'));
        tabs[1].classList.add('active');
    }
}

function logout() {
    if (window.mainPageManager) {
        window.mainPageManager.logout();
    }
}

// ===== СТИЛИ ДЛЯ МОДАЛЬНЫХ ОКОН =====
const modalStyles = `
<style>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: rgba(42, 42, 64, 0.95);
    backdrop-filter: blur(25px);
    border-radius: 20px;
    padding: 30px;
    max-width: 500px;
    width: 90%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
}

.modal-title {
    color: #fff;
    font-size: 24px;
    font-weight: 600;
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 20px;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.modal-close:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
}

.auth-tabs {
    display: flex;
    margin-bottom: 25px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.auth-tab {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    padding: 15px 25px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    border-bottom: 2px solid transparent;
    transition: all 0.3s ease;
}

.auth-tab.active {
    color: #5b5fef;
    border-bottom-color: #5b5fef;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    color: #fff;
    font-weight: 500;
    font-size: 14px;
}

.form-group input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    padding: 12px 15px;
    color: #fff;
    font-size: 16px;
    transition: all 0.3s ease;
}

.form-group input:focus {
    outline: none;
    border-color: #5b5fef;
    background: rgba(255, 255, 255, 0.15);
}

.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px 0;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    cursor: pointer;
}

.forgot-link {
    color: #5b5fef;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s ease;
}

.forgot-link:hover {
    color: #7c7fff;
}

.btn {
    padding: 12px 25px;
    border-radius: 10px;
    border: none;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.btn-primary {
    background: linear-gradient(135deg, #5b5fef, #7c7fff);
    color: #fff;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(91, 95, 239, 0.4);
}

.btn-outline {
    background: transparent;
    color: #5b5fef;
    border: 2px solid #5b5fef;
}

.btn-outline:hover {
    background: #5b5fef;
    color: #fff;
}

.btn-full {
    width: 100%;
}

.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(42, 42, 64, 0.95);
    backdrop-filter: blur(25px);
    color: #fff;
    padding: 15px 20px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    transform: translateX(400px);
    opacity: 0;
    transition: all 0.3s ease;
}

.notification.show {
    transform: translateX(0);
    opacity: 1;
}

.notification-success {
    border-left: 4px solid #4ade80;
}

.notification-error {
    border-left: 4px solid #f87171;
}

.notification-info {
    border-left: 4px solid #60a5fa;
}
</style>
`;

// Добавляем стили в head
document.head.insertAdjacentHTML('beforeend', modalStyles);

// ===== КАРУСЕЛЬ НОВИНОК =====
let currentSlide = 0;

function getSlidesPerView() {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1200) return 2;
    return 3;
}

function moveCarousel(direction) {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    
    const cards = track.querySelectorAll('.new-item-card');
    const totalSlides = cards.length;
    const slidesPerView = getSlidesPerView();
    
    if (direction === 'prev') {
        currentSlide = Math.max(0, currentSlide - 1);
    } else {
        currentSlide = Math.min(totalSlides - slidesPerView, currentSlide + 1);
    }
    
    const offset = -currentSlide * (100 / slidesPerView);
    track.style.transform = `translateX(${offset}%)`;
    
    updateIndicators();
}

function goToSlide(index) {
    currentSlide = index;
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    
    const slidesPerView = getSlidesPerView();
    const offset = -currentSlide * (100 / slidesPerView);
    track.style.transform = `translateX(${offset}%)`;
    updateIndicators();
}

// Обновление при изменении размера окна
window.addEventListener('resize', () => {
    goToSlide(0);
});

function updateIndicators() {
    const indicators = document.querySelectorAll('.carousel-dot');
    indicators.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// Автопрокрутка карусели
setInterval(() => {
    moveCarousel('next');
}, 5000);

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    window.mainPageManager = new MainPageManager();
    console.log('🎵 AutoSound Main Page загружен!');
});