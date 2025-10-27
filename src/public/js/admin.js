// ===== АДМИН ПАНЕЛЬ - JAVASCRIPT =====

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация всех функций админ панели
    initAdminTabs();
    initAdminActions();
    initAdminAnimations();
    initAdminFilters();
    initAdminNotifications();
    initAdminStats();
    initAdminModals();
});

// ===== ВКЛАДКИ АДМИН ПАНЕЛИ =====
function initAdminTabs() {
    const tabButtons = document.querySelectorAll('.admin-tab-btn');
    const tabPanels = document.querySelectorAll('.admin-tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Убираем активный класс со всех кнопок и панелей
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Добавляем активный класс к выбранной кнопке и панели
            this.classList.add('active');
            const targetPanel = document.getElementById(targetTab);
            if (targetPanel) {
                targetPanel.classList.add('active');
                
                // Анимация появления контента
                targetPanel.style.opacity = '0';
                targetPanel.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    targetPanel.style.transition = 'all 0.3s ease';
                    targetPanel.style.opacity = '1';
                    targetPanel.style.transform = 'translateY(0)';
                }, 50);
            }
        });
    });
}

// ===== ДЕЙСТВИЯ АДМИН ПАНЕЛИ =====
function initAdminActions() {
    // Быстрые действия
    const quickActions = document.querySelectorAll('.quick-action-btn');
    quickActions.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleQuickAction(action);
        });
    });

    // Действия со статьями
    const articleActions = document.querySelectorAll('.articles-table .action-btn');
    articleActions.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.classList.contains('edit') ? 'edit' :
                          this.classList.contains('view') ? 'view' :
                          this.classList.contains('delete') ? 'delete' :
                          this.classList.contains('approve') ? 'approve' :
                          this.classList.contains('publish') ? 'publish' : 'unknown';
            
            const articleRow = this.closest('.table-row');
            handleArticleAction(action, articleRow);
        });
    });

    // Действия с пользователями
    const userActions = document.querySelectorAll('.user-actions .action-btn');
    userActions.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.classList.contains('edit') ? 'edit' :
                          this.classList.contains('promote') ? 'promote' :
                          this.classList.contains('ban') ? 'ban' :
                          this.classList.contains('delete') ? 'delete' : 'unknown';
            
            const userCard = this.closest('.user-card');
            handleUserAction(action, userCard);
        });
    });

    // Действия с комментариями
    const commentActions = document.querySelectorAll('.comment-actions .action-btn');
    commentActions.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.classList.contains('approve') ? 'approve' :
                          this.classList.contains('edit') ? 'edit' :
                          this.classList.contains('spam') ? 'spam' :
                          this.classList.contains('delete') ? 'delete' :
                          this.classList.contains('ban-user') ? 'ban-user' : 'unknown';
            
            const commentItem = this.closest('.comment-item');
            handleCommentAction(action, commentItem);
        });
    });

    // Действия с категориями
    const categoryActions = document.querySelectorAll('.category-actions .action-btn');
    categoryActions.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.classList.contains('edit') ? 'edit' :
                          this.classList.contains('delete') ? 'delete' : 'unknown';
            
            const categoryCard = this.closest('.category-card');
            handleCategoryAction(action, categoryCard);
        });
    });

    // Пагинация
    const pageButtons = document.querySelectorAll('.page-btn, .page-number');
    pageButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.disabled && !this.classList.contains('active')) {
                handlePagination(this);
            }
        });
    });

    // Кнопки добавления
    const addButtons = document.querySelectorAll('.add-btn');
    addButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const context = this.closest('.admin-tab-panel').id;
            showAddModal(context);
        });
    });

    // Массовые действия
    const bulkActionBtn = document.querySelector('.bulk-action-btn');
    if (bulkActionBtn) {
        bulkActionBtn.addEventListener('click', function() {
            handleBulkAction();
        });
    }

    // Сохранение настроек
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveSettings();
        });
    }

    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            resetSettings();
        });
    }
}

// ===== АНИМАЦИИ АДМИН ПАНЕЛИ =====
function initAdminAnimations() {
    // Анимация появления элементов при скролле
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

    // Наблюдаем за элементами админ панели
    const animatedElements = document.querySelectorAll('.stat-card, .user-card, .category-card, .comment-item, .table-row');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });

    // Анимация статистики
    animateAdminStats();
}

