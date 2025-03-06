/**
 * Мини-игра "Весенний сапер"
 * Исправленная версия с корректной обработкой флажков
 */
class MinesweeperGame {
    constructor() {
        this._rows = 8;
        this._cols = 8;
        this._flowers = 10;
        this._board = [];
        this._revealed = [];
        this._flagged = [];
        this._gameOver = false;
        this._container = null;
        this._completeCallback = null;
        this._firstClick = true;
        this._theme = '8march';
        this._longPressTimers = {};
        this._isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this._flaggedCells = new Set(); // Отслеживаем ячейки с флажками для предотвращения нажатий
    }
    
    init(containerId, options = {}) {
        // Настройка параметров в зависимости от сложности
        if (options.difficulty === 'easy') {
            this._rows = 6;
            this._cols = 6;
            this._flowers = 5;
        } else if (options.difficulty === 'hard') {
            this._rows = 9;
            this._cols = 9;
            this._flowers = 12;
        } else {
            this._rows = 8;
            this._cols = 8;
            this._flowers = 10;
        }
        
        // Для мобильных устройств уменьшаем размеры
        if (window.innerWidth < 500) {
            this._rows = Math.min(this._rows, 8);
            this._cols = Math.min(this._cols, 8);
        }
        
        if (options.theme) {
            this._theme = options.theme;
        }
        
        this._container = document.getElementById(containerId);
        if (!this._container) {
            console.error('Контейнер не найден');
            return;
        }
        
        this._container.innerHTML = '';
        this._container.className = 'game-container minesweeper-container';
        
        // Создаем заголовок игры
        const header = document.createElement('div');
        header.className = 'game-header';
        header.innerHTML = `
            <h2>Весенний сапер</h2>
            <p>Найдите все безопасные клетки, избегая цветочных сюрпризов!</p>
            <div class="game-controls">
                <span class="flowers-counter">🌷 ${this._flowers}</span>
                <button class="reset-button">Начать заново</button>
            </div>
        `;
        this._container.appendChild(header);
        
        // Добавляем подсказку о долгом нажатии только для мобильных устройств
        if (this._isTouchDevice) {
            const mobileControls = document.createElement('div');
            mobileControls.className = 'mobile-hint-box';
            mobileControls.innerHTML = `
                <p>👆 Нажмите на клетку, чтобы открыть</p>
                <p>👆 Долгое нажатие ставит/снимает флажок 🚩</p>
            `;
            this._container.appendChild(mobileControls);
        }
        
        // Добавляем обработчик для кнопки сброса
        header.querySelector('.reset-button').addEventListener('click', () => this._resetGame());
        
        // Инициализируем пустые массивы для состояния игры
        this._revealed = Array(this._rows).fill().map(() => Array(this._cols).fill(false));
        this._flagged = Array(this._rows).fill().map(() => Array(this._cols).fill(false));
        
        // Создаем игровое поле
        this._createBoard();
        this._renderBoard();
    }
    
    _createBoard() {
        this._board = Array(this._rows).fill().map(() => Array(this._cols).fill(0));
        this._firstClick = true;
    }
    
