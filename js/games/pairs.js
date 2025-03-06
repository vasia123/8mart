/**
 * Игра "Пары" для детективной игры к 8 марта
 * Упрощенная версия с исправленным отображением символов
 */
class PairsGame {
    /**
     * Создает новую игру Пары
     * @param {HTMLElement} container - DOM-элемент, в который будет помещена игра
     */
    constructor(container) {
        this.container = container;
        this._onCompleteCallback = null;
        this._nextHint = null;
        
        // Настройки игры
        this.rows = 4;
        this.cols = 4;
        this.totalPairs = 8; // rows*cols/2
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.isLocked = false; // Блокировка во время анимации
        this.gameStarted = false;
        this.gameOver = false;
        
        // Символы для карточек (тематика 8 марта и весны) - используем простые и надежные эмодзи
        this.symbols = [
            '🎁', '🌹', '💐', '🧸',
            '👑', '💍', '💎', '🌷',
            '🍓', '🍰', '🦋', '🌺'
        ];
    }
    
    /**
     * Инициализация игры и отображение интерфейса
     * @param {string} containerId - ID контейнера для игры
     * @param {Object} options - Дополнительные параметры
     */
    init(containerId, options = {}) {
        // Настройка размеров в зависимости от сложности
        if (options.difficulty === 'easy') {
            this.rows = 3;
            this.cols = 4;
            this.totalPairs = 6;
        } else if (options.difficulty === 'hard') {
            this.rows = 4;
            this.cols = 5;
            this.totalPairs = 10;
        } else {
            this.rows = 4;
            this.cols = 4;
            this.totalPairs = 8;
        }
        
        // Для мобильных устройств уменьшаем размеры
        if (window.innerWidth < 500) {
            this.cols = Math.min(this.cols, 4);
            if (this.rows * this.cols > 12) {
                this.rows = 3;
                this.cols = 4;
                this.totalPairs = 6;
            }
        }
        
        this._createUI();
        this._addInlineStyles();
        this._initGame();
        this._addEventListeners();
        
        // Показываем правила при первом запуске
        this._showRules();
    }
    
    /**
     * Устанавливает функцию обратного вызова при завершении игры
     * @param {Function} callback - Функция обратного вызова
     * @returns {PairsGame} - Текущий экземпляр для цепочки вызовов
     */
    onComplete(callback) {
        this._onCompleteCallback = callback;
        return this; // Для цепочки вызовов
    }
    
    /**
     * Устанавливает текст следующей подсказки
     * @param {string} hintText - Текст подсказки
     * @returns {PairsGame} - Текущий экземпляр для цепочки вызовов
     */
    setNextHint(hintText) {
        this._nextHint = hintText;
        return this; // Для цепочки вызовов
    }
    
    /**
     * Создает пользовательский интерфейс игры
     * @private
     */
    _createUI() {
        this.container.innerHTML = `
            <div class="memory-container">
                <div class="game-header">
                    <h2>Найди пары</h2>
                    <p>Найдите все пары одинаковых карточек</p>
                    <div class="game-controls">
                        <span class="moves-counter">Ходов: 0</span>
                        <span class="pairs-counter">Пары: 0/${this.totalPairs}</span>
                        <button class="reset-button">Начать заново</button>
                        <button class="rules-button">Правила</button>
                    </div>
                </div>
                
                <div class="memory-board"></div>
                
                <div class="game-message hidden"></div>
            </div>
        `;
    }
    
    /**
     * Исправленный метод _addInlineStyles с более специфичными селекторами 
     * и принудительным заданием grid-layout
     */
    _addInlineStyles() {
        const styleId = 'memory-game-inline-styles';
        
        // Удаляем старые стили, если они есть
        const oldStyle = document.getElementById(styleId);
        if (oldStyle) {
            oldStyle.remove();
        }
        
        // Вычисляем уникальный идентификатор для нашей игры, чтобы повысить специфичность селекторов
        const gameId = 'memory-game-' + Math.random().toString(36).substring(2, 9);
        this.container.querySelector('.memory-container').id = gameId;
        
        // Количество столбцов - выводим для отладки
        console.log(`Инициализация игры: ${this.rows} строк, ${this.cols} столбцов`);
        
        // Создаем новый элемент стиля с высокой специфичностью
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* Базовые стили для игры Memory с повышенной специфичностью */
            #${gameId} .memory-board {
                display: grid !important;
                grid-template-columns: repeat(${this.cols}, 1fr) !important;
                gap: 10px !important;
                margin: 1.5rem auto !important;
                max-width: 500px !important;
                width: 100% !important;
            }
            
