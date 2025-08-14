// Проверяем, есть ли доступ
if (!localStorage.getItem('childAccess')) {
    window.location.href = "/lera-games/index.html";
}

document.addEventListener('DOMContentLoaded', function () {
    // Элементы интерфейса
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const lessonFrame = document.getElementById('lessonFrame');
    const accordion = document.getElementById('lessonsAccordion');
    // Элементы для марафона
    const superGameBtn = document.getElementById('superGameBtn');
    const superGameModal = document.getElementById('superGameModal');
    const closeSuperGameModal = document.getElementById('closeSuperGameModal');
    const gameSelectionList = document.getElementById('gameSelectionList');
    const startSuperGameBtn = document.getElementById('startSuperGameBtn');
    const modalError = document.getElementById('modalError');
    // Элементы для модального окна рекордов
    const highScoresBtn = document.getElementById('highScoresBtn');
    const highScoresModal = document.getElementById('highScoresModal');
    const closeHighScoresModal = document.getElementById('closeHighScoresModal');
    const highScoresModalTableBody = document.getElementById('highScoresModalTableBody');
    let allLessonsData = null; // Переменная для хранения данных об уроках для повторного использования

    // Открытие/закрытие бокового меню
    menuToggle.addEventListener('click', function () {
        sidebar.classList.toggle('active');
    });

    // Загрузка структуры уроков
    loadLessonsStructure();

    // Навешиваем обработчики для марафона
    setupSuperGameModal();

    // Навешиваем обработчики для модального окна рекордов
    setupHighScoresModal();

    // Функция загрузки структуры уроков
    function loadLessonsStructure() {
        fetch('/lera-games/data/lessons.json') // Путь к нашему новому файлу
            .then(response => {
                if (!response.ok) {
                    // Если файл не найден или другая ошибка сети
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Преобразуем ответ в JSON
            })
            .then(data => {
                allLessonsData = data; // Сохраняем данные в переменную

                // Строим аккордеон с уроками
                for (const subject in allLessonsData) {
                    if (allLessonsData.hasOwnProperty(subject)) {
                        const accordionItem = createAccordionItem(subject, allLessonsData[subject]);
                        accordion.appendChild(accordionItem);
                    }
                }

                // После построения меню, восстанавливаем активный урок, если он был
                restoreActiveLesson();
            })
            .catch(error => {
                console.error('Ошибка загрузки структуры уроков:', error);
                accordion.innerHTML = '<p style="padding: 20px; color: #ff7675;">Не удалось загрузить список уроков.</p>';
            });
    }

    /**
     * Отображает таблицу рекордов в модальном окне.
     * @param {object} lessonsData - Объект со структурой уроков.
     */
    function displayHighScores(lessonsData) {
        if (!highScoresModalTableBody || !lessonsData) return;
        highScoresModalTableBody.innerHTML = ''; // Очищаем старые записи

        // Добавляем рекорд марафона вручную в начало таблицы
        const marathonHighScore = localStorage.getItem('marathonHighScore') || 0;
        const marathonRow = document.createElement('tr');
        // Добавляем класс для возможной будущей стилизации
        marathonRow.className = 'marathon-score-row';
        marathonRow.innerHTML = `<td>🏆 Марафон</td><td>${marathonHighScore}</td>`;
        highScoresModalTableBody.appendChild(marathonRow);

        // Собираем все уроки из всех предметов в один массив
        const allLessons = Object.values(lessonsData).flat();

        // Собираем уроки с их рекордами и сортируем по убыванию рекорда
        const lessonsWithScores = allLessons
            .map(lesson => {
                return {
                    title: lesson.title,
                    highScore: parseInt(localStorage.getItem(`${lesson.id}HighScore`) || 0, 10)
                };
            })
            .sort((a, b) => b.highScore - a.highScore);

        // Отображаем отсортированный список
        lessonsWithScores.forEach(lesson => {
            // Не показываем игры с рекордом 0, чтобы не засорять список
            if (lesson.highScore === 0) return;

            const row = document.createElement('tr');
            row.innerHTML = `<td>${lesson.title}</td><td>${lesson.highScore}</td>`;
            highScoresModalTableBody.appendChild(row);
        });
    }

    // Создание элемента аккордеона
    function createAccordionItem(subject, lessons) {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';

        // Заголовок раздела
        const accordionHeader = document.createElement('div');
        accordionHeader.className = 'accordion-header';
        accordionHeader.innerHTML = `${subject} <span>▼</span>`;

        // Контент раздела
        const accordionContent = document.createElement('div');
        accordionContent.className = 'accordion-content';

        // Добавляем ссылки на уроки
        lessons.forEach(lesson => {
            const lessonLink = createLessonLink(lesson);
            accordionContent.appendChild(lessonLink);
        });

        // Собираем аккордеон
        accordionItem.appendChild(accordionHeader);
        accordionItem.appendChild(accordionContent);

        // Обработчик клика для заголовка аккордеона
        accordionHeader.addEventListener('click', function () {
            toggleAccordionItem(this);
        });

        return accordionItem;
    }

    // Функция для настройки и управления модальным окном марафона
    function setupSuperGameModal() {
        if (!superGameBtn) return;

        superGameBtn.addEventListener('click', () => {
            populateGameSelection();
            superGameModal.style.display = 'flex';
        });

        closeSuperGameModal.addEventListener('click', () => {
            superGameModal.style.display = 'none';
        });

        superGameModal.addEventListener('click', (e) => {
            if (e.target === superGameModal) {
                superGameModal.style.display = 'none';
            }
        });

        startSuperGameBtn.addEventListener('click', () => {
            const selectedGames = Array.from(gameSelectionList.querySelectorAll('input:checked')).map(input => input.value);

            if (selectedGames.length < 2) {
                modalError.style.display = 'block';
                return;
            }

            modalError.style.display = 'none';
            const gameIds = selectedGames.join(',');
            const marathonUrl = `/lera-games/templates/super_game_template.html?games=${gameIds}`;
            loadLessonContent(marathonUrl);
            superGameModal.style.display = 'none';
        });
    }

    // Функция для настройки и управления модальным окном рекордов
    function setupHighScoresModal() {
        if (!highScoresBtn) return;

        highScoresBtn.addEventListener('click', () => {
            // Заполняем таблицу свежими данными при каждом открытии
            displayHighScores(allLessonsData);
            // Показываем модальное окно
            highScoresModal.style.display = 'flex';
        });

        closeHighScoresModal.addEventListener('click', () => {
            highScoresModal.style.display = 'none';
        });

        highScoresModal.addEventListener('click', (e) => {
            if (e.target === highScoresModal) {
                highScoresModal.style.display = 'none';
            }
        });
    }

    // Заполняет список игр в модальном окне
    function populateGameSelection() {
        gameSelectionList.innerHTML = '';
        const allLessons = Object.values(allLessonsData).flat();
        const compatibleGames = allLessons.filter(lesson => lesson.engineCompatible);

        compatibleGames.forEach(lesson => {
            const item = document.createElement('label');
            item.className = 'game-selection-item';
            item.innerHTML = `<input type="checkbox" value="${lesson.id}"> ${lesson.title}`;
            gameSelectionList.appendChild(item);
        });
    }

    // Создание ссылки на урок
    function createLessonLink(lesson) {
        const lessonLink = document.createElement('a');
        // Если в JSON указан прямой URL, используем его.
        // Иначе, строим URL для нашего игрового движка.
        const lessonUrl = lesson.url ? lesson.url : `/lera-games/templates/lesson_template.html?game=${lesson.id}`;
        lessonLink.className = 'lesson-link';
        lessonLink.href = lessonUrl;
        lessonLink.textContent = lesson.title;

        lessonLink.addEventListener('click', function (e) {
            e.preventDefault();

            // Убираем класс 'active-lesson' со всех ссылок, чтобы "погасить" предыдущую.
            const allLinks = document.querySelectorAll('.lesson-link');
            allLinks.forEach(link => {
                link.classList.remove('active-lesson');
            });

            // Добавляем класс 'active-lesson' к нажатой ссылке, чтобы "подсветить" её.
            this.classList.add('active-lesson');

            // Загружаем контент урока и закрываем меню на мобильных
            loadLessonContent(lessonUrl);
            // Сохраняем URL последнего открытого урока в localStorage
            localStorage.setItem('activeLessonUrl', lessonUrl);

            if (window.innerWidth < 768) {
                sidebar.classList.remove('active');
            }
        });

        return lessonLink;
    }

    // Переключение состояния элемента аккордеона
    function toggleAccordionItem(header) {
        const content = header.parentElement.querySelector('.accordion-content');
        content.classList.toggle('active');

        const arrow = header.querySelector('span');
        arrow.textContent = content.classList.contains('active') ? '▲' : '▼';
    }

    // Функция загрузки контента урока в iframe
    function loadLessonContent(url) {
        // Просто меняем атрибут src у iframe. Браузер сделает всё остальное.
        lessonFrame.src = url;
    }

    // Функция для восстановления состояния активного урока при загрузке страницы
    function restoreActiveLesson() {
        const activeUrl = localStorage.getItem('activeLessonUrl');
        if (!activeUrl) return; // Если сохраненного урока нет, ничего не делаем

        // Загружаем сохраненный урок в iframe
        loadLessonContent(activeUrl);

        // Находим соответствующую ссылку в меню и подсвечиваем её
        const activeLink = document.querySelector(`.lesson-link[href="${activeUrl}"]`);
        if (activeLink) {
            activeLink.classList.add('active-lesson');

            // Находим родительский раздел аккордеона и открываем его, если он закрыт
            const accordionContent = activeLink.closest('.accordion-content');
            if (accordionContent && !accordionContent.classList.contains('active')) {
                toggleAccordionItem(accordionContent.previousElementSibling);
            }
        }
    }
});


