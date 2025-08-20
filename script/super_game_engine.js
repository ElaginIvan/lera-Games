document.addEventListener('DOMContentLoaded', () => {
    class SuperGame {
        constructor(gameIds) {
            this.gameIds = gameIds;
            this.loadedConfigs = [];
            this.score = 0;
            this.questionCount = 0;
            this.gameDuration = 180; // 3 минуты
            this.timeLeft = this.gameDuration;
            this.timerId = null;
            this.currentCorrectAnswer = null;
            this.currentGameId = null; // Для отслеживания текущего класса стиля
            this.lastQuestionString = null; // Для защиты от повтора вопросов

            // Элементы DOM
            this.timeLeftElement = document.getElementById('time-left');
            this.scoreElement = document.getElementById('score');
            this.questionCountElement = document.getElementById('question-count');
            this.questionPromptElement = document.getElementById('question-prompt');
            this.questionElement = document.getElementById('question');
            this.answersContainer = document.querySelector('.answers');
            this.feedbackText = document.getElementById('feedback-text');
            this.nextButton = document.getElementById('next-btn');
            this.gameArea = document.querySelector('.game-area');
            this.gameOverScreen = document.getElementById('game-over-screen');
            this.finalScoreElement = document.getElementById('final-score');
            this.finalQuestionsElement = document.getElementById('final-questions');
            this.restartButton = document.getElementById('restart-btn');
            this.newRecordMessageElement = document.getElementById('new-record-message');

            this.init();
        }

        async init() {
            try {
                await this.loadGameConfigs(); // Ждем, пока все конфиги загрузятся

                if (this.loadedConfigs.length === 0) {
                    throw new Error('Не удалось загрузить конфигурации для выбранных игр.');
                }

                this.nextButton.addEventListener('click', () => this.newQuestion());
                this.restartButton.addEventListener('click', () => window.location.reload());

                this.startGame();
            } catch (error) {
                console.error("Ошибка инициализации марафона:", error);
                this.gameArea.innerHTML = `<h1>Ошибка при загрузке марафона</h1><p>${error.message}</p>`;
            }
        }

        // Новый асинхронный метод для загрузки конфигов
        async loadGameConfigs() {
            window.gameConfigs = window.gameConfigs || {};

            const loadPromises = this.gameIds.map(id => {
                return new Promise((resolve, reject) => {
                    // Если конфиг уже есть, используем его
                    if (window.gameConfigs[id]) {
                        return resolve(window.gameConfigs[id]);
                    }
                    // Иначе, загружаем скрипт
                    const script = document.createElement('script');
                    script.src = `/lera_game/script/games/${id}.js`;
                    script.onload = () => {
                        if (window.gameConfigs[id]) {
                            resolve(window.gameConfigs[id]);
                        } else {
                            reject(new Error(`Конфигурация для "${id}" не найдена.`));
                        }
                    };
                    script.onerror = () => reject(new Error(`Не удалось загрузить скрипт для "${id}".`));
                    document.body.appendChild(script);
                });
            });

            this.loadedConfigs = await Promise.all(loadPromises);
        }

        startGame() {
            this.score = 0;
            this.questionCount = 0;
            this.timeLeft = this.gameDuration;
            this.updateUI();
            this.startTimer();
            this.newQuestion();
            this.gameArea.classList.remove('hidden');
            this.gameOverScreen.classList.add('hidden');
        }

        startTimer() {
            this.timerId = setInterval(() => {
                this.timeLeft--;
                this.updateUI();
                if (this.timeLeft <= 0) {
                    this.endGame();
                }
            }, 1000);
        }

        updateUI() {
            const minutes = Math.floor(this.timeLeft / 60);
            const seconds = this.timeLeft % 60;
            this.timeLeftElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            this.scoreElement.textContent = this.score;
            this.questionCountElement.textContent = this.questionCount;
        }

        newQuestion() {
            this.feedbackText.textContent = '';
            // Показываем кнопку "Дальше" сразу, чтобы можно было пропустить вопрос
            this.nextButton.classList.remove('hidden');
            this.nextButton.disabled = false; // Убедимся, что кнопка активна

            this.answersContainer.innerHTML = '';

            // Создаем функцию-генератор, которая будет возвращать новый вопрос
            const questionGenerator = () => {
                // Выбираем случайную игру из списка
                const randomConfig = this.loadedConfigs[Math.floor(Math.random() * this.loadedConfigs.length)];
                // Генерируем вопрос, используя ее логику (уровень всегда 1, но можно усложнить)
                const questionData = randomConfig.generateQuestionAndAnswers(1);
                // Добавляем конфиг к данным, чтобы использовать его позже (например, для заголовка)
                return { ...questionData, config: randomConfig };
            };

            // Используем утилиту для получения уникального вопроса
            const generatedData = generateUniqueQuestion(questionGenerator, this.lastQuestionString);
            const { question, correctAnswer, answers, config } = generatedData;

            this.lastQuestionString = question; // Запоминаем новый вопрос для следующей проверки
            this.questionPromptElement.textContent = config.questionPrompt;
            this.questionElement.textContent = question;
            this.currentCorrectAnswer = correctAnswer;

            // Создаем кнопки ответов
            createAnswerButtons(this.answersContainer, answers, (answer, button) => this.checkAnswer(answer, button));
        }

        checkAnswer(selectedAnswer, button) {
            // Блокируем все кнопки
            const answerButtons = this.answersContainer.querySelectorAll('.answer-btn');
            answerButtons.forEach(btn => btn.disabled = true);

            // Блокируем кнопку "Дальше" на время проверки, чтобы избежать двойных нажатий
            this.nextButton.disabled = true;

            const isCorrect = selectedAnswer == this.currentCorrectAnswer;

            if (isCorrect) {
                this.feedbackText.textContent = "Правильно!";
                this.feedbackText.style.color = '#00b894';
                button.classList.add('correct');
                this.score += 10;
                this.questionCount++;
                this.updateUI();

                // При правильном ответе переходим к следующему вопросу автоматически через 1 секунду
                setTimeout(() => this.newQuestion(), 1000);
            } else {
                this.feedbackText.textContent = `Ошибка! Правильный ответ: ${this.currentCorrectAnswer}`;
                this.feedbackText.style.color = '#ff7675';
                button.classList.add('incorrect');
                // Подсвечиваем правильный ответ
                answerButtons.forEach(btn => {
                    if (btn.textContent == this.currentCorrectAnswer) {
                        btn.classList.add('correct');
                    }
                });
                // При ошибке оставляем кнопку "Дальше" активной, чтобы пользователь мог перейти сам
                this.nextButton.disabled = false;
            }
        }

        endGame() {
            clearInterval(this.timerId);
            this.gameArea.classList.add('hidden');
            this.gameOverScreen.classList.remove('hidden');
            this.finalScoreElement.textContent = this.score;
            this.finalQuestionsElement.textContent = this.questionCount;

            // Сохранение и отображение рекорда марафона
            const marathonHighScore = localStorage.getItem('marathonHighScore') || 0;
            if (this.score > 0 && this.score > marathonHighScore) {
                localStorage.setItem('marathonHighScore', this.score);
                this.newRecordMessageElement.textContent = `🎉 Новый рекорд!`;
                this.newRecordMessageElement.classList.remove('hidden');
            }
        }
    }

    // --- Запуск ---
    const urlParams = new URLSearchParams(window.location.search);
    const gameIdsParam = urlParams.get('games');

    if (gameIdsParam) {
        const gameIds = gameIdsParam.split(',');
        new SuperGame(gameIds);
    } else {
        document.body.innerHTML = '<h1>Ошибка: не выбраны игры для марафона.</h1>';
    }
});