// ===== ФИЛЬТРЫ АДМИН ПАНЕЛИ =====
function initAdminFilters() {
    const filterSelects = document.querySelectorAll('.filter-select');
    const searchInputs = document.querySelectorAll('.search-input');
    
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            const filterValue = this.value;
            const container = this.closest('.admin-tab-panel');
            filterContent(container, filterValue, 'filter');
        });
    });
    
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const container = this.closest('.admin-tab-panel');
            filterContent(container, searchTerm, 'search');
        });
    });
}

// ===== УВЕДОМЛЕНИЯ =====
function initAdminNotifications() {
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            showNotificationsPanel();
        });
    }
}

// ===== СТАТИСТИКА =====
function initAdminStats() {
    // Анимация счетчиков статистики
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const finalValue = stat.textContent;
        const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
        
        if (numericValue > 0) {
            animateCounter(stat, 0, numericValue, 2000);
        }
    });
}

// ===== МОДАЛЬНЫЕ ОКНА =====
function initAdminModals() {
    // Здесь будет инициализация модальных окон для добавления/редактирования
}

// ===== ОБРАБОТЧИКИ ДЕЙСТВИЙ =====

// Быстрые действия
function handleQuickAction(action) {
    switch(action) {
        case 'add-article':
            showAddModal('articles');
            break;
        case 'add-category':
            showAddModal('categories');
            break;
        case 'moderate-comments':
            switchToTab('comments');
            break;
        case 'backup':
            createBackup();
            break;
        default:
            showNotification(`Действие "${action}" в разработке`, 'info');
    }
}

// Действия со статьями
function handleArticleAction(action, articleRow) {
    const articleTitle = articleRow.querySelector('.article-info span').textContent;
    
    switch(action) {
        case 'edit':
            editArticle(articleRow);
            break;
        case 'view':
            viewArticle(articleRow);
            break;
        case 'delete':
            deleteArticle(articleRow, articleTitle);
            break;
        case 'approve':
            approveArticle(articleRow, articleTitle);
            break;
        case 'publish':
            publishArticle(articleRow, articleTitle);
            break;
    }
}

// Действия с пользователями
function handleUserAction(action, userCard) {
    const userName = userCard.querySelector('.user-info h4').textContent;
    
    switch(action) {
        case 'edit':
            editUser(userCard);
            break;
        case 'promote':
            promoteUser(userCard, userName);
            break;
        case 'ban':
            banUser(userCard, userName);
            break;
        case 'delete':
            deleteUser(userCard, userName);
            break;
    }
}

// Действия с комментариями
function handleCommentAction(action, commentItem) {
    const commentText = commentItem.querySelector('.comment-text').textContent;
    
    switch(action) {
        case 'approve':
            approveComment(commentItem);
            break;
        case 'edit':
            editComment(commentItem);
            break;
        case 'spam':
            markAsSpam(commentItem);
            break;
        case 'delete':
            deleteComment(commentItem);
            break;
        case 'ban-user':
            banCommentUser(commentItem);
            break;
    }
}

// Действия с категориями
function handleCategoryAction(action, categoryCard) {
    const categoryName = categoryCard.querySelector('.category-info h4').textContent;
    
    switch(action) {
        case 'edit':
            editCategory(categoryCard);
            break;
        case 'delete':
            deleteCategory(categoryCard, categoryName);
            break;
    }
}

// ===== КОНКРЕТНЫЕ ДЕЙСТВИЯ =====

// Редактирование статьи
function editArticle(articleRow) {
    const articleTitle = articleRow.querySelector('.article-info span').textContent;
    showNotification(`Редактирование статьи: ${articleTitle}`, 'info');
    // Здесь должна открываться форма редактирования
}

// Просмотр статьи
function viewArticle(articleRow) {
    const articleTitle = articleRow.querySelector('.article-info span').textContent;
    showNotification(`Просмотр статьи: ${articleTitle}`, 'info');
    // Здесь должен открываться просмотр статьи
}

