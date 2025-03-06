/**
 * Основной модуль приложения Детективной игры "Дело о пропавших розах"
 * Управляет состоянием игры, загрузкой этапов и их инициализацией
 */
class DetectiveGame {
    constructor() {
        this._stages = QUEST_STAGES; // Импортируем данные из story.js
        this._progressManager = new ProgressManager();
        this._currentStage = null;
        this._gameInstance = null;
        
        // Предзагрузка необходимых модулей
        this._gameModules = {
            minesweeper: MinesweeperGame,
            mastermind: Mastermind,
            anagrams: Anagrams,
            quiz: Quiz,
            puzzle: PuzzleGame,
            match3: Match3Game,
            pairs: PairsGame
        };
        
        this._initialize();
    }
    
    /**
     * Инициализация приложения и определение текущего этапа
     * @private
     */
    _initialize() {
        // Определяем текущий этап из URL
        const urlParams = new URLSearchParams(window.location.search);
        const stageKey = urlParams.get('stage');
        
        // Проверяем наличие ключа этапа
        if (!stageKey) {
            // Если ключа нет, показываем стартовый экран
            this._showStartScreen();
            return;
        }
        
        // Получаем этап по ключу
        const stage = getStageByKey(stageKey);
        if (!stage) {
            // Если этап не найден, показываем стартовый экран
            this._showStartScreen();
            return;
        }
        
        // Проверяем доступность этапа (прогресс)
        if (stage.id > 1 && !this._progressManager.isStageAvailable(stage.id)) {
            this._showAccessDeniedMessage();
            return;
        }
        
        this._loadStage(stage);
    }
    
    /**
     * Показывает стартовый экран игры
     * @private
     */
    _showStartScreen() {
        const mainContainer = document.getElementById('main-container');
        mainContainer.innerHTML = `
            <div class="start-screen">
                <h1>Дело о пропавших розах</h1>
                <div class="detective-large">🕵️‍♀️</div>
                <p>Добро пожаловать в детективную игру!<br>Для начала расследования отсканируйте QR-код в офисе.</p>
                <p>Приключение начнётся с первой локации возле кофемашины.</p>
                <button class="start-button" id="reset-progress-btn">Сбросить прогресс</button>
            </div>
        `;
        
        // Добавляем обработчик для кнопки сброса прогресса
        document.getElementById('reset-progress-btn').addEventListener('click', () => {
            this._progressManager.resetProgress();
            alert('Прогресс сброшен. Теперь вы можете начать игру заново.');
        });
    }
    
    /**
     * Загрузка этапа по ID
     * @param {number} stageId - ID этапа
     * @private
     */
    _loadStageById(stageId) {
        const stage = getStageById(stageId);
        if (!stage) {
            console.error('Ошибка: указанный этап не найден');
            return;
        }
        
        this._loadStage(stage);
    }
    
    /**
     * Загрузка и инициализация указанного этапа игры
     * @param {Object} stage - Объект этапа
     * @private
     */
    _loadStage(stage) {
        this._currentStage = stage;
        
        // Устанавливаем заголовок страницы (без указания локации)
        document.title = `Дело о пропавших розах`;
        
        // Отображаем сюжетный текст
        this._renderStoryText();
        
        // Инициализируем игру
        this._initializeGame();
    }
    
    /**
     * Отображение сюжетного текста для текущего этапа
     * @private
     */
    _renderStoryText() {
        const storyContainer = document.getElementById('story-container');
        
        // Устанавливаем текст истории
        const storyText = document.getElementById('story-text');
        storyText.textContent = this._currentStage.storyText;
        
        // Показываем детектива и текст
        const detectiveContainer = document.getElementById('detective-container');
        detectiveContainer.classList.remove('hidden');
        storyContainer.classList.remove('hidden');
    }
    
    /**
     * Инициализация игры для текущего этапа
     * @private
     */
    _initializeGame() {
        const gameContainer = document.getElementById('game-container');
        gameContainer.innerHTML = ''; // Очищаем контейнер
        
        // Получаем тип игры из текущего этапа
        const gameType = this._currentStage.game;
        
        // Проверяем, есть ли такой тип игры
        if (!this._gameModules[gameType]) {
            gameContainer.innerHTML = `
                <div class="error-message">
                    <h3>Ошибка загрузки игры</h3>
                    <p>К сожалению, игра "${gameType}" пока не реализована.</p>
                    <p>Пожалуйста, сообщите организатору об этой ошибке.</p>
                </div>
            `;
            return;
        }
        
        try {
            // Создаем экземпляр игры используя предзагруженный класс
            this._gameInstance = new this._gameModules[gameType](gameContainer);
            
            // Устанавливаем текст подсказки для следующего этапа
            if (this._currentStage.nextHint) {
                this._gameInstance.setNextHint(this._currentStage.nextHint);
            }
            
            // Инициализируем игру
            this._gameInstance.init(gameContainer.id, {
                theme: '8march',
                difficulty: this._currentStage.difficulty || 'normal'
            });
            
            // Устанавливаем обработчик завершения игры
            this._gameInstance.onComplete(() => this._handleGameCompletion());
        } catch (error) {
            console.error('Ошибка инициализации игры:', error);
            gameContainer.innerHTML = `
                <div class="error-message">
                    <h3>Ошибка инициализации игры</h3>
                    <p>Произошла ошибка при запуске игры.</p>
                    <p>Пожалуйста, сообщите организатору об этой ошибке.</p>
                    <pre class="error-details">${error.message}</pre>
                </div>
            `;
        }
    }
    
