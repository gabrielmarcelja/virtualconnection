<?php
header('Content-Type: application/json');

session_start();

require_once '../connection.php';

function sanitize($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

$name = isset($_POST['name']) ? sanitize($_POST['name']) : '';
$email = isset($_POST['email']) ? sanitize($_POST['email']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';

if (empty($name) || empty($email) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'Todos os campos são obrigatórios.']);
    exit;
}

if (strlen($name) < 2) {
    echo json_encode(['status' => 'error', 'message' => 'O nome deve ter pelo menos 2 caracteres.']);
    exit;
}

$emailRegex = '/^[^\s@]+@[^\s@]+\.[^\s@]+$/';
if (!preg_match($emailRegex, $email)) {
    echo json_encode(['status' => 'error', 'message' => 'Por favor, insira um email válido.']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['status' => 'error', 'message' => 'A senha deve ter pelo menos 6 caracteres.']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetchColumn() > 0) {
        echo json_encode(['status' => 'error', 'message' => 'Este email já está cadastrado.']);
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    $stmt->execute([$name, $email, $hashedPassword]);

    $userId = $pdo->lastInsertId();
    $_SESSION['user'] = $userId;

    echo json_encode(['status' => 'success', 'message' => 'Cadastro realizado com sucesso! Redirecionando para o dashboard...']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Erro ao cadastrar o usuário: ' . $e->getMessage()]);
}
?>