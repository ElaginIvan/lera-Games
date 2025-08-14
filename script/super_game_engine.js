document.addEventListener('DOMContentLoaded', () => {
    // Вспомогательная функция для перемешивания массива
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

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
                    script.src = `/script/games/${id}.js`;
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
            this.nextButton.classList.add('hidden');
            this.answersContainer.innerHTML = '';

            // Выбираем случайную игру из списка
            const randomConfig = this.loadedConfigs[Math.floor(Math.random() * this.loadedConfigs.length)];

            // Удаляем класс предыдущей игры и добавляем класс текущей, чтобы применились стили
            const gameContainer = this.gameArea.parentElement;
            if (this.currentGameId) {
                gameContainer.classList.remove(this.currentGameId);
            }
            gameContainer.classList.add(randomConfig.gameId);
            this.currentGameId = randomConfig.gameId;
            
            // Генерируем вопрос, используя ее логику (уровень всегда 1, но можно усложнить)
            const { question, correctAnswer, answers } = randomConfig.generateQuestionAndAnswers(1);

            this.questionPromptElement.textContent = randomConfig.questionPrompt;
            this.questionElement.textContent = question;
            this.currentCorrectAnswer = correctAnswer;

            // Создаем кнопки ответов
            const shuffledAnswers = shuffleArray(answers);
            shuffledAnswers.forEach(answer => {
                const button = document.createElement('button');
                button.className = 'answer-btn';
                button.textContent = answer;
                button.addEventListener('click', () => this.checkAnswer(answer, button));
                this.answersContainer.appendChild(button);
            });
        }

        checkAnswer(selectedAnswer, button) {
            // Блокируем все кнопки
            const answerButtons = this.answersContainer.querySelectorAll('.answer-btn');
            answerButtons.forEach(btn => btn.disabled = true);

            const isCorrect = selectedAnswer == this.currentCorrectAnswer;

            if (isCorrect) {
                this.feedbackText.textContent = "Правильно!";
                this.feedbackText.style.color = '#00b894';
                button.classList.add('correct');
                this.score += 10;
                this.questionCount++;
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
            }

            this.updateUI();
            this.nextButton.classList.remove('hidden');
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