/**
 * Игра "Пазл" для детективной игры к 8 марта
 * 
 * Пользователь должен перемещать части изображения, чтобы собрать правильную картинку.
 * В игре используется механика "пятнашек", где перемещение происходит в пустую клетку.
 */
class PuzzleGame {
    /**
     * Создает новую игру Пазл
     * @param {HTMLElement} container - DOM-элемент, в который будет помещена игра
     */
    constructor(container) {
        this.container = container;
        this._onCompleteCallback = null;
        this._nextHint = null;
        
        // Параметры игры
        this._size = 3; // Размер сетки (3x3 по умолчанию)
        this._difficulty = 'normal';
        this._moves = 0;
        this._isGameOver = false;
        
        // Массивы для хранения состояния пазла
        this._tiles = []; // Текущее состояние
        this._solution = []; // Правильное решение
        
        // Положение пустой ячейки
        this._emptyPos = { row: 0, col: 0 };
        
        // Изображения для пазла (в зависимости от темы)
        this._images = {
            '8march': [
                'images/puzzle/flowers.jpg',
                'images/puzzle/vaza.jpg',
                'images/puzzle/march-8.jpg'
            ],
            'default': [
                'images/puzzle/detective.jpg',
                'images/puzzle/city.jpg',
                'images/puzzle/office.jpg'
            ]
        };
        
        // Выбранное изображение
        this._currentImage = '';
        
        // Индикатор мобильного устройства
        this._isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    /**
     * Инициализация игры и отображение интерфейса
     * @param {string} containerId - ID контейнера для игры
     * @param {Object} options - Опции игры
     */
    init(containerId, options = {}) {
        // Настройка параметров в зависимости от сложности
        if (options.difficulty) {
            this._difficulty = options.difficulty;
            
            if (options.difficulty === 'easy') {
                this._size = 3;
            } else if (options.difficulty === 'hard') {
                this._size = 4;
            } else {
                this._size = 3;
            }
        }
        
        // Выбор темы
        const theme = options.theme || '8march';
        const imageArray = this._images[theme] || this._images.default;
        
        // Случайный выбор изображения из доступных для темы
        this._currentImage = imageArray[Math.floor(Math.random() * imageArray.length)];
        
        // Подготовка игры
        this._createPuzzle();
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
     * @returns {PuzzleGame} - Текущий экземпляр для цепочки вызовов
     */
    onComplete(callback) {
        this._onCompleteCallback = callback;
        return this; // Для цепочки вызовов
    }
    
    /**
     * Устанавливает текст следующей подсказки
     * @param {string} hintText - Текст подсказки
     * @returns {PuzzleGame} - Текущий экземпляр для цепочки вызовов
     */
    setNextHint(hintText) {
        this._nextHint = hintText;
        return this; // Для цепочки вызовов
    }
    
    /**
     * Создает логику пазла
     * @private
     */
    _createPuzzle() {
        // Создаем решение - последовательный массив индексов плиток
        this._solution = [];
        for (let i = 0; i < this._size * this._size; i++) {
            this._solution.push(i);
        }
        
        // Копируем решение как начальное состояние
        this._tiles = [...this._solution];
        
        // Пустая ячейка - последняя в правильном решении
        this._emptyPos = { 
            row: this._size - 1, 
            col: this._size - 1 
        };
        
        // Перемешиваем плитки (гарантируя решаемость)
        this._shuffleTiles();
        
        // Сбрасываем ходы
        this._moves = 0;
    }
    
    /**
     * Перемешивает плитки, гарантируя решаемость головоломки
     * @private
     */
    _shuffleTiles() {
        // Количество перемешиваний зависит от размера и сложности
        let shuffleCount;
        
        if (this._difficulty === 'easy') {
            shuffleCount = 20;
        } else if (this._difficulty === 'hard') {
            shuffleCount = 80;
        } else {
            shuffleCount = 40;
        }
        
        // Делаем случайные ходы для перемешивания
        for (let i = 0; i < shuffleCount; i++) {
            const possibleMoves = this._getPossibleMoves();
            if (possibleMoves.length > 0) {
                // Выбираем случайный ход из возможных
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                this._moveTile(randomMove.row, randomMove.col, false); // без обновления UI
            }
        }
    }
    
    /**
     * Получает список возможных ходов (соседей пустой ячейки)
     * @returns {Array} Массив с координатами возможных ходов
     * @private
     */
    _getPossibleMoves() {
        const moves = [];
        const { row, col } = this._emptyPos;
        
        // Проверяем ячейки вверх, вниз, влево, вправо от пустой
        const directions = [
            { dr: -1, dc: 0 }, // вверх
            { dr: 1, dc: 0 },  // вниз
            { dr: 0, dc: -1 }, // влево
            { dr: 0, dc: 1 }   // вправо
        ];
        
        for (const dir of directions) {
            const newRow = row + dir.dr;
            const newCol = col + dir.dc;
            
            // Проверяем, что новые координаты в пределах сетки
            if (newRow >= 0 && newRow < this._size && newCol >= 0 && newCol < this._size) {
                moves.push({ row: newRow, col: newCol });
            }
        }
        
        return moves;
    }
    
    /**
     * Проверяет, можно ли переместить плитку
     * @param {number} row - Строка плитки
     * @param {number} col - Столбец плитки
     * @returns {boolean} True, если плитку можно переместить
     * @private
     */
    _canMoveTile(row, col) {
        // Плитку можно переместить, если она соседняя с пустой ячейкой
        return (
            (Math.abs(row - this._emptyPos.row) === 1 && col === this._emptyPos.col) || 
            (Math.abs(col - this._emptyPos.col) === 1 && row === this._emptyPos.row)
        );
    }
    
    /**
     * Перемещает плитку в пустую ячейку
     * @param {number} row - Строка плитки
     * @param {number} col - Столбец плитки
     * @param {boolean} updateUI - Флаг обновления интерфейса
     * @private
     */
    _moveTile(row, col, updateUI = true) {
        if (this._isGameOver || !this._canMoveTile(row, col)) return;
        
        // Индексы в одномерном массиве
        const tileIndex = row * this._size + col;
        const emptyIndex = this._emptyPos.row * this._size + this._emptyPos.col;
        
        // Обмен значений
        [this._tiles[tileIndex], this._tiles[emptyIndex]] = [this._tiles[emptyIndex], this._tiles[tileIndex]];
        
        // Обновляем положение пустой ячейки
        this._emptyPos = { row, col };
        
        // Увеличиваем счетчик ходов
        if (updateUI) {
            this._moves++;
            this._updateMovesCounter();
            this._updateBoard();
            
            // Проверяем, решена ли головоломка
            if (this._checkWin()) {
                this._isGameOver = true;
                this._handleWin();
            }
        }
    }
    
    /**
     * Обновляет счетчик ходов
     * @private
     */
    _updateMovesCounter() {
        const movesCounter = this.container.querySelector('.moves-counter');
        if (movesCounter) {
            movesCounter.textContent = `Ходов: ${this._moves}`;
        }
    }
    
    /**
     * Проверяет, совпадает ли текущее расположение с решением
     * @returns {boolean} True, если головоломка решена
     * @private
     */
    _checkWin() {
        for (let i = 0; i < this._tiles.length; i++) {
            if (this._tiles[i] !== this._solution[i]) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Создает пользовательский интерфейс игры
     * @private
     */
    _createUI() {
        this.container.innerHTML = `
            <div class="puzzle-container">
                <div class="game-header">
                    <h2>Восстановите изображение</h2>
                    <p>Перемещайте фрагменты изображения, чтобы собрать правильную картинку</p>
                    <div class="game-controls">
                        <span class="moves-counter">Ходов: ${this._moves}</span>
                        <button class="reset-button">Начать заново</button>
                        <button class="rules-button">Правила</button>
                    </div>
                </div>
                
                <div class="puzzle-board" style="grid-template-columns: repeat(${this._size}, 1fr);">
                    ${this._createPuzzleTiles()}
                </div>
                
                <div class="game-message hidden"></div>
                
                <div class="preview-container">
                    <button class="preview-button">Показать образец</button>
                    <div class="puzzle-preview hidden">
                        <img src="${this._currentImage}" alt="Предварительный просмотр" class="preview-image">
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Создает HTML для плиток пазла
     * @returns {string} HTML строка с плитками
     * @private
     */
    _createPuzzleTiles() {
        let tilesHTML = '';
        
        for (let row = 0; row < this._size; row++) {
            for (let col = 0; col < this._size; col++) {
                const index = row * this._size + col;
                const tileValue = this._tiles[index];
                const isEmptyTile = tileValue === this._size * this._size - 1;
                
                // Вычисляем позицию изображения
                const originalRow = Math.floor(tileValue / this._size);
                const originalCol = tileValue % this._size;
                const bgPositionX = -(originalCol * (100 / (this._size - 1))) + '%';
                const bgPositionY = -(originalRow * (100 / (this._size - 1))) + '%';
                
                // Размер фрагмента изображения
                const bgSize = (this._size * 100) + '%';
                
                // Создаем плитку
                tilesHTML += `
                    <div class="puzzle-piece ${isEmptyTile ? 'empty' : ''}" 
                         data-row="${row}" 
                         data-col="${col}" 
                         data-value="${tileValue}"
                         ${!isEmptyTile ? `style="background-image: url('${this._currentImage}'); 
                                        background-size: ${bgSize}; 
                                        background-position: ${bgPositionX} ${bgPositionY};"` : ''}
                    ></div>
                `;
            }
        }
        
        return tilesHTML;
    }
    
    /**
     * Обновляет отображение игрового поля
     * @private
     */
    _updateBoard() {
        const puzzleBoard = this.container.querySelector('.puzzle-board');
        if (!puzzleBoard) return;
        
        // Получаем все плитки
        const tiles = puzzleBoard.querySelectorAll('.puzzle-piece');
        
        // Обновляем каждую плитку
        for (let row = 0; row < this._size; row++) {
            for (let col = 0; col < this._size; col++) {
                const index = row * this._size + col;
                const tileValue = this._tiles[index];
                const tileElement = tiles[index];
                
                // Проверяем, пустая ли это плитка
                const isEmptyTile = tileValue === this._size * this._size - 1;
                
                // Обновляем класс и атрибуты
                tileElement.className = `puzzle-piece ${isEmptyTile ? 'empty' : ''}`;
                tileElement.dataset.value = tileValue;
                
                // Обновляем стиль только для непустых плиток
                if (!isEmptyTile) {
                    const originalRow = Math.floor(tileValue / this._size);
                    const originalCol = tileValue % this._size;
                    const bgPositionX = -(originalCol * (100 / (this._size - 1))) + '%';
                    const bgPositionY = -(originalRow * (100 / (this._size - 1))) + '%';
                    const bgSize = (this._size * 100) + '%';
                    
                    tileElement.style.backgroundImage = `url('${this._currentImage}')`;
                    tileElement.style.backgroundSize = bgSize;
                    tileElement.style.backgroundPosition = `${bgPositionX} ${bgPositionY}`;
                } else {
                    tileElement.style.backgroundImage = 'none';
                }
            }
        }
    }
    
    /**
     * Добавляет обработчики событий
     * @private
     */
    _addEventListeners() {
        // Обработчик клика по плитке
        const puzzleBoard = this.container.querySelector('.puzzle-board');
        if (puzzleBoard) {
            puzzleBoard.addEventListener('click', (e) => {
                const piece = e.target.closest('.puzzle-piece');
                if (piece && !piece.classList.contains('empty')) {
                    const row = parseInt(piece.dataset.row);
                    const col = parseInt(piece.dataset.col);
                    this._moveTile(row, col);
                }
            });
        }
        
        // Обработчик для кнопки сброса
        const resetButton = this.container.querySelector('.reset-button');
        if (resetButton) {
            resetButton.addEventListener('click', () => this._resetGame());
        }
        
        // Обработчик для кнопки правил
        const rulesButton = this.container.querySelector('.rules-button');
        if (rulesButton) {
            rulesButton.addEventListener('click', () => this._showRules());
        }
        
        // Обработчик для кнопки предварительного просмотра
        const previewButton = this.container.querySelector('.preview-button');
        const previewImage = this.container.querySelector('.puzzle-preview');
        if (previewButton && previewImage) {
            previewButton.addEventListener('click', () => {
                previewImage.classList.toggle('hidden');
                previewButton.textContent = previewImage.classList.contains('hidden') 
                    ? 'Показать образец' 
                    : 'Скрыть образец';
            });
        }
        
        // Специальные обработчики для мобильных устройств
        if (this._isTouchDevice) {
            this._addTouchEventListeners();
        }
    }
    
    /**
     * Добавляет обработчики событий для сенсорных устройств
     * @private
     */
    _addTouchEventListeners() {
        // Добавляем подсказку для мобильных устройств
        const gameHeader = this.container.querySelector('.game-header');
        if (gameHeader) {
            const mobileHint = document.createElement('div');
            mobileHint.className = 'mobile-hint-box';
            mobileHint.innerHTML = '<p>Нажмите на фрагмент рядом с пустой клеткой, чтобы переместить его</p>';
            gameHeader.appendChild(mobileHint);
        }
    }
    
    /**
     * Показывает правила игры
     * @private
     */
    _showRules() {
        // Текст правил
        const rulesText = `
- Восстановите изображение, перемещая фрагменты
- Фрагменты можно перемещать только в пустую клетку
- Перемещать можно только фрагменты, соседние с пустой клеткой
- Нажмите на фрагмент, чтобы переместить его в пустую клетку
- Используйте кнопку "Показать образец", чтобы увидеть, как должно выглядеть готовое изображение
- Соберите изображение с минимальным количеством ходов!
        `;
        
        // Проверяем доступность модального окна
        if (typeof hintModal !== 'undefined') {
            hintModal.showRules(rulesText);
        } else {
            // Если модальное окно недоступно, показываем стандартное сообщение
            alert('Правила игры:\n' + rulesText);
        }
    }
    
    /**
     * Обрабатывает выигрыш
     * @private
     */
    _handleWin() {
        // Проверяем доступность модального окна
        if (typeof hintModal !== 'undefined') {
            // Показываем ТОЛЬКО сообщение об успехе, без подсказки
            hintModal.showSuccess(`Поздравляем! Вы успешно восстановили изображение за ${this._moves} ходов!`, () => {
                // После закрытия модального окна вызываем callback
                if (this._onCompleteCallback) {
                    this._onCompleteCallback();
                }
            });
        } else {
            // Если модальное окно недоступно, используем стандартный способ
            const messageElement = this.container.querySelector('.game-message');
            if (messageElement) {
                messageElement.textContent = `Поздравляем! Вы успешно восстановили изображение за ${this._moves} ходов!`;
                messageElement.classList.remove('hidden');
                messageElement.classList.add('success');
            }
            
            // Добавляем анимацию для плиток
            const puzzlePieces = this.container.querySelectorAll('.puzzle-piece');
            puzzlePieces.forEach((piece, index) => {
                setTimeout(() => {
                    piece.classList.add('completed');
                }, index * 50);
            });
            
            // Вызываем callback после небольшой задержки
            setTimeout(() => {
                if (this._onCompleteCallback) {
                    this._onCompleteCallback();
                }
            }, 2000);
        }
    }
    
    /**
     * Сбрасывает игру
     * @private
     */
    _resetGame() {
        this._isGameOver = false;
        this._moves = 0;
        this._createPuzzle();
        this._updateMovesCounter();
        this._updateBoard();
        
        // Скрываем предварительный просмотр
        const previewImage = this.container.querySelector('.puzzle-preview');
        const previewButton = this.container.querySelector('.preview-button');
        if (previewImage) {
            previewImage.classList.add('hidden');
        }
        if (previewButton) {
            previewButton.textContent = 'Показать образец';
        }
        
        // Скрываем сообщение, если оно видимо
        const messageElement = this.container.querySelector('.game-message');
        if (messageElement) {
            messageElement.classList.add('hidden');
            messageElement.classList.remove('success', 'error');
        }
    }
}

// Экспортируем класс для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PuzzleGame };
} else {
    window.PuzzleGame = PuzzleGame;
}