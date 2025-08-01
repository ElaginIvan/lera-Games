// Проверяем, есть ли доступ
if (!localStorage.getItem('childAccess')) {
    window.location.href = "index.html";
}

// Элементы DOM
const questionElement = document.getElementById('question');
const answersContainer = document.querySelector('.answers');
const feedbackText = document.getElementById('feedback-text');
const nextButton = document.getElementById('next-btn');
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const highScoreElement = document.getElementById('high-score');
const helpButton = document.getElementById('help-btn');
const helpText = document.getElementById('help-text');

// Игровые переменные
let score = 0;
let level = 1;
let highScore = localStorage.getItem('square-rootlHighScore') || 0;
let correctAnswer;

// Начало игры
highScoreElement.textContent = highScore;
startGame();

// Обработчики событий
helpButton.addEventListener('click', toggleHelp);
nextButton.addEventListener('click', nextQuestion);

// Функции игры
function startGame() {
    score = 0;
    level = 1;
    updateScore();
    generateQuestion();
}

function generateQuestion() {
    // Генерируем число, из которого будем брать корень
    // На первых уровнях используем полные квадраты
    let number;
    if (level <= 3) {
        // Уровни 1-3: простые квадраты до 10
        const squares = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];
        number = squares[Math.floor(Math.random() * squares.length)];
    } else if (level <= 6) {
        // Уровни 4-6: квадраты до 15
        const squares = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225];
        number = squares[Math.floor(Math.random() * squares.length)];
    } else {
        // Уровни 7+: случайные числа до 400
        number = Math.floor(Math.random() * 400) + 1;
    }

    questionElement.textContent = number;
    correctAnswer = Math.sqrt(number);

    // Если корень не целый, округляем для простоты
    if (!Number.isInteger(correctAnswer)) {
        correctAnswer = Math.round(correctAnswer * 100) / 100;
    }

    generateAnswers(number, correctAnswer);
}

function generateAnswers(number, correctAnswer) {
    answersContainer.innerHTML = '';

    // Создаем массив возможных ответов
    let answers = [correctAnswer];

    // Добавляем неправильные ответы
    while (answers.length < 4) {
        let wrongAnswer;

        if (Number.isInteger(correctAnswer)) {
            // Для целых корней
            wrongAnswer = correctAnswer + Math.floor(Math.random() * 5) + 1;
            if (Math.random() > 0.5) wrongAnswer = correctAnswer - Math.floor(Math.random() * 5) - 1;
            if (wrongAnswer < 0) wrongAnswer = 0;
        } else {
            // Для нецелых корней
            wrongAnswer = correctAnswer + (Math.random() * 2 + 1);
            if (Math.random() > 0.5) wrongAnswer = correctAnswer - (Math.random() * 2 + 1);
            wrongAnswer = Math.round(wrongAnswer * 100) / 100;
            if (wrongAnswer < 0) wrongAnswer = 0;
        }

        // Убедимся, что ответ уникален
        if (!answers.includes(wrongAnswer)) {
            answers.push(wrongAnswer);
        }
    }

    // Перемешиваем ответы
    answers = shuffleArray(answers);

    // Создаем кнопки с ответами
    answers.forEach(answer => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.textContent = answer;
        button.addEventListener('click', () => checkAnswer(answer));
        answersContainer.appendChild(button);
    });
}

function checkAnswer(selectedAnswer) {
    // Отключаем все кнопки ответов
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach(btn => {
        btn.disabled = true;
        if (parseFloat(btn.textContent) === correctAnswer) {
            btn.classList.add('correct');
        } else if (parseFloat(btn.textContent) === parseFloat(selectedAnswer) && parseFloat(selectedAnswer) !== correctAnswer) {
            btn.classList.add('incorrect');
        }
    });

    // Проверяем ответ
    if (parseFloat(selectedAnswer) === correctAnswer) {
        feedbackText.textContent = getRandomSuccessMessage();
        score += level * 10;
        updateScore();

        // Обновляем рекорд
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('square-rootlHighScore', highScore);
        }
    } else {
        feedbackText.textContent = `Ой! Правильный ответ: ${correctAnswer}. ${getRandomHint()}`;
    }

    nextButton.classList.remove('hidden');
}

function nextQuestion() {
    feedbackText.textContent = '';
    nextButton.classList.add('hidden');

    // Повышаем уровень каждые 3 правильных ответа
    if (score >= level * 30) {
        level++;
        levelElement.textContent = level;
        feedbackText.textContent = `Ура! Ты достиг уровня ${level}!`;
        setTimeout(() => {
            feedbackText.textContent = '';
            generateQuestion();
        }, 1500);
    } else {
        generateQuestion();
    }
}

function updateScore() {
    scoreElement.textContent = score;
}

function toggleHelp() {
    helpText.classList.toggle('hidden');
}

// Вспомогательные функции
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomSuccessMessage() {
    const messages = [
        "Верно! Ты гений квадратных корней!",
        "Правильно! Какой ты умный!",
        "Отлично! Ты мастер корней!",
        "Супер! Ты решил это как профессионал!",
        "Браво! Квадратные корни тебе по плечу!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

function getRandomHint() {
    const hints = [
        `Помни: квадратный корень из ${questionElement.textContent} - это число, которое при умножении на себя дает ${questionElement.textContent}.`,
        "Попробуй вспомнить таблицу квадратов чисел!",
        "Не переживай, в следующий раз получится!",
        "Попробуй подобрать число, которое при умножении на себя даст исходное число.",
        "Если забыл, можешь нажать кнопку 'Помощь'!"
    ];
    return hints[Math.floor(Math.random() * hints.length)];
}