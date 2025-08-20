(function () {
    // Создаем глобальный объект для хранения конфигураций, если его еще нет
    window.gameConfigs = window.gameConfigs || {};

    // --- Вспомогательная функция, специфичная для этой игры ---
    const calculateFactorial = (n) => (n < 0 ? 0 : (n === 0 ? 1 : Array.from({ length: n }, (_, i) => i + 1).reduce((acc, val) => acc * val, 1)));

    // --- Конфигурация для игрового движка ---
    window.gameConfigs.factorial = {
        // Новые поля для заполнения шаблона
        title: "🎉 ФАКТОРИАЛ-ФЕСТ! ✨",
        questionPrompt: "Чему равен факториал числа:",
        helpHTML: `
            <p>Факториал числа - это произведение всех натуральных чисел от 1 до этого числа.</p>
            <p>Обозначается восклицательным знаком: n!</p>
            <p>Примеры:</p>
            <ul>
                <li>3! = 1 × 2 × 3 = 6</li>
                <li>4! = 1 × 2 × 3 × 4 = 24</li>
                <li>5! = 1 × 2 × 3 × 4 × 5 = 120</li>
            </ul>
            <p>Запомни: 0! = 1 (это особый случай)</p>
        `,

        // Старая конфигурация
        gameId: 'factorial',
        // answerType: 'textInput', // Указываем новый тип ответов!
        // timePerQuestion: 10, // Время на ответ: 10 секунд

        getSolutionHTML: (gameInstance) => {
            const number = gameInstance.currentQuestionData.number;
            const correctAnswer = gameInstance.correctAnswer;
            if (number === 0) return '<p>0! = 1 (по определению)</p>';

            let explanation = Array.from({ length: number }, (_, i) => i + 1).join(' × ');
            return `<p>${number}! = ${explanation} = ${correctAnswer}</p>`;
        },

        generateQuestionAndAnswers: (level, existingQuestionData = null) => {
            let currentNumber;
            if (existingQuestionData) {
                // Восстанавливаем число из сохраненных данных
                currentNumber = existingQuestionData.number;
            } else {
                // Генерируем новое случайное число
                let maxNumber = Math.min(3 + level, 8);
                currentNumber = Math.floor(Math.random() * (maxNumber + 1));
            }
            const correctAnswer = calculateFactorial(currentNumber);

            let answers = [correctAnswer];
            while (answers.length < 4) {
                let wrongAnswer;
                if (currentNumber > 1) {
                    if (Math.random() > 0.7) {
                        wrongAnswer = calculateFactorial(currentNumber - 1);
                    } else {
                        let deviation = Math.floor(Math.random() * 10) + 1;
                        if (Math.random() > 0.5) deviation = -deviation;
                        wrongAnswer = correctAnswer + deviation;
                    }
                } else {
                    wrongAnswer = Math.floor(Math.random() * 5);
                }
                if (wrongAnswer < 0) wrongAnswer = 0;

                if (!answers.includes(wrongAnswer)) {
                    answers.push(wrongAnswer);
                }
            }

            return {
                question: currentNumber,
                correctAnswer: correctAnswer,
                answers: answers,
                questionData: { number: currentNumber }
            };
        },

        getSuccessMessage: () => {
            const messages = [
                "Верно! Ты факториальный гений!",
                "Правильно! Умножение - твоя суперсила!",
                "Отлично! Ты мастер факториалов!"];
            return messages[Math.floor(Math.random() * messages.length)];
        },

        getHint: (gameInstance) => {
            const num = gameInstance.currentQuestionData.number;
            const hints = [`Помни: ${num}! - это произведение всех чисел от 1 до ${num}.`, "Не переживай, в следующий раз получится!"];
            return hints[Math.floor(Math.random() * hints.length)];
        }
    };
})();