// Удаление статьи
function deleteArticle(articleRow, articleTitle) {
    if (confirm(`Вы уверены, что хотите удалить статью "${articleTitle}"?`)) {
        articleRow.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            articleRow.remove();
            showNotification('Статья удалена', 'success');
            updateStats();
        }, 300);
    }
}

// Одобрение статьи
function approveArticle(articleRow, articleTitle) {
    const statusBadge = articleRow.querySelector('.status-badge');
    statusBadge.textContent = 'Опубликовано';
    statusBadge.className = 'status-badge published';
    
    showNotification(`Статья "${articleTitle}" одобрена`, 'success');
    updateStats();
}

// Публикация статьи
function publishArticle(articleRow, articleTitle) {
    const statusBadge = articleRow.querySelector('.status-badge');
    statusBadge.textContent = 'Опубликовано';
    statusBadge.className = 'status-badge published';
    
    showNotification(`Статья "${articleTitle}" опубликована`, 'success');
    updateStats();
}

// Редактирование пользователя
function editUser(userCard) {
    const userName = userCard.querySelector('.user-info h4').textContent;
    showNotification(`Редактирование пользователя: ${userName}`, 'info');
}

// Повышение пользователя
function promoteUser(userCard, userName) {
    const userRole = userCard.querySelector('.user-role');
    if (userRole.textContent === 'Пользователь') {
        userRole.textContent = 'Автор';
        userRole.className = 'user-role author';
        showNotification(`Пользователь ${userName} повышен до автора`, 'success');
    } else if (userRole.textContent === 'Автор') {
        userRole.textContent = 'Администратор';
        userRole.className = 'user-role admin';
        showNotification(`Пользователь ${userName} повышен до администратора`, 'success');
    } else {
        showNotification('Пользователь уже имеет максимальную роль', 'info');
    }
}

// Блокировка пользователя
function banUser(userCard, userName) {
    if (confirm(`Заблокировать пользователя "${userName}"?`)) {
        userCard.style.opacity = '0.5';
        userCard.style.filter = 'grayscale(100%)';
        showNotification(`Пользователь ${userName} заблокирован`, 'success');
    }
}

// Удаление пользователя
function deleteUser(userCard, userName) {
    if (confirm(`Удалить пользователя "${userName}"?`)) {
        userCard.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            userCard.remove();
            showNotification('Пользователь удален', 'success');
            updateStats();
        }, 300);
    }
}

// Одобрение комментария
function approveComment(commentItem) {
    commentItem.classList.remove('spam');
    commentItem.style.borderColor = 'rgba(76, 175, 80, 0.3)';
    commentItem.style.background = 'rgba(76, 175, 80, 0.05)';
    showNotification('Комментарий одобрен', 'success');
}

// Редактирование комментария
function editComment(commentItem) {
    showNotification('Редактирование комментария', 'info');
}

// Пометить как спам
function markAsSpam(commentItem) {
    commentItem.classList.add('spam');
    commentItem.style.borderColor = 'rgba(244, 67, 54, 0.3)';
    commentItem.style.background = 'rgba(244, 67, 54, 0.05)';
    showNotification('Комментарий помечен как спам', 'success');
}

// Удаление комментария
function deleteComment(commentItem) {
    if (confirm('Удалить этот комментарий?')) {
        commentItem.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            commentItem.remove();
            showNotification('Комментарий удален', 'success');
            updateStats();
        }, 300);
    }
}

// Блокировка автора комментария
function banCommentUser(commentItem) {
    const userName = commentItem.querySelector('.comment-header h4').textContent;
    if (confirm(`Заблокировать пользователя "${userName}"?`)) {
        showNotification(`Пользователь ${userName} заблокирован`, 'success');
    }
}

// Редактирование категории
function editCategory(categoryCard) {
    const categoryName = categoryCard.querySelector('.category-info h4').textContent;
    showNotification(`Редактирование категории: ${categoryName}`, 'info');
}

// Удаление категории
function deleteCategory(categoryCard, categoryName) {
    if (confirm(`Удалить категорию "${categoryName}"?`)) {
        categoryCard.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            categoryCard.remove();
            showNotification('Категория удалена', 'success');
        }, 300);
    }
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

