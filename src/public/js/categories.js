// ===== ФУНКЦИИ ДЛЯ СТРАНИЦЫ КАТЕГОРИЙ =====

class CategoriesManager {
    constructor() {
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.currentView = 'grid';
        this.articles = [];
        this.init();
    }

    init() {
        this.setupFilters();
        this.setupSorting();
        this.setupViewToggle();
        this.setupLoadMore();
        this.setupArticleCards();
        this.loadArticles();
    }

    // ===== ФИЛЬТРАЦИЯ =====
    setupFilters() {
        const filterTabs = document.querySelectorAll('.filter-tab');
        
        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.setActiveFilter(tab);
                this.filterArticles(filter);
            });
        });
    }

    setActiveFilter(activeTab) {
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        activeTab.classList.add('active');
    }

    filterArticles(filter) {
        this.currentFilter = filter;
        const articles = document.querySelectorAll('.article-card');
        
        articles.forEach(article => {
            const category = article.dataset.category;
            
            if (filter === 'all' || category === filter) {
                article.classList.remove('filtered-out');
                article.classList.add('filtered-in');
            } else {
                article.classList.remove('filtered-in');
                article.classList.add('filtered-out');
            }
        });

        // Анимация появления отфильтрованных статей
        setTimeout(() => {
            this.animateFilteredArticles();
        }, 100);
    }

    animateFilteredArticles() {
        const visibleArticles = document.querySelectorAll('.article-card.filtered-in');
        visibleArticles.forEach((article, index) => {
            article.style.animation = 'none';
            article.offsetHeight; // Trigger reflow
            article.style.animation = `fadeInUp 0.6s ease forwards`;
            article.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // ===== СОРТИРОВКА =====
    setupSorting() {
        const sortSelect = document.querySelector('.sort-select');
        
        sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.sortArticles();
        });
    }

    sortArticles() {
        const articlesContainer = document.getElementById('articlesGrid');
        const articles = Array.from(articlesContainer.children);
        
        articles.sort((a, b) => {
            switch (this.currentSort) {
                case 'newest':
                    return this.compareByDate(a, b, 'desc');
                case 'popular':
                    return this.compareByViews(a, b, 'desc');
                case 'rating':
                    return this.compareByRating(a, b, 'desc');
                case 'alphabetical':
                    return this.compareByTitle(a, b, 'asc');
                default:
                    return 0;
            }
        });

        // Переставляем статьи в DOM
        articles.forEach(article => {
            articlesContainer.appendChild(article);
        });

        // Анимация перестановки
        this.animateSortedArticles();
    }

    compareByDate(a, b, order) {
        const dateA = new Date(a.querySelector('.article-date').textContent);
        const dateB = new Date(b.querySelector('.article-date').textContent);
        return order === 'desc' ? dateB - dateA : dateA - dateB;
    }

    compareByViews(a, b, order) {
        const viewsA = parseInt(a.dataset.views);
        const viewsB = parseInt(b.dataset.views);
        return order === 'desc' ? viewsB - viewsA : viewsA - viewsB;
    }

    compareByRating(a, b, order) {
        const ratingA = parseFloat(a.dataset.rating);
        const ratingB = parseFloat(b.dataset.rating);
        return order === 'desc' ? ratingB - ratingA : ratingA - ratingB;
    }

    compareByTitle(a, b, order) {
        const titleA = a.querySelector('.article-title').textContent.toLowerCase();
        const titleB = b.querySelector('.article-title').textContent.toLowerCase();
        if (order === 'asc') {
            return titleA.localeCompare(titleB);
        } else {
            return titleB.localeCompare(titleA);
        }
    }

    animateSortedArticles() {
        const articles = document.querySelectorAll('.article-card');
        articles.forEach((article, index) => {
            article.style.animation = 'none';
            article.offsetHeight; // Trigger reflow
            article.style.animation = `fadeInUp 0.4s ease forwards`;
            article.style.animationDelay = `${index * 0.05}s`;
        });
    }

    // ===== ПЕРЕКЛЮЧЕНИЕ ВИДА =====
    setupViewToggle() {
        const viewToggles = document.querySelectorAll('.view-toggle');
        
        viewToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.setActiveViewToggle(toggle);
                this.switchView(view);
            });
        });
    }

    setActiveViewToggle(activeToggle) {
        document.querySelectorAll('.view-toggle').forEach(toggle => {
            toggle.classList.remove('active');
        });
        activeToggle.classList.add('active');
    }

    switchView(view) {
        this.currentView = view;
        const articlesGrid = document.getElementById('articlesGrid');
        
        if (view === 'list') {
            articlesGrid.classList.add('list-view');
        } else {
            articlesGrid.classList.remove('list-view');
        }

        // Анимация переключения
        articlesGrid.style.opacity = '0.5';
        setTimeout(() => {
            articlesGrid.style.opacity = '1';
        }, 300);
    }

    // ===== КНОПКА "ПОКАЗАТЬ ЕЩЕ" =====
    setupLoadMore() {
        const loadMoreBtn = document.querySelector('.load-more-btn');
        
        loadMoreBtn.addEventListener('click', () => {
            this.loadMoreArticles();
        });
    }

    loadMoreArticles() {
        const loadMoreBtn = document.querySelector('.load-more-btn');
        const articlesGrid = document.getElementById('articlesGrid');
        
        // Показываем индикатор загрузки
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
        loadMoreBtn.disabled = true;
        
        // Имитация загрузки
        setTimeout(() => {
            this.addMoreArticles();
            loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Показать еще статьи';
            loadMoreBtn.disabled = false;
        }, 1500);
    }

    addMoreArticles() {
        const articlesGrid = document.getElementById('articlesGrid');
        const newArticles = this.generateMockArticles(3);
        
        newArticles.forEach((article, index) => {
            const articleElement = this.createArticleElement(article);
            articleElement.style.opacity = '0';
            articleElement.style.transform = 'translateY(30px)';
            articlesGrid.appendChild(articleElement);
            
            // Анимация появления
            setTimeout(() => {
                articleElement.style.transition = 'all 0.6s ease';
                articleElement.style.opacity = '1';
                articleElement.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    generateMockArticles(count) {
        const categories = ['guitars', 'synthesizers', 'drums', 'midi', 'piano'];
        const titles = [
            'Новый обзор Gibson Les Paul Studio',
            'Roland TR-8S: Драм-машина будущего',
            'Yamaha PSR-E473: Цифровое пианино для начинающих',
            'Akai MPK Mini MK3: Обновленная версия',
            'Fender Telecaster: Классика в современном исполнении'
        ];
        
        const authors = ['Алексей Музыкантов', 'Мария Синтез', 'Дмитрий Барабан', 'Кирилл MIDI', 'Петр Пианист'];
        
        return Array.from({ length: count }, (_, index) => ({
            id: Date.now() + index,
            title: titles[index % titles.length],
            category: categories[index % categories.length],
            author: authors[index % authors.length],
            rating: (4.0 + Math.random() * 1.0).toFixed(1),
            views: Math.floor(Math.random() * 3000) + 1000,
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU'),
            image: `https://via.placeholder.com/400x250/${this.getRandomColor()}/ffffff?text=Новая+статья+${index + 1}`,
            excerpt: 'Подробный обзор с анализом звука, качества сборки и практическими рекомендациями для музыкантов.'
        }));
    }

    getRandomColor() {
        const colors = ['ff6b81', 'b84ef0', '5b5fef', 'ffa502', '00d2d3'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    createArticleElement(article) {
        const articleElement = document.createElement('article');
        articleElement.className = 'article-card';
        articleElement.dataset.category = article.category;
        articleElement.dataset.rating = article.rating;
        articleElement.dataset.views = article.views;
        
        articleElement.innerHTML = `
            <div class="article-image">
                <img src="${article.image}" alt="${article.title}">
                <div class="article-badge">Новое</div>
                <div class="article-rating">
                    <i class="fas fa-star"></i>
                    <span>${article.rating}</span>
                </div>
            </div>
            <div class="article-content">
                <div class="article-meta">
                    <span class="article-category">${this.getCategoryName(article.category)}</span>
                    <span class="article-date">${article.date}</span>
                </div>
                <h3 class="article-title">${article.title}</h3>
                <p class="article-excerpt">${article.excerpt}</p>
                <div class="article-footer">
                    <div class="article-author">
                        <img src="https://via.placeholder.com/32x32/2a2a40/ffffff?text=${article.author.charAt(0)}" alt="Автор" class="author-avatar">
                        <span class="author-name">${article.author}</span>
                    </div>
                    <div class="article-stats">
                        <span class="stat">
                            <i class="fas fa-eye"></i>
                            ${this.formatNumber(article.views)}
                        </span>
                        <span class="stat">
                            <i class="fas fa-heart"></i>
                            ${Math.floor(Math.random() * 200) + 50}
                        </span>
                    </div>
                </div>
            </div>
        `;
        
        return articleElement;
    }

    getCategoryName(category) {
        const names = {
            'guitars': 'Гитары',
            'synthesizers': 'Синтезаторы',
            'drums': 'Барабаны',
            'midi': 'MIDI',
            'piano': 'Пианино'
        };
        return names[category] || category;
    }

    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }

    // ===== КАРТОЧКИ СТАТЕЙ =====
    setupArticleCards() {
        // Обработка кликов по карточкам
        document.addEventListener('click', (e) => {
            const articleCard = e.target.closest('.article-card');
            if (articleCard) {
                this.openArticle(articleCard);
            }
        });

        // Обработка наведения на карточки
        document.addEventListener('mouseenter', (e) => {
            const articleCard = e.target.closest('.article-card');
            if (articleCard) {
                this.highlightArticle(articleCard);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            const articleCard = e.target.closest('.article-card');
            if (articleCard) {
                this.unhighlightArticle(articleCard);
            }
        }, true);
    }

    openArticle(articleCard) {
        const title = articleCard.querySelector('.article-title').textContent;
        const category = articleCard.dataset.category;
        
        // Переход на страницу статьи
        const articleId = this.generateArticleId(title);
        window.location.href = `article.html?id=${articleId}&category=${category}`;
    }

    generateArticleId(title) {
        return title.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
    }

    highlightArticle(articleCard) {
        articleCard.style.transform = 'translateY(-8px) scale(1.02)';
        articleCard.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
    }

    unhighlightArticle(articleCard) {
        articleCard.style.transform = 'translateY(0) scale(1)';
        articleCard.style.boxShadow = '';
    }

    // ===== ЗАГРУЗКА СТАТЕЙ =====
    loadArticles() {
        // Имитация загрузки статей
        console.log('Загрузка статей для категории...');
        this.showLoadingState();
        
        setTimeout(() => {
            this.hideLoadingState();
            this.animateArticlesOnLoad();
        }, 1000);
    }

    showLoadingState() {
        const articlesGrid = document.getElementById('articlesGrid');
        articlesGrid.classList.add('loading');
    }

    hideLoadingState() {
        const articlesGrid = document.getElementById('articlesGrid');
        articlesGrid.classList.remove('loading');
    }

    animateArticlesOnLoad() {
        const articles = document.querySelectorAll('.article-card');
        articles.forEach((article, index) => {
            article.style.animation = 'none';
            article.offsetHeight; // Trigger reflow
            article.style.animation = `fadeInUp 0.6s ease forwards`;
            article.style.animationDelay = `${index * 0.1}s`;
        });
    }
}

// ===== ДОПОЛНИТЕЛЬНЫЕ АНИМАЦИИ =====
const additionalStyles = `
<style>
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.article-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.filter-tab {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.view-toggle {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.load-more-btn {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.load-more-btn:hover {
    transform: translateY(-2px);
}

.load-more-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}
</style>
`;

// Добавляем стили в head
document.head.insertAdjacentHTML('beforeend', additionalStyles);

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    new CategoriesManager();
    console.log('🎵 AutoSound Categories загружен!');
});
