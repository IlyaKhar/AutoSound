// ===== БОКОВОЙ ХЕДЕР =====

class Sidebar {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.toggleBtn = document.getElementById('sidebarToggle');
        this.mainContent = document.getElementById('mainContent');
        this.body = document.body;
        
        this.isCollapsed = false;
        this.isMobile = window.innerWidth <= 768;
        
        this.init();
    }
    
    init() {
        if (!this.sidebar) return;
        
        this.setupToggle();
        this.setupNavigation();
        this.setupSearch();
        this.setupAuth();
        this.setupUserMenu();
        this.setupResponsive();
        this.setupKeyboard();
        
        // Добавляем класс для стилизации
        this.body.classList.add('has-sidebar');
        
        // Создаем мобильную кнопку если нужно
        if (this.isMobile) {
            this.createMobileButton();
        }
        
        // Восстанавливаем состояние из localStorage
        this.restoreState();
    }
    
    createMobileButton() {
        // Проверяем, существует ли уже кнопка
        if (document.getElementById('mobileMenuBtn')) return;
        
        const mobileBtn = document.createElement('button');
        mobileBtn.id = 'mobileMenuBtn';
        mobileBtn.className = 'mobile-menu-btn';
        mobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
        mobileBtn.setAttribute('aria-label', 'Открыть меню');
        
        mobileBtn.addEventListener('click', () => {
            this.toggleMobile();
        });
        
        document.body.appendChild(mobileBtn);
    }
    
    removeMobileButton() {
        const mobileBtn = document.getElementById('mobileMenuBtn');
        if (mobileBtn) {
            mobileBtn.remove();
        }
    }
    
    setupToggle() {
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => {
                this.toggle();
            });
        }
    }
    
    toggle() {
        if (this.isMobile) {
            this.toggleMobile();
        } else {
            this.isCollapsed = !this.isCollapsed;
            
            if (this.isCollapsed) {
                this.collapse();
            } else {
                this.expand();
            }
            
            // Сохраняем состояние
            this.saveState();
        }
    }
    
    toggleMobile() {
        if (this.sidebar.classList.contains('mobile-open')) {
            this.closeMobile();
        } else {
            this.openMobile();
        }
    }
    
    openMobile() {
        this.sidebar.classList.add('mobile-open');
        this.sidebar.classList.remove('mobile-closed');
        this.body.style.overflow = 'hidden'; // Блокируем скролл body
        this.createOverlay();
    }
    
    closeMobile() {
        this.sidebar.classList.remove('mobile-open');
        this.sidebar.classList.add('mobile-closed');
        this.body.style.overflow = ''; // Разблокируем скролл
        this.removeOverlay();
    }
    
    createOverlay() {
        // Создаем overlay если его еще нет
        if (!document.getElementById('sidebarOverlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'sidebarOverlay';
            overlay.className = 'sidebar-overlay';
            overlay.addEventListener('click', () => {
                this.closeMobile();
            });
            document.body.appendChild(overlay);
        }
    }
    
    removeOverlay() {
        const overlay = document.getElementById('sidebarOverlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    collapse() {
        this.sidebar.classList.add('collapsed');
        this.mainContent.classList.add('sidebar-collapsed');
        this.isCollapsed = true;
    }
    
    expand() {
        this.sidebar.classList.remove('collapsed');
        this.mainContent.classList.remove('sidebar-collapsed');
        this.isCollapsed = false;
    }
    
    setupNavigation() {
        const navLinks = this.sidebar.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavigation(e, link);
            });
        });
    }
    
    handleNavigation(e, link) {
        const href = link.getAttribute('href');
        
        // Если это якорь или внешняя ссылка, не перехватываем
        if (href && (href.startsWith('#') || href.startsWith('http'))) {
            return;
        }
        
        // Убираем активный класс со всех ссылок
        const allLinks = this.sidebar.querySelectorAll('.nav-link');
        allLinks.forEach(l => l.classList.remove('active'));
        
        // Добавляем активный класс к текущей ссылке
        link.classList.add('active');
        
        // На мобильных устройствах закрываем сайдбар после клика
        if (this.isMobile) {
            this.closeMobile();
        }
    }
    
    setupSearch() {
        const searchInput = this.sidebar.querySelector('.search-input');
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(searchInput.value);
                }
            });
            
            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
        }
    }
    
    performSearch(query) {
        if (!query.trim()) return;
        
        console.log('Поиск из сайдбара:', query);
        
        // Здесь можно добавить логику поиска
        // Например, перенаправление на страницу поиска
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
    
    handleSearchInput(query) {
        // Здесь можно добавить автодополнение
        console.log('Поисковый запрос:', query);
    }
    
    setupAuth() {
        const authBtn = this.sidebar.querySelector('.auth-login-btn');
        
        if (authBtn) {
            authBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthModal();
            });
        }
    }
    
    showAuthModal() {
        // Используем существующую функцию из navigation-simple.js
        if (window.simpleNavigation) {
            window.simpleNavigation.showAuthModal('login');
        }
    }
    
    setupUserMenu() {
        const userMenuBtn = this.sidebar.querySelector('.user-menu-btn');
        const userMenu = this.sidebar.querySelector('.sidebar-user');
        
        if (userMenuBtn && userMenu) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleUserMenu();
            });
        }
    }
    
    toggleUserMenu() {
        // Здесь можно добавить логику для меню пользователя
        console.log('Переключение меню пользователя');
    }
    
    setupResponsive() {
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            
            if (wasMobile !== this.isMobile) {
                this.handleResponsiveChange();
            }
        });
    }
    
    handleResponsiveChange() {
        if (this.isMobile) {
            // На мобильных устройствах
            this.sidebar.classList.add('mobile-closed');
            this.sidebar.classList.remove('mobile-open');
            this.mainContent.classList.remove('sidebar-collapsed');
            // Закрываем мобильное меню при переходе в мобильный режим
            this.body.style.overflow = '';
            this.removeOverlay();
            // Создаем мобильную кнопку
            this.createMobileButton();
        } else {
            // На десктопе
            this.sidebar.classList.remove('mobile-closed', 'mobile-open');
            this.body.style.overflow = '';
            this.removeOverlay();
            // Удаляем мобильную кнопку
            this.removeMobileButton();
            if (this.isCollapsed) {
                this.mainContent.classList.add('sidebar-collapsed');
            }
        }
    }
    
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + B для переключения сайдбара
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                this.toggle();
            }
            
            // Escape для закрытия на мобильных
            if (e.key === 'Escape' && this.isMobile) {
                this.closeMobile();
            }
        });
    }
    
    openMobile() {
        if (this.isMobile) {
            this.sidebar.classList.add('mobile-open');
            this.sidebar.classList.remove('mobile-closed');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeMobile() {
        if (this.isMobile) {
            this.sidebar.classList.remove('mobile-open');
            this.sidebar.classList.add('mobile-closed');
            document.body.style.overflow = '';
        }
    }
    
    saveState() {
        localStorage.setItem('sidebarCollapsed', this.isCollapsed);
    }
    
    restoreState() {
        const saved = localStorage.getItem('sidebarCollapsed');
        if (saved !== null) {
            this.isCollapsed = saved === 'true';
            if (this.isCollapsed) {
                this.collapse();
            }
        }
    }
    
    // Публичные методы
    show() {
        this.sidebar.style.display = 'flex';
    }
    
    hide() {
        this.sidebar.style.display = 'none';
    }
    
    isVisible() {
        return this.sidebar.style.display !== 'none';
    }
}

// Инициализация
function initializeSidebar() {
    // Небольшая задержка чтобы убедиться что все элементы загружены
    setTimeout(() => {
        window.sidebar = new Sidebar();
    }, 100);
}

// Автоматическая инициализация при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSidebar);
} else {
    initializeSidebar();
}

// Экспорт
window.Sidebar = Sidebar;
