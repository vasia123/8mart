/**
 * Игра Квиз о знаменитых женщинах для детективной игры к 8 марта
 * 
 * Игрок отвечает на вопросы о выдающихся женщинах в истории.
 * Для победы необходимо правильно ответить на определенное количество вопросов.
 */
class Quiz {
    /**
     * Создает новую игру Квиз
     * @param {HTMLElement} container - DOM-элемент, в который будет помещена игра
     */
    constructor(container) {
        this.container = container;
        this._onCompleteCallback = null;
        this._nextHint = null;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.isGameOver = false;
        this.answeredQuestions = new Set();
        
        // Настройки игры
        this.requiredScore = 7; // Количество правильных ответов для победы
        
        // Вопросы и ответы
        this.questions = [
            {
                text: "Кто стал первой женщиной-космонавтом?",
                options: [
                    "Салли Райд",
                    "Валентина Терешкова",
                    "Светлана Савицкая",
                    "Кристи Макколифф"
                ],
                correctIndex: 1,
                explanation: "Валентина Терешкова стала первой женщиной в космосе на корабле Восток-6 в 1963 году."
            },
            {
                text: "Какая женщина-ученый дважды получила Нобелевскую премию?",
                options: [
                    "Мария Кюри",
                    "Розалинд Франклин",
                    "Лиза Мейтнер",
                    "Ирен Жолио-Кюри"
                ],
                correctIndex: 0,
                explanation: "Мария Кюри получила Нобелевскую премию по физике в 1903 году и по химии в 1911 году."
            },
            {
                text: "Кто написал роман 'Франкенштейн, или Современный Прометей'?",
                options: [
                    "Джейн Остин",
                    "Эмили Бронте",
                    "Мэри Шелли",
                    "Вирджиния Вульф"
                ],
                correctIndex: 2,
                explanation: "Мэри Шелли написала 'Франкенштейн' в 1818 году, создав один из первых научно-фантастических романов."
            },
            {
                text: "Какая женщина возглавила борьбу за избирательное право женщин в США?",
                options: [
                    "Роза Паркс",
                    "Сьюзен Б. Энтони",
                    "Гарриет Табмен",
                    "Элеонора Рузвельт"
                ],
                correctIndex: 1,
                explanation: "Сьюзен Б. Энтони была лидером суфражистского движения и боролась за право женщин голосовать."
            },
            {
                text: "Кто из этих женщин была известным математиком и первым программистом?",
                options: [
                    "Софья Ковалевская",
                    "Ада Лавлейс",
                    "Эмми Нётер",
                    "Грейс Хоппер"
                ],
                correctIndex: 1,
                explanation: "Ада Лавлейс написала первую в мире компьютерную программу для аналитической машины Чарльза Бэббиджа."
            },
            {
                text: "Какая женщина-пилот пропала без вести во время кругосветного перелета?",
                options: [
                    "Амелия Эрхарт",
                    "Берил Маркхэм",
                    "Жаклин Кокран",
                    "Бесси Коулман"
                ],
                correctIndex: 0,
                explanation: "Амелия Эрхарт исчезла над Тихим океаном в 1937 году во время попытки совершить кругосветный перелет."
            },
            {
                text: "Какая художница известна своими автопортретами и мексиканским народным стилем?",
                options: [
                    "Джорджия О'Киф",
                    "Фрида Кало",
                    "Мэри Кассат",
                    "Тамара де Лемпицка"
                ],
                correctIndex: 1,
                explanation: "Фрида Кало - мексиканская художница, известная своими яркими автопортретами и работами, отражающими мексиканскую культуру."
            },
            {
                text: "Кто была первой женщиной, получившей Нобелевскую премию мира?",
                options: [
                    "Мать Тереза",
                    "Вангари Маатаи",
                    "Берта фон Зутнер",
                    "Джейн Аддамс"
                ],
                correctIndex: 2,
                explanation: "Берта фон Зутнер получила Нобелевскую премию мира в 1905 году за свою работу в пацифистском движении."
            },
            {
                text: "Какая российская императрица правила в XVIII веке и провела множество реформ?",
                options: [
                    "Анна Иоанновна",
                    "Елизавета Петровна",
                    "Екатерина II",
                    "Мария Федоровна"
                ],
                correctIndex: 2,
                explanation: "Екатерина II (Великая) правила с 1762 по 1796 год, проведя множество реформ и расширив территорию России."
            },
            {
                text: "Кто из этих женщин возглавил движение за права чернокожих в США и отказалась уступить место в автобусе?",
                options: [
                    "Роза Паркс",
                    "Корета Скотт Кинг",
                    "Гарриет Табмен",
                    "Мэри Маклеод Бетюн"
                ],
                correctIndex: 0,
                explanation: "Роза Паркс отказалась уступить место белому пассажиру в автобусе в 1955 году, что стало важным символом движения за гражданские права."
            },
            {
                text: "Какая женщина-физик внесла значительный вклад в открытие структуры ДНК?",
                options: [
                    "Барбара Макклинток",
                    "Дороти Ходжкин",
                    "Розалинд Франклин",
                    "Рита Леви-Монтальчини"
                ],
                correctIndex: 2,
                explanation: "Розалинд Франклин сделала ключевые рентгеновские снимки ДНК, которые помогли определить ее двойную спиральную структуру."
            },
            {
                text: "Кто была первой женщиной-лауреатом Филдсовской премии (высшей награды в математике)?",
                options: [
                    "Мариам Мирзахани",
                    "Софья Ковалевская",
                    "Эмми Нётер",
                    "Карен Уленбек"
                ],
                correctIndex: 0,
                explanation: "Мариам Мирзахани, иранский математик, стала первой женщиной, получившей Филдсовскую премию в 2014 году."
            },
            {
                text: "Какая женщина создала первый в истории компьютерный компилятор?",
                options: [
                    "Ада Лавлейс",
                    "Грейс Хоппер",
                    "Джин Саммет",
                    "Кэтрин Джонсон"
                ],
                correctIndex: 1,
                explanation: "Грейс Хоппер разработала первый компилятор и ввела термин 'баг' после того, как нашла настоящую моль в компьютере."
            },
            {
                text: "Какая женщина-предпринимательница создала косметическую империю и стала одной из первых женщин-миллионеров?",
                options: [
                    "Коко Шанель",
                    "Эсте Лаудер",
                    "Мадам Си Джей Уокер",
                    "Хелена Рубинштейн"
                ],
                correctIndex: 2,
                explanation: "Мадам Си Джей Уокер (Сара Бридлав) создала линию продуктов по уходу за волосами и стала первой женщиной-миллионером в США."
            },
            {
                text: "Кто из этих женщин была известной революционеркой и борцом за права женщин в России?",
                options: [
                    "Александра Коллонтай",
                    "Надежда Крупская",
                    "Инесса Арманд",
                    "Вера Засулич"
                ],
                correctIndex: 0,
                explanation: "Александра Коллонтай была революционеркой, феминисткой и первой в мире женщиной-министром и послом."
            },
            {
                text: "Какая женщина-режиссер первой получила 'Оскар' за лучшую режиссуру?",
                options: [
                    "София Коппола",
                    "Кэтрин Бигелоу",
                    "Гретa Гервиг",
                    "Джейн Кэмпион"
                ],
                correctIndex: 1,
                explanation: "Кэтрин Бигелоу стала первой женщиной, получившей премию 'Оскар' за лучшую режиссуру в 2010 году за фильм 'Повелитель бури'."
            },
            {
                text: "Какая известная писательница написала роман 'Убить пересмешника'?",
                options: [
                    "Тони Моррисон",
                    "Харпер Ли",
                    "Джоан Роулинг",
                    "Майя Энджелоу"
                ],
                correctIndex: 1,
                explanation: "Харпер Ли написала роман 'Убить пересмешника', опубликованный в 1960 году, который стал классикой американской литературы."
            },
            {
                text: "Какая женщина стала символом борьбы за права работниц и произнесла знаменитую фразу 'Хлеба и роз'?",
                options: [
                    "Роза Люксембург",
                    "Клара Цеткин",
                    "Элеонора Рузвельт",
                    "Роза Шнайдерман"
                ],
                correctIndex: 3,
                explanation: "Роза Шнайдерман, профсоюзный лидер, произнесла знаменитую речь, в которой сказала, что работницам нужен не только хлеб, но и розы."
            },
            {
                text: "Какая женщина-ученый внесла значительный вклад в исследование шимпанзе в дикой природе?",
                options: [
                    "Джейн Гудолл",
                    "Дайан Фосси",
                    "Бируте Галдикас",
                    "Сильвия Эрл"
                ],
                correctIndex: 0,
                explanation: "Джейн Гудолл провела более 60 лет, изучая социальное и семейное взаимодействие шимпанзе в Танзании."
            }
        ];
        
        // Перемешиваем вопросы
        this._shuffleArray(this.questions);
    }
    
