// Проверяем, есть ли доступ
if (!localStorage.getItem('childAccess')) {
    window.location.href = "/lera-games/index.html";
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
const factorialExplanation = document.getElementById('factorial-explanation');

// Игровые переменные
let score = 0;
let level = 1;
let highScore = localStorage.getItem('factorialHighScore') || 0;
let correctAnswer;
let currentNumber;

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
    // Генерируем число для факториала (от 0 до 8 для начала)
    // С увеличением уровня увеличиваем диапазон
    let maxNumber = Math.min(3 + level, 8); // Максимум 8, чтобы не было слишком больших чисел
    currentNumber = Math.floor(Math.random() * (maxNumber + 1));

    questionElement.textContent = currentNumber;
    correctAnswer = calculateFactorial(currentNumber);

    // Скрываем объяснение
    factorialExplanation.classList.add('hidden');

    generateAnswers(currentNumber, correctAnswer);
}

function generateAnswers(number, correctAnswer) {
    answersContainer.innerHTML = '';

    // Создаем массив возможных ответов
    let answers = [correctAnswer];

    // Добавляем неправильные ответы
    while (answers.length < 4) {
        let wrongAnswer;

        // Разные стратегии для генерации неправильных ответов
        if (number > 0) {
            // Вариант 1: пропустить один множитель
            if (Math.random() > 0.5) {
                wrongAnswer = calculateFactorial(number - 1) * number;
            }
            // Вариант 2: добавить/убавить случайное число
            else {
                let deviation = Math.floor(Math.random() * 10) + 1;
                if (Math.random() > 0.5) deviation = -deviation;
                wrongAnswer = correctAnswer + deviation;
                if (wrongAnswer < 0) wrongAnswer = 0;
            }
        } else {
            // Для 0! специальные варианты
            wrongAnswer = Math.floor(Math.random() * 5);
            if (wrongAnswer === 1) wrongAnswer = 2; // 1 - правильный ответ
        }

        // Убедимся, что ответ уникален и положительный
        if (!answers.includes(wrongAnswer) && wrongAnswer >= 0) {
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

    // Добавляем кнопку "Показать решение"
    const explanationBtn = document.createElement('button');
    explanationBtn.className = 'explanation-btn';
    explanationBtn.textContent = 'Показать решение';
    explanationBtn.addEventListener('click', showExplanation);
    answersContainer.appendChild(explanationBtn);
}

function showExplanation() {
    if (currentNumber === 0) {
        factorialExplanation.innerHTML = '<p>0! = 1 (по определению)</p>';
    } else {
        let explanation = `${currentNumber}! = `;
        for (let i = 1; i <= currentNumber; i++) {
            explanation += i;
            if (i < currentNumber) explanation += ' × ';
        }
        explanation += ` = ${correctAnswer}`;
        factorialExplanation.innerHTML = `<p>${explanation}</p>`;
    }
    factorialExplanation.classList.remove('hidden');
}

function checkAnswer(selectedAnswer) {
    // Отключаем все кнопки ответов
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach(btn => {
        btn.disabled = true;
        if (parseInt(btn.textContent) === correctAnswer) {
            btn.classList.add('correct');
        } else if (parseInt(btn.textContent) === parseInt(selectedAnswer) && parseInt(selectedAnswer) !== correctAnswer) {
            btn.classList.add('incorrect');
        }
    });

    // Проверяем ответ
    if (parseInt(selectedAnswer) === correctAnswer) {
        feedbackText.textContent = getRandomSuccessMessage();
        score += level * 10;
        updateScore();

        // Обновляем рекорд
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('factorialHighScore', highScore);
        }
    } else {
        feedbackText.textContent = `Ой! Правильный ответ: ${correctAnswer}. ${getRandomHint()}`;
        showExplanation();
    }

    nextButton.classList.remove('hidden');
}

function nextQuestion() {
    feedbackText.textContent = '';
    nextButton.classList.add('hidden');

    // Повышаем уровень каждые 5 правильных ответов
    if (score >= level * 50) {
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

// Функция вычисления факториала
function calculateFactorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
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
        "Верно! Ты факториальный гений!",
        "Правильно! Умножение - твоя суперсила!",
        "Отлично! Ты мастер факториалов!",
        "Супер! Ты решил это как профессор математики!",
        "Браво! Факториалы тебе по плечу!",
        "Великолепно! Ты умножаешь как компьютер!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

function getRandomHint() {
    const hints = [
        `Помни: ${currentNumber}! - это произведение всех чисел от 1 до ${currentNumber}.`,
        "Попробуй последовательно умножать числа от 1 до N!",
        "Не переживай, в следующий раз получится!",
        "Для тренировки можешь записать все числа от 1 до N и перемножить их.",
        "Если забыл, можешь нажать кнопку 'Помощь' или 'Показать решение'!"
    ];
    return hints[Math.floor(Math.random() * hints.length)];
}

