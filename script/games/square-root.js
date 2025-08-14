(function () {
    window.gameConfigs = window.gameConfigs || {};

    window.gameConfigs['square-root'] = {
        // Новые поля для заполнения шаблона
        title: "🎪 КОРЕНЬ-ШОУ! 🎁",
        questionPrompt: "Каков квадратный корень из:",
        helpHTML: `
            <p>Квадратный корень из числа - это число, которое при умножении на себя дает исходное число.</p>
            <p>Пример: √25 = 5, потому что 5 × 5 = 25</p>
        `,

        // Старая конфигурация
        gameId: 'square-root',
        answerType: 'textInput', // Указываем новый тип ответов!
        levelUpScoreMultiplier: 30, // Для повышения уровня нужно 30 * уровень очков
        // timePerQuestion: 10, // Время на ответ: 10 секунд

        getSolutionHTML: (gameInstance) => {
            const number = gameInstance.currentQuestionData.number;
            const correctAnswer = gameInstance.correctAnswer;
            return `<p>√${number} = ${correctAnswer}, потому что ${correctAnswer} × ${correctAnswer} = ${number}</p>`;
        },


        generateQuestionAndAnswers: (level, existingQuestionData = null) => {
            let number;
            if (existingQuestionData) {
                // Восстанавливаем число из сохраненных данных
                number = existingQuestionData.number;
            } else {
                // Генерируем новое случайное число
                if (level <= 3) {
                    const squares = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];
                    number = squares[Math.floor(Math.random() * squares.length)];
                } else if (level <= 6) {
                    const squares = [121, 144, 169, 196, 225];
                    number = squares[Math.floor(Math.random() * squares.length)];
                } else {
                    const base = Math.floor(Math.random() * 15) + 11; // от 11 до 25
                    number = base * base;
                }
            }

            const correctAnswer = Math.sqrt(number);

            let answers = [correctAnswer];
            while (answers.length < 4) {
                let wrongAnswer = correctAnswer + (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
                if (wrongAnswer < 0) wrongAnswer = 0;
                if (!answers.includes(wrongAnswer)) {
                    answers.push(wrongAnswer);
                }
            }

            return {
                question: number,
                correctAnswer: correctAnswer,
                answers: answers,
                questionData: { number: number }
            };
        },

        getSuccessMessage: () => {
            const messages = [
                "Верно! Ты гений квадратных корней!",
                "Правильно! Какой ты умный!",
                "Отлично! Ты мастер корней!",
                "Супер! Ты решил это как профессионал!",
                "Браво! Квадратные корни тебе по плечу!"
            ];
            return messages[Math.floor(Math.random() * messages.length)];
        },

        getHint: (gameInstance) => {
            const number = gameInstance.currentQuestionData.number;
            const hints = [
                `Помни: квадратный корень из ${number} - это число, которое при умножении на себя дает ${number}.`,
                "Попробуй вспомнить таблицу квадратов чисел!",
                "Не переживай, в следующий раз получится!",
            ];
            return hints[Math.floor(Math.random() * hints.length)];
        }
    };
})();