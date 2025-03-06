/**
 * Мини-игра "Весенний пазл"
 * Головоломка с перемещением частей изображения
 */
class PuzzleGame {
    /**
     * Создает экземпляр игры Пазл
     */
    constructor() {
        this._container = null;
        this._gridSize = 3; // 3x3 пазл по умолчанию
        this._pieces = [];
        this._completeCallback = null;
        this._solved = false;
        this._moves = 0;
        
        // Изображения для пазла
        this._images = [
            'puzzle-flowers.jpg',
            'puzzle-march8.jpg',
            'puzzle-spring.jpg'
        ];
        this._selectedImage = '';
    }
    
    /**
     * Инициализирует игру в указанном контейнере
     * @param {string} containerId - ID контейнера для игры
     * @param {Object} options - Опции игры (тема, сложность)
     */
    init(containerId, options = {}) {
        this._container = document.getElementById(containerId);
        if (!this._container) {
            console.error('Контейнер не найден');
            return;
        }
        
        // Настраиваем сложность
        if (options.difficulty === 'easy') {
            this._gridSize = 2; // 2x2
        } else if (options.difficulty === 'hard') {
            this._gridSize = 4; // 4x4
        } else {
            this._gridSize = 3; // 3x3 (нормальная сложность)
        }
        
        // Выбираем случайное изображение
        this._selectedImage = this._images[Math.floor(Math.random() * this._images.length)];
        
        // Создаем интерфейс игры
        this._render();
        
        // Подготавливаем пазл
        this._setupPuzzle();
    }
    
    /**
     * Отрисовывает интерфейс игры
     * @private
     */
    _render() {
        this._container.innerHTML = '';
        this._container.className = 'game-container puzzle-container';
        
        // Создаем заголовок
        const header = document.createElement('div');
        header.className = 'game-header';
        header.innerHTML = `
            <h2>Весенний пазл</h2>
            <p>Восстановите изображение, перемещая части головоломки</p>
            <div class="game-controls">
                <span class="moves-counter">Ходы: <span id="moves-count">0</span></span>
                <button class="reset-button">Начать заново</button>
            </div>
        `;
        this._container.appendChild(header);
        
        // Создаем контейнер для пазла
        const puzzleBoard = document.createElement('div');
        puzzleBoard.className = 'puzzle-board';
        puzzleBoard.style.gridTemplateColumns = `repeat(${this._gridSize}, 1fr)`;
        puzzleBoard.style.gridTemplateRows = `repeat(${this._gridSize}, 1fr)`;
        puzzleBoard.id = 'puzzle-board';
        this._container.appendChild(puzzleBoard);
        
        // Настраиваем размер доски
        puzzleBoard.style.aspectRatio = '1 / 1';
        puzzleBoard.style.maxWidth = '500px';
        puzzleBoard.style.margin = '0 auto';
        
        // Добавляем обработчик для кнопки сброса
        header.querySelector('.reset-button').addEventListener('click', () => this._resetGame());
    }
    
    /**
     * Настраивает игровой пазл с изображением
     * @private
     */
    _setupPuzzle() {
        const puzzleBoard = document.getElementById('puzzle-board');
        this._pieces = [];
        puzzleBoard.innerHTML = '';
        
        // Генерируем части пазла
        const totalPieces = this._gridSize * this._gridSize;
        for (let i = 0; i < totalPieces - 1; i++) {
            this._pieces.push({
                currentIndex: i,
                correctIndex: i
            });
        }
        
        // Добавляем пустую ячейку
        this._pieces.push({
            currentIndex: totalPieces - 1,
            correctIndex: null,
            isEmpty: true
        });
        
        // Перемешиваем пазл (убедившись, что он решаем)
        this._shufflePuzzle();
        
        // Отображаем части пазла
        this._renderPieces();
        
        // Добавляем обработчики событий для перемещения частей
        puzzleBoard.addEventListener('click', (e) => {
            const piece = e.target.closest('.puzzle-piece');
            if (piece) {
                const index = parseInt(piece.dataset.index);
                this._movePiece(index);
            }
        });
    }
    
    /**
     * Перемешивает пазл, гарантируя решаемость
     * @private
     */
    _shufflePuzzle() {
        // Находим пустую ячейку
        const emptyIndex = this._pieces.findIndex(piece => piece.isEmpty);
        
        // Выполняем случайные перемещения для перемешивания
        for (let i = 0; i < 100; i++) {
            const movableIndices = this._getMovablePieceIndices();
            if (movableIndices.length > 0) {
                const randomIndex = movableIndices[Math.floor(Math.random() * movableIndices.length)];
                this._swapPieces(randomIndex, emptyIndex);
            }
        }
        
        // Сбрасываем счетчик ходов
        this._moves = 0;
        document.getElementById('moves-count').textContent = '0';
    }
    
