/**
 * Игра Анаграммы для детективной игры к 8 марта
 * 
 * Игрок должен расшифровать перемешанные буквы, чтобы получить исходное слово.
 * Слова связаны с тематикой весны и женского праздника.
 */
class Anagrams {
    /**
     * Создает новую игру Анаграммы
     * @param {HTMLElement} container - DOM-элемент, в который будет помещена игра
     */
    constructor(container) {
        this.container = container;
        this._onCompleteCallback = null;
        this.totalWords = 5; // Общее количество слов, которые нужно отгадать
        this.currentWordIndex = 0; // Текущий индекс слова
        this.maxHints = 3; // Максимальное количество подсказок
        this.hintsUsed = 0; // Количество использованных подсказок
        this.isGameOver = false;
        this._nextHint = null; // Для хранения текста следующей подсказки
        this.incorrectAttempts = 0; // Счетчик неправильных попыток
        this.maxIncorrectAttempts = 10; // Максимальное количество неправильных попыток

        // Массив слов с подсказками (женская/весенняя тематика)
        this.words = [
            { 
                word: "ВЕСНА", 
                hint: "Время года, когда природа просыпается",
                category: "Праздничное время года"
            },
            { 
                word: "ЦВЕТЫ", 
                hint: "Традиционный подарок для женщин",
                category: "Популярный праздничный презент"
            },
            { 
                word: "ТЮЛЬПАН", 
                hint: "Символ весны и один из самых популярных цветов к 8 марта",
                category: "Весенний цветок"
            },
            { 
                word: "МИМОЗА", 
                hint: "Пушистый жёлтый символ женского праздника",
                category: "Традиционный цветок к празднику"
            },
            { 
                word: "ПОДАРОК", 
                hint: "То, что принято дарить на 8 марта", 
                category: "Праздничный атрибут"
            },
            { 
                word: "ШАМПАНСКОЕ", 
                hint: "Игристый напиток для праздничного тоста", 
                category: "Праздничный напиток"
            },
            { 
                word: "КОМПЛИМЕНТ", 
                hint: "Приятные слова, которые говорят женщинам", 
                category: "Приятное высказывание"
            },
            { 
                word: "УЛЫБКА", 
                hint: "Она украшает лицо женщины", 
                category: "Выражение радости"
            },
            { 
                word: "ПРАЗДНИК", 
                hint: "8 марта - это международный женский ...", 
                category: "Особый день"
            },
            { 
                word: "КРАСОТА", 
                hint: "То, чем славятся женщины", 
                category: "Эстетическое качество"
            }
        ];
        
        // Перемешиваем слова
        this._shuffleArray(this.words);
        
        // Выбираем подмножество слов для текущей игры
        this.gameWords = this.words.slice(0, this.totalWords);
        
        // Текущее отображаемое слово (анаграмма)
        this.currentAnagram = "";
        
        // Текущее правильное слово
        this.currentWord = "";
        
        // Текущая подсказка
        this.currentHint = "";
        
        // Текущая категория
        this.currentCategory = "";
        
        // Перемешиваем первое слово
        this._prepareNextWord();
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
        
        // Показываем правила при первом запуске
        this._showRules();
    }
    
    /**
     * Устанавливает функцию обратного вызова при завершении игры
     * @param {Function} callback - Функция обратного вызова
     * @returns {Anagrams} - Текущий экземпляр для цепочки вызовов
     */
    onComplete(callback) {
        this._onCompleteCallback = callback;
        return this; // Для цепочки вызовов
    }
    
    /**
     * Устанавливает текст следующей подсказки
     * @param {string} hintText - Текст подсказки
     * @returns {Anagrams} - Текущий экземпляр для цепочки вызовов
     */
    setNextHint(hintText) {
        this._nextHint = hintText;
        return this; // Для цепочки вызовов
    }
    
