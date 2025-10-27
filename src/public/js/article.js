// ===== МЕНЕДЖЕР СТРАНИЦЫ СТАТЬИ =====
class ArticlePageManager {
    constructor() {
        this.articleId = this.getArticleId();
        this.init();
    }

    init() {
        this.loadArticle();
        this.setupComments();
        this.setupLikes();
        this.setupShare();
        this.setupRelatedArticles();
    }

    // ===== ПОЛУЧЕНИЕ ID СТАТЬИ =====
    getArticleId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    // ===== ЗАГРУЗКА СТАТЬИ =====
    async loadArticle() {
        if (!this.articleId) {
            this.showError('Статья не найдена');
            return;
        }

        try {
            const response = await fetch(`/api/articles/${this.articleId}`);
            const result = await response.json();

            if (result.success && result.article) {
                this.displayArticle(result.article);
            } else {
                this.showError('Статья не найдена');
            }
        } catch (error) {
            console.error('Ошибка загрузки статьи:', error);
            this.showError('Ошибка загрузки статьи');
        }
    }

    displayArticle(article) {
        // Обновляем заголовок страницы
        document.title = `${article.title} - AutoSound`;
        
        // Заполняем контент статьи
        const articleContainer = document.querySelector('.article-content');
        if (articleContainer) {
            articleContainer.innerHTML = `
                <div class="article-header">
                    <div class="article-meta">
                        <span class="article-category">${article.category?.name || 'Без категории'}</span>
                        <span class="article-date">${new Date(article.createdAt).toLocaleDateString()}</span>
                        <span class="article-author">
                            <i class="fas fa-user"></i>
                            ${article.author?.username || 'Автор'}
                        </span>
                    </div>
                    <h1 class="article-title">${article.title}</h1>
                    <p class="article-excerpt">${article.excerpt}</p>
                </div>
                
                <div class="article-image">
                    <img src="${article.image || 'assets/images/placeholder.svg'}" alt="${article.title}" loading="lazy">
                </div>
                
                <div class="article-body">
                    ${article.content || '<p>Содержимое статьи будет добавлено позже.</p>'}
                </div>
                
                <div class="article-footer">
                    <div class="article-stats">
                        <span class="article-views">
                            <i class="fas fa-eye"></i>
                            ${article.stats?.views || 0} просмотров
                        </span>
                        <span class="article-likes" data-likes="${article.stats?.likes || 0}">
                            <i class="fas fa-heart"></i>
                            ${article.stats?.likes || 0} лайков
                        </span>
                        <span class="article-comments">
                            <i class="fas fa-comments"></i>
                            ${article.comments?.length || 0} комментариев
                        </span>
                    </div>
                    
                    <div class="article-actions">
                        <button class="btn btn-outline like-btn" onclick="articlePageManager.toggleLike()">
                            <i class="fas fa-heart"></i>
                            Лайк
                        </button>
                        <button class="btn btn-outline share-btn" onclick="articlePageManager.shareArticle()">
                            <i class="fas fa-share"></i>
                            Поделиться
                        </button>
                    </div>
                </div>
            `;
        }
    }