    _handleFirstClick(firstRow, firstCol) {
        this._firstClick = false;
        
        // Размещаем цветы, избегая первого клика
        let flowersPlaced = 0;
        while (flowersPlaced < this._flowers) {
            const row = Math.floor(Math.random() * this._rows);
            const col = Math.floor(Math.random() * this._cols);
            
            // Не ставим цветок на первый клик и вокруг него
            const isTooClose = Math.abs(row - firstRow) <= 1 && Math.abs(col - firstCol) <= 1;
            
            if (!isTooClose && this._board[row][col] !== 'F') {
                this._board[row][col] = 'F'; // F для цветка
                flowersPlaced++;
            }
        }
        
        // Рассчитываем числа (сколько цветов вокруг каждой клетки)
        for (let r = 0; r < this._rows; r++) {
            for (let c = 0; c < this._cols; c++) {
                if (this._board[r][c] !== 'F') {
                    let count = 0;
                    // Проверяем все 8 соседних клеток
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const nr = r + dr;
                            const nc = c + dc;
                            if (nr >= 0 && nr < this._rows && nc >= 0 && nc < this._cols && 
                                this._board[nr][nc] === 'F') {
                                count++;
                            }
                        }
                    }
                    this._board[r][c] = count;
                }
            }
        }
    }
    
    _renderBoard() {
        const boardElement = document.createElement('div');
        boardElement.className = 'minesweeper-board';
        boardElement.style.gridTemplateColumns = `repeat(${this._cols}, 1fr)`;
        
        // Определяем размер ячеек на основе размера поля и устройства
        const isMobile = window.innerWidth < 500;
        const cellSize = isMobile 
            ? Math.min(40, Math.floor((window.innerWidth - 40) / this._cols)) // для мобильных
            : (this._cols > 8 ? 40 : 50); // для десктопов
            
        this._container.style.setProperty('--cell-size', `${cellSize}px`);
        
        // Создаем все ячейки доски
        for (let r = 0; r < this._rows; r++) {
            for (let c = 0; c < this._cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'minesweeper-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.dataset.cellId = `cell-${r}-${c}`;
                
                // Обработчик для клика мыши (для desktop)
                if (!this._isTouchDevice) {
                    // Левый клик - открытие ячейки
                    cell.addEventListener('click', (e) => {
                        // Откроем только если на ячейке нет флажка
                        if (!this._flagged[r][c]) {
                            this._handleCellClick(r, c);
                        }
                    });
                    
                    // Правый клик - установка/снятие флажка
                    cell.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        this._handleRightClick(r, c);
                    });
                } else {
                    // === Для сенсорных устройств ===
                    // Переменные для отслеживания времени и позиции касания
                    let touchStartTime = 0;
                    let touchStartX = 0;
                    let touchStartY = 0;
                    let longPressTriggered = false;
                    const cellId = `cell-${r}-${c}`;
                    
                    // При начале касания
                    cell.addEventListener('touchstart', (e) => {
                        // Сохраняем время и координаты начала касания
                        touchStartTime = Date.now();
                        if (e.touches.length > 0) {
                            touchStartX = e.touches[0].clientX;
                            touchStartY = e.touches[0].clientY;
                        }
                        
                        longPressTriggered = false;
                        
                        // Устанавливаем таймер для долгого нажатия
                        this._longPressTimers[cellId] = setTimeout(() => {
                            // Если не было значительного движения, считаем долгим нажатием
                            longPressTriggered = true;
                            
                            // Устанавливаем/снимаем флаг
                            this._handleRightClick(r, c);
                            
                            // Добавляем визуальную и тактильную обратную связь
                            cell.classList.add('long-press-feedback');
                            if ('vibrate' in navigator) {
                                navigator.vibrate(50);
                            }
                            
                            // Снимаем анимацию после завершения
                            setTimeout(() => {
                                cell.classList.remove('long-press-feedback');
                            }, 300);
                        }, 500); // 500ms для долгого нажатия
                    }, { passive: true });
                    
                    // При перемещении пальца отменяем долгое нажатие
                    cell.addEventListener('touchmove', (e) => {
                        if (this._longPressTimers[cellId]) {
                            // Проверяем, было ли значительное перемещение
                            if (e.touches.length > 0) {
                                const touchX = e.touches[0].clientX;
                                const touchY = e.touches[0].clientY;
                                
                                // Если перемещение больше 10px, отменяем долгое нажатие
                                const moveDistance = Math.sqrt(
                                    Math.pow(touchX - touchStartX, 2) + 
                                    Math.pow(touchY - touchStartY, 2)
                                );
                                
                                if (moveDistance > 10) {
                                    clearTimeout(this._longPressTimers[cellId]);
                                    delete this._longPressTimers[cellId];
                                }
                            }
                        }
                    }, { passive: true });
                    
                    // При отпускании проверяем, было ли долгое нажатие
                    cell.addEventListener('touchend', (e) => {
                        // Отменяем любой активный таймер долгого нажатия
                        if (this._longPressTimers[cellId]) {
                            clearTimeout(this._longPressTimers[cellId]);
                            delete this._longPressTimers[cellId];
                        }
                        
                        // Вычисляем длительность нажатия
                        const touchTime = Date.now() - touchStartTime;
                        
                        // Если не было долгого нажатия и нажатие было коротким,
                        // то обрабатываем как клик для открытия клетки
                        if (!longPressTriggered && touchTime < 500 && !this._flagged[r][c]) {
                            this._handleCellClick(r, c);
                        }
                    }, { passive: true });
                    
                    // При отмене касания очищаем таймеры
                    cell.addEventListener('touchcancel', (e) => {
                        if (this._longPressTimers[cellId]) {
                            clearTimeout(this._longPressTimers[cellId]);
                            delete this._longPressTimers[cellId];
                        }
                    }, { passive: true });
                }
                
                boardElement.appendChild(cell);
            }
        }
        
        this._container.appendChild(boardElement);
        this._updateBoard();
    }
    
    _updateBoard() {
        const cells = this._container.querySelectorAll('.minesweeper-cell');
        const flowersCounter = this._container.querySelector('.flowers-counter');
        
        // Обновляем счетчик цветов
        let flaggedCount = 0;
        for (let r = 0; r < this._rows; r++) {
            for (let c = 0; c < this._cols; c++) {
                if (this._flagged[r][c]) flaggedCount++;
            }
        }
        
        // Выбираем эмодзи в зависимости от темы
        let flowerEmoji = '🌷';
        let flagEmoji = '🚩';
        
        if (this._theme === '8march') {
            flowerEmoji = '🌷';
            flagEmoji = '🎀';
        }
        
        flowersCounter.textContent = `${flowerEmoji} ${this._flowers - flaggedCount}`;
        
        // Обновляем каждую ячейку
        cells.forEach(cell => {
            const r = parseInt(cell.dataset.row);
            const c = parseInt(cell.dataset.col);
            
            // Сбрасываем классы
            cell.className = 'minesweeper-cell';
            cell.textContent = '';
            
            if (this._revealed[r][c]) {
                cell.classList.add('revealed');
                
                if (this._board[r][c] === 'F') {
                    // Показываем цветок
                    cell.classList.add('flower');
                    cell.textContent = flowerEmoji;
                } else if (this._board[r][c] > 0) {
                    // Показываем число
                    cell.classList.add(`number-${this._board[r][c]}`);
                    cell.textContent = this._board[r][c];
                }
            } else if (this._flagged[r][c]) {
                // Показываем флажок
                cell.classList.add('flagged');
                cell.textContent = flagEmoji;
                
                // Добавляем ячейку в список с флажками
                this._flaggedCells.add(`${r}-${c}`);
            } else {
                // Убираем ячейку из списка с флажками
                this._flaggedCells.delete(`${r}-${c}`);
            }
        });
    }
    
    _handleCellClick(row, col) {
        // Не реагируем если игра окончена или на ячейке флажок
        if (this._gameOver || this._flagged[row][col]) return;
        
        // Если первый клик - размещаем цветы после него
        if (this._firstClick) {
            this._handleFirstClick(row, col);
        }
        
        // Открываем ячейку
        if (this._board[row][col] === 'F') {
            // Нажатие на цветок - проигрыш
            this._revealed[row][col] = true;
            this._gameOver = true;
            this._revealAll();
            this._showMessage('О нет! Вы нашли цветок слишком рано. Попробуйте еще раз!', 'error');
        } else {
            // Открываем ячейку и проверяем на пустоту
            this._revealCell(row, col);
            
            // Проверяем, выиграл ли игрок
            if (this._checkWin()) {
                this._gameOver = true;
                this._revealAll();
                this._showMessage('Поздравляем! Вы успешно нашли все безопасные клетки!', 'success');
                
                // Вызываем колбэк завершения
                if (this._completeCallback) {
                    setTimeout(() => {
                        this._completeCallback();
                    }, 1500);
                }
            }
        }
        
        this._updateBoard();
    }
    
    _handleRightClick(row, col) {
        if (this._gameOver || this._revealed[row][col]) return;
        
        // Переключаем флаг
        this._flagged[row][col] = !this._flagged[row][col];
        this._updateBoard();
        
        // Вибрация для мобильных устройств
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
        
        // Проверяем, все ли цветы отмечены правильно
        if (this._checkWin()) {
            this._gameOver = true;
            this._revealAll();
            this._showMessage('Поздравляем! Вы успешно нашли все цветы!', 'success');
            
            // Вызываем колбэк завершения
            if (this._completeCallback) {
                setTimeout(() => {
                    this._completeCallback();
                }, 1500);
            }
        }
    }
    
    _revealCell(row, col) {
        if (row < 0 || row >= this._rows || col < 0 || col >= this._cols || 
            this._revealed[row][col]) {
            return;
        }
        
        // Открываем ячейку
        this._revealed[row][col] = true;
        
        // Если ячейка пустая (0), открываем все соседние
        if (this._board[row][col] === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    this._revealCell(row + dr, col + dc);
                }
            }
        }
    }
    
    _revealAll() {
        for (let r = 0; r < this._rows; r++) {
            for (let c = 0; c < this._cols; c++) {
                this._revealed[r][c] = true;
            }
        }
        this._updateBoard();
    }
    
    _checkWin() {
        // Проверяем, открыты ли все безопасные клетки
        let allSafeCellsRevealed = true;
        for (let r = 0; r < this._rows; r++) {
            for (let c = 0; c < this._cols; c++) {
                if (this._board[r][c] !== 'F' && !this._revealed[r][c]) {
                    allSafeCellsRevealed = false;
                    break;
                }
            }
            if (!allSafeCellsRevealed) break;
        }
        
        // Проверяем, все ли цветы правильно отмечены флажками
        let allFlowersMarked = true;
        for (let r = 0; r < this._rows; r++) {
            for (let c = 0; c < this._cols; c++) {
                if ((this._board[r][c] === 'F' && !this._flagged[r][c]) || 
                    (this._board[r][c] !== 'F' && this._flagged[r][c])) {
                    allFlowersMarked = false;
                    break;
                }
            }
            if (!allFlowersMarked) break;
        }
        
        return allSafeCellsRevealed || allFlowersMarked;
    }
    
    _showMessage(message, type) {
        // Удаляем предыдущее сообщение, если есть
        const oldMessage = this._container.querySelector('.game-message');
        if (oldMessage) oldMessage.remove();
        
        const messageElement = document.createElement('div');
        messageElement.className = `game-message ${type}`;
        messageElement.textContent = message;
        
        this._container.appendChild(messageElement);
    }
    
    _resetGame() {
        this._gameOver = false;
        this._firstClick = true;
        this._createBoard();
        this._revealed = Array(this._rows).fill().map(() => Array(this._cols).fill(false));
        this._flagged = Array(this._rows).fill().map(() => Array(this._cols).fill(false));
        this._flaggedCells.clear();
        
        // Очищаем все таймеры долгого нажатия
        for (const timerId in this._longPressTimers) {
            clearTimeout(this._longPressTimers[timerId]);
        }
        this._longPressTimers = {};
        
        // Удаляем сообщение, если есть
        const message = this._container.querySelector('.game-message');
        if (message) message.remove();
        
        this._updateBoard();
    }
    
    onComplete(callback) {
        this._completeCallback = callback;
    }
}