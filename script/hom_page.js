// Проверяем, есть ли доступ
if (!localStorage.getItem('childAccess')) {
    window.location.href = "index.html";
}

document.addEventListener('DOMContentLoaded', function () {
    // Элементы интерфейса
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const lessonFrame = document.getElementById('lessonFrame');
    const accordion = document.getElementById('lessonsAccordion');

    // Открытие/закрытие бокового меню
    menuToggle.addEventListener('click', function () {
        sidebar.classList.toggle('active');
    });

    // Загрузка структуры уроков
    loadLessonsStructure();

    // Функция загрузки структуры уроков
    function loadLessonsStructure() {
        fetch('data/lessons.json') // Путь к нашему новому файлу
            .then(response => {
                if (!response.ok) {
                    // Если файл не найден или другая ошибка сети
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Преобразуем ответ в JSON
            })
            .then(lessons => {
                // Этот код выполнится, когда данные успешно загрузятся.
                // Он точно такой же, как был у тебя, но теперь работает с данными из файла.
                for (const subject in lessons) {
                    if (lessons.hasOwnProperty(subject)) {
                        const accordionItem = createAccordionItem(subject, lessons[subject]);
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

    // Создание ссылки на урок
    function createLessonLink(lesson) {
        const lessonLink = document.createElement('a');
        lessonLink.className = 'lesson-link';
        lessonLink.href = lesson.url;
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
            loadLessonContent(lesson.url);
            // Сохраняем URL последнего открытого урока в localStorage
            localStorage.setItem('activeLessonUrl', lesson.url);

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
