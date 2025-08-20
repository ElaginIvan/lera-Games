// Проверяем, есть ли доступ. Теперь это делается в одном месте.
if (!localStorage.getItem('childAccess')) {
    // Используем абсолютный путь, чтобы избежать ошибок при вызове из вложенных папок
    window.location.href = "/lera-games/index.html";
}

/**
 * Класс Game - наш универсальный игровой движок.
 */
class Game {
    constructor(config) {
        // --- Конфигурация игры (уникальна для каждого урока) ---
        this.gameId = config.gameId; // e.g., 'factorial', 'square-root'
        this.timePerQuestion = config.timePerQuestion || null; // Время на вопрос в секундах
        this.answerType = config.answerType || 'buttons'; // 'buttons' или 'textInput'
        this.generateQuestionAndAnswers = config.generateQuestionAndAnswers;
        this.getSuccessMessage = config.getSuccessMessage;
        this.getHint = config.getHint;
        this.getSolutionHTML = config.getSolutionHTML; // Функция для генерации HTML-кода решения
        // Функции-колбэки для дополнительной логики
        this.onNewRound = config.onNewRound || (() => { });
        this.onCorrectAnswer = config.onCorrectAnswer || (() => { });
        this.onIncorrectAnswer = config.onIncorrectAnswer || (() => { });

        // --- Общие элементы DOM ---
        this.questionElement = document.getElementById('question');
        this.answersContainer = document.querySelector('.answers');
        this.feedbackText = document.getElementById('feedback-text');
        this.nextButton = document.getElementById('next-btn');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.errorsElement = document.getElementById('errors');
        this.helpButton = document.getElementById('help-btn');
        this.helpText = document.getElementById('help-text');
        this.timerBar = document.getElementById('timer-bar');
        this.solutionButton = document.getElementById('solution-btn');
        this.resetButton = document.getElementById('reset-btn');

        // --- Состояние игры ---
        this.score = 0; // Будет перезаписано при загрузке
        this.errors = 0; // Будет перезаписано при загрузке
        // Ключ для рекорда теперь генерируется автоматически, например 'factorialHighScore'
        this.highScore = localStorage.getItem(`${this.gameId}HighScore`) || 0;
        this.correctAnswer = null;
        this.solutionWasShown = false; // Флаг, показывающий, использовалась ли подсказка
        this.currentQuestionData = null; // Для хранения доп. данных, например, числа для факториала
        this.questionAnswered = false; // Флаг, показывающий, был ли дан ответ на текущий вопрос
        this.lastQuestionString = null; // Для хранения строки последнего вопроса, чтобы избежать повторов
        this.timerId = null; // ID для setInterval
        this.timeLeft = 0;
        this.loadedQuestionState = null; // Временное хранилище для состояния вопроса при загрузке

        // --- Инициализация ---
        this.highScoreElement.textContent = this.highScore;
        this.addEventListeners();
        this.loadProgress(); // Загружаем сохраненный прогресс

        if (this.questionAnswered) {
            // Если страница была перезагружена после ответа, сразу переходим к следующему вопросу
            this.nextQuestion();
        } else {
            // Иначе начинаем раунд (он использует сохраненный вопрос, если он есть)
            this.newRound();
        }
    }

    addEventListeners() {
        this.helpButton.addEventListener('click', () => this.toggleHelp());
        // Кнопка "Дальше" теперь просто переходит к следующему вопросу
        this.nextButton.addEventListener('click', () => this.nextQuestion());
        this.resetButton.addEventListener('click', () => this.startGame());
        // Обработчик для кнопки "Показать решение"
        this.solutionButton.addEventListener('click', () => this.showSolution());
    }

    startGame() {
        // Добавляем диалог подтверждения, так как сброс - это важное действие
        if (confirm("Вы уверены, что хотите сбросить прогресс и начать заново?")) {
            this.score = 0;
            this.errors = 0;
            this.lastQuestionString = null; // Сбрасываем и последний вопрос
            this.updateScore(); // Обновит UI и сохранит сброшенное состояние
            this.updateErrors();

            // Очищаем игровое поле и даем обратную связь пользователю
            this.stopTimer();
            this.questionElement.textContent = '';
            this.answersContainer.innerHTML = '';
            this.feedbackText.textContent = 'Прогресс сброшен. Начинаем новую игру...';
            this.feedbackText.style.color = '#6c5ce7'; // Фиолетовый для информационного сообщения
            document.getElementById('explanation-area').classList.add('hidden');
            this.solutionButton.classList.add('hidden');
            this.nextButton.classList.add('hidden');

            // Начинаем новый раунд с небольшой задержкой, чтобы игрок успел увидеть сообщение
            setTimeout(() => this.newRound(), 2000); // Задержка в 2 секунды
        }
    }

