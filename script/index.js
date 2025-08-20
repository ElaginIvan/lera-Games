document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const errorMessage = document.getElementById('errorMessage');
    const submitBtn = document.getElementById('submitBtn');

    // Показать/скрыть пароль
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    });

    // Проверка пароля
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = passwordInput.value;

        // Анимация загрузки
        submitBtn.textContent = 'Проверка...';
        submitBtn.disabled = true;

        // Имитация задержки сервера
        setTimeout(() => {
            // Правильный пароль (можно изменить)
            if (username.toLowerCase() === 'лера' && password === 'лера') {
                // Сохраняем факт входа
                localStorage.setItem('childAccess', 'true');

                // Анимация успешного входа
                submitBtn.textContent = '✓ Успешно!';
                submitBtn.style.backgroundColor = '#4bb543';

                // Переход через 1 секунду
                setTimeout(() => {
                    window.location.href = 'hom_page.html';
                }, 1000);
            } else {
                // Показываем ошибку
                errorMessage.style.display = 'block';
                loginForm.classList.add('shake');
                submitBtn.textContent = 'Войти';
                submitBtn.disabled = false;

                // Убираем анимацию тряски
                setTimeout(() => {
                    loginForm.classList.remove('shake');
                }, 500);
            }
        }, 800);
    });
});