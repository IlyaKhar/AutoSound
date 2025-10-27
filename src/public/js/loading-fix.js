// ===== ИСПРАВЛЕНИЕ АНИМАЦИИ ЗАГРУЗКИ =====

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('loadingOverlay');
    const progressBar = document.getElementById('loadingProgress');
    const percentage = document.getElementById('loadingPercentage');
    const text = document.getElementById('loadingText');
    
    if (!overlay) {
        console.log('Элемент loadingOverlay не найден');
        return;
    }
    
    console.log('Запуск анимации загрузки...');
    
    let progress = 0;
    const steps = [
        { text: 'Загрузка ресурсов...', progress: 20 },
        { text: 'Инициализация компонентов...', progress: 40 },
        { text: 'Подключение к серверу...', progress: 60 },
        { text: 'Загрузка данных...', progress: 80 },
        { text: 'Финализация...', progress: 100 }
    ];
    
    let currentStep = 0;
    
    function updateProgress() {
        if (currentStep < steps.length) {
            const step = steps[currentStep];
            progress = step.progress;
            
            console.log(`Прогресс: ${progress}% - ${step.text}`);
            
            if (progressBar) {
                progressBar.style.width = progress + '%';
                progressBar.style.transition = 'width 0.5s ease';
            }
            if (percentage) {
                percentage.textContent = progress + '%';
            }
            if (text) {
                text.textContent = step.text;
            }
            
            currentStep++;
            
            if (currentStep < steps.length) {
                setTimeout(updateProgress, 600);
            } else {
                // Завершаем загрузку
                console.log('Загрузка завершена, скрываем overlay...');
                setTimeout(() => {
                    if (overlay) {
                        overlay.style.opacity = '0';
                        overlay.style.transition = 'opacity 0.5s ease';
                        setTimeout(() => {
                            overlay.style.display = 'none';
                            console.log('Overlay скрыт');
                        }, 500);
                    }
                }, 800);
            }
        }
    }
    
    // Запускаем анимацию через небольшую задержку
    setTimeout(() => {
        updateProgress();
    }, 300);
});