    newRound() {
        this.feedbackText.textContent = '';
        this.solutionWasShown = false; // Сбрасываем флаг подсказки
        document.getElementById('explanation-area').classList.add('hidden'); // Прячем область решения
        this.stopTimer();
        this.questionAnswered = false; // Новый вопрос еще не был отвечен

        // Кнопка "Дальше" по умолчанию скрыта. Она появится только после просмотра решения.
        this.nextButton.classList.add('hidden');

        // Сложность теперь зависит от очков, а не от уровня
        const difficulty = Math.floor(this.score / 50) + 1;

        let generatedData;

        // Используем сохраненное состояние вопроса при перезагрузке или генерируем новый
        if (this.loadedQuestionState?.questionData) {
            generatedData = this.generateQuestionAndAnswers(difficulty, this.loadedQuestionState.questionData);
            this.loadedQuestionState = null; // Очищаем временное хранилище
        } else {
            // Используем новую утилиту для генерации уникального вопроса
            const generator = () => this.generateQuestionAndAnswers(difficulty);
            generatedData = generateUniqueQuestion(generator, this.lastQuestionString);
        }

        const { question, correctAnswer, answers, questionData } = generatedData;
        this.lastQuestionString = question; // Запоминаем новый вопрос

        // Показываем кнопку "Показать решение", если игра ее поддерживает
        if (this.getSolutionHTML) {
            this.solutionButton.classList.remove('hidden');
            this.solutionButton.disabled = false;
        }

        this.questionElement.textContent = question;
        this.correctAnswer = correctAnswer;
        this.currentQuestionData = questionData || {};

        // Очищаем контейнер и создаем нужный тип ввода
        this.answersContainer.innerHTML = '';

        if (this.answerType === 'textInput') {
            this.createTextInput();
        } else { // по умолчанию 'buttons'
            // Используем новую утилиту для создания кнопок
            createAnswerButtons(this.answersContainer, answers, (answer, button) => this.checkAnswer(answer));
        }

        if (this.timePerQuestion) {
            this.startTimer();
        }

        // Сохраняем состояние нового раунда
        this.saveProgress();

        this.onNewRound(this); // Вызываем колбэк для специфичной логики раунда (например, добавить кнопку "Решение")
    }