    showError(message) {
        const articleContainer = document.querySelector('.article-content');
        if (articleContainer) {
            articleContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>${message}</h2>
                    <p>Попробуйте вернуться на <a href="index.html">главную страницу</a></p>
                </div>
            `;
        }
    }

    // ===== КОММЕНТАРИИ =====
    setupComments() {
        const commentForm = document.querySelector('.comment-form');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitComment(commentForm);
            });
        }
    }

    async submitComment(form) {
        const formData = new FormData(form);
        const commentText = formData.get('comment');
        
        if (!commentText.trim()) {
            this.showNotification('Введите текст комментария', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/articles/${this.articleId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ text: commentText })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Комментарий добавлен', 'success');
                form.reset();
                this.loadComments();
            } else {
                this.showNotification('Ошибка добавления комментария', 'error');
            }
        } catch (error) {
            console.error('Ошибка отправки комментария:', error);
            this.showNotification('Ошибка соединения', 'error');
        }
    }

    async loadComments() {
        try {
            const response = await fetch(`/api/articles/${this.articleId}/comments`);
            const result = await response.json();

            if (result.success) {
                this.displayComments(result.comments);
            }
        } catch (error) {
            console.error('Ошибка загрузки комментариев:', error);
        }
    }

    displayComments(comments) {
        const commentsContainer = document.querySelector('.comments-list');
        if (!commentsContainer) return;

        commentsContainer.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-avatar">
                    <img src="${comment.author?.avatar || 'assets/images/avatar-default.jpg'}" alt="${comment.author?.username}">
                </div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${comment.author?.username || 'Пользователь'}</span>
                        <span class="comment-date">${new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p class="comment-text">${comment.text}</p>
                </div>
            </div>
        `).join('');
    }

    // ===== ЛАЙКИ =====
    setupLikes() {
        const likeBtn = document.querySelector('.like-btn');
        if (likeBtn) {
            likeBtn.addEventListener('click', () => {
                this.toggleLike();
            });
        }
    }

    async toggleLike() {
        try {
            const response = await fetch(`/api/articles/${this.articleId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const result = await response.json();

            if (result.success) {
                const likesElement = document.querySelector('.article-likes');
                const currentLikes = parseInt(likesElement.dataset.likes);
                const newLikes = result.liked ? currentLikes + 1 : currentLikes - 1;
                
                likesElement.dataset.likes = newLikes;
                likesElement.innerHTML = `<i class="fas fa-heart"></i> ${newLikes} лайков`;
                
                const likeBtn = document.querySelector('.like-btn');
                if (result.liked) {
                    likeBtn.classList.add('liked');
                } else {
                    likeBtn.classList.remove('liked');
                }
            }
        } catch (error) {
            console.error('Ошибка лайка:', error);
        }
    }

    // ===== ПОДЕЛИТЬСЯ =====
    setupShare() {
        const shareBtn = document.querySelector('.share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareArticle();
            });
        }
    }

    shareArticle() {
        if (navigator.share) {
            navigator.share({
                title: document.title,
                text: document.querySelector('.article-excerpt')?.textContent || '',
                url: window.location.href
            });
        } else {
            // Копируем ссылку в буфер обмена
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showNotification('Ссылка скопирована в буфер обмена', 'success');
            });
        }
    }

    // ===== ПОХОЖИЕ СТАТЬИ =====
    async setupRelatedArticles() {
        try {
            const response = await fetch(`/api/articles/related/${this.articleId}`);
            const result = await response.json();

            if (result.success && result.articles) {
                this.displayRelatedArticles(result.articles);
            }
        } catch (error) {
            console.error('Ошибка загрузки похожих статей:', error);
        }
    }

    displayRelatedArticles(articles) {
        const relatedContainer = document.querySelector('.related-articles');
        if (!relatedContainer) return;

        relatedContainer.innerHTML = articles.map(article => `
            <article class="related-article">
                <div class="related-image">
                    <img src="${article.image || 'assets/images/placeholder.svg'}" alt="${article.title}" loading="lazy">
                </div>
                <div class="related-content">
                    <h3 class="related-title">
                        <a href="article.html?id=${article._id}">${article.title}</a>
                    </h3>
                    <p class="related-excerpt">${article.excerpt}</p>
                    <div class="related-meta">
                        <span class="related-date">${new Date(article.createdAt).toLocaleDateString()}</span>
                        <span class="related-views">
                            <i class="fas fa-eye"></i>
                            ${article.stats?.views || 0}
                        </span>
                    </div>
                </div>
            </article>
        `).join('');
    }

    // ===== УВЕДОМЛЕНИЯ =====
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    window.articlePageManager = new ArticlePageManager();
    console.log('📄 Article Page Manager загружен!');
});