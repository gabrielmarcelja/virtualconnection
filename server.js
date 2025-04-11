const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(session({
    secret: 'vtcsecret',
    resave: false,
    saveUninitialized: false,
    store: new FileStore({ path: './sessions' }),
    cookie: { maxAge: 1000 * 60 * 60 }
}));

const dbConfig = {
    host: 'localhost',
    user: 'hxduserdb',
    password: 'hxddbpass@3',
    database: 'vtcdb'
};

function sanitize(data) {
    return String(data).replace(/[<>&"']/g, '');
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/auth/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth/login/index.html'));
});

app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ status: 'error', message: 'Todos os campos são obrigatórios.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.json({ status: 'error', message: 'Por favor, insira um email válido.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [sanitize(email)]);
        const user = rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = user.id;
            res.json({ status: 'success', message: 'Login realizado com sucesso!' });
        } else {
            res.json({ status: 'error', message: 'Email ou senha incorretos.' });
        }
        await connection.end();
    } catch (error) {
        res.json({ status: 'error', message: `Erro ao verificar o usuário: ${error.message}` });
    }
});

app.get('/auth/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth/register/index.html'));
});

app.post('/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ status: 'error', message: 'Todos os campos são obrigatórios.' });
    }

    if (name.length < 2) {
        return res.json({ status: 'error', message: 'O nome deve ter pelo menos 2 caracteres.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.json({ status: 'error', message: 'Por favor, insira um email válido.' });
    }

    if (password.length < 6) {
        return res.json({ status: 'error', message: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [existing] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE email = ?', [sanitize(email)]);
        if (existing[0].count > 0) {
            return res.json({ status: 'error', message: 'Este email já está cadastrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await connection.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [sanitize(name), sanitize(email), hashedPassword]);
        req.session.user = result.insertId;
        res.json({ status: 'success', message: 'Cadastro realizado com sucesso! Redirecionando para o dashboard...' });
        await connection.end();
    } catch (error) {
        res.json({ status: 'error', message: `Erro ao cadastrar o usuário: ${error.message}` });
    }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.sendFile(path.join(__dirname, 'dashboard/index.html'));
});

app.get('/dashboard/check_session', (req, res) => {
    if (req.session.user) {
        res.json({ status: 'success', message: 'Sessão ativa' });
    } else {
        res.json({ status: 'error', message: 'Usuário não autenticado' });
    }
});

app.get('/dashboard/get_contacts', async (req, res) => {
    if (!req.session.user) {
        return res.json({ status: 'error', message: 'Usuário não autenticado' });
    }

    const contactId = req.query.id;
    try {
        const connection = await mysql.createConnection(dbConfig);
        let query = 'SELECT * FROM contato WHERE Id_usuario = ?';
        const params = [req.session.user];

        if (contactId) {
            query += ' AND Id_Contato = ?';
            params.push(sanitize(contactId));
        }

        const [contacts] = await connection.execute(query, params);
        res.json({ status: 'success', contacts });
        await connection.end();
    } catch (error) {
        res.json({ status: 'error', message: `Erro ao buscar contatos: ${error.message}` });
    }
});

app.post('/dashboard/add_contact', async (req, res) => {
    if (!req.session.user) {
        return res.json({ status: 'error', message: 'Usuário não autenticado' });
    }

    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
        return res.json({ status: 'error', message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('INSERT INTO contato (Id_usuario, Nome, Email, Telefone) VALUES (?, ?, ?, ?)', 
            [req.session.user, sanitize(name), sanitize(email), sanitize(phone)]);
        res.json({ status: 'success', message: 'Contato adicionado com sucesso!' });
        await connection.end();
    } catch (error) {
        res.json({ status: 'error', message: `Erro ao adicionar contato: ${error.message}` });
    }
});

app.post('/dashboard/edit_contact', async (req, res) => {
    if (!req.session.user) {
        return res.json({ status: 'error', message: 'Usuário não autenticado' });
    }

    const { id, name, email, phone } = req.body;
    if (!id || !name || !email || !phone) {
        return res.json({ status: 'error', message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute('UPDATE contato SET Nome = ?, Email = ?, Telefone = ? WHERE Id_Contato = ? AND Id_usuario = ?', 
            [sanitize(name), sanitize(email), sanitize(phone), sanitize(id), req.session.user]);
        
        if (result.affectedRows > 0) {
            res.json({ status: 'success', message: 'Contato atualizado com sucesso!' });
        } else {
            res.json({ status: 'error', message: 'Contato não encontrado ou não pertence ao usuário.' });
        }
        await connection.end();
    } catch (error) {
        res.json({ status: 'error', message: `Erro ao atualizar contato: ${error.message}` });
    }
});

app.get('/dashboard/delete_contact', async (req, res) => {
    if (!req.session.user) {
        return res.json({ status: 'error', message: 'Usuário não autenticado' });
    }

    const { id } = req.query;
    if (!id) {
        return res.json({ status: 'error', message: 'ID do contato não fornecido.' });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute('DELETE FROM contato WHERE Id_Contato = ? AND Id_usuario = ?', 
            [sanitize(id), req.session.user]);
        
        if (result.affectedRows > 0) {
            res.json({ status: 'success', message: 'Contato excluído com sucesso!' });
        } else {
            res.json({ status: 'error', message: 'Contato não encontrado ou não pertence ao usuário.' });
        }
        await connection.end();
    } catch (error) {
        res.json({ status: 'error', message: `Erro ao excluir contato: ${error.message}` });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});