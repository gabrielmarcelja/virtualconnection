document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Por favor, insira um email válido.', 'error');
            return;
        }
        if (password.length < 1) {
            showMessage('A senha não pode estar vazia.', 'error');
            return;
        }

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'process.php', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    showMessage(response.message, response.status);
                    if (response.status === 'success') {
                        setTimeout(() => {
                            window.location.href = '../../dashboard/';
                        }, 1000);
                    }
                } else {
                    showMessage('Erro na comunicação com o servidor.', 'error');
                }
            }
        };

        const data = `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
        xhr.send(data);
    });

    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = 'message';
        }, 5000);
    }
});