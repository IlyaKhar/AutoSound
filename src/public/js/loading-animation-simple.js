// ===== ПРОСТАЯ АНИМАЦИЯ ЗАГРУЗКИ =====

class LoadingAnimation {
    constructor() {
        this.overlay = document.getElementById('loadingOverlay');
        this.progressBar = document.getElementById('loadingProgress');
        this.percentage = document.getElementById('loadingPercentage');
        this.text = document.getElementById('loadingText');
        
        this.loadingSteps = [
            { text: 'Загрузка ресурсов...', progress: 20 },
            { text: 'Инициализация компонентов...', progress: 40 },
            { text: 'Подключение к серверу...', progress: 60 },
            { text: 'Загрузка данных...', progress: 80 },
            { text: 'Финализация...', progress: 100 }
        ];
        
        this.currentStep = 0;
        this.isComplete = false;
        
        this.init();
    }
    
    init() {
        if (!this.overlay) return;
        
        // Показываем анимацию загрузки
        this.showLoading();
        
        // Запускаем процесс загрузки
        this.startLoading();
    }
    
    showLoading() {
        this.overlay.style.display = 'flex';
        this.overlay.classList.remove('hidden');
    }
    
    hideLoading() {
        this.overlay.classList.add('hidden');
        setTimeout(() => {
            this.overlay.style.display = 'none';
        }, 500);
    }
    
    startLoading() {
        this.updateProgress(0, 'Инициализация...');
        
        // Симулируем загрузку с реалистичными задержками
        setTimeout(() => this.loadStep(0), 500);
        setTimeout(() => this.loadStep(1), 1200);
        setTimeout(() => this.loadStep(2), 2000);
        setTimeout(() => this.loadStep(3), 2800);
        setTimeout(() => this.loadStep(4), 3500);
        
        // Завершаем загрузку
        setTimeout(() => this.completeLoading(), 4000);
    }
    
    loadStep(stepIndex) {
        if (stepIndex >= this.loadingSteps.length) return;
        
        const step = this.loadingSteps[stepIndex];
        this.updateProgress(step.progress, step.text);
        this.currentStep = stepIndex;
    }
    
    updateProgress(progress, text) {
        if (this.progressBar) {
            this.progressBar.style.width = `${progress}%`;
        }
        
        if (this.percentage) {
            this.percentage.textContent = `${progress}%`;
        }
        
        if (this.text) {
            this.text.textContent = text;
        }
    }
    
    completeLoading() {
        this.updateProgress(100, 'Готово!');
        this.isComplete = true;
        
        // Скрываем анимацию через небольшую задержку
        setTimeout(() => {
            this.hideLoading();
            this.onComplete();
        }, 800);
    }
    
    onComplete() {
        // Событие завершения загрузки
        document.dispatchEvent(new CustomEvent('loadingComplete'));
        
        // Инициализируем другие компоненты
        this.initializeComponents();
    }
    
    initializeComponents() {
        // Инициализация навигации
        if (typeof initializeNavigation === 'function') {
            initializeNavigation();
        }
        
        // Инициализация аутентификации
        if (typeof initializeAuth === 'function') {
            initializeAuth();
        }
        
        // Инициализация сайдбара
        if (typeof initializeSidebar === 'function') {
            initializeSidebar();
        }
    }
}

// Экспорт для использования в других модулях
window.LoadingAnimation = LoadingAnimation;