// Переключение на вкладку
function switchToTab(tabId) {
    const tabBtn = document.querySelector(`[data-tab="${tabId}"]`);
    if (tabBtn) {
        tabBtn.click();
    }
}

// Фильтрация контента
function filterContent(container, value, type) {
    const items = container.querySelectorAll('.table-row, .user-card, .comment-item, .category-card');
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        let shouldShow = true;
        
        if (type === 'filter') {
            // Логика фильтрации по статусу
            if (value === 'published') {
                shouldShow = item.querySelector('.status-badge.published') !== null;
            } else if (value === 'draft') {
                shouldShow = item.querySelector('.status-badge.draft') !== null;
            } else if (value === 'pending') {
                shouldShow = item.querySelector('.status-badge.pending') !== null;
            } else if (value === 'active') {
                shouldShow = !item.style.opacity || item.style.opacity !== '0.5';
            } else if (value === 'banned') {
                shouldShow = item.style.opacity === '0.5';
            } else if (value === 'spam') {
                shouldShow = item.classList.contains('spam');
            }
        } else if (type === 'search') {
            shouldShow = text.includes(value);
        }
        
        if (shouldShow) {
            item.style.display = 'flex';
            item.style.animation = 'fadeIn 0.3s ease';
        } else {
            item.style.display = 'none';
        }
    });
}

// Показ модального окна добавления
function showAddModal(context) {
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    
    let modalContent = '';
    let modalTitle = '';
    
    switch(context) {
        case 'articles':
            modalTitle = 'Добавить статью';
            modalContent = `
                <div class="modal-body">
                    <form class="add-form">
                        <div class="form-group">
                            <label>Заголовок</label>
                            <input type="text" class="form-input" placeholder="Введите заголовок статьи">
                        </div>
                        <div class="form-group">
                            <label>Категория</label>
                            <select class="form-input">
                                <option>Гитары</option>
                                <option>Синтезаторы</option>
                                <option>Автозвук</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Содержание</label>
                            <textarea class="form-textarea" placeholder="Введите содержание статьи"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Изображение</label>
                            <input type="file" class="form-input" accept="image/*">
                        </div>
                    </form>
                </div>
            `;
            break;
        case 'categories':
            modalTitle = 'Добавить категорию';
            modalContent = `
                <div class="modal-body">
                    <form class="add-form">
                        <div class="form-group">
                            <label>Название категории</label>
                            <input type="text" class="form-input" placeholder="Введите название категории">
                        </div>
                        <div class="form-group">
                            <label>Описание</label>
                            <textarea class="form-textarea" placeholder="Введите описание категории"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Иконка</label>
                            <select class="form-input">
                                <option value="guitar">Гитара</option>
                                <option value="music">Музыка</option>
                                <option value="car">Автомобиль</option>
                            </select>
                        </div>
                    </form>
                </div>
            `;
            break;
    }
    
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${modalTitle}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                ${modalContent}
                <div class="modal-footer">
                    <button class="btn-secondary modal-cancel">Отмена</button>
                    <button class="btn-primary modal-save">Сохранить</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Стили для модального окна
    const style = document.createElement('style');
    style.textContent = `
        .admin-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
        }
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .modal-content {
            background: rgba(42, 42, 64, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            backdrop-filter: blur(20px);
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 25px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .modal-header h3 {
            color: rgba(255, 255, 255, 0.9);
            margin: 0;
            font-size: 1.3rem;
        }
        .modal-close {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            font-size: 1.5rem;
            cursor: pointer;
            transition: color 0.3s ease;
        }
        .modal-close:hover {
            color: rgba(255, 107, 129, 0.8);
        }
        .modal-body {
            padding: 25px;
        }
        .add-form {
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
            color: rgba(255, 255, 255, 0.8);
            font-weight: 500;
            font-size: 0.9rem;
        }
        .form-input, .form-textarea {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 12px 15px;
            color: rgba(255, 255, 255, 0.9);
            font-size: 0.9rem;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }
        .form-input:focus, .form-textarea:focus {
            outline: none;
            border-color: rgba(255, 107, 129, 0.5);
            background: rgba(255, 255, 255, 0.15);
        }
        .form-textarea {
            min-height: 120px;
            resize: vertical;
        }
        .modal-footer {
            display: flex;
            gap: 15px;
            justify-content: flex-end;
            padding: 20px 25px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .btn-primary, .btn-secondary {
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .btn-primary {
            background: rgba(255, 107, 129, 0.8);
            color: white;
        }
        .btn-primary:hover {
            background: rgba(255, 107, 129, 1);
        }
        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.2);
        }
    `;
    document.head.appendChild(style);
    
    // Обработчики событий
    modal.querySelector('.modal-close').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.modal-cancel').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.modal-save').addEventListener('click', () => saveItem(modal, context));
    
    // Закрытие по клику на overlay
    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeModal(modal);
        }
    });
}

