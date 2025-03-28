<?php
include('../auth/assets/files/connection.php');
if(isset($_GET['id'])){
    $id = $_GET['id'];
    $excluirQuery = $mycon->prepare("DELETE FROM contato WHERE Id_Contato = :id");
    $excluirQuery->bindParam(":id", $id);
    $excluirQuery->excute();
    header('Location: index.html');
}