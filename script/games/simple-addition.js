(function () {
    window.gameConfigs = window.gameConfigs || {};

    window.gameConfigs['simple-addition'] = {
        // --- Данные для шаблона ---
        title: "➕ СУПЕР-СЧЁТ ➖",
        questionPrompt: "Реши пример:",
        helpHTML: `
            <p>Просто сложи два числа и впиши ответ в поле.</p>
            <p>С каждым уровнем числа будут становиться больше!</p>
        `,

        // --- Конфигурация для движка ---
        gameId: 'simple-addition',
        // answerType: 'textInput', // Раскомментируйте, чтобы использовать текстовый ввод, а не кнопки
        levelUpScoreMultiplier: 40, // Для повышения уровня нужно 40 * уровень очков
        timePerQuestion: 15, // Время на ответ: 15 секунд

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

            // Генерируем варианты ответов для режима с кнопками.
            // Если в конфигурации будет указан answerType: 'textInput',
            // движок просто проигнорирует этот массив.
            const answers = [correctAnswer];
            while (answers.length < 4) {
                // Генерируем неверный ответ, близкий к правильному
                const deviation = Math.floor(Math.random() * 10) + 1; // отклонение от 1 до 10
                const wrongAnswer = correctAnswer + (Math.random() > 0.5 ? deviation : -deviation);

                // Убедимся, что ответ не отрицательный и не дублируется
                if (wrongAnswer >= 0 && !answers.includes(wrongAnswer)) {
                    answers.push(wrongAnswer);
                }
            }

            return {
                question: `${num1} + ${num2}`,
                correctAnswer: correctAnswer,
                answers: answers, // Теперь массив содержит варианты
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