    /**
     * Показывает правила игры с использованием модального окна
     * @private
     */
    _showRules() {
        // Текст правил
        const rulesText = `
- Расшифруйте перемешанные буквы, чтобы получить исходное слово
- Введите ваш ответ в текстовое поле и нажмите "Проверить"
- Категория подсказывает тематику слова
- Вы можете использовать до ${this.maxHints} подсказок
- Неправильные попытки учитываются, не более ${this.maxIncorrectAttempts}
- Для победы нужно отгадать все ${this.totalWords} слов
- Все слова связаны с весенним праздником 8 марта
        `;
        
        // Проверяем доступность модального окна
        if (typeof hintModal !== 'undefined') {
            hintModal.showRules(rulesText);
        } else {
            // Если модальное окно недоступно, показываем альтернативное сообщение
            console.log('Модальное окно недоступно, правила не показаны');
        }
    }
    
    /**
     * Перемешивает массив (алгоритм Фишера-Йейтса)
     * @param {Array} array - Массив для перемешивания
     * @private
     */
    _shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    /**
     * Перемешивает буквы в слове
     * @param {string} word - Исходное слово
     * @returns {string} - Перемешанное слово (анаграмма)
     * @private
     */
    _shuffleWord(word) {
        const letters = word.split('');
        
        // Перемешиваем буквы до тех пор, пока анаграмма не будет отличаться от исходного слова
        let shuffled;
        do {
            this._shuffleArray(letters);
            shuffled = letters.join('');
        } while (shuffled === word);
        
        return shuffled;
    }
    
    /**
     * Подготавливает следующее слово
     * @private
     */
    _prepareNextWord() {
        if (this.currentWordIndex < this.gameWords.length) {
            const wordData = this.gameWords[this.currentWordIndex];
            this.currentWord = wordData.word;
            this.currentHint = wordData.hint;
            this.currentCategory = wordData.category;
            this.currentAnagram = this._shuffleWord(this.currentWord);
            
            // Сбрасываем счетчик неправильных попыток для нового слова
            this.incorrectAttempts = 0;
        }
    }
    
    /**
     * Создает пользовательский интерфейс игры
     * @private
     */
    _createUI() {
        this.container.innerHTML = `
            <div class="anagrams-container">
                <div class="game-header">
                    <h2>Расшифровка записей</h2>
                    <p>Расшифруйте анаграммы, чтобы найти следующую подсказку. Отгадайте все ${this.totalWords} слов!</p>
                </div>
                
                <div class="anagram-progress">
                    <div class="progress-text">Слово ${this.currentWordIndex + 1} из ${this.totalWords} | Ошибок: ${this.incorrectAttempts}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(this.currentWordIndex / this.totalWords) * 100}%"></div>
                    </div>
                </div>
                
                <div class="anagram-feedback hidden"></div>
                
                <div class="anagram-card">
                    <div class="anagram-category">${this.currentCategory}</div>
                    <div class="anagram-letters">${this.currentAnagram}</div>
                    
                    <div class="anagram-input-container">
                        <input type="text" class="anagram-input" placeholder="Введите слово..." autocomplete="off">
                        <button class="check-anagram-button">Проверить</button>
                    </div>
                    
                    <div class="hints-container">
                        <button class="hint-button" style="background: linear-gradient(135deg, var(--accent-color) 0%, var(--secondary-dark) 100%); color: white;">Подсказка (${this.maxHints - this.hintsUsed} осталось)</button>
                        <div class="anagram-hint hidden"></div>
                    </div>
                </div>
                
                <div class="game-controls">
                    <button class="reset-button">Начать заново</button>
                    <button class="rules-button">Правила</button>
                </div>
            </div>
        `;
    }
    
    /**
     * Добавляет обработчики событий к элементам интерфейса
     * @private
     */
    _addEventListeners() {
        // Обработчик ввода
        const inputElement = this.container.querySelector('.anagram-input');
        inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this._checkAnswer();
            }
        });
        
        // Обработчик кнопки проверки
        const checkButton = this.container.querySelector('.check-anagram-button');
        checkButton.addEventListener('click', () => {
            this._checkAnswer();
        });
        
        // Обработчик кнопки подсказки
        const hintButton = this.container.querySelector('.hint-button');
        hintButton.addEventListener('click', () => {
            this._showWordHint();
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
     * Показывает подсказку для текущего слова
     * @private
     */
    _showWordHint() {
        if (this.hintsUsed < this.maxHints) {
            this.hintsUsed++;
            
            const hintElement = this.container.querySelector('.anagram-hint');
            const hintButton = this.container.querySelector('.hint-button');
            
            // Проверяем доступность модального окна
            if (typeof hintModal !== 'undefined') {
                hintModal.show(`Подсказка: ${this.currentHint}`, {
                    title: 'Подсказка к слову',
                    buttonText: 'Продолжить игру'
                });
            } else {
                // Если модальное окно недоступно, используем встроенное отображение
                hintElement.textContent = this.currentHint;
                hintElement.classList.remove('hidden');
            }
            
            hintButton.textContent = `Подсказка (${this.maxHints - this.hintsUsed} осталось)`;
            
            if (this.hintsUsed >= this.maxHints) {
                hintButton.disabled = true;
            }
        }
    }
    
    /**
     * Проверяет ответ игрока
     * @private
     */
    _checkAnswer() {
        if (this.isGameOver) return;
        
        const inputElement = this.container.querySelector('.anagram-input');
        const userAnswer = inputElement.value.trim().toUpperCase();
        const feedbackElement = this.container.querySelector('.anagram-feedback');
        
        // Проверяем, не пустой ли ввод
        if (!userAnswer) {
            feedbackElement.textContent = 'Введите слово!';
            feedbackElement.className = 'anagram-feedback incorrect';
            setTimeout(() => {
                feedbackElement.classList.add('hidden');
            }, 1500);
            return;
        }
        
        if (userAnswer === this.currentWord) {
            // Правильный ответ
            if (typeof hintModal !== 'undefined') {
                // Если доступно модальное окно, можем использовать его для обратной связи
                // но в данном случае это необязательно, чтобы не прерывать игровой поток
            }
            
            feedbackElement.textContent = 'Правильно! Отличная работа!';
            feedbackElement.className = 'anagram-feedback correct';
            
            // Переходим к следующему слову или заканчиваем игру
            this.currentWordIndex++;
            
            if (this.currentWordIndex >= this.totalWords) {
                this._endGame(true);
            } else {
                // Показываем следующее слово через небольшую паузу
                setTimeout(() => {
                    this._prepareNextWord();
                    this._updateUI();
                    feedbackElement.classList.add('hidden');
                }, 1500);
            }
        } else {
            // Неправильный ответ
            this.incorrectAttempts++;
            
            // Обновляем отображение неправильных попыток
            const progressTextElement = this.container.querySelector('.progress-text');
            progressTextElement.textContent = `Слово ${this.currentWordIndex + 1} из ${this.totalWords} | Ошибок: ${this.incorrectAttempts}`;
            
            // Проверяем, не превышено ли максимальное количество попыток
            if (this.incorrectAttempts >= this.maxIncorrectAttempts) {
                if (typeof hintModal !== 'undefined') {
                    hintModal.showError(`Превышено количество попыток! Правильный ответ: ${this.currentWord}`, () => {
                        // Переходим к следующему слову после закрытия модального окна
                        this.currentWordIndex++;
                        
                        if (this.currentWordIndex >= this.totalWords) {
                            this._endGame(false); // Игра окончена с поражением
                        } else {
                            this._prepareNextWord();
                            this._updateUI();
                        }
                    });
                } else {
                    feedbackElement.textContent = `Превышено количество попыток! Правильный ответ: ${this.currentWord}`;
                    feedbackElement.className = 'anagram-feedback incorrect';
                    
                    setTimeout(() => {
                        this.currentWordIndex++;
                        
                        if (this.currentWordIndex >= this.totalWords) {
                            this._endGame(false); // Игра окончена с поражением
                        } else {
                            this._prepareNextWord();
                            this._updateUI();
                            feedbackElement.classList.add('hidden');
                        }
                    }, 3000);
                }
            } else {
                // Показываем сообщение о неправильном ответе
                feedbackElement.textContent = 'Неверно. Попробуйте еще раз!';
                feedbackElement.className = 'anagram-feedback incorrect';
                
                // Очищаем поле ввода для новой попытки
                inputElement.value = '';
                inputElement.focus();
                
                // Скрываем сообщение через некоторое время
                setTimeout(() => {
                    feedbackElement.classList.add('hidden');
                }, 2000);
            }
        }
    }
    
    /**
     * Обновляет пользовательский интерфейс
     * @private
     */
    _updateUI() {
        const categoryElement = this.container.querySelector('.anagram-category');
        const anagramElement = this.container.querySelector('.anagram-letters');
        const inputElement = this.container.querySelector('.anagram-input');
        const progressTextElement = this.container.querySelector('.progress-text');
        const progressFillElement = this.container.querySelector('.progress-fill');
        const hintElement = this.container.querySelector('.anagram-hint');
        const hintButton = this.container.querySelector('.hint-button');
        
        // Обновляем текст анаграммы
        categoryElement.textContent = this.currentCategory;
        anagramElement.textContent = this.currentAnagram;
        
        // Очищаем поле ввода
        inputElement.value = '';
        inputElement.focus();
        
        // Обновляем прогресс
        progressTextElement.textContent = `Слово ${this.currentWordIndex + 1} из ${this.totalWords} | Ошибок: ${this.incorrectAttempts}`;
        progressFillElement.style.width = `${(this.currentWordIndex / this.totalWords) * 100}%`;
        
        // Обновляем текст кнопки подсказки
        hintButton.textContent = `Подсказка (${this.maxHints - this.hintsUsed} осталось)`;
        
        // Сбрасываем состояние кнопки подсказки
        if (this.hintsUsed >= this.maxHints) {
            hintButton.disabled = true;
        } else {
            hintButton.disabled = false;
        }
        
        // Скрываем подсказку
        hintElement.classList.add('hidden');
    }
    
    /**
     * Обрабатывает завершение игры
     * @param {boolean} success - Флаг успешного завершения
     * @private
     */
    _endGame(success) {
        this.isGameOver = true;
        
        if (success) {
            // Проверяем доступность модального окна
            if (typeof hintModal !== 'undefined') {
                // Показываем ТОЛЬКО сообщение об успехе, без подсказки
                hintModal.showSuccess('Поздравляем! Вы успешно расшифровали все слова!', () => {
                    // Вызываем колбэк завершения
                    if (this._onCompleteCallback) {
                        this._onCompleteCallback();
                    }
                });
            } else {
                // Если модальное окно недоступно, используем стандартный способ
                const anagramsContainer = this.container.querySelector('.anagrams-container');
                
                // Создаем сообщение об успешном завершении
                const successMessage = document.createElement('div');
                successMessage.className = 'game-message success';
                successMessage.innerHTML = `
                    <h3>Поздравляем!</h3>
                    <p>Вы успешно расшифровали все слова!</p>
                    <p>Теперь вы можете получить следующую подсказку.</p>
                `;
                
                anagramsContainer.appendChild(successMessage);
                
                // Вызываем колбэк успешного завершения с небольшой задержкой
                setTimeout(() => {
                    if (this._onCompleteCallback) {
                        this._onCompleteCallback();
                    }
                }, 2000);
            }
        } else {
            // Если игра завершена неудачей (слишком много ошибок)
            if (typeof hintModal !== 'undefined') {
                hintModal.showError('К сожалению, вы допустили слишком много ошибок. Попробуйте еще раз!', () => {
                    this._resetGame();
                });
            } else {
                const anagramsContainer = this.container.querySelector('.anagrams-container');
                
                const errorMessage = document.createElement('div');
                errorMessage.className = 'game-message error';
                errorMessage.innerHTML = `
                    <h3>Не получилось!</h3>
                    <p>К сожалению, вы допустили слишком много ошибок.</p>
                    <button class="reset-button">Попробовать еще раз</button>
                `;
                
                anagramsContainer.appendChild(errorMessage);
                
                // Добавляем обработчик для кнопки сброса
                errorMessage.querySelector('.reset-button').addEventListener('click', () => {
                    this._resetGame();
                    errorMessage.remove();
                });
            }
        }
    }
    
    /**
     * Сбрасывает игру и начинает заново
     * @private
     */
    _resetGame() {
        // Перемешиваем слова заново
        this._shuffleArray(this.words);
        
        // Выбираем новый набор слов
        this.gameWords = this.words.slice(0, this.totalWords);
        
        // Сбрасываем состояние
        this.currentWordIndex = 0;
        this.hintsUsed = 0;
        this.incorrectAttempts = 0;
        this.isGameOver = false;
        
        // Подготавливаем первое слово
        this._prepareNextWord();
        
        // Обновляем интерфейс
        this._createUI();
        this._addEventListeners();
    }
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Anagrams };
} else {
    window.Anagrams = Anagrams;
}