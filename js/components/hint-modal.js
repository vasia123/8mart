/**
 * Модуль для отображения всплывающего окна с подсказкой
 * Использует архитектурный паттерн Singleton для управления единым модальным окном
 */
class HintModal {
    /**
     * Конструктор класса, реализующий паттерн Singleton
     */
    constructor() {
        // Проверяем, существует ли уже экземпляр класса
        if (HintModal.instance) {
            return HintModal.instance;
        }
        
        // Сохраняем экземпляр
        HintModal.instance = this;
        
        // Флаг инициализации
        this._isInitialized = false;
        
        // Элементы модального окна
        this.modalContainer = null;
        this.modalContent = null;
        this.modalTitle = null;
        this.modalBody = null;
        this.closeButton = null;
        
        // Задержка для предотвращения множественных инициализаций
        // и гарантии загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._initialize());
        } else {
            setTimeout(() => this._initialize(), 0);
        }
    }
    
    /**
     * Инициализирует модальное окно
     * @private
     */
    _initialize() {
        // Проверяем, не было ли уже инициализации
        if (this._isInitialized) return;
        
        // Проверяем, существует ли уже элемент в DOM
        const existingModal = document.querySelector('.hint-modal');
        if (existingModal) {
            this.modalContainer = existingModal;
            this.modalContent = existingModal.querySelector('.hint-modal-content');
            this.modalTitle = existingModal.querySelector('.hint-modal-title');
            this.modalBody = existingModal.querySelector('.hint-modal-body');
            this.closeButton = existingModal.querySelector('.hint-modal-close');
        } else {
            // Создаем элементы модального окна
            this._createModalElements();
        }
        
        // Инициализируем обработчики событий
        this._initEventListeners();
        
        this._isInitialized = true;
    }
    
    /**
     * Создает DOM-элементы модального окна
     * @private
     */
    _createModalElements() {
        // Контейнер модального окна
        this.modalContainer = document.createElement('div');
        this.modalContainer.className = 'hint-modal';
        this.modalContainer.setAttribute('role', 'dialog');
        this.modalContainer.setAttribute('aria-modal', 'true');
        this.modalContainer.style.display = 'none';
        
        // Содержимое модального окна
        this.modalContent = document.createElement('div');
        this.modalContent.className = 'hint-modal-content';
        
        // Заголовок подсказки
        this.modalTitle = document.createElement('h3');
        this.modalTitle.className = 'hint-modal-title';
        this.modalTitle.textContent = 'Следующая подсказка';
        
        // Текст подсказки
        this.modalBody = document.createElement('div');
        this.modalBody.className = 'hint-modal-body';
        
        // Кнопка закрытия
        this.closeButton = document.createElement('button');
        this.closeButton.className = 'hint-modal-close';
        this.closeButton.textContent = 'Продолжить расследование';
        
        // Собираем модальное окно
        this.modalContent.appendChild(this.modalTitle);
        this.modalContent.appendChild(this.modalBody);
        this.modalContent.appendChild(this.closeButton);
        this.modalContainer.appendChild(this.modalContent);
        
        // Добавляем в DOM
        document.body.appendChild(this.modalContainer);
    }
    
    /**
     * Инициализирует обработчики событий
     * @private
     */
    _initEventListeners() {
        // Сохраняем ссылки на методы-обработчики с правильным контекстом
        this._handleCloseClick = this.hide.bind(this);
        this._handleOutsideClick = (e) => {
            if (e.target === this.modalContainer) {
                this.hide();
            }
        };
        
        // Удаляем существующие обработчики, если они есть
        this.closeButton.removeEventListener('click', this._handleCloseClick);
        this.modalContainer.removeEventListener('click', this._handleOutsideClick);
        
        // Закрытие по клику на кнопку
        this.closeButton.addEventListener('click', this._handleCloseClick);
        
        // Закрытие по клику вне модального окна
        this.modalContainer.addEventListener('click', this._handleOutsideClick);
        
        // Закрытие по нажатию Esc (делаем на уровне документа, чтобы не повторять для каждого экземпляра)
        if (!HintModal._escKeyHandlerInitialized) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isVisible()) {
                    this.hide();
                }
            });
            HintModal._escKeyHandlerInitialized = true;
        }
    }
    
    /**
     * Показывает модальное окно с подсказкой
     * @param {string} hintText - Текст подсказки
     * @param {Object} options - Дополнительные параметры
     * @param {string} [options.title] - Заголовок модального окна
     * @param {string} [options.buttonText] - Текст кнопки закрытия
     * @param {string} [options.type] - Тип модального окна (hint, rules, success, error)
     * @param {Function} [options.callback] - Функция обратного вызова при закрытии
     * @param {Function} [options.onTypeComplete] - Функция обратного вызова по завершению анимации печати
     */
    show(hintText, options = {}) {
        // Проверяем инициализацию
        if (!this._isInitialized) {
            this._initialize();
        }
        
        // Устанавливаем заголовок, если передан
        if (options.title) {
            this.modalTitle.textContent = options.title;
        } else {
            this.modalTitle.textContent = 'Следующая подсказка';
        }
        
        // Устанавливаем текст кнопки, если передан
        if (options.buttonText) {
            this.closeButton.textContent = options.buttonText;
        } else {
            this.closeButton.textContent = 'Продолжить расследование';
        }
        
        // Применяем класс типа, если передан
        this.modalContainer.classList.remove('hint-modal-rules', 'hint-modal-success', 'hint-modal-error');
        if (options.type) {
            this.modalContainer.classList.add(`hint-modal-${options.type}`);
        }
        
        // Воспроизводим звук уведомления (только для обычных подсказок)
        if (!options.type || options.type === 'hint') {
            const notificationSound = document.getElementById('notification-sound');
            if (notificationSound) {
                notificationSound.play().catch(err => console.warn('Не удалось воспроизвести звук:', err));
            }
        }
        
        // Добавляем текст подсказки 
        this.modalBody.innerHTML = '';
        const hintParagraph = document.createElement('p');
        hintParagraph.className = 'hint-text';
        this.modalBody.appendChild(hintParagraph);
        
        // Сохраняем callback для вызова после закрытия
        this._closeCallback = options.callback || null;
        
        // Показываем модальное окно
        this.modalContainer.style.display = 'flex';
        
        // Запускаем анимацию печатающего текста
        this._typeText(hintParagraph, hintText, 0, 30, () => {
            // Колбэк по завершению анимации печати
            if (options.onTypeComplete) {
                options.onTypeComplete();
            }
        });
        
        // Добавляем класс для анимации появления
        setTimeout(() => {
            this.modalContainer.classList.add('active');
        }, 10);
    }
    
    /**
     * Показывает модальное окно с правилами
     * @param {string} rulesText - Текст правил
     * @param {Function} [callback] - Функция обратного вызова при закрытии
     */
    showRules(rulesText, callback = null) {
        this.show(rulesText, {
            title: 'Правила игры',
            buttonText: 'Понятно',
            type: 'rules',
            callback: callback
        });
    }
    
    /**
     * Показывает модальное окно с сообщением об успехе
     * @param {string} text - Текст сообщения
     * @param {Function} [callback] - Функция обратного вызова при закрытии
     */
    showSuccess(text, callback = null) {
        this.show(text, {
            title: 'Поздравляем!',
            buttonText: 'Продолжить',
            type: 'success',
            callback: callback
        });
    }
    
    /**
     * Показывает модальное окно с сообщением об ошибке
     * @param {string} text - Текст сообщения
     * @param {Function} [callback] - Функция обратного вызова при закрытии
     */
    showError(text, callback = null) {
        this.show(text, {
            title: 'Ошибка',
            buttonText: 'Закрыть',
            type: 'error',
            callback: callback
        });
    }
    
    /**
     * Скрывает модальное окно
     */
    hide() {
        if (!this.modalContainer) return;
        
        this.modalContainer.classList.remove('active');
        
        // Ждем завершения анимации исчезновения
        setTimeout(() => {
            this.modalContainer.style.display = 'none';
            
            // Вызываем callback если он есть
            if (typeof this._closeCallback === 'function') {
                const callback = this._closeCallback;
                this._closeCallback = null;
                callback();
            }
        }, 300);
    }
    
    /**
     * Проверяет, видимо ли модальное окно
     * @returns {boolean}
     */
    isVisible() {
        return this.modalContainer && 
               this.modalContainer.style.display === 'flex' && 
               this.modalContainer.classList.contains('active');
    }
    
    /**
     * Анимация печатающего текста
     * @param {HTMLElement} element - DOM-элемент для добавления текста
     * @param {string} text - Текст для анимации
     * @param {number} index - Текущий индекс символа
     * @param {number} speed - Скорость печати в мс
     * @param {Function} [callback] - Функция обратного вызова по завершению анимации
     * @private
     */
    _typeText(element, text, index, speed, callback = null) {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(() => this._typeText(element, text, index, speed, callback), speed);
        } else if (callback) {
            // Если печать завершена и есть callback, вызываем его
            callback();
        }
    }
}

// Статические свойства
HintModal._escKeyHandlerInitialized = false;

// Создаем и экспортируем экземпляр синглтона
window.hintModal = new HintModal();