    /**
     * Обработка завершения мини-игры
     * @private
     */
    _handleGameCompletion() {
        // Отмечаем этап как пройденный
        this._progressManager.markStageCompleted(this._currentStage.id);
        
        // Проверяем, доступен ли компонент hintModal
        if (typeof hintModal !== 'undefined') {
            // Используем модальное окно для отображения подсказки
            const options = {
                title: 'Следующая подсказка'
            };
            
            // Если это последний этап, добавляем кнопку завершения
            if (this._currentStage.id === this._stages.length) {
                options.buttonText = 'Завершить расследование';
                options.callback = () => this._showFinalMessage();
            }
            
            // Показываем подсказку в модальном окне
            hintModal.show(this._currentStage.nextHint, options);
            
            // Вибрация для мобильных устройств
            if ('vibrate' in navigator) {
                navigator.vibrate([100, 50, 100]);
            }
        } else {
            // Если модальное окно недоступно, используем стандартный способ отображения
            // Получаем контейнер подсказки
            const hintContainer = document.getElementById('hint-container');
            const hintText = document.getElementById('hint-text');
            
            // Добавляем текст подсказки
            hintText.textContent = this._currentStage.nextHint;
            
            // Очищаем предыдущую кнопку завершения, если она есть
            const oldFinishButton = hintContainer.querySelector('.finish-button');
            if (oldFinishButton) {
                oldFinishButton.remove();
            }
            
            // Если это последний этап - показываем кнопку завершения
            if (this._currentStage.id === this._stages.length) {
                const finishButton = document.createElement('button');
                finishButton.className = 'finish-button';
                finishButton.textContent = 'Завершить расследование';
                finishButton.addEventListener('click', () => this._showFinalMessage());
                
                hintContainer.appendChild(finishButton);
            }
            
            // Показываем подсказку
            hintContainer.classList.remove('hidden');
            
            // Вибрация для мобильных устройств
            if ('vibrate' in navigator) {
                navigator.vibrate([100, 50, 100]);
            }
            
            // Прокрутка к подсказке
            setTimeout(() => {
                hintContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }
    
    /**
     * Воспроизвести звук уведомления
     * @private
     */
    _playNotificationSound() {
        try {
            const audio = new Audio('sounds/notification.mp3');
            audio.volume = 0.5;
            
            // Проверяем, поддерживает ли браузер автовоспроизведение
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Автовоспроизведение звука заблокировано браузером');
                });
            }
        } catch (e) {
            console.log('Ошибка воспроизведения звука', e);
        }
    }
    
    /**
     * Показ сообщения о недоступности этапа
     * @private
     */
    _showAccessDeniedMessage() {
        const mainContainer = document.getElementById('main-container');
        mainContainer.innerHTML = `
            <div class="access-denied">
                <h2>Этот этап расследования еще недоступен!</h2>
                <p>Детектив настаивает на последовательном расследовании.</p>
                <p>Пожалуйста, пройдите предыдущие этапы, прежде чем продолжить.</p>
                <button onclick="window.location.href='?stage=${getFirstStage().stageKey}'">Вернуться к началу</button>
            </div>
        `;
    }
    
    /**
     * Показ финального сообщения при завершении всех этапов
     * @private
     */
    _showFinalMessage() {
        // Проверяем, доступно ли модальное окно
        if (typeof hintModal !== 'undefined') {
            // Используем модальное окно для финального сообщения
            hintModal.showSuccess(`
Поздравляем! Дело раскрыто!

Вы блестяще прошли все испытания и разгадали тайну пропавших роз.
Оказалось, что розы были спрятаны, чтобы подготовить для вас особый сюрприз!

Пожалуйста, обратитесь к организатору игры для получения вашего заслуженного приза.
            `, () => {
                // После закрытия модального окна показываем финальный экран
                this._renderFinalScreen();
            });
        } else {
            // Если модальное окно недоступно, сразу показываем финальный экран
            this._renderFinalScreen();
        }
    }
    
    /**
     * Отображение финального экрана
     * @private
     */
    _renderFinalScreen() {
        const mainContainer = document.getElementById('main-container');
        mainContainer.innerHTML = `
            <div class="final-message">
                <h1>Поздравляем! Дело раскрыто!</h1>
                <p>Вы блестяще прошли все испытания и разгадали тайну пропавших роз.</p>
                <p>Оказалось, что розы были спрятаны, чтобы подготовить для вас особый сюрприз!</p>
                <p>Пожалуйста, обратитесь к организатору игры для получения вашего заслуженного приза.</p>
                <div class="final-image">🌹✨🎁</div>
            </div>
        `;
    }
}

// Инициализация приложения при загрузке документа
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем наличие скрипта hint-modal.js
    // Если его нет, динамически создаем его
    if (typeof hintModal === 'undefined') {
        const script = document.createElement('script');
        script.src = 'js/components/hint-modal.js';
        script.onload = () => {
            console.log('HintModal загружен');
        };
        script.onerror = () => {
            console.warn('Не удалось загрузить HintModal, используем альтернативный режим');
        };
        document.head.appendChild(script);
    }
    
    window.gameApp = new DetectiveGame();
});