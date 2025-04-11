<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(['status' => 'error', 'message' => 'Usuário não autenticado']);
    exit;
}

require_once '../auth/connection.php';

function sanitize($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

$name = isset($_POST['name']) ? sanitize($_POST['name']) : '';
$email = isset($_POST['email']) ? sanitize($_POST['email']) : '';
$phone = isset($_POST['phone']) ? sanitize($_POST['phone']) : '';
$userId = $_SESSION['user'];

if (empty($name) || empty($email) || empty($phone)) {
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

try {
    $stmt = $pdo->prepare('INSERT INTO contato (Id_usuario, Nome, Email, Telefone) VALUES (:id, :name, :email, :phone)');
    $stmt->execute([
        ':id' => $userId,
        ':name' => $name,
        ':email' => $email,
        ':phone' => $phone
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Contato adicionado com sucesso!']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Erro ao adicionar contato: ' . $e->getMessage()]);
}
?>