document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const messageDiv = document.getElementById('message');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (name.length < 2) {
            showMessage('O nome deve ter pelo menos 2 caracteres.', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Por favor, insira um email válido.', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('As senhas não coincidem.', 'error');
            return;
        }

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/auth/register', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    showMessage(response.message, response.status);
                    if (response.status === 'success') {
                        setTimeout(() => {
                            window.location.href = '/dashboard';
                        }, 1000);
                    }
                } else {
                    showMessage('Erro na comunicação com o servidor.', 'error');
                }
            }
        };

        const data = `name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
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