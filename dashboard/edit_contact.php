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

$id = isset($_POST['id']) ? sanitize($_POST['id']) : '';
$name = isset($_POST['name']) ? sanitize($_POST['name']) : '';
$email = isset($_POST['email']) ? sanitize($_POST['email']) : '';
$phone = isset($_POST['phone']) ? sanitize($_POST['phone']) : '';
$userId = $_SESSION['user'];

if (empty($id) || empty($name) || empty($email) || empty($phone)) {
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
    $stmt = $pdo->prepare('UPDATE contato SET Nome = :name, Email = :email, Telefone = :phone WHERE Id_Contato = :id AND Id_usuario = :userId');
    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':phone' => $phone,
        ':id' => $id,
        ':userId' => $userId
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Contato atualizado com sucesso!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Contato não encontrado ou não pertence ao usuário.']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Erro ao atualizar contato: ' . $e->getMessage()]);
}
?>