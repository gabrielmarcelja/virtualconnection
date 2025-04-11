<?php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user'])) {
    echo json_encode(['status' => 'success', 'message' => 'Usuário autenticado']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Usuário não autenticado']);
}
?>