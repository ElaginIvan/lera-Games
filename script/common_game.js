// Проверяем, есть ли доступ. Теперь это делается в одном месте.
if (!localStorage.getItem('childAccess')) {
    // Используем абсолютный путь, чтобы избежать ошибок при вызове из вложенных папок
    window.location.href = "/lera-games/index.html";
}

/**
 * Вспомогательная функция для перемешивания массива.
 * @param {Array} array - Массив для перемешивания.
 * @returns {Array} - Перемешанный массив.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Класс Game - наш универсальный игровой движок.
 */
class Game {
    constructor(config) {
        // --- Конфигурация игры (уникальна для каждого урока) ---
        this.gameId = config.gameId; // e.g., 'factorial', 'square-root'
        this.levelUpScoreMultiplier = config.levelUpScoreMultiplier || 30;
        this.generateQuestionAndAnswers = config.generateQuestionAndAnswers;
        this.getSuccessMessage = config.getSuccessMessage;
        this.getHint = config.getHint;
        // Функции-колбэки для дополнительной логики
        this.onNewRound = config.onNewRound || (() => {});
        this.onCorrectAnswer = config.onCorrectAnswer || (() => {});
        this.onIncorrectAnswer = config.onIncorrectAnswer || (() => {});

        // --- Общие элементы DOM ---
        this.questionElement = document.getElementById('question');
        this.answersContainer = document.querySelector('.answers');
        this.feedbackText = document.getElementById('feedback-text');
        this.nextButton = document.getElementById('next-btn');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.highScoreElement = document.getElementById('high-score');
        this.helpButton = document.getElementById('help-btn');
        this.helpText = document.getElementById('help-text');

        // --- Состояние игры ---
        this.score = 0;
        this.level = 1;
        // Ключ для рекорда теперь генерируется автоматически, например 'factorialHighScore'
        this.highScore = localStorage.getItem(`${this.gameId}HighScore`) || 0;
        this.correctAnswer = null;
        this.currentQuestionData = null; // Для хранения доп. данных, например, числа для факториала

        // --- Инициализация ---
        this.highScoreElement.textContent = this.highScore;
        this.addEventListeners();
        this.startGame();
    }

    addEventListeners() {
        this.helpButton.addEventListener('click', () => this.toggleHelp());
        this.nextButton.addEventListener('click', () => this.nextQuestion());
    }

    startGame() {
        this.score = 0;
        this.level = 1;
        this.levelElement.textContent = this.level;
        this.updateScore();
        this.newRound();
    }

    newRound() {
        this.feedbackText.textContent = '';
        this.nextButton.classList.add('hidden');

        const { question, correctAnswer, answers, questionData } = this.generateQuestionAndAnswers(this.level);

        this.questionElement.textContent = question;
        this.correctAnswer = correctAnswer;
        this.currentQuestionData = questionData || {};

        this.answersContainer.innerHTML = '';
        const shuffledAnswers = shuffleArray(answers);
        shuffledAnswers.forEach(answer => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer;
            button.addEventListener('click', () => this.checkAnswer(answer));
            this.answersContainer.appendChild(button);
        });

        this.onNewRound(this); // Вызываем колбэк для специфичной логики раунда (например, добавить кнопку "Решение")
    }

    checkAnswer(selectedAnswer) {
        const isCorrect = parseFloat(selectedAnswer) == this.correctAnswer;

        const answerButtons = this.answersContainer.querySelectorAll('.answer-btn');
        answerButtons.forEach(btn => {
            btn.disabled = true;
            const btnValue = parseFloat(btn.textContent);
            if (btnValue == this.correctAnswer) {
                btn.classList.add('correct');
            } else if (btnValue == selectedAnswer) {
                btn.classList.add('incorrect');
            }
        });

        if (isCorrect) {
            this.feedbackText.textContent = this.getSuccessMessage(this);
            this.score += this.level * 10;
            this.updateScore();

            if (this.score > this.highScore) {
                this.highScore = this.score;
                this.highScoreElement.textContent = this.highScore;
                localStorage.setItem(`${this.gameId}HighScore`, this.highScore);
            }
            this.onCorrectAnswer(this);
        } else {
            this.feedbackText.textContent = `Ой! Правильный ответ: ${this.correctAnswer}. ${this.getHint(this)}`;
            this.onIncorrectAnswer(this);
        }

        this.nextButton.classList.remove('hidden');
    }

    nextQuestion() {
        if (this.score >= this.level * this.levelUpScoreMultiplier) {
            this.level++;
            this.levelElement.textContent = this.level;
            this.feedbackText.textContent = `Ура! Ты достиг уровня ${this.level}!`;
            setTimeout(() => this.newRound(), 1500);
        } else {
            this.newRound();
        }
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    toggleHelp() {
        this.helpText.classList.toggle('hidden');
    }
}
