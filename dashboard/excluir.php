<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(['status' => 'error', 'message' => 'Usuário não autenticado']);
    exit;
}

require_once '../auth/connection.php';

$id = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT) : '';
$userId = $_SESSION['user'];

if (empty($id)) {
    echo json_encode(['status' => 'error', 'message' => 'ID do contato não fornecido.']);
    exit;
}

try {
    $stmt = $pdo->prepare('DELETE FROM contato WHERE Id_Contato = :id AND Id_usuario = :userId');
    $stmt->execute([
        ':id' => $id,
        ':userId' => $userId
    ]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Contato excluído com sucesso!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Contato não encontrado ou não pertence ao usuário.']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Erro ao excluir contato: ' . $e->getMessage()]);
}
?>