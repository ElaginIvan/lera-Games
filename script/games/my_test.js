(function () {
    window.gameConfigs = window.gameConfigs || {};

    window.gameConfigs['my_test'] = {
        // --- Данные для шаблона ---
        title: 'Моя игра',
        questionPrompt: "Реши пример:",
        helpHTML: `
            <p>Просто сложи два числа и впиши ответ в поле.</p>
            <p>С каждым уровнем числа будут становиться больше!</p>
        `,

        // --- Конфигурация для движка ---
        gameId: 'my_test',
        answerType: 'textInput', // Указываем новый тип ответов!
        // timePerQuestion: 15, // Время на ответ: 15 секунд

        getSolutionHTML: (gameInstance) => {
            const { num1, num2 } = gameInstance.currentQuestionData;
            const correctAnswer = gameInstance.correctAnswer;
            return `<p>Решение: ${num1} + ${num2} = ${correctAnswer}</p>`;
        },

        generateQuestionAndAnswers: (level, existingQuestionData = null) => {
            let num1, num2;
            if (existingQuestionData) {
                // Восстанавливаем числа из сохраненных данных
                num1 = existingQuestionData.num1;
                num2 = existingQuestionData.num2;
            } else {
                // Генерируем новые случайные числа
                const maxNumber = level * 5 + 5;
                num1 = Math.floor(Math.random() * maxNumber) + 1;
                num2 = Math.floor(Math.random() * maxNumber) + 1;
            }

            const correctAnswer = num1 + num2;

            // генератор ответов
            const answers = [correctAnswer];
            while (answers.length < 4) {
                let wrongAnswer = correctAnswer + Math.floor(Math.random() * 10) - 5; // +/- 5 от правильного
                if (wrongAnswer < 0) wrongAnswer = 0;
                if (!answers.includes(wrongAnswer)) {
                    answers.push(wrongAnswer);
                }
            }

            return {
                question: `${num1} + ${num2}`,
                correctAnswer: correctAnswer,
                answers: answers, // Пустой массив
                questionData: { num1, num2 }
            };
        },

        getSuccessMessage: () => {
            const messages = [
                "Точно! Ты чемпион по счёту!",
                "Правильно! Математика - это просто!",
                "Супер! Отличная работа!"
            ];
            return messages[Math.floor(Math.random() * messages.length)];
        },

        getHint: () => {
            const hints = [
                "Попробуй посчитать еще раз, не торопись.",
                "Используй пальчики, если нужно!",
            ];
            return hints[Math.floor(Math.random() * hints.length)];
        }
    };
})();