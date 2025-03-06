/**
 * Игра "Три в ряд" для детективной игры к 8 марта
 */
class Match3Game {
    /**
     * Создает новую игру "Три в ряд"
     * @param {HTMLElement} container - DOM-элемент для размещения игры
     */
    constructor(container) {
        this.container = container;
        this._onCompleteCallback = null;
        this._nextHint = null;
        
        // Настройки игры
        this.boardSize = 7; // 7x7 поле
        this.gemTypes = ['🌷', '🌹', '💐', '🎁', '💄', '💎']; // Тематические символы для 8 марта
        this.targetScore = 1000; // Целевое количество очков
        this.movesLimit = 30; // Ограничение по ходам
        
        // Подсказки
        this.maxHints = 3; // Максимальное количество подсказок
        this.hintsLeft = 3; // Оставшиеся подсказки
        this.hintTimeout = null; // Таймер для подсказки
        
        // Состояние игры
        this.board = [];
        this.selectedGem = null;
        this.score = 0;
        this.moves = 0;
        this.isGameOver = false;
        this.isAnimating = false;
        
        // Матрицы для отслеживания анимаций
        this.animatingCells = [];
    }
    
    /**
     * Инициализация игры
     * @param {string} containerId - ID контейнера (не используется, для совместимости)
     * @param {Object} options - Настройки игры
     */
    init(containerId, options = {}) {
        // Настройка параметров в зависимости от сложности
        if (options.difficulty === 'easy') {
            this.boardSize = 6;
            this.targetScore = 800;
            this.movesLimit = 35;
        } else if (options.difficulty === 'hard') {
            this.boardSize = 8;
            this.targetScore = 1200;
            this.movesLimit = 25;
        }
        
        // Для мобильных устройств уменьшаем размер поля
        if (window.innerWidth < 500) {
            this.boardSize = Math.min(this.boardSize, 6);
        }
        
        this._createUI();
        this._createBoard();
        this._renderBoard();
        this._addEventListeners();
        
        // Показываем правила при первом запуске
        this._showRules();
    }
    
    /**
     * Устанавливает функцию обратного вызова при завершении игры
     * @param {Function} callback - Функция обратного вызова
     * @returns {Match3Game} - Текущий экземпляр для цепочки вызовов
     */
    onComplete(callback) {
        this._onCompleteCallback = callback;
        return this;
    }
    
    /**
     * Устанавливает текст следующей подсказки
     * @param {string} hintText - Текст подсказки
     * @returns {Match3Game} - Текущий экземпляр для цепочки вызовов
     */
    setNextHint(hintText) {
        this._nextHint = hintText;
        return this;
    }
    
    /**
     * Создает пользовательский интерфейс игры
     * @private
     */
    _createUI() {
        this.container.innerHTML = `
            <div class="match3-container">
                <div class="game-header">
                    <h2>Весенний букет</h2>
                    <p>Соберите три или более одинаковых элемента в ряд, чтобы набрать ${this.targetScore} очков!</p>
                    
                    <div class="match3-info">
                        <div class="match3-score">
                            <span class="score-label">Очки:</span>
                            <span class="score-value">0</span>
                            <span class="score-target">/ ${this.targetScore}</span>
                        </div>
                        <div class="match3-moves">
                            <span class="moves-label">Ходы:</span>
                            <span class="moves-value">${this.movesLimit}</span>
                        </div>
                        <div class="match3-hints">
                            <span class="hints-label">Подсказка:</span>
                            <button class="hint-button">Показать ход <span class="hints-count">${this.hintsLeft}</span></button>
                        </div>
                    </div>
                </div>
                
                <div class="match3-board-container">
                    <div class="match3-board"></div>
                    <div class="board-refresh-notice">Нет возможных ходов! Обновляем доску...</div>
                </div>
                
                <div class="game-controls">
                    <button class="reset-button">Начать заново</button>
                    <button class="rules-button">Правила</button>
                </div>
                
                <div class="game-message hidden"></div>
            </div>
        `;
    }
    
