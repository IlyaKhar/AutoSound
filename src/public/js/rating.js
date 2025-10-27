// ===== МЕНЕДЖЕР СТРАНИЦЫ РЕЙТИНГОВ =====
class RatingPageManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupFilters();
        this.setupSorting();
        this.loadRatings();
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
                
                // Фильтруем рейтинги
                const filter = btn.dataset.filter;
                this.filterRatings(filter);
            });
        });
    }

    filterRatings(filter) {
        const ratingCards = document.querySelectorAll('.rating-card');
        
        ratingCards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.5s ease';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // ===== СОРТИРОВКА =====
    setupSorting() {
        const sortSelect = document.querySelector('.sort-select');
        
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const sortBy = e.target.value;
                this.sortRatings(sortBy);
            });
        }
    }

    sortRatings(sortBy) {
        const container = document.querySelector('.ratings-grid');
        const cards = Array.from(container.querySelectorAll('.rating-card'));
        
        cards.sort((a, b) => {
            let valueA, valueB;
            
            switch (sortBy) {
                case 'rating':
                    valueA = parseFloat(a.querySelector('.rating-score').textContent);
                    valueB = parseFloat(b.querySelector('.rating-score').textContent);
                    return valueB - valueA;
                case 'price':
                    valueA = this.parsePrice(a.querySelector('.rating-price').textContent);
                    valueB = this.parsePrice(b.querySelector('.rating-price').textContent);
                    return valueA - valueB;
                case 'name':
                    valueA = a.querySelector('.rating-title').textContent;
                    valueB = b.querySelector('.rating-title').textContent;
                    return valueA.localeCompare(valueB);
                default:
                    return 0;
            }
        });
        
        // Переставляем карточки
        cards.forEach(card => container.appendChild(card));
    }

    parsePrice(priceText) {
        return parseInt(priceText.replace(/[^\d]/g, ''));
    }

    // ===== ЗАГРУЗКА РЕЙТИНГОВ =====
    async loadRatings() {
        try {
            const response = await fetch('http://localhost:3000/api/articles?type=rating');
            const result = await response.json();

            if (result.articles && result.articles.length > 0) {
                this.displayRatings(result.articles);
            } else {
                this.displayDefaultRatings();
            }
        } catch (error) {
            console.error('Ошибка загрузки рейтингов:', error);
            this.displayDefaultRatings();
        }
    }

    displayRatings(articles) {
        const ratingsGrid = document.querySelector('.ratings-grid');
        if (!ratingsGrid) return;

        ratingsGrid.innerHTML = articles.map((article, index) => `
            <div class="rating-card" data-category="${article.category?.slug || 'general'}">
                <div class="rating-position">${index + 1}</div>
                <div class="rating-image">
                    <img src="${article.image || 'assets/images/placeholder.svg'}" alt="${article.title}" loading="lazy">
                </div>
                <div class="rating-content">
                    <h3 class="rating-title">${article.title}</h3>
                    <div class="rating-stars">
                        ${this.generateStars(article.rating || 4.5)}
                        <span class="rating-score">${article.rating || 4.5}</span>
                    </div>
                    <p class="rating-description">${article.excerpt}</p>
                    <div class="rating-price">${article.price || 'Цена не указана'}</div>
                </div>
            </div>
        `).join('');
    }

    displayDefaultRatings() {
        const ratingsGrid = document.querySelector('.ratings-grid');
        if (!ratingsGrid) return;

        const defaultRatings = [
            {
                position: 1,
                title: "Fender Stratocaster 2024",
                rating: 4.8,
                description: "Легендарная гитара с обновленными звукоснимателями",
                price: "45 000 ₽",
                category: "guitars",
                image: "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=300&h=200&fit=crop&crop=center"
            },
            {
                position: 2,
                title: "Marshall JCM800",
                rating: 4.7,
                description: "Классический ламповый усилитель для рока",
                price: "120 000 ₽",
                category: "amplifiers",
                image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center"
            },
            {
                position: 3,
                title: "Moog Subsequent 37",
                rating: 4.6,
                description: "Аналоговый синтезатор с 37 клавишами",
                price: "85 000 ₽",
                category: "synthesizers",
                image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center"
            },
            {
                position: 4,
                title: "Pioneer DEH-S4200BT",
                rating: 4.5,
                description: "Автомагнитола с Bluetooth и USB",
                price: "15 000 ₽",
                category: "autozvuk",
                image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&crop=center"
            },
            {
                position: 5,
                title: "Yamaha P-125",
                rating: 4.4,
                description: "Цифровое пианино с 88 клавишами",
                price: "65 000 ₽",
                category: "pianos",
                image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center"
            },
            {
                position: 6,
                title: "Alpine S-S65",
                rating: 4.3,
                description: "Компонентная акустика для автомобиля",
                price: "18 500 ₽",
                category: "autozvuk",
                image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&crop=center"
            }
        ];

        ratingsGrid.innerHTML = defaultRatings.map(item => `
            <div class="rating-card" data-category="${item.category}">
                <div class="rating-position">${item.position}</div>
                <div class="rating-image">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                </div>
                <div class="rating-content">
                    <h3 class="rating-title">${item.title}</h3>
                    <div class="rating-stars">
                        ${this.generateStars(item.rating)}
                        <span class="rating-score">${item.rating}</span>
                    </div>
                    <p class="rating-description">${item.description}</p>
                    <div class="rating-price">${item.price}</div>
                </div>
            </div>
        `).join('');
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        
        // Полные звезды
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        // Половина звезды
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Пустые звезды
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
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

        // Наблюдаем за карточками рейтингов
        document.querySelectorAll('.rating-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease';
            observer.observe(card);
        });
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    window.ratingPageManager = new RatingPageManager();
    console.log('⭐ Rating Page Manager загружен!');
});