    createTextInput() {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'text-answer-input';
        input.placeholder = 'Введите ответ...';
        input.autocomplete = 'off';
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });

        const submitBtn = document.createElement('button');
        submitBtn.textContent = 'Проверить';
        submitBtn.className = 'submit-answer-btn';
        submitBtn.addEventListener('click', () => this.checkAnswer());

        this.answersContainer.appendChild(input);
        this.answersContainer.appendChild(submitBtn);
    }

    checkAnswer(selectedAnswer) {
        this.stopTimer(); // Останавливаем таймер при ответе

        const userAnswer = (this.answerType === 'textInput')
            ? document.getElementById('text-answer-input').value.trim()
            : selectedAnswer;

        // Немедленно сохраняем, что на вопрос ответили, чтобы предотвратить "абуз" перезагрузки
        this.questionAnswered = true;
        this.saveProgress();

        // Сравниваем как числа, если возможно, иначе как строки
        const isCorrect = (userAnswer !== '' && parseFloat(userAnswer) == this.correctAnswer) || userAnswer == this.correctAnswer;

        this.disableInputs(userAnswer, isCorrect);

        if (isCorrect) { // Если ответ верный
            if (this.solutionWasShown) {
                // Верно, но с подсказкой
                this.feedbackText.textContent = `Верно, но с подсказкой очки не начисляются. Ответ: ${this.correctAnswer}.`;
                this.feedbackText.style.color = '#e17055'; // Оранжевый
            } else {
                // Верно и без подсказки - начисляем очки
                this.feedbackText.textContent = this.getSuccessMessage(this);
                this.feedbackText.style.color = '#00b894'; // Зеленый
                this.score += (Math.floor(this.score / 50) + 1) * 10;
                this.updateScore();

                if (this.score > this.highScore) {
                    this.highScore = this.score;
                    this.highScoreElement.textContent = this.highScore;
                    localStorage.setItem(`${this.gameId}HighScore`, this.highScore);
                }
            }
            this.onCorrectAnswer(this);
        } else { // Если ответ неверный
            this.feedbackText.textContent = `Ой! Правильный ответ: ${this.correctAnswer}. ${this.getHint(this)}`;
            this.feedbackText.style.color = '#ff7675'; // Красный для ошибки
            this.errors++;
            this.updateErrors();
            // Автоматически показываем решение при ошибке, если оно есть
            if (this.getSolutionHTML) {
                this.showSolution(true); // true означает, что это автоматический показ
            }
            this.onIncorrectAnswer(this);
        }

        setTimeout(() => this.nextQuestion(), 2500); // Автоматический переход к следующему вопросу
    }

    disableInputs(userAnswer, isCorrect) {
        if (this.answerType === 'textInput') {
            const input = document.getElementById('text-answer-input');
            input.disabled = true;
            input.classList.add(isCorrect ? 'correct-input' : 'incorrect-input');
            this.answersContainer.querySelector('.submit-answer-btn').disabled = true;

            // Блокируем кнопки действий
            this.nextButton.disabled = true;
            this.solutionButton.disabled = true;
        } else {
            const answerButtons = this.answersContainer.querySelectorAll('.answer-btn');
            answerButtons.forEach(btn => {
                btn.disabled = true;
                const btnValue = parseFloat(btn.textContent);
                if (btnValue == this.correctAnswer) {
                    btn.classList.add('correct');
                } else if (btnValue == userAnswer) {
                    btn.classList.add('incorrect');
                }
            });
            // Блокируем кнопки действий
            this.nextButton.disabled = true;
            this.solutionButton.disabled = true;
        }
    }

    nextQuestion() {
        this.newRound();
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
        this.saveProgress(); // Сохраняем прогресс при обновлении очков
    }

    updateErrors() {
        if (this.errorsElement) this.errorsElement.textContent = this.errors;
        this.saveProgress();
    }

    toggleHelp() {
        this.helpText.classList.toggle('hidden');
    }

    startTimer() {
        if (!this.timePerQuestion || !this.timerBar) return;

        this.timeLeft = this.timePerQuestion;
        this.timerBar.parentElement.style.display = 'block'; // Показываем контейнер таймера

        // Сбрасываем анимацию для мгновенного заполнения полосы
        this.timerBar.style.transition = 'none';
        this.timerBar.style.width = '100%';
        this.timerBar.style.backgroundColor = '#55efc3ff'; // Зеленый

        // Эта строка заставляет браузер применить стили немедленно, до следующего кадра
        void this.timerBar.offsetWidth;

        // Возвращаем плавную анимацию
        this.timerBar.style.transition = `width ${this.timePerQuestion}s linear, background-color 0.5s`;
        this.timerBar.style.width = '0%';

        this.timerId = setInterval(() => {
            this.timeLeft--;

            // Меняем цвет, когда время на исходе
            if (this.timeLeft < this.timePerQuestion * 0.4) { // меньше 40%
                this.timerBar.style.backgroundColor = '#fdcb6eff'; // Желтый
            }
            if (this.timeLeft < this.timePerQuestion * 0.2) { // меньше 20%
                this.timerBar.style.backgroundColor = '#ff7675'; // Красный
            }

            if (this.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    stopTimer() {
        clearInterval(this.timerId);
        this.timerId = null;
    }

    timeUp() {
        this.stopTimer();
        this.feedbackText.textContent = `Время вышло! Правильный ответ: ${this.correctAnswer}.`;
        this.feedbackText.style.color = '#ff7675';
        this.disableInputs(null, false); // Блокируем ввод, ответ неверный
        setTimeout(() => this.nextQuestion(), 2500); // Автоматический переход
        this.onIncorrectAnswer(this); // Вызываем колбэк для неверного ответа
    }

    /**
     * Показывает решение вопроса.
     * @param {boolean} isAutoShow - Флаг, указывающий, что показ автоматический (при ошибке).
     */
    showSolution(isAutoShow = false) {
        if (!this.getSolutionHTML) return;

        if (!isAutoShow) { // Если кнопка нажата вручную
            this.solutionWasShown = true;
        }

        const explanationArea = document.getElementById('explanation-area');
        explanationArea.innerHTML = this.getSolutionHTML(this);
        explanationArea.classList.remove('hidden');
        this.solutionButton.disabled = true;

        // Показываем кнопку "Дальше", чтобы можно было перейти к следующему вопросу
        this.nextButton.textContent = 'Дальше →';
        this.nextButton.classList.remove('hidden');
        this.nextButton.disabled = false;
    }

     /**
     * Сохраняет текущий прогресс (очки и уровень) в localStorage.
     */
    saveProgress() {
        const gameState = {
            score: this.score,
            errors: this.errors,
            questionAnswered: this.questionAnswered,
            lastQuestionString: this.lastQuestionString,
            // Сохраняем данные для восстановления вопроса
            currentQuestion: this.currentQuestionData && Object.keys(this.currentQuestionData).length > 0 ? {
                questionData: this.currentQuestionData
            } : null
        };
        localStorage.setItem(`${this.gameId}_gameState`, JSON.stringify(gameState));
    }

    /**
     * Загружает прогресс из localStorage при запуске игры.
     */
    loadProgress() {
        const savedStateJSON = localStorage.getItem(`${this.gameId}_gameState`);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            this.score = savedState.score || 0;
            this.errors = savedState.errors || 0;
            this.questionAnswered = savedState.questionAnswered || false;
            this.lastQuestionString = savedState.lastQuestionString || null;
            if (savedState.currentQuestion) {
                this.loadedQuestionState = savedState.currentQuestion;
            }
        }
        // Обновляем UI в любом случае (либо загруженными, либо дефолтными значениями)
        this.scoreElement.textContent = this.score;
        this.updateErrors();
    }
}