    /**
     * Показывает правила игры
     * @private
     */
    _showRules() {
        const rulesText = `
- Соберите три или более одинаковых элемента в ряд или столбец
- Меняйте местами соседние элементы, чтобы создать комбинации
- Наберите ${this.targetScore} очков за ${this.movesLimit} ходов
- Чем больше элементов в комбинации, тем больше очков
- Комбинации из 4 и 5 элементов дают бонусные очки
- У вас есть ${this.maxHints} подсказки, чтобы найти возможный ход
- Если нет возможных ходов, доска автоматически обновится
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
     * Добавляет обработчики событий
     * @private
     */
    _addEventListeners() {
        // Обработчик для кнопки сброса
        const resetButton = this.container.querySelector('.reset-button');
        resetButton.addEventListener('click', () => this._resetGame());
        
        // Обработчик для кнопки правил
        const rulesButton = this.container.querySelector('.rules-button');
        rulesButton.addEventListener('click', () => this._showRules());
        
        // Обработчик для кнопки подсказки
        const hintButton = this.container.querySelector('.hint-button');
        hintButton.addEventListener('click', () => this._showHint());
    }
    
    /**
     * Создает игровое поле
     * @private
     */
    _createBoard() {
        this.board = [];
        
        // Создаем пустое поле
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = this._getRandomGem();
            }
        }
        
        // Инициализируем массив для отслеживания анимаций
        this.animatingCells = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(false));
        
        // Проверяем и удаляем начальные совпадения
        let hasMatches = true;
        while (hasMatches) {
            const matchesInfo = this._findAllMatches();
            
            if (matchesInfo.hasMatches) {
                // Заменяем совпадающие элементы
                for (const match of matchesInfo.matches) {
                    for (const { row, col } of match) {
                        this.board[row][col] = this._getRandomGem();
                    }
                }
            } else {
                hasMatches = false;
            }
        }
        
        // Проверяем наличие возможных ходов
        this._ensureValidMovesExist();
    }
    
    /**
     * Проверяет наличие валидных ходов и обновляет доску при необходимости
     * @private
     */
    _ensureValidMovesExist() {
        // Находим все возможные ходы
        const possibleMoves = this._findPossibleMoves();
        
        // Если ходов нет, перегенерируем доску
        if (possibleMoves.length === 0) {
            this._rebuildBoard();
        }
    }
    
    /**
     * Полностью обновляет доску при отсутствии ходов
     * @private
     */
    _rebuildBoard() {
        // Показываем уведомление об обновлении
        this._showBoardRefreshNotice();
        
        // Создаем новую доску
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = this._getRandomGem();
            }
        }
        
        // Проверяем и удаляем начальные совпадения
        let hasMatches = true;
        while (hasMatches) {
            const matchesInfo = this._findAllMatches();
            
            if (matchesInfo.hasMatches) {
                // Заменяем совпадающие элементы
                for (const match of matchesInfo.matches) {
                    for (const { row, col } of match) {
                        this.board[row][col] = this._getRandomGem();
                    }
                }
            } else {
                hasMatches = false;
            }
        }
        
        // Повторно проверяем наличие ходов
        const possibleMoves = this._findPossibleMoves();
        if (possibleMoves.length === 0) {
            // Если опять нет ходов, пробуем снова
            setTimeout(() => this._rebuildBoard(), 500);
        } else {
            // Обновляем отображение
            this._renderBoard();
        }
    }
    
    /**
     * Показывает уведомление об обновлении доски
     * @private
     */
    _showBoardRefreshNotice() {
        const notice = this.container.querySelector('.board-refresh-notice');
        notice.classList.add('visible');
        
        setTimeout(() => {
            notice.classList.remove('visible');
        }, 2000);
    }
    
    /**
     * Находит все возможные ходы на доске
     * @returns {Array} - Массив возможных ходов
     * @private
     */
    _findPossibleMoves() {
        const possibleMoves = [];
        
        // Проверяем все возможные обмены
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                // Проверяем обмен вправо
                if (col < this.boardSize - 1) {
                    // Временно меняем элементы
                    [this.board[row][col], this.board[row][col + 1]] = 
                    [this.board[row][col + 1], this.board[row][col]];
                    
                    // Проверяем, образуется ли совпадение
                    const matchesInfo = this._findAllMatches();
                    if (matchesInfo.hasMatches) {
                        possibleMoves.push({
                            from: { row, col },
                            to: { row, col: col + 1 }
                        });
                    }
                    
                    // Возвращаем элементы обратно
                    [this.board[row][col], this.board[row][col + 1]] = 
                    [this.board[row][col + 1], this.board[row][col]];
                }
                
                // Проверяем обмен вниз
                if (row < this.boardSize - 1) {
                    // Временно меняем элементы
                    [this.board[row][col], this.board[row + 1][col]] = 
                    [this.board[row + 1][col], this.board[row][col]];
                    
                    // Проверяем, образуется ли совпадение
                    const matchesInfo = this._findAllMatches();
                    if (matchesInfo.hasMatches) {
                        possibleMoves.push({
                            from: { row, col },
                            to: { row: row + 1, col }
                        });
                    }
                    
                    // Возвращаем элементы обратно
                    [this.board[row][col], this.board[row + 1][col]] = 
                    [this.board[row + 1][col], this.board[row][col]];
                }
            }
        }
        
        return possibleMoves;
    }
    
    /**
     * Показывает подсказку для возможного хода
     * @private
     */
    _showHint() {
        // Если нет подсказок или идет анимация, ничего не делаем
        if (this.hintsLeft <= 0 || this.isAnimating || this.isGameOver) return;
        
        // Очищаем предыдущую подсказку, если она есть
        this._clearHint();
        
        // Находим возможные ходы
        const possibleMoves = this._findPossibleMoves();
        
        if (possibleMoves.length > 0) {
            // Выбираем случайный ход из возможных
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            
            // Находим DOM-элементы этих элементов
            const gemElements = this.container.querySelectorAll('.match3-gem');
            const fromElement = [...gemElements].find(
                el => parseInt(el.dataset.row) === randomMove.from.row && 
                     parseInt(el.dataset.col) === randomMove.from.col
            );
            const toElement = [...gemElements].find(
                el => parseInt(el.dataset.row) === randomMove.to.row && 
                     parseInt(el.dataset.col) === randomMove.to.col
            );
            
            // Подсвечиваем элементы
            if (fromElement && toElement) {
                fromElement.classList.add('hint');
                toElement.classList.add('hint');
                
                // Уменьшаем количество подсказок
                this.hintsLeft--;
                this._updateHintsCounter();
                
                // Устанавливаем таймер для удаления подсветки
                this.hintTimeout = setTimeout(() => {
                    this._clearHint();
                }, 3000);
            }
        } else {
            // Если ходов нет, обновляем доску
            this._rebuildBoard();
        }
    }
    
    /**
     * Очищает подсветку подсказки
     * @private
     */
    _clearHint() {
        // Очищаем таймер, если он есть
        if (this.hintTimeout) {
            clearTimeout(this.hintTimeout);
            this.hintTimeout = null;
        }
        
        // Удаляем класс подсказки со всех элементов
        const hintElements = this.container.querySelectorAll('.match3-gem.hint');
        hintElements.forEach(element => {
            element.classList.remove('hint');
        });
    }
    
    /**
     * Обновляет счетчик подсказок
     * @private
     */
    _updateHintsCounter() {
        const hintsCountElement = this.container.querySelector('.hints-count');
        hintsCountElement.textContent = this.hintsLeft;
        
        // Отключаем кнопку, если подсказки закончились
        const hintButton = this.container.querySelector('.hint-button');
        if (this.hintsLeft <= 0) {
            hintButton.disabled = true;
        }
    }
    
    /**
     * Возвращает случайный элемент
     * @returns {string} - Случайный элемент
     * @private
     */
    _getRandomGem() {
        const randomIndex = Math.floor(Math.random() * this.gemTypes.length);
        return this.gemTypes[randomIndex];
    }
    
    /**
     * Отрисовывает игровое поле
     * @private
     */
    _renderBoard() {
        const boardElement = this.container.querySelector('.match3-board');
        boardElement.innerHTML = '';
        boardElement.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        
        // Создаем элементы для каждой ячейки
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const gemElement = document.createElement('div');
                gemElement.className = 'match3-gem';
                gemElement.textContent = this.board[row][col];
                gemElement.dataset.row = row;
                gemElement.dataset.col = col;
                
                // Добавляем обработчик клика
                gemElement.addEventListener('click', () => {
                    this._handleGemClick(row, col, gemElement);
                });
                
                boardElement.appendChild(gemElement);
            }
        }
        
        // Обновляем отображение счета и ходов
        this._updateStats();
    }
    
    /**
     * Обновляет отображение статистики (очки, ходы)
     * @private
     */
    _updateStats() {
        const scoreElement = this.container.querySelector('.score-value');
        const movesElement = this.container.querySelector('.moves-value');
        
        scoreElement.textContent = this.score;
        movesElement.textContent = this.movesLimit - this.moves;
        
        // Обновляем прогресс в достижении цели
        const progressPercentage = Math.min(100, Math.floor((this.score / this.targetScore) * 100));
        scoreElement.style.setProperty('--progress', `${progressPercentage}%`);
    }
    
    /**
     * Обрабатывает клик по элементу
     * @param {number} row - Строка элемента
     * @param {number} col - Столбец элемента
     * @param {HTMLElement} gemElement - DOM-элемент
     * @private
     */
    _handleGemClick(row, col, gemElement) {
        // Если анимация в процессе или игра окончена, ничего не делаем
        if (this.isAnimating || this.isGameOver) return;
        
        // Очищаем подсказку при клике
        this._clearHint();
        
        // Если это первый выбранный элемент
        if (!this.selectedGem) {
            this.selectedGem = { row, col, element: gemElement };
            gemElement.classList.add('selected');
            return;
        }
        
        // Если это тот же элемент, снимаем выделение
        if (this.selectedGem.row === row && this.selectedGem.col === col) {
            gemElement.classList.remove('selected');
            this.selectedGem = null;
            return;
        }
        
        // Проверяем, соседние ли это элементы
        const isAdjacent = (
            (Math.abs(this.selectedGem.row - row) === 1 && this.selectedGem.col === col) ||
            (Math.abs(this.selectedGem.col - col) === 1 && this.selectedGem.row === row)
        );
        
        if (isAdjacent) {
            // Снимаем выделение с первого элемента
            this.selectedGem.element.classList.remove('selected');
            
            // Пытаемся поменять элементы местами с анимацией
            this._swapGemsWithAnimation(this.selectedGem.row, this.selectedGem.col, row, col);
            this.selectedGem = null;
        } else {
            // Если элементы не соседние, выбираем новый элемент
            this.selectedGem.element.classList.remove('selected');
            this.selectedGem = { row, col, element: gemElement };
            gemElement.classList.add('selected');
        }
    }
    
    /**
     * Меняет два элемента местами с анимацией
     * @param {number} row1 - Строка первого элемента
     * @param {number} col1 - Столбец первого элемента
     * @param {number} row2 - Строка второго элемента
     * @param {number} col2 - Столбец второго элемента
     * @private
     */
    _swapGemsWithAnimation(row1, col1, row2, col2) {
        // Устанавливаем флаг анимации
        this.isAnimating = true;
        
        // Получаем значения элементов
        const gem1 = this.board[row1][col1];
        const gem2 = this.board[row2][col2];
        
        // Находим DOM-элементы
        const gemElements = this.container.querySelectorAll('.match3-gem');
        const gemElement1 = [...gemElements].find(
            el => parseInt(el.dataset.row) === row1 && parseInt(el.dataset.col) === col1
        );
        const gemElement2 = [...gemElements].find(
            el => parseInt(el.dataset.row) === row2 && parseInt(el.dataset.col) === col2
        );
        
        // Определяем направление анимации
        let class1, class2;
        if (row1 === row2) {
            // Горизонтальный обмен
            if (col1 < col2) {
                class1 = 'swap-right';
                class2 = 'swap-left';
            } else {
                class1 = 'swap-left';
                class2 = 'swap-right';
            }
        } else {
            // Вертикальный обмен
            if (row1 < row2) {
                class1 = 'swap-down';
                class2 = 'swap-up';
            } else {
                class1 = 'swap-up';
                class2 = 'swap-down';
            }
        }
        
        // Добавляем классы анимации
        gemElement1.classList.add(class1);
        gemElement2.classList.add(class2);
        
        // Меняем элементы местами в модели
        this.board[row1][col1] = gem2;
        this.board[row2][col2] = gem1;
        
        // Проверяем, образуется ли совпадение после обмена
        const matchesInfo = this._findAllMatches();
        
        // После завершения анимации обмена
        setTimeout(() => {
            if (matchesInfo.hasMatches) {
                // Если есть совпадения, удаляем классы анимации и обрабатываем совпадения
                gemElement1.classList.remove(class1);
                gemElement2.classList.remove(class2);
                
                // Обновляем отображение
                this._renderBoard();
                
                // Обрабатываем совпадения с анимацией
                this._processMatchesWithAnimation(matchesInfo);
                
                // Увеличиваем счетчик ходов
                this.moves++;
                this._updateStats();
                
                // Проверяем условия завершения игры
                this._checkGameOver();
            } else {
                // Если совпадений нет, меняем элементы обратно
                this.board[row1][col1] = gem1;
                this.board[row2][col2] = gem2;
                
                // Отображаем "тряску" для неудачного обмена
                gemElement1.classList.remove(class1);
                gemElement2.classList.remove(class2);
                gemElement1.classList.add('shake');
                gemElement2.classList.add('shake');
                
                setTimeout(() => {
                    gemElement1.classList.remove('shake');
                    gemElement2.classList.remove('shake');
                    this.isAnimating = false;
                }, 500);
            }
        }, 300); // Задержка, равная длительности анимации обмена
    }
    
    /**
     * Находит все совпадения на поле
     * @returns {Object} - Информация о совпадениях
     * @private
     */
    _findAllMatches() {
        const matches = [];
        let hasMatches = false;
        
        // Проверяем горизонтальные совпадения
        for (let row = 0; row < this.boardSize; row++) {
            let matchStart = 0;
            let matchLength = 1;
            
            for (let col = 1; col < this.boardSize; col++) {
                if (this.board[row][col] === this.board[row][col - 1]) {
                    // Продолжение совпадения
                    matchLength++;
                } else {
                    // Конец совпадения
                    if (matchLength >= 3) {
                        const match = [];
                        for (let i = 0; i < matchLength; i++) {
                            match.push({ row, col: matchStart + i });
                        }
                        matches.push(match);
                        hasMatches = true;
                    }
                    
                    // Начало нового потенциального совпадения
                    matchStart = col;
                    matchLength = 1;
                }
            }
            
            // Проверяем совпадение в конце строки
            if (matchLength >= 3) {
                const match = [];
                for (let i = 0; i < matchLength; i++) {
                    match.push({ row, col: matchStart + i });
                }
                matches.push(match);
                hasMatches = true;
            }
        }
        
        // Проверяем вертикальные совпадения
        for (let col = 0; col < this.boardSize; col++) {
            let matchStart = 0;
            let matchLength = 1;
            
            for (let row = 1; row < this.boardSize; row++) {
                if (this.board[row][col] === this.board[row - 1][col]) {
                    // Продолжение совпадения
                    matchLength++;
                } else {
                    // Конец совпадения
                    if (matchLength >= 3) {
                        const match = [];
                        for (let i = 0; i < matchLength; i++) {
                            match.push({ row: matchStart + i, col });
                        }
                        matches.push(match);
                        hasMatches = true;
                    }
                    
                    // Начало нового потенциального совпадения
                    matchStart = row;
                    matchLength = 1;
                }
            }
            
            // Проверяем совпадение в конце столбца
            if (matchLength >= 3) {
                const match = [];
                for (let i = 0; i < matchLength; i++) {
                    match.push({ row: matchStart + i, col });
                }
                matches.push(match);
                hasMatches = true;
            }
        }
        
        return { hasMatches, matches };
    }
    
    /**
     * Обрабатывает найденные совпадения с анимацией
     * @param {Object} matchesInfo - Информация о совпадениях
     * @private
     */
    _processMatchesWithAnimation(matchesInfo) {
        // Сбрасываем матрицу анимирующихся ячеек
        this.animatingCells = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(false));
        
        // Получаем все элементы поля
        const gemElements = this.container.querySelectorAll('.match3-gem');
        
        // Для каждого совпадения
        for (const match of matchesInfo.matches) {
            // Начисляем очки за совпадение
            const points = this._addScore(match.length);
            
            // Показываем анимацию очков
            const firstGem = match[0];
            const firstGemElement = [...gemElements].find(
                el => parseInt(el.dataset.row) === firstGem.row && parseInt(el.dataset.col) === firstGem.col
            );
            
            if (firstGemElement) {
                const pointsElement = document.createElement('div');
                pointsElement.className = 'match3-points';
                pointsElement.textContent = `+${points}`;
                
                // Размещаем элемент очков над первым элементом совпадения
                const rect = firstGemElement.getBoundingClientRect();
                const boardRect = this.container.querySelector('.match3-board').getBoundingClientRect();
                
                pointsElement.style.left = `${rect.left - boardRect.left + rect.width / 2}px`;
                pointsElement.style.top = `${rect.top - boardRect.top}px`;
                
                // Добавляем элемент очков в контейнер
                this.container.querySelector('.match3-board').appendChild(pointsElement);
                
                // Удаляем элемент очков после завершения анимации
                setTimeout(() => {
                    pointsElement.remove();
                }, 1200);
            }
            
            // Добавляем анимацию совпадения для каждого элемента
            for (const { row, col } of match) {
                const gemElement = [...gemElements].find(
                    el => parseInt(el.dataset.row) === row && parseInt(el.dataset.col) === col
                );
                
                if (gemElement) {
                    // Отмечаем ячейку как анимирующуюся
                    this.animatingCells[row][col] = true;
                    
                    // Добавляем класс для анимации совпадения
                    gemElement.classList.add('match');
                    
                    // Помечаем ячейки как пустые в модели
                    this.board[row][col] = null;
                }
            }
        }
        
        // После завершения анимации совпадения
        setTimeout(() => {
            // Удаляем класс анимации
            gemElements.forEach(el => {
                el.classList.remove('match');
            });
            
            // Заполняем пустые ячейки с анимацией
            this._fillEmptyCellsWithAnimation();
        }, 400); // Задержка, равная длительности анимации совпадения
    }
    
    /**
     * Добавляет очки за совпадение и возвращает количество начисленных очков
     * @param {number} matchLength - Длина совпадения
     * @returns {number} - Количество начисленных очков
     * @private
     */
    _addScore(matchLength) {
        // Базовые очки за каждый элемент
        const basePoints = 10;
        
        // Бонус за длинные комбинации
        let multiplier = 1;
        if (matchLength === 4) multiplier = 1.5;
        if (matchLength >= 5) multiplier = 2;
        
        // Начисляем очки
        const points = Math.floor(basePoints * matchLength * multiplier);
        this.score += points;
        
        // Обновляем отображение
        this._updateStats();
        
        return points;
    }
    
    /**
     * Заполняет пустые ячейки новыми элементами с анимацией
     * @private
     */
    _fillEmptyCellsWithAnimation() {
        // Перемещаем элементы вниз и подсчитываем количество пустых ячеек в каждом столбце
        const emptyCountByColumn = Array(this.boardSize).fill(0);
        
        // Перемещаем существующие элементы вниз
        for (let col = 0; col < this.boardSize; col++) {
            let emptyCount = 0;
            
            for (let row = this.boardSize - 1; row >= 0; row--) {
                if (this.board[row][col] === null) {
                    emptyCount++;
                } else if (emptyCount > 0) {
                    // Перемещаем элемент вниз на количество пустых ячеек
                    this.board[row + emptyCount][col] = this.board[row][col];
                    this.board[row][col] = null;
                }
            }
            
            // Сохраняем количество пустых ячеек для этого столбца
            emptyCountByColumn[col] = emptyCount;
        }
        
        // Заполняем верхние пустые ячейки новыми элементами
        for (let col = 0; col < this.boardSize; col++) {
            for (let row = 0; row < emptyCountByColumn[col]; row++) {
                this.board[row][col] = this._getRandomGem();
            }
        }
        
        // Обновляем отображение поля с анимацией падения и появления новых элементов
        const boardElement = this.container.querySelector('.match3-board');
        
        // Создаем и добавляем новые элементы
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                // Находим существующий элемент или создаем новый
                let gemElement = boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                
                if (!gemElement) {
                    gemElement = document.createElement('div');
                    gemElement.className = 'match3-gem';
                    gemElement.dataset.row = row;
                    gemElement.dataset.col = col;
                    
                    // Добавляем обработчик клика
                    gemElement.addEventListener('click', () => {
                        this._handleGemClick(row, col, gemElement);
                    });
                    
                    boardElement.appendChild(gemElement);
                }
                
                // Обновляем содержимое
                gemElement.textContent = this.board[row][col];
                
                // Добавляем анимацию для новых элементов
                if (row < emptyCountByColumn[col]) {
                    gemElement.classList.add('new');
                    
                    // Удаляем класс анимации после её завершения
                    setTimeout(() => {
                        gemElement.classList.remove('new');
                    }, 400);
                }
                // Добавляем анимацию падения для смещённых элементов
                else if (this.animatingCells[row][col]) {
                    gemElement.classList.add('fall');
                    
                    // Удаляем класс анимации после её завершения
                    setTimeout(() => {
                        gemElement.classList.remove('fall');
                    }, 400);
                }
            }
        }
        
        // После завершения анимаций
        setTimeout(() => {
            // Проверяем, есть ли новые совпадения
            const newMatchesInfo = this._findAllMatches();
            
            if (newMatchesInfo.hasMatches) {
                // Если есть новые совпадения, обрабатываем их
                this._processMatchesWithAnimation(newMatchesInfo);
            } else {
                // Если новых совпадений нет, снимаем флаг анимации
                this.isAnimating = false;
                
                // Сбрасываем матрицу анимирующихся ячеек
                this.animatingCells = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(false));
                
                // Проверяем, есть ли возможные ходы
                const possibleMoves = this._findPossibleMoves();
                if (possibleMoves.length === 0) {
                    // Если нет ходов, обновляем доску
                    this._rebuildBoard();
                }
            }
        }, 500); // Задержка после анимации падения
    }
    
    /**
     * Проверяет условия завершения игры
     * @private
     */
    _checkGameOver() {
        // Проверяем достижение целевого счета
        if (this.score >= this.targetScore) {
            this._endGame(true);
            return;
        }
        
        // Проверяем исчерпание ходов
        if (this.moves >= this.movesLimit) {
            this._endGame(false);
            return;
        }
    }
    
    /**
     * Завершает игру
     * @param {boolean} success - Флаг успешного завершения
     * @private
     */
    _endGame(success) {
        this.isGameOver = true;
        
        if (success) {
            // Поздравляем с победой
            if (typeof hintModal !== 'undefined') {
                // Показываем ТОЛЬКО сообщение об успехе, без подсказки
                hintModal.showSuccess('Поздравляем! Вы успешно собрали достаточно комбинаций и набрали необходимое количество очков!', () => {
                    // Вызываем колбэк завершения
                    if (this._onCompleteCallback) {
                        this._onCompleteCallback();
                    }
                });
            } else {
                // Если модальное окно недоступно, используем стандартный способ
                const messageElement = this.container.querySelector('.game-message');
                messageElement.textContent = 'Поздравляем! Вы успешно собрали достаточно комбинаций!';
                messageElement.classList.remove('hidden');
                messageElement.classList.add('success');
                
                // Вызываем колбэк завершения
                setTimeout(() => {
                    if (this._onCompleteCallback) {
                        this._onCompleteCallback();
                    }
                }, 2000);
            }
        } else {
            // Сообщаем о проигрыше
            if (typeof hintModal !== 'undefined') {
                hintModal.showError(`Ходы закончились! Вы набрали ${this.score} из ${this.targetScore} необходимых очков. Попробуйте еще раз!`, () => {
                    this._resetGame();
                });
            } else {
                const messageElement = this.container.querySelector('.game-message');
                messageElement.textContent = `Ходы закончились! Вы набрали ${this.score} из ${this.targetScore} необходимых очков.`;
                messageElement.classList.remove('hidden');
                messageElement.classList.add('error');
                
                // Добавляем кнопку для повторной попытки
                const resetButton = document.createElement('button');
                resetButton.className = 'reset-button';
                resetButton.textContent = 'Попробовать еще раз';
                resetButton.addEventListener('click', () => {
                    this._resetGame();
                    messageElement.classList.add('hidden');
                    messageElement.classList.remove('error');
                });
                
                messageElement.appendChild(resetButton);
            }
        }
    }
    
    /**
     * Сбрасывает игру и начинает заново
     * @private
     */
    _resetGame() {
        // Сбрасываем состояние
        this.score = 0;
        this.moves = 0;
        this.selectedGem = null;
        this.isGameOver = false;
        this.isAnimating = false;
        this.hintsLeft = this.maxHints;
        
        // Обновляем состояние кнопки подсказок
        const hintButton = this.container.querySelector('.hint-button');
        hintButton.disabled = false;
        this._updateHintsCounter();
        
        // Очищаем подсветку подсказки, если есть
        this._clearHint();
        
        // Создаем новое поле
        this._createBoard();
        this._renderBoard();
        
        // Скрываем сообщение, если оно есть
        const messageElement = this.container.querySelector('.game-message');
        if (messageElement) {
            messageElement.classList.add('hidden');
            messageElement.classList.remove('success', 'error');
        }
    }
}

// Экспортируем класс
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Match3Game };
} else {
    window.Match3Game = Match3Game;
}