    /**
     * Инициализация игры и отображение интерфейса
     * @param {Object} options - Параметры игры
     */
    init(options = {}) {
        // Настраиваем параметры в зависимости от сложности
        if (options.difficulty === 'easy') {
            this.requiredScore = 4;
        } else if (options.difficulty === 'hard') {
            this.requiredScore = 10;
        } else {
            this.requiredScore = 7;
        }
        
        this._createUI();
        this._addEventListeners();
        this._showRules();
    }
    
    /**
     * Устанавливает функцию обратного вызова при завершении игры
     * @param {Function} callback - Функция обратного вызова
     * @returns {Quiz} - Текущий экземпляр для цепочки вызовов
     */
    onComplete(callback) {
        this._onCompleteCallback = callback;
        return this;
    }
    
    /**
     * Устанавливает текст следующей подсказки
     * @param {string} hintText - Текст подсказки
     * @returns {Quiz} - Текущий экземпляр для цепочки вызовов
     */
    setNextHint(hintText) {
        this._nextHint = hintText;
        return this;
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
     * Создает пользовательский интерфейс игры
     * @private
     */
    _createUI() {
        this.container.innerHTML = `
            <div class="quiz-container">
                <div class="game-header">
                    <h2>Квиз о знаменитых женщинах</h2>
                    <p>Ответьте на вопросы об известных женщинах в истории, науке и искусстве.</p>
                </div>
                
                <div class="quiz-progress">
                    <div class="progress-text">Счет: <span class="score-value">0</span> из <span class="required-score">${this.requiredScore}</span></div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                </div>
                
                <div class="question">
                    <div class="question-text"></div>
                    <div class="options"></div>
                </div>
                
                <div class="feedback hidden"></div>
                
                <div class="game-controls">
                    <button class="rules-button">Правила</button>
                </div>
            </div>
        `;
        
        // Показываем первый вопрос
        this._showQuestion(0);
    }
    
    /**
     * Добавляет обработчики событий
     * @private
     */
    _addEventListeners() {
        // Обработчик для кнопки правил
        const rulesButton = this.container.querySelector('.rules-button');
        rulesButton.addEventListener('click', () => this._showRules());
    }
    
    /**
     * Показывает правила игры
     * @private
     */
    _showRules() {
        // Текст правил
        const rulesText = `
- Ответьте на вопросы о знаменитых женщинах в истории
- Для каждого вопроса выберите один из вариантов ответа
- Для победы нужно правильно ответить на ${this.requiredScore} вопросов
- После выбора ответа вы увидите, правильно ли ответили
- Каждый вопрос задается только один раз
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
     * Показывает вопрос по индексу
     * @param {number} index - Индекс вопроса
     * @private
     */
    _showQuestion(index) {
        // Проверяем наличие вопроса с таким индексом
        if (index >= this.questions.length) {
            // Если вопросы закончились, но нужный счет не набран
            if (this.score < this.requiredScore) {
                // Генерируем новые вопросы, перемешивая массив
                this._shuffleArray(this.questions);
                this.answeredQuestions.clear();
                index = 0;
            } else {
                // Если счет достаточный, завершаем игру
                this._endGame(true);
                return;
            }
        }
        
        // Если вопрос уже был задан, переходим к следующему
        if (this.answeredQuestions.has(index)) {
            this._showQuestion(index + 1);
            return;
        }
        
        this.currentQuestionIndex = index;
        const question = this.questions[index];
        
        const questionTextElement = this.container.querySelector('.question-text');
        const optionsElement = this.container.querySelector('.options');
        
        // Очищаем предыдущую обратную связь
        const feedbackElement = this.container.querySelector('.feedback');
        feedbackElement.classList.add('hidden');
        
        // Устанавливаем текст вопроса
        questionTextElement.textContent = question.text;
        
        // Очищаем варианты ответов
        optionsElement.innerHTML = '';
        
        // Добавляем варианты ответов
        question.options.forEach((option, optionIndex) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.textContent = option;
            
            // Добавляем обработчик клика
            optionElement.addEventListener('click', () => {
                if (!this.answeredQuestions.has(this.currentQuestionIndex)) {
                    this._checkAnswer(this.currentQuestionIndex, optionIndex);
                }
            });
            
            optionsElement.appendChild(optionElement);
        });
    }
    
    /**
     * Проверяет ответ пользователя
     * @param {number} questionIndex - Индекс вопроса
     * @param {number} answerIndex - Индекс выбранного ответа
     * @private
     */
    _checkAnswer(questionIndex, answerIndex) {
        const question = this.questions[questionIndex];
        const options = this.container.querySelectorAll('.option');
        const feedbackElement = this.container.querySelector('.feedback');
        const isCorrect = answerIndex === question.correctIndex;
        
        // Отмечаем вопрос как отвеченный
        this.answeredQuestions.add(questionIndex);
        
        // Стилизуем выбранный вариант
        options.forEach((option, index) => {
            if (index === answerIndex) {
                option.classList.add('selected');
            }
            
            if (index === question.correctIndex) {
                option.classList.add('correct');
            } else if (index === answerIndex && answerIndex !== question.correctIndex) {
                option.classList.add('incorrect');
            }
        });
        
        // Обновляем счет и отображаем обратную связь
        if (isCorrect) {
            this.score++;
            feedbackElement.textContent = `Верно! ${question.explanation}`;
            feedbackElement.className = 'feedback correct';
        } else {
            feedbackElement.textContent = `Неверно. ${question.explanation}`;
            feedbackElement.className = 'feedback incorrect';
        }
        
        // Обновляем отображение счета
        this._updateScore();
        
        // Добавляем кнопку для перехода к следующему вопросу
        const nextButton = document.createElement('button');
        nextButton.className = 'next-button';
        nextButton.textContent = 'Следующий вопрос';
        nextButton.addEventListener('click', () => {
            // Если набрали нужное количество правильных ответов
            if (this.score >= this.requiredScore) {
                this._endGame(true);
            } else {
                this._showQuestion(this.currentQuestionIndex + 1);
            }
        });
        
        // Очищаем предыдущую кнопку, если есть
        const oldNextButton = feedbackElement.querySelector('.next-button');
        if (oldNextButton) {
            oldNextButton.remove();
        }
        
        feedbackElement.appendChild(nextButton);
        feedbackElement.classList.remove('hidden');
    }
    
    /**
     * Обновляет отображение счета
     * @private
     */
    _updateScore() {
        const scoreElement = this.container.querySelector('.score-value');
        const progressFill = this.container.querySelector('.progress-fill');
        
        scoreElement.textContent = this.score;
        const progressPercentage = (this.score / this.requiredScore) * 100;
        progressFill.style.width = `${Math.min(progressPercentage, 100)}%`;
    }
    
    /**
     * Обрабатывает завершение игры
     * @param {boolean} success - Флаг успешного завершения
     * @private
     */
    _endGame(success) {
        this.isGameOver = true;
        
        // Скрываем элементы вопроса
        const questionElement = this.container.querySelector('.question');
        questionElement.style.display = 'none';
        
        // Скрываем обратную связь
        const feedbackElement = this.container.querySelector('.feedback');
        feedbackElement.classList.add('hidden');
        
        if (success) {
            // Проверяем доступность модального окна
            if (typeof hintModal !== 'undefined') {
                // Показываем ТОЛЬКО сообщение об успехе, без подсказки
                hintModal.showSuccess('Поздравляем! Вы успешно ответили на необходимое количество вопросов!', () => {
                    // Вызываем колбэк завершения
                    if (this._onCompleteCallback) {
                        this._onCompleteCallback();
                    }
                });
            } else {
                // Если модальное окно недоступно, используем стандартный способ
                const successMessage = document.createElement('div');
                successMessage.className = 'game-message success';
                successMessage.innerHTML = `
                    <h3>Поздравляем!</h3>
                    <p>Вы успешно ответили на необходимое количество вопросов!</p>
                    <p>Вы доказали свои знания о выдающихся женщинах!</p>
                `;
                
                this.container.querySelector('.quiz-container').appendChild(successMessage);
                
                // Вызываем колбэк успешного завершения
                if (this._onCompleteCallback) {
                    setTimeout(() => {
                        this._onCompleteCallback();
                    }, 2000);
                }
            }
        } else {
            // Сообщение о неудаче
            const failMessage = document.createElement('div');
            failMessage.className = 'game-message error';
            failMessage.innerHTML = `
                <h3>Попробуйте еще раз</h3>
                <p>К сожалению, вы не набрали необходимое количество правильных ответов.</p>
                <button class="reset-button">Начать заново</button>
            `;
            
            this.container.querySelector('.quiz-container').appendChild(failMessage);
            
            // Добавляем обработчик для кнопки сброса
            failMessage.querySelector('.reset-button').addEventListener('click', () => {
                this._resetGame();
                failMessage.remove();
            });
        }
    }
    
    /**
     * Сбрасывает игру и начинает заново
     * @private
     */
    _resetGame() {
        // Сбрасываем счет и состояние
        this.score = 0;
        this.currentQuestionIndex = 0;
        this.isGameOver = false;
        this.answeredQuestions.clear();
        
        // Перемешиваем вопросы
        this._shuffleArray(this.questions);
        
        // Удаляем сообщения
        const messageElements = this.container.querySelectorAll('.game-message');
        messageElements.forEach(element => element.remove());
        
        // Показываем элементы вопроса
        const questionElement = this.container.querySelector('.question');
        questionElement.style.display = 'block';
        
        // Обновляем отображение счета
        this._updateScore();
        
        // Показываем первый вопрос
        this._showQuestion(0);
    }
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Quiz };
} else {
    window.Quiz = Quiz;
}