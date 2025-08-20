(function () {
    window.gameConfigs = window.gameConfigs || {};

    window.gameConfigs['multiplication'] = {
        // --- Данные для шаблона ---
        title: "✖️ МАСТЕР УМНОЖЕНИЯ ✖️",
        questionPrompt: "Сколько будет:",
        helpHTML: `
            <p>Нужно правильно решить пример на умножение.</p>
            <p>С каждым уровнем числа будут становиться больше, а примеры сложнее!</p>
            <p>Например: 5 × 6 = 30</p>
        `,

        // --- Конфигурация для движка ---
        gameId: 'multiplication',
        answerType: 'textInput', // Используем кнопки для ответов
        // timePerQuestion: 15, // 15 секунд на ответ

        getSolutionHTML: (gameInstance) => {
            const { num1, num2 } = gameInstance.currentQuestionData;
            const correctAnswer = gameInstance.correctAnswer;
            return `<p>Решение: ${num1} × ${num2} = ${correctAnswer}</p>`;
        },

        generateQuestionAndAnswers: (level, existingQuestionData = null) => {
            let num1, num2;
            if (existingQuestionData) {
                // Восстанавливаем числа из сохраненных данных
                num1 = existingQuestionData.num1;
                num2 = existingQuestionData.num2;
            } else {
                // Улучшенная логика для более полного охвата таблицы умножения
                if (level <= 3) { // Уровни 1-3: Основы таблицы умножения (до 5)
                    num1 = Math.floor(Math.random() * 5) + 1; // 1-5
                    num2 = Math.floor(Math.random() * 5) + 1; // 1-5
                } else if (level <= 6) { // Уровни 4-6: Полная стандартная таблица (до 10)
                    num1 = Math.floor(Math.random() * 10) + 1; // 1-10
                    num2 = Math.floor(Math.random() * 10) + 1; // 1-10
                } else { // Уровни 7+: Продвинутые примеры (до 12)
                    num1 = Math.floor(Math.random() * 12) + 1; // 1-12
                    num2 = Math.floor(Math.random() * 10) + 1;  // 1-10
                }
            }

            const correctAnswer = num1 * num2;

            // Генерируем варианты ответов для кнопок
            const answers = [correctAnswer];
            while (answers.length < 4) {
                // Генерируем неверный ответ, который может быть похож на правильный
                let wrongAnswer;
                const errorType = Math.random();
                if (errorType < 0.33) {
                    // Ошибка на единицу в одном из множителей
                    wrongAnswer = num1 * (num2 + (Math.random() > 0.5 ? 1 : -1));
                } else if (errorType < 0.66) {
                    // Ошибка на единицу в другом множителе
                    wrongAnswer = (num1 + (Math.random() > 0.5 ? 1 : -1)) * num2;
                } else {
                    // Случайное отклонение
                    const deviation = Math.floor(Math.random() * 10) + 1;
                    wrongAnswer = correctAnswer + (Math.random() > 0.5 ? deviation : -deviation);
                }

                // Убедимся, что ответ не отрицательный, не равен правильному и не дублируется
                if (wrongAnswer >= 0 && wrongAnswer !== correctAnswer && !answers.includes(wrongAnswer)) {
                    answers.push(wrongAnswer);
                }
            }

            return {
                question: `${num1} × ${num2}`,
                correctAnswer: correctAnswer,
                answers: answers,
                questionData: { num1, num2 }
            };
        },

        getSuccessMessage: () => {
            const messages = [
                "Отлично! Ты знаешь таблицу умножения!",
                "Правильно! Так держать!",
                "Супер! Еще один верный ответ!"];
            return messages[Math.floor(Math.random() * messages.length)];
        },

        getHint: () => {
            const hints = ["Попробуй посчитать еще раз, не торопись.", "Вспомни таблицу умножения."];
            return hints[Math.floor(Math.random() * hints.length)];
        }
    };
})();