            /* Упрощенный стиль карточек без 3D-эффектов */
            #${gameId} .memory-card {
                aspect-ratio: 1 / 1 !important;
                background-color: #e84a5f !important;
                border-radius: 12px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                color: white !important;
                font-size: 2rem !important;
                cursor: pointer !important;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
                transition: transform 0.2s ease, box-shadow 0.2s ease !important;
                user-select: none !important;
            }
            
            #${gameId} .memory-card:hover {
                transform: translateY(-3px) !important;
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15) !important;
            }
            
            /* Перевернутая карточка */
            #${gameId} .memory-card.flipped {
                background-color: white !important;
                color: black !important;
            }
            
            /* Найденная пара */
            #${gameId} .memory-card.matched {
                background-color: #f6ffed !important;
                box-shadow: 0 0 10px rgba(82, 196, 26, 0.3) !important;
                cursor: default !important;
            }
            
            #${gameId} .memory-card.matched:hover {
                transform: none !important;
            }
            
            /* Счетчики */
            #${gameId} .moves-counter, 
            #${gameId} .pairs-counter {
                display: inline-block !important;
                padding: 0.6rem 1rem !important;
                background-color: #f8f8f8 !important;
                border-radius: 50px !important;
                margin: 0 0.5rem !important;
                font-weight: 600 !important;
            }
            
            #${gameId} .pairs-counter {
                color: #e84a5f !important;
            }
            
            /* Сообщение */
            #${gameId} .game-message {
                width: 100% !important;
                margin-top: 1.5rem !important;
                padding: 1rem !important;
                text-align: center !important;
                border-radius: 12px !important;
                font-weight: 600 !important;
            }
            
            #${gameId} .game-message.success {
                background-color: #f6ffed !important;
                color: #52c41a !important;
                border: 1px solid #b7eb8f !important;
            }
            
            /* Скрытые элементы */
            #${gameId} .hidden {
                display: none !important;
            }
            
            /* Мобильная адаптация */
            @media (max-width: 480px) {
                #${gameId} .memory-board {
                    gap: 8px !important;
                }
                
                #${gameId} .memory-card {
                    font-size: 1.5rem !important;
                }
                
                #${gameId} .game-controls {
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                }
                
                #${gameId} .moves-counter, 
                #${gameId} .pairs-counter {
                    margin: 0.3rem 0 !important;
                }
                
                #${gameId} .reset-button, 
                #${gameId} .rules-button {
                    width: 100% !important;
                    margin-top: 0.5rem !important;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Переопределяем метод _initGame, чтобы явно задать сетку
     */
    _initGame() {
        // Очищаем состояние игры
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.isLocked = false;
        this.gameStarted = false;
        this.gameOver = false;
        
        // Создаем массив символов для карточек
        let cardSymbols = [];
        
        // Выбираем нужное количество уникальных символов
        const selectedSymbols = this._shuffleArray([...this.symbols]).slice(0, this.totalPairs);
        
        // Создаем пары символов
        for (let i = 0; i < this.totalPairs; i++) {
            cardSymbols.push(selectedSymbols[i]);
            cardSymbols.push(selectedSymbols[i]);
        }
        
        // Перемешиваем символы
        cardSymbols = this._shuffleArray(cardSymbols);
        
        // Получаем контейнер для доски
        const boardElement = this.container.querySelector('.memory-board');
        boardElement.innerHTML = '';
        
        // Принудительно устанавливаем сетку напрямую на элементе
        boardElement.style.display = 'grid';
        boardElement.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        boardElement.style.gap = '10px';
        
        // Создаем карточки - используем УПРОЩЕННЫЙ подход без вложенных элементов
        for (let i = 0; i < this.rows * this.cols; i++) {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = i;
            card.dataset.symbol = cardSymbols[i];
            
            // Изначально показываем знак вопроса
            card.textContent = '?';
            
            this.cards.push({
                element: card,
                symbol: cardSymbols[i],
                isFlipped: false,
                isMatched: false
            });
            
            boardElement.appendChild(card);
        }
        
        // Обновляем счетчики
        this._updateCounters();
        
        // Дополнительно проверяем сетку через setTimeout
        setTimeout(() => {
            if (window.getComputedStyle(boardElement).gridTemplateColumns.split(' ').length <= 2) {
                console.warn('Стили сетки не применились корректно, применяем повторно');
                boardElement.style.gridTemplateColumns = `repeat(${this.cols}, 1fr) !important`;
            }
        }, 100);
    }
    
    /**
     * Добавляет обработчики событий
     * @private
     */
    _addEventListeners() {
        // Обработчик кликов по карточкам
        const boardElement = this.container.querySelector('.memory-board');
        boardElement.addEventListener('click', (e) => {
            const cardElement = e.target.closest('.memory-card');
            if (cardElement) {
                const index = parseInt(cardElement.dataset.index);
                this._flipCard(index);
            }
        });
        
        // Обработчик кнопки сброса
        const resetButton = this.container.querySelector('.reset-button');
        resetButton.addEventListener('click', () => {
            this._resetGame();
        });
        
        // Обработчик кнопки правил
        const rulesButton = this.container.querySelector('.rules-button');
        rulesButton.addEventListener('click', () => {
            this._showRules();
        });
    }
    
    /**
     * Показывает правила игры
     * @private
     */
    _showRules() {
        // Текст правил
        const rulesText = `
- Найдите все пары одинаковых карточек
- За один ход можно открыть 2 карточки
- Если символы на карточках совпадают, они остаются открытыми
- Если символы не совпадают, карточки закрываются
- Цель игры - найти все ${this.totalPairs} пар за минимальное количество ходов
- Постарайтесь запомнить расположение символов
        `;
        
        // Проверяем доступность модального окна
        if (typeof hintModal !== 'undefined') {
            hintModal.showRules(rulesText);
        } else {
            // Если модальное окно недоступно, показываем альтернативное сообщение
            alert('Правила игры:\n' + rulesText);
        }
    }
    
    /**
     * Перемешивает массив (алгоритм Фишера-Йейтса)
     * @param {Array} array - Массив для перемешивания
     * @returns {Array} - Перемешанный массив
     * @private
     */
    _shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    /**
     * Переворачивает карточку - УПРОЩЕННАЯ версия
     * @param {number} index - Индекс карточки
     * @private
     */
    _flipCard(index) {
        // Проверяем, что игра не заблокирована и карточка не перевернута
        if (this.isLocked || 
            this.cards[index].isFlipped || 
            this.cards[index].isMatched || 
            this.flippedCards.length >= 2) {
            return;
        }
        
        // Обозначаем, что игра началась
        if (!this.gameStarted) {
            this.gameStarted = true;
        }
        
        // Переворачиваем карточку - просто меняем текст и применяем класс
        const card = this.cards[index];
        card.isFlipped = true;
        card.element.classList.add('flipped');
        card.element.textContent = card.symbol;
        
        // Добавляем в массив перевернутых карточек
        this.flippedCards.push(index);
        
        // Проверяем, есть ли совпадение
        if (this.flippedCards.length === 2) {
            this.moves++;
            this._updateCounters();
            this._checkMatch();
        }
    }
    
    /**
     * Проверяет совпадение перевернутых карточек
     * @private
     */
    _checkMatch() {
        const index1 = this.flippedCards[0];
        const index2 = this.flippedCards[1];
        
        // Если символы совпадают
        if (this.cards[index1].symbol === this.cards[index2].symbol) {
            // Отмечаем карточки как совпавшие
            this.cards[index1].isMatched = true;
            this.cards[index2].isMatched = true;
            
            this.cards[index1].element.classList.add('matched');
            this.cards[index2].element.classList.add('matched');
            
            // Увеличиваем счетчик найденных пар
            this.matchedPairs++;
            this._updateCounters();
            
            // Очищаем массив перевернутых карточек
            this.flippedCards = [];
            
            // Запускаем небольшую вибрацию для обратной связи
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
            
            // Проверяем, все ли пары найдены
            if (this.matchedPairs === this.totalPairs) {
                setTimeout(() => {
                    this._handleWin();
                }, 500);
            }
        } else {
            // Если символы не совпадают, переворачиваем карточки обратно
            this.isLocked = true;
            
            setTimeout(() => {
                // Возвращаем карточки в исходное состояние
                this.cards[index1].isFlipped = false;
                this.cards[index2].isFlipped = false;
                
                this.cards[index1].element.classList.remove('flipped');
                this.cards[index2].element.classList.remove('flipped');
                
                // Возвращаем знаки вопроса
                this.cards[index1].element.textContent = '?';
                this.cards[index2].element.textContent = '?';
                
                this.flippedCards = [];
                this.isLocked = false;
            }, 1000);
        }
    }
    
    /**
     * Обновляет счетчики ходов и найденных пар
     * @private
     */
    _updateCounters() {
        const movesCounter = this.container.querySelector('.moves-counter');
        const pairsCounter = this.container.querySelector('.pairs-counter');
        
        movesCounter.textContent = `Ходов: ${this.moves}`;
        pairsCounter.textContent = `Пары: ${this.matchedPairs}/${this.totalPairs}`;
    }
    
    /**
     * Обрабатывает выигрыш
     * @private
     */
    _handleWin() {
        this.gameOver = true;
        
        // Формируем сообщение о победе
        const message = `Поздравляем! Вы нашли все пары за ${this.moves} ходов!`;
        
        // Проверяем доступность модального окна
        if (typeof hintModal !== 'undefined') {
            // Показываем сообщение об успехе
            setTimeout(() => {
                hintModal.showSuccess(message, () => {
                    // Вызываем колбэк завершения
                    if (this._onCompleteCallback) {
                        this._onCompleteCallback();
                    }
                });
            }, 300);
        } else {
            // Если модальное окно недоступно, используем стандартный способ
            const messageElement = this.container.querySelector('.game-message');
            messageElement.classList.remove('hidden');
            messageElement.classList.add('success');
            messageElement.textContent = message;
            
            // Вызываем колбэк успешного завершения с небольшой задержкой
            setTimeout(() => {
                if (this._onCompleteCallback) {
                    this._onCompleteCallback();
                }
            }, 2000);
        }
    }
    
    /**
     * Сбрасывает игру и начинает заново
     * @private
     */
    _resetGame() {
        // Очищаем доску и инициализируем новую игру
        this._initGame();
        
        // Скрываем сообщение, если оно есть
        const messageElement = this.container.querySelector('.game-message');
        messageElement.classList.add('hidden');
        messageElement.classList.remove('success', 'error');
    }
}

// Экспортируем класс для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PairsGame };
} else {
    window.PairsGame = PairsGame;
}