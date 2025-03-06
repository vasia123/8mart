/**
 * Игра Mastermind (Быки и коровы) для детективной игры к 8 марта
 * 
 * Игрок должен угадать секретный код из символов.
 * После каждой попытки игрок получает подсказки:
 * - Точное совпадение: правильный символ на правильном месте
 * - Близкое совпадение: правильный символ на неправильном месте
 */
class Mastermind {
    /**
     * Создает новую игру Mastermind
     * @param {HTMLElement} container - DOM-элемент, в который будет помещена игра
     * @param {Function} onSuccess - Колбэк, вызываемый при успешном завершении игры
     */
    constructor(container, onSuccess) {
        this.container = container;
        this.onSuccess = onSuccess;
        this.codeLength = 4; // Длина секретного кода
        this.maxAttempts = 10; // Максимальное количество попыток
        this.currentGuess = []; // Текущая попытка игрока
        this.attempts = []; // История всех попыток
        this.isGameOver = false; // Флаг завершения игры
        
        // Символы для кода (с праздничной тематикой)
        this.symbols = ['🌹', '💐', '🎁', '💄', '👠', '💎'];
        
        // Генерация секретного кода
        this.secretCode = this._generateSecretCode();
    }

    /**
     * Инициализация игры и отображение интерфейса
     */
    init() {
        this._createUI();
        this._addEventListeners();
        
        // Запускаем звук уведомления, если он существует
        const notificationSound = document.getElementById('notification-sound');
        if (notificationSound) {
            notificationSound.play().catch(error => console.log('Не удалось воспроизвести звук:', error));
        }
    }

    /**
     * Генерирует случайный секретный код
     * @returns {Array} - Массив символов секретного кода
     * @private
     */
    _generateSecretCode() {
        const code = [];
        for (let i = 0; i < this.codeLength; i++) {
            const randomIndex = Math.floor(Math.random() * this.symbols.length);
            code.push(this.symbols[randomIndex]);
        }
        return code;
    }

    /**
     * Создает пользовательский интерфейс игры
     * @private
     */
    _createUI() {
        this.container.innerHTML = `
            <div class="mastermind-container">
                <div class="game-header">
                    <h2>Шифр сейфа</h2>
                    <p>Разгадайте секретный код из 4 символов, чтобы открыть сейф с новой подсказкой.</p>
                    <div class="mastermind-legend">
                        <div class="mastermind-legend-item">
                            <span class="mastermind-hint exact"></span> - правильный символ на правильном месте
                        </div>
                        <div class="mastermind-legend-item">
                            <span class="mastermind-hint close"></span> - правильный символ на неправильном месте
                        </div>
                    </div>
                    
                    <div class="mobile-hint-box">
                        <p>Выберите символы из палитры внизу, затем нажмите "Проверить"</p>
                    </div>
                </div>
                
                <div class="mastermind-board">
                    <div class="mastermind-secret-code">
                        <div class="mastermind-code-peg hidden">?</div>
                        <div class="mastermind-code-peg hidden">?</div>
                        <div class="mastermind-code-peg hidden">?</div>
                        <div class="mastermind-code-peg hidden">?</div>
                    </div>
                    
                    <div class="mastermind-attempts"></div>
                    
                    <div class="mastermind-input">
                        <div class="mastermind-guess">
                            <div class="mastermind-guess-pegs">
                                <div class="mastermind-guess-peg empty" data-index="0"></div>
                                <div class="mastermind-guess-peg empty" data-index="1"></div>
                                <div class="mastermind-guess-peg empty" data-index="2"></div>
                                <div class="mastermind-guess-peg empty" data-index="3"></div>
                            </div>
                            <div class="mastermind-button-group">
                                <button class="check-button" disabled>Проверить</button>
                                <button class="clear-button">Очистить</button>
                            </div>
                        </div>
                        
                        <div class="mastermind-colors">
                            ${this.symbols.map(symbol => 
                                `<div class="mastermind-color" data-symbol="${symbol}">${symbol}</div>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="game-controls">
                    <button class="reset-button">Начать заново</button>
                </div>
                
                <div class="game-message hidden"></div>
            </div>
        `;
        
        // Подготавливаем область для попыток
        this._prepareAttemptRows();
    }
    
    /**
     * Создает строки для отображения истории попыток
     * @private
     */
    _prepareAttemptRows() {
        const attemptsContainer = this.container.querySelector('.mastermind-attempts');
        attemptsContainer.innerHTML = '';
        
        for (let i = 0; i < this.maxAttempts; i++) {
            const row = document.createElement('div');
            row.className = 'mastermind-attempt-row';
            row.innerHTML = `
                <div class="mastermind-attempt-number">${i + 1}</div>
                <div class="mastermind-attempt-pegs">
                    <div class="mastermind-peg"></div>
                    <div class="mastermind-peg"></div>
                    <div class="mastermind-peg"></div>
                    <div class="mastermind-peg"></div>
                </div>
                <div class="mastermind-attempt-hints">
                    <div class="mastermind-hint"></div>
                    <div class="mastermind-hint"></div>
                    <div class="mastermind-hint"></div>
                    <div class="mastermind-hint"></div>
                </div>
            `;
            attemptsContainer.appendChild(row);
        }
    }
    
    /**
     * Добавляет обработчики событий к элементам интерфейса
     * @private
     */
    _addEventListeners() {
        // Обработчик выбора символа
        const colorElements = this.container.querySelectorAll('.mastermind-color');
        colorElements.forEach(element => {
            element.addEventListener('click', () => {
                if (this.isGameOver) return;
                const symbol = element.dataset.symbol;
                this._addSymbolToGuess(symbol);
            });
        });
        
        // Обработчик кнопки проверки
        const checkButton = this.container.querySelector('.check-button');
        checkButton.addEventListener('click', () => {
            if (this.isGameOver) return;
            this._checkGuess();
        });
        
        // Обработчик кнопки очистки
        const clearButton = this.container.querySelector('.clear-button');
        clearButton.addEventListener('click', () => {
            if (this.isGameOver) return;
            this._clearCurrentGuess();
        });
        
        // Обработчик кнопки сброса
        const resetButton = this.container.querySelector('.reset-button');
        resetButton.addEventListener('click', () => {
            this._resetGame();
        });
        
        // Обработчик клика по элементам текущей попытки (для удаления)
        const guessPegs = this.container.querySelectorAll('.mastermind-guess-peg');
        guessPegs.forEach(peg => {
            peg.addEventListener('click', () => {
                if (this.isGameOver || peg.classList.contains('empty')) return;
                this._removeSymbolFromGuess(parseInt(peg.dataset.index));
            });
        });
    }
    
    /**
     * Добавляет символ в текущую попытку
     * @param {string} symbol - Выбранный символ
     * @private
     */
    _addSymbolToGuess(symbol) {
        if (this.currentGuess.length < this.codeLength) {
            this.currentGuess.push(symbol);
            this._updateGuessUI();
        }
    }
    
    /**
     * Удаляет символ из текущей попытки по индексу
     * @param {number} index - Индекс символа для удаления
     * @private
     */
    _removeSymbolFromGuess(index) {
        if (index >= 0 && index < this.currentGuess.length) {
            this.currentGuess.splice(index, 1);
            this._updateGuessUI();
        }
    }
    
    /**
     * Обновляет отображение текущей попытки
     * @private
     */
    _updateGuessUI() {
        const guessPegs = this.container.querySelectorAll('.mastermind-guess-peg');
        
        // Сначала очищаем все пеги
        guessPegs.forEach(peg => {
            peg.textContent = '';
            peg.classList.add('empty');
        });
        
        // Затем заполняем текущими символами
        for (let i = 0; i < this.currentGuess.length; i++) {
            guessPegs[i].textContent = this.currentGuess[i];
            guessPegs[i].classList.remove('empty');
        }
        
        // Активируем/деактивируем кнопку проверки
        const checkButton = this.container.querySelector('.check-button');
        checkButton.disabled = this.currentGuess.length !== this.codeLength;
    }
    
    /**
     * Очищает текущую попытку
     * @private
     */
    _clearCurrentGuess() {
        this.currentGuess = [];
        this._updateGuessUI();
    }
    
    /**
     * Проверяет текущую попытку и обновляет историю
     * @private
     */
    _checkGuess() {
        // Оцениваем текущую попытку
        const result = this._evaluateGuess(this.currentGuess);
        
        // Добавляем в историю
        this.attempts.push({
            guess: [...this.currentGuess],
            result: result
        });
        
        // Обновляем отображение истории
        this._updateAttemptsUI();
        
        // Очищаем текущую попытку
        this._clearCurrentGuess();
        
        // Проверяем, не закончилась ли игра
        if (result.exact === this.codeLength) {
            this._endGame(true);
        } else if (this.attempts.length >= this.maxAttempts) {
            this._endGame(false);
        }
    }
    
    /**
     * Оценивает попытку и возвращает количество точных и близких совпадений
     * @param {Array} guess - Текущая попытка
     * @returns {Object} - Объект с количеством точных и близких совпадений
     * @private
     */
    _evaluateGuess(guess) {
        let exact = 0;
        let close = 0;
        
        // Создаем копии для подсчета
        const codeCopy = [...this.secretCode];
        const guessCopy = [...guess];
        
        // Сначала ищем точные совпадения
        for (let i = 0; i < this.codeLength; i++) {
            if (guessCopy[i] === codeCopy[i]) {
                exact++;
                // Помечаем найденные элементы
                codeCopy[i] = null;
                guessCopy[i] = null;
            }
        }
        
        // Затем ищем близкие совпадения среди оставшихся
        for (let i = 0; i < this.codeLength; i++) {
            if (guessCopy[i] !== null) {
                const indexInCode = codeCopy.indexOf(guessCopy[i]);
                if (indexInCode !== -1) {
                    close++;
                    codeCopy[indexInCode] = null;
                }
            }
        }
        
        return { exact, close };
    }
    
    /**
     * Обновляет отображение истории попыток
     * @private
     */
    _updateAttemptsUI() {
        const attemptRows = this.container.querySelectorAll('.mastermind-attempt-row');
        
        for (let i = 0; i < this.attempts.length; i++) {
            const attempt = this.attempts[i];
            const row = attemptRows[i];
            
            // Устанавливаем символы в истории
            const pegs = row.querySelectorAll('.mastermind-peg');
            for (let j = 0; j < this.codeLength; j++) {
                pegs[j].textContent = attempt.guess[j] || '';
            }
            
            // Устанавливаем подсказки
            const hints = row.querySelectorAll('.mastermind-hint');
            let hintIndex = 0;
            
            // Точные совпадения
            for (let j = 0; j < attempt.result.exact; j++) {
                hints[hintIndex].classList.add('exact');
                hintIndex++;
            }
            
            // Близкие совпадения
            for (let j = 0; j < attempt.result.close; j++) {
                hints[hintIndex].classList.add('close');
                hintIndex++;
            }
        }
    }
    
    /**
     * Обрабатывает завершение игры
     * @param {boolean} success - Флаг успешного завершения
     * @private
     */
    _endGame(success) {
        this.isGameOver = true;
        
        // Показываем секретный код
        const secretCodePegs = this.container.querySelectorAll('.mastermind-code-peg');
        secretCodePegs.forEach((peg, index) => {
            peg.textContent = this.secretCode[index];
            peg.classList.remove('hidden');
        });
        
        // Показываем сообщение о результате
        const messageElement = this.container.querySelector('.game-message');
        messageElement.classList.remove('hidden');
        
        if (success) {
            messageElement.textContent = 'Поздравляем! Вы разгадали код и открыли сейф!';
            messageElement.classList.add('success');
            
            // Вызываем колбэк успешного завершения
            setTimeout(() => {
                if (typeof this.onSuccess === 'function') {
                    this.onSuccess();
                }
            }, 2000);
        } else {
            messageElement.textContent = 'К сожалению, вам не удалось разгадать код. Попробуйте еще раз!';
            messageElement.classList.add('error');
        }
    }
    
    /**
     * Сбрасывает игру и начинает заново
     * @private
     */
    _resetGame() {
        // Генерируем новый код
        this.secretCode = this._generateSecretCode();
        
        // Сбрасываем состояние
        this.currentGuess = [];
        this.attempts = [];
        this.isGameOver = false;
        
        // Скрываем секретный код
        const secretCodePegs = this.container.querySelectorAll('.mastermind-code-peg');
        secretCodePegs.forEach(peg => {
            peg.textContent = '?';
            peg.classList.add('hidden');
        });
        
        // Очищаем текущую попытку
        this._clearCurrentGuess();
        
        // Сбрасываем историю попыток
        this._prepareAttemptRows();
        
        // Скрываем сообщение о результате
        const messageElement = this.container.querySelector('.game-message');
        messageElement.classList.remove('hidden', 'success', 'error');
        messageElement.textContent = '';
    }
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Mastermind };
} else {
    window.Mastermind = Mastermind;
}