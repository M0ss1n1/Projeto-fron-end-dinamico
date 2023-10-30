document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Verificação se os campos estão preenchidos
        if (!username || !password) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        // Verificação se os dados ja existem no LocalStorage
        const users = JSON.parse(localStorage.getItem('users')) || {};
        if (users[username]) {
            alert('Nome de usuário já existe! Escolha outro.');
            return;
        }

        // Registrar o usuario no localStorage
        users[username] = password;
        localStorage.setItem('users', JSON.stringify(users));

        alert('Registro bem-sucedido! Você pode fazer login agora.');
        window.location.href = 'login.html';
    });
});
