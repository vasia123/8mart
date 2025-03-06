/**
 * Игра Mastermind (Быки и коровы) для детективной игры к 8 марта
 */
class Mastermind {
    /**
     * Создает новую игру Mastermind
     * @param {HTMLElement} container - DOM-элемент для размещения игры
     * @param {Function} [onCompleteCallback] - Функция при успешном завершении
     */
    constructor(container, onCompleteCallback = null) {
        this.container = container;
        this._onCompleteCallback = onCompleteCallback;
        this.codeLength = 4;
        this.maxAttempts = 10;
        this.currentGuess = [];
        this.attempts = [];
        this.isGameOver = false;
        this._nextHint = null; // Добавляем для хранения подсказки
        
        // Праздничные символы для кода
        this.symbols = ['🌹', '💐', '🎁', '💄', '👠', '💎'];
        
        // Генерация секретного кода
        this.secretCode = this._generateSecretCode();
    }

    /**
     * Инициализация игры
     */
    init() {
        this._createUI();
        this._addEventListeners();
        
        // Показываем инструкции при первой загрузке
        this._showInstructions();
        
        // Звуковое оповещение
        const notificationSound = document.getElementById('notification-sound');
        if (notificationSound) {
            notificationSound.play().catch(error => console.log('Не удалось воспроизвести звук:', error));
        }
    }

    /**
     * Вызывается при успешном прохождении игры
     */
    onComplete(callback) {
        this._onCompleteCallback = callback;
        return this; // Для цепочки вызовов
    }
    
    /**
     * Устанавливает текст следующей подсказки
     * @param {string} hintText - Текст подсказки
     */
    setNextHint(hintText) {
        this._nextHint = hintText;
        return this; // Для цепочки вызовов
    }

    /**
     * Генерирует случайный код
     * @private
     */
    _generateSecretCode() {
        // Создаем копию массива символов, чтобы не изменять оригинал
        const availableSymbols = [...this.symbols];
        const code = [];
        
        // Проверяем, достаточно ли уникальных символов
        if (this.codeLength > availableSymbols.length) {
            console.warn('Невозможно создать код без повторений: codeLength > количество доступных символов');
            // Если символов недостаточно, возвращаемся к оригинальному алгоритму
            for (let i = 0; i < this.codeLength; i++) {
                const randomIndex = Math.floor(Math.random() * this.symbols.length);
                code.push(this.symbols[randomIndex]);
            }
            return code;
        }
        
        // Реализация алгоритма Фишера-Йетса для перемешивания массива
        for (let i = availableSymbols.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableSymbols[i], availableSymbols[j]] = [availableSymbols[j], availableSymbols[i]];
        }
        
        // Берем первые codeLength элементов из перемешанного массива
        console.log(availableSymbols.slice(0, this.codeLength));
        return availableSymbols.slice(0, this.codeLength);
    }

    /**
     * Создает интерфейс игры
     * @private
     */
    _createUI() {
        this.container.innerHTML = `
            <div class="mastermind-container">
                <button class="rules-button">Правила</button>
                
                <div class="attempts-counter">
                    Использовано попыток: <span class="attempts-used">0</span> из <span class="attempts-total">${this.maxAttempts}</span>
                </div>
                
                <div class="mastermind-board">
                    <!-- История попыток -->
                    <div class="mastermind-attempts"></div>
                    
                    <!-- Область ввода -->
                    <div class="mastermind-input-area">
                        <div class="mastermind-guess-pegs">
                            <div class="mastermind-guess-peg empty" data-index="0"></div>
                            <div class="mastermind-guess-peg empty" data-index="1"></div>
                            <div class="mastermind-guess-peg empty" data-index="2"></div>
                            <div class="mastermind-guess-peg empty" data-index="3"></div>
                        </div>
                        
                        <!-- Символы для выбора -->
                        <div class="mastermind-colors">
                            ${this.symbols.map(symbol => 
                                `<div class="mastermind-color" data-symbol="${symbol}">${symbol}</div>`
                            ).join('')}
                        </div>
                        
                        <!-- Кнопка проверки -->
                        <button class="check-button" disabled>Проверить</button>
                    </div>
                </div>
                
                <div class="game-message hidden"></div>
            </div>
        `;
        
        // Обновляем отображение истории
        this._updateAttemptsUI();
    }
    
    /**
     * Показывает инструкции игры с использованием модального окна
     * @private
     */
    _showInstructions() {
        // Проверяем, доступен ли глобальный объект hintModal
        if (typeof hintModal !== 'undefined') {
            // Текст инструкций
            const instructionsText = `
- Загадан код из 4 символов
- Выберите символы и нажмите "Проверить"
- Зеленые точки: символ на правильной позиции
- Желтые точки: правильный символ на неправильной позиции
- Чем больше зеленых точек, тем ближе вы к решению
- У вас ${this.maxAttempts} попыток
            `;
            
            // Используем hintModal для отображения правил
            hintModal.showRules(instructionsText);
        } else {
            // Резервный вариант, если модальное окно недоступно
            const instructionsElement = this.container.querySelector('.mastermind-instructions');
            if (instructionsElement) {
                instructionsElement.classList.add('active');
                
                // Когда пользователь нажимает "Понятно", скрываем инструкции
                const startButton = this.container.querySelector('.start-game-button');
                if (startButton) {
                    startButton.addEventListener('click', () => {
                        instructionsElement.classList.remove('active');
                    });
                }
            }
        }
    }
    
    /**
     * Добавляет обработчики событий
     * @private
     */
    _addEventListeners() {
        // Обработчик для кнопки "Правила"
        const rulesButton = this.container.querySelector('.rules-button');
        rulesButton.addEventListener('click', () => {
            this._showInstructions();
        });
        
        // Выбор символа
        const colorElements = this.container.querySelectorAll('.mastermind-color');
        colorElements.forEach(element => {
            element.addEventListener('click', () => {
                if (this.isGameOver) return;
                const symbol = element.dataset.symbol;
                this._addSymbolToGuess(symbol);
            });
        });
        
        // Кнопка "Проверить"
        const checkButton = this.container.querySelector('.check-button');
        checkButton.addEventListener('click', () => {
            if (this.isGameOver) return;
            this._checkGuess();
        });
        
        // Удаление символа при клике на ячейку
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
     * @private
     */
    _addSymbolToGuess(symbol) {
        if (this.currentGuess.length < this.codeLength) {
            this.currentGuess.push(symbol);
            this._updateGuessUI();
        }
    }
    
    /**
     * Удаляет символ из текущей попытки
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
        
        // Очищаем все ячейки
        guessPegs.forEach(peg => {
            peg.textContent = '';
            peg.classList.add('empty');
        });
        
        // Заполняем символами
        for (let i = 0; i < this.currentGuess.length; i++) {
            guessPegs[i].textContent = this.currentGuess[i];
            guessPegs[i].classList.remove('empty');
        }
        
        // Активируем/деактивируем кнопку "Проверить"
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
     * Проверяет текущую попытку
     * @private
     */
    _checkGuess() {
        // Оцениваем попытку
        const result = this._evaluateGuess(this.currentGuess);
        
        // Добавляем в историю
        this.attempts.push({
            guess: [...this.currentGuess],
            result: result
        });
        
        // Обновляем отображение
        this._updateAttemptsUI();
        
        // Очищаем текущую попытку
        this._clearCurrentGuess();
        
        // Проверяем завершение игры
        if (result.exact === this.codeLength) {
            this._endGame(true);
        } else if (this.attempts.length >= this.maxAttempts) {
            this._endGame(false);
        }
    }
    
    /**
     * Оценивает попытку
     * @private
     */
    _evaluateGuess(guess) {
        let exact = 0;
        let close = 0;
        
        // Копии для подсчета
        const codeCopy = [...this.secretCode];
        const guessCopy = [...guess];
        
        // Точные совпадения
        for (let i = 0; i < this.codeLength; i++) {
            if (guessCopy[i] === codeCopy[i]) {
                exact++;
                codeCopy[i] = null;
                guessCopy[i] = null;
            }
        }
        
        // Близкие совпадения
        for (let i = 0; i < this.codeLength; i++) {
            if (guessCopy[i] !== null) {
                const indexInCode = codeCopy.indexOf(guessCopy[i]);
                if (indexInCode !== -1) {
                    close++;
                    codeCopy[indexInCode] = null;
                }
            }
        }
        
        // Возвращаем отдельно exact (точные совпадения) и close (правильный символ на неправильной позиции)
        return { exact, close };
    }
    
    /**
     * Создает строку для истории попыток
     * @private
     */
    _createAttemptRow(attemptNumber, guess, result) {
        const row = document.createElement('div');
        row.className = 'mastermind-attempt-row';
        
        // Номер попытки
        const attemptNumberEl = document.createElement('div');
        attemptNumberEl.className = 'mastermind-attempt-number';
        attemptNumberEl.textContent = attemptNumber + 1;
        row.appendChild(attemptNumberEl);
        
        // Символы попытки
        const pegsContainer = document.createElement('div');
        pegsContainer.className = 'mastermind-attempt-pegs';
        
        for (let i = 0; i < this.codeLength; i++) {
            const peg = document.createElement('div');
            peg.className = 'mastermind-peg';
            peg.textContent = guess[i];
            pegsContainer.appendChild(peg);
        }
        
        row.appendChild(pegsContainer);
        
        // Индикаторы результата
        const hintsContainer = document.createElement('div');
        hintsContainer.className = 'mastermind-attempt-hints';
        
        // Сначала добавляем точные совпадения (зеленые)
        for (let i = 0; i < result.exact; i++) {
            const hint = document.createElement('div');
            hint.className = 'mastermind-hint correct';
            hint.title = 'Символ на правильной позиции (зеленый)';
            hintsContainer.appendChild(hint);
        }
        
        // Затем добавляем близкие совпадения (желтые)
        for (let i = 0; i < result.close; i++) {
            const hint = document.createElement('div');
            hint.className = 'mastermind-hint close';
            hint.title = 'Правильный символ на неправильной позиции (желтый)';
            hintsContainer.appendChild(hint);
        }
        
        // Добавляем пустые индикаторы
        const emptyCount = this.codeLength - result.exact - result.close;
        for (let i = 0; i < emptyCount; i++) {
            const hint = document.createElement('div');
            hint.className = 'mastermind-hint empty';
            hintsContainer.appendChild(hint);
        }
        
        row.appendChild(hintsContainer);
        
        return row;
    }
    
    /**
     * Обновляет отображение истории попыток
     * @private
     */
    _updateAttemptsUI() {
        const attemptsContainer = this.container.querySelector('.mastermind-attempts');
        attemptsContainer.innerHTML = '';
        
        // Обновляем счетчик попыток
        const attemptsUsed = this.container.querySelector('.attempts-used');
        attemptsUsed.textContent = this.attempts.length;
        
        // Выделяем цифру красным цветом
        const attemptsCounterEl = this.container.querySelector('.attempts-counter');
        attemptsCounterEl.innerHTML = `Использовано попыток: <span class="attempts-used">${this.attempts.length}</span> из <span class="attempts-total">${this.maxAttempts}</span>`;
        
        // Добавляем строки с попытками
        for (let i = 0; i < this.attempts.length; i++) {
            const attempt = this.attempts[i];
            const row = this._createAttemptRow(i, attempt.guess, attempt.result);
            attemptsContainer.appendChild(row);
        }
    }
    
    /**
     * Обрабатывает завершение игры
     * @private
     */
    _endGame(success) {
        this.isGameOver = true;
        
        // Скрываем область ввода
        const inputArea = this.container.querySelector('.mastermind-input-area');
        inputArea.style.display = 'none';
        
        if (success) {
            // Проверяем доступность модального окна hint-modal
            if (typeof hintModal !== 'undefined') {
                // Показываем ТОЛЬКО сообщение об успехе, без подсказки
                setTimeout(() => {
                    hintModal.showSuccess('Поздравляем! Вы разгадали код и открыли сейф!', () => {
                        // После закрытия модального окна вызываем callback
                        if (this._onCompleteCallback) {
                            this._onCompleteCallback();
                        }
                    });
                }, 500);
            } else {
                // Если модальное окно недоступно, используем стандартный способ
                const messageElement = this.container.querySelector('.game-message');
                messageElement.classList.remove('hidden');
                messageElement.textContent = 'Поздравляем! Вы разгадали код и открыли сейф!';
                messageElement.classList.add('success');
                
                // Вызываем метод успешного завершения
                setTimeout(() => {
                    if (this._onCompleteCallback) {
                        this._onCompleteCallback();
                    }
                }, 2000);
            }
        } else {
            // Сообщение о проигрыше
            const messageElement = this.container.querySelector('.game-message');
            messageElement.classList.remove('hidden');
            messageElement.textContent = 'К сожалению, вам не удалось разгадать код. Попробуйте еще раз!';
            messageElement.classList.add('error');
            
            // Добавляем кнопку "Начать заново" только при проигрыше
            const resetButton = document.createElement('button');
            resetButton.className = 'reset-button';
            resetButton.textContent = 'Начать заново';
            resetButton.addEventListener('click', () => {
                this._resetGame();
                inputArea.style.display = 'block'; // Показываем область ввода снова
                messageElement.classList.add('hidden');
                messageElement.classList.remove('error');
                resetButton.remove(); // Удаляем кнопку
            });
            
            this.container.querySelector('.mastermind-board').appendChild(resetButton);
        }
    }
    
    /**
     * Сбрасывает игру
     * @private
     */
    _resetGame() {
        // Генерируем новый код
        this.secretCode = this._generateSecretCode();
        
        // Сбрасываем состояние
        this.currentGuess = [];
        this.attempts = [];
        this.isGameOver = false;
        
        // Очищаем текущую попытку
        this._clearCurrentGuess();
        
        // Обновляем отображение попыток
        this._updateAttemptsUI();
        
        // Сбрасываем сообщение
        const messageElement = this.container.querySelector('.game-message');
        if (messageElement) {
            messageElement.textContent = '';
            messageElement.classList.add('hidden');
            messageElement.classList.remove('success', 'error');
        }
        
        // Убедимся, что область ввода видима
        const inputArea = this.container.querySelector('.mastermind-input-area');
        if (inputArea) {
            inputArea.style.display = 'block';
        }
        
        // Сбрасываем состояние кнопки проверки
        const checkButton = this.container.querySelector('.check-button');
        if (checkButton) {
            checkButton.disabled = true;
        }
    }
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Mastermind };
} else {
    window.Mastermind = Mastermind;
}