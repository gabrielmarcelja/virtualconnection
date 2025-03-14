<?php
if(!isset($_SESSION)){
    session_start();
}
if($_POST['imail']){
    $email = $_POST['imail'];
    $senha = $_POST['ipass'];
    if (filter_var($email, FILTER_VALIDATE_EMAIL) && strlen($senha) >= 6) {
        include('connection.php');
        $emailCheck = $mycon->prepare("SELECT * FROM users WHERE Email = :email");
        $emailCheck->bindParam(':email', $email);
        $emailCheck->execute();
        if($emailCheck->rowCount() > 0){
            //email existe
            //checar senha
            $emaildata = $emailCheck->fetch();
            if($emaildata['Senha'] == $senha){
                $_SESSION['user'] = $emaildata['Id'];
                http_response_code(202);
            }
        }else{
            http_response_code(400);
            exit;
        }
    }
}