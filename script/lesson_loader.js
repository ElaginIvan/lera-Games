document.addEventListener('DOMContentLoaded', () => {
    // 1. Получаем ID игры из URL, например, ?game=factorial
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('game');

    if (!gameId) {
        displayError('Ошибка: не указана игра для загрузки.');
        console.error('Game ID is missing in URL parameters.');
        return;
    }

    // 2. Динамически загружаем скрипт с конфигурацией игры
    const script = document.createElement('script');
    script.src = `/lera_game/script/games/${gameId}.js`;

    script.onload = () => {
        // 3. Скрипт загружен, теперь конфигурация должна быть в window.gameConfigs
        const gameConfig = window.gameConfigs ? window.gameConfigs[gameId] : undefined;

        if (!gameConfig) {
            displayError(`Ошибка: не найдена конфигурация для игры "${gameId}".`);
            console.error(`Configuration for game "${gameId}" not found after loading script.`);
            return;
        }

        // 4. Заполняем шаблон и инициализируем игру
        populateTemplate(gameConfig);
        new Game(gameConfig);
    };

    script.onerror = () => {
        displayError(`Ошибка: не удалось загрузить файл для игры "${gameId}".`);
        console.error(`Failed to load script: ${script.src}`);
    };

    document.body.appendChild(script);
});

function populateTemplate(gameConfig) {
    document.title = gameConfig.title;

    const lessonTitleElement = document.getElementById('lesson-title');
    const questionPromptElement = document.getElementById('question-prompt');
    const helpTextElement = document.getElementById('help-text');
    const gameContainer = document.querySelector('.game-container');

    if (lessonTitleElement) lessonTitleElement.textContent = gameConfig.title;
    if (questionPromptElement) questionPromptElement.textContent = gameConfig.questionPrompt;
    if (helpTextElement) helpTextElement.innerHTML = gameConfig.helpHTML;

    if (gameContainer) gameContainer.classList.add(gameConfig.gameId);
}

function displayError(message) {
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
        gameContainer.innerHTML = `<h1 style="color: #ff7675;">${message}</h1><p>Пожалуйста, выберите другую игру из меню.</p>`;
    } else {
        document.body.innerHTML = `<h1>${message}</h1>`;
    }
}