    /**
     * Отрисовывает части пазла на доске
     * @private
     */
    _renderPieces() {
        const puzzleBoard = document.getElementById('puzzle-board');
        puzzleBoard.innerHTML = '';
        
        for (let i = 0; i < this._pieces.length; i++) {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.dataset.index = i;
            
            if (this._pieces[i].isEmpty) {
                piece.classList.add('empty');
            } else {
                const pieceIndex = this._pieces[i].correctIndex;
                const row = Math.floor(pieceIndex / this._gridSize);
                const col = pieceIndex % this._gridSize;
                
                // Позиционируем фоновое изображение
                piece.style.backgroundImage = `url(images/${this._selectedImage})`;
                piece.style.backgroundSize = `${this._gridSize * 100}%`;
                piece.style.backgroundPosition = `-${col * 100}% -${row * 100}%`;
                
                // Добавляем текстовый номер части (для отладки)
                // piece.textContent = pieceIndex + 1;
            }
            
            puzzleBoard.appendChild(piece);
        }
    }
    
    /**
     * Возвращает индексы частей, которые можно переместить
     * @returns {Array<number>} Массив индексов перемещаемых частей
     * @private
     */
    _getMovablePieceIndices() {
        // Находим пустую ячейку
        const emptyPiece = this._pieces.find(piece => piece.isEmpty);
        const emptyIndex = emptyPiece ? this._pieces.indexOf(emptyPiece) : -1;
        
        if (emptyIndex === -1) return [];
        
        const movableIndices = [];
        const emptyRow = Math.floor(emptyIndex / this._gridSize);
        const emptyCol = emptyIndex % this._gridSize;
        
        // Проверяем соседние ячейки (сверху, снизу, слева, справа)
        const directions = [
            { row: -1, col: 0 }, // сверху
            { row: 1, col: 0 },  // снизу
            { row: 0, col: -1 }, // слева
            { row: 0, col: 1 }   // справа
        ];
        
        for (const dir of directions) {
            const newRow = emptyRow + dir.row;
            const newCol = emptyCol + dir.col;
            
            if (newRow >= 0 && newRow < this._gridSize && newCol >= 0 && newCol < this._gridSize) {
                const index = newRow * this._gridSize + newCol;
                movableIndices.push(index);
            }
        }
        
        return movableIndices;
    }
    
    /**
     * Перемещает часть пазла
     * @param {number} index - Индекс части для перемещения
     * @private
     */
    _movePiece(index) {
        // Находим пустую ячейку
        const emptyPiece = this._pieces.find(piece => piece.isEmpty);
        const emptyIndex = emptyPiece ? this._pieces.indexOf(emptyPiece) : -1;
        
        if (emptyIndex === -1) return;
        
        // Проверяем, можно ли переместить выбранную часть
        const movableIndices = this._getMovablePieceIndices();
        if (!movableIndices.includes(index)) return;
        
        // Меняем местами части
        this._swapPieces(index, emptyIndex);
        
        // Увеличиваем счетчик ходов
        this._moves++;
        document.getElementById('moves-count').textContent = this._moves;
        
        // Перерисовываем пазл
        this._renderPieces();
        
        // Проверяем, решен ли пазл
        if (this._checkIfSolved()) {
            this._solved = true;
            this._showCompletionMessage();
        }
    }
    
    /**
     * Меняет местами две части пазла
     * @param {number} index1 - Индекс первой части
     * @param {number} index2 - Индекс второй части
     * @private
     */
    _swapPieces(index1, index2) {
        const temp = {...this._pieces[index1]};
        this._pieces[index1] = {...this._pieces[index2]};
        this._pieces[index2] = temp;
        
        // Обновляем текущие индексы
        this._pieces[index1].currentIndex = index1;
        this._pieces[index2].currentIndex = index2;
    }
    
    /**
     * Проверяет, решен ли пазл
     * @returns {boolean} true если пазл решен
     * @private
     */
    _checkIfSolved() {
        // Проверяем, что каждая часть на своем месте
        for (let i = 0; i < this._pieces.length - 1; i++) {
            if (this._pieces[i].correctIndex !== i) {
                return false;
            }
        }
        
        // Проверяем, что пустая ячейка в правом нижнем углу
        return this._pieces[this._pieces.length - 1].isEmpty;
    }
    
    /**
     * Показывает сообщение о завершении игры
     * @private
     */
    _showCompletionMessage() {
        // Создаем сообщение
        const messageElement = document.createElement('div');
        messageElement.className = 'game-message success';
        messageElement.textContent = `Поздравляем! Вы собрали пазл за ${this._moves} ходов!`;
        
        this._container.appendChild(messageElement);
        
        // Вызываем колбэк завершения
        if (this._completeCallback) {
            setTimeout(() => {
                this._completeCallback();
            }, 1500);
        }
    }
    
    /**
     * Сбрасывает игру для повторного прохождения
     * @private
     */
    _resetGame() {
        // Удаляем сообщение о завершении, если есть
        const message = this._container.querySelector('.game-message');
        if (message) message.remove();
        
        this._solved = false;
        this._setupPuzzle();
    }
    
    /**
     * Устанавливает функцию обратного вызова при завершении игры
     * @param {Function} callback - Функция, вызываемая при завершении
     */
    onComplete(callback) {
        this._completeCallback = callback;
    }
}