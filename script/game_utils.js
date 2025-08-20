/**
 * Вспомогательная функция для перемешивания массива (алгоритм Фишера-Йейтса).
 * Создает копию массива, не изменяя исходный.
 * @param {Array} array - Массив для перемешивания.
 * @returns {Array} - Перемешанный массив.
 */
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/**
 * Генерирует уникальный вопрос, избегая повторения с предыдущим.
 * @param {Function} generatorFunction - Функция, которая генерирует новый вопрос. Должна возвращать объект с полем `question` (string).
 * @param {string|null} lastQuestionString - Строковое представление предыдущего вопроса.
 * @returns {object} - Новый сгенерированный объект вопроса.
 */
function generateUniqueQuestion(generatorFunction, lastQuestionString) {
    let generatedData;
    let attempts = 0;
    const MAX_ATTEMPTS = 10; // Защита от бесконечного цикла

    do {
        generatedData = generatorFunction();
        attempts++;
    } while (generatedData.question === lastQuestionString && attempts < MAX_ATTEMPTS);

    return generatedData;
}

/**
 * Создает и добавляет кнопки с вариантами ответов в указанный контейнер.
 * @param {HTMLElement} container - DOM-элемент, в который будут добавлены кнопки.
 * @param {string[]} answers - Массив строк с вариантами ответов.
 * @param {Function} clickHandler - Функция-обработчик клика. Будет вызвана с двумя аргументами: (ответ, элемент_кнопки).
 */
function createAnswerButtons(container, answers, clickHandler) {
    const shuffledAnswers = shuffleArray(answers);
    shuffledAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.textContent = answer;
        button.addEventListener('click', () => clickHandler(answer, button));
        container.appendChild(button);
    });
}