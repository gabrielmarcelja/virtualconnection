<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user'])) {
    echo json_encode(['status' => 'error', 'message' => 'Usuário não autenticado']);
    exit;
}

require_once '../auth/connection.php';

$idusuario = $_SESSION['user'];
$contactId = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_SANITIZE_NUMBER_INT) : null;

try {
    if ($contactId) {
        $stmt = $pdo->prepare("SELECT * FROM contato WHERE Id_usuario = :id AND Id_Contato = :contactId");
        $stmt->bindParam(':id', $idusuario, PDO::PARAM_INT);
        $stmt->bindParam(':contactId', $contactId, PDO::PARAM_INT);
    } else {
        $stmt = $pdo->prepare("SELECT * FROM contato WHERE Id_usuario = :id");
        $stmt->bindParam(':id', $idusuario, PDO::PARAM_INT);
    }
    $stmt->execute();
    $contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'contacts' => $contacts]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Erro ao buscar contatos: ' . $e->getMessage()]);
}
?>