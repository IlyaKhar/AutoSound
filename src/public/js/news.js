// ===== МЕНЕДЖЕР СТРАНИЦЫ НОВОСТЕЙ =====
class NewsPageManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupFilters();
        this.setupSearch();
        this.loadNews();
        this.setupAnimations();
    }

    // ===== ФИЛЬТРЫ =====
    setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Убираем активный класс со всех кнопок
                filterButtons.forEach(b => b.classList.remove('active'));
                // Добавляем активный класс к текущей кнопке
                btn.classList.add('active');
                
                // Фильтруем новости
                const filter = btn.dataset.filter;
                this.filterNews(filter);
            });
        });
    }

    filterNews(filter) {
        const newsCards = document.querySelectorAll('.news-card');
        
        newsCards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.5s ease';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // ===== ПОИСК =====
    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                this.searchNews(query);
            });
        }
    }

    searchNews(query) {
        const newsCards = document.querySelectorAll('.news-card');
        
        newsCards.forEach(card => {
            const title = card.querySelector('.news-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.news-excerpt').textContent.toLowerCase();
            
            if (title.includes(query) || excerpt.includes(query)) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.5s ease';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // ===== ЗАГРУЗКА НОВОСТЕЙ =====
    async loadNews() {
        try {
            const response = await fetch('/api/articles?type=news');
            const result = await response.json();

            if (result.articles && result.articles.length > 0) {
                this.displayNews(result.articles);
            } else {
                this.displayDefaultNews();
            }
        } catch (error) {
            console.error('Ошибка загрузки новостей:', error);
            this.displayDefaultNews();
        }
    }

    displayNews(articles) {
        const newsGrid = document.querySelector('.news-grid');
        if (!newsGrid) return;

        newsGrid.innerHTML = articles.map(article => `
            <article class="news-card" data-category="${article.category?.slug || 'general'}">
                <div class="news-image">
                    <img src="${article.image || 'assets/images/placeholder.svg'}" alt="${article.title}" loading="lazy">
                    <div class="news-category">${article.category?.name || 'Новости'}</div>
                </div>
                <div class="news-content">
                    <div class="news-meta">
                        <span class="news-date">${new Date(article.createdAt).toLocaleDateString()}</span>
                        <span class="news-author">
                            <i class="fas fa-user"></i>
                            ${article.author?.username || 'Автор'}
                        </span>
                    </div>
                    <h3 class="news-title">${article.title}</h3>
                    <p class="news-excerpt">${article.excerpt}</p>
                    <div class="news-stats">
                        <span class="news-views">
                            <i class="fas fa-eye"></i>
                            ${article.stats?.views || 0}
                        </span>
                        <span class="news-likes">
                            <i class="fas fa-heart"></i>
                            ${article.stats?.likes || 0}
                        </span>
                    </div>
                </div>
            </article>
        `).join('');
    }

    displayDefaultNews() {
        const newsGrid = document.querySelector('.news-grid');
        if (!newsGrid) return;

        newsGrid.innerHTML = `
            <article class="news-card featured" data-category="music">
                <div class="news-image">
                    <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop&crop=center" alt="Новые синтезаторы 2024" loading="lazy">
                    <div class="news-category">Музыка</div>
                </div>
                <div class="news-content">
                    <div class="news-meta">
                        <span class="news-date">15 декабря 2024</span>
                        <span class="news-author">
                            <i class="fas fa-user"></i>
                            Алексей Музыкантов
                        </span>
                    </div>
                    <h3 class="news-title">Топ-10 синтезаторов 2024: Обзор лучших моделей</h3>
                    <p class="news-excerpt">Подробный обзор самых интересных синтезаторов этого года с анализом возможностей и цен.</p>
                    <div class="news-stats">
                        <span class="news-views">
                            <i class="fas fa-eye"></i>
                            2.5k
                        </span>
                        <span class="news-likes">
                            <i class="fas fa-heart"></i>
                            156
                        </span>
                    </div>
                </div>
            </article>

            <article class="news-card" data-category="autozvuk">
                <div class="news-image">
                    <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center" alt="Автозвук 2024" loading="lazy">
                    <div class="news-category">Автозвук</div>
                </div>
                <div class="news-content">
                    <div class="news-meta">
                        <span class="news-date">12 декабря 2024</span>
                        <span class="news-author">
                            <i class="fas fa-user"></i>
                            Сергей Звук
                        </span>
                    </div>
                    <h3 class="news-title">Новые технологии в автозвуке 2024</h3>
                    <p class="news-excerpt">Обзор инновационных решений для автомобильной аудиосистемы.</p>
                    <div class="news-stats">
                        <span class="news-views">
                            <i class="fas fa-eye"></i>
                            1.8k
                        </span>
                        <span class="news-likes">
                            <i class="fas fa-heart"></i>
                            89
                        </span>
                    </div>
                </div>
            </article>

            <article class="news-card" data-category="music">
                <div class="news-image">
                    <img src="https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=400&h=300&fit=crop&crop=center" alt="Гитары 2024" loading="lazy">
                    <div class="news-category">Гитары</div>
                </div>
                <div class="news-content">
                    <div class="news-meta">
                        <span class="news-date">10 декабря 2024</span>
                        <span class="news-author">
                            <i class="fas fa-user"></i>
                            Мария Гитарист
                        </span>
                    </div>
                    <h3 class="news-title">Fender представил новую линейку гитар</h3>
                    <p class="news-excerpt">Американский производитель анонсировал обновленную серию Stratocaster.</p>
                    <div class="news-stats">
                        <span class="news-views">
                            <i class="fas fa-eye"></i>
                            3.2k
                        </span>
                        <span class="news-likes">
                            <i class="fas fa-heart"></i>
                            234
                        </span>
                    </div>
                </div>
            </article>
        `;
    }

    // ===== АНИМАЦИИ =====
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

        // Наблюдаем за карточками новостей
        document.querySelectorAll('.news-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease';
            observer.observe(card);
        });
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    window.newsPageManager = new NewsPageManager();
    console.log('📰 News Page Manager загружен!');
});