// Закрытие модального окна
function closeModal(modal) {
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.9)';
    setTimeout(() => {
        document.body.removeChild(modal);
    }, 300);
}

// Сохранение элемента
function saveItem(modal, context) {
    const form = modal.querySelector('.add-form');
    const formData = new FormData(form);
    
    // Здесь должна быть отправка данных на сервер
    console.log('Сохранение:', context, Object.fromEntries(formData));
    
    showNotification(`Элемент успешно добавлен в ${context}`, 'success');
    closeModal(modal);
}

// Пагинация
function handlePagination(button) {
    if (button.classList.contains('page-number')) {
        // Убираем активный класс со всех номеров страниц
        document.querySelectorAll('.page-number').forEach(btn => btn.classList.remove('active'));
        // Добавляем активный класс к выбранной странице
        button.classList.add('active');
        
        showNotification(`Переход на страницу ${button.textContent}`, 'info');
    } else if (button.classList.contains('page-btn')) {
        const isNext = button.classList.contains('next');
        const currentPage = document.querySelector('.page-number.active');
        const currentPageNum = parseInt(currentPage.textContent);
        
        if (isNext) {
            showNotification(`Переход на страницу ${currentPageNum + 1}`, 'info');
        } else {
            showNotification(`Переход на страницу ${currentPageNum - 1}`, 'info');
        }
    }
}

// Массовые действия
function handleBulkAction() {
    showNotification('Массовое одобрение комментариев выполнено', 'success');
}

// Создание резервной копии
function createBackup() {
    showNotification('Создание резервной копии...', 'info');
    
    // Имитация создания резервной копии
    setTimeout(() => {
        showNotification('Резервная копия создана успешно', 'success');
    }, 2000);
}

// Сохранение настроек
function saveSettings() {
    showNotification('Настройки сохранены', 'success');
}

// Сброс настроек
function resetSettings() {
    if (confirm('Сбросить все настройки к значениям по умолчанию?')) {
        showNotification('Настройки сброшены', 'success');
    }
}

// Показ панели уведомлений
function showNotificationsPanel() {
    showNotification('Панель уведомлений в разработке', 'info');
}

// Анимация статистики
function animateAdminStats() {
    const stats = document.querySelectorAll('.stat-card');
    
    stats.forEach((stat, index) => {
        stat.style.opacity = '0';
        stat.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            stat.style.transition = 'all 0.6s ease';
            stat.style.opacity = '1';
            stat.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Анимация счетчиков
function animateCounter(element, start, end, duration) {
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (end - start) * progress);
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Обновление статистики
function updateStats() {
    // Здесь должна быть логика обновления статистики
    console.log('Статистика обновлена');
}

// Уведомления
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Стили для уведомлений
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10001;
            animation: slideInRight 0.3s ease;
            backdrop-filter: blur(10px);
        }
        .notification-success {
            background: rgba(76, 175, 80, 0.9);
            border: 1px solid rgba(76, 175, 80, 0.3);
        }
        .notification-info {
            background: rgba(33, 150, 243, 0.9);
            border: 1px solid rgba(33, 150, 243, 0.3);
        }
        .notification-error {
            background: rgba(244, 67, 54, 0.9);
            border: 1px solid rgba(244, 67, 54, 0.3);
        }
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(-100%); opacity: 0; }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    
    if (!document.querySelector('#admin-notification-styles')) {
        style.id = 'admin-notification-styles';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Автоматическое удаление через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}
