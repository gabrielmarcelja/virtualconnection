<?php
    session_start();
    $idusuario = $_SESSION['user'];

    // Incluindo a conexão com o banco
    include("../auth/assets/files/connection.php");

    // Usando prepare e bindParam para evitar SQL Injection
    $getcontact = $mycon->prepare("SELECT * FROM contato WHERE Id_usuario = :id");
    $getcontact->bindParam(':id', $idusuario, PDO::PARAM_INT);
    $getcontact->execute();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link rel="stylesheet" href="../assets/dashboard.css">
</head>
<body>
    <main>
        <p id="title">Contatos</p>

        <!-- Barra de pesquisa -->
        <div id="searchbarContainer">
            <svg class="searchbarIcon" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
            </svg>
            <input type="text" id="searchbarInput" placeholder="Pesquisar contatos...">
        </div>

        <!-- Loop para exibir os contatos -->
        <?php
            while($getcontactinfo = $getcontact->fetch(PDO::FETCH_ASSOC)) {
                echo '<div class="contactContainer">';
                echo '<div class="contactContainertwo">';
                echo '<p class="contactName">' . htmlspecialchars($getcontactinfo['Nome']) . '</p>';
                echo '<a href="excluir.php?id=' . $getcontactinfo['Id_usuario'] . '">Excluir</a>';
                echo '</div>';

                echo '<div class="contactInfo">';
                echo '<div class="contactInfoContainer">';
                echo '<input type="email" class="contactEmail contactinput" value="' . htmlspecialchars($getcontactinfo['Email']) . '" readonly>';
                echo '<a href="editar.php?id=' . $getcontactinfo['Id_Contato'] . '">Editar</a>';
                echo '</div>';
                echo '<div class="contactInfoContainer">';
                echo '<input type="text" class="contactTelefone contactinput" value="' . htmlspecialchars($getcontactinfo['Telefone']) . '" readonly>';
                echo '<a href="editar.php?id=' . $getcontactinfo['Id_Contato'] . '">Editar</a>';
                echo '</div>';
                echo '</div>'; // Fechar contactInfo
                echo '</div>'; // Fechar contactContainer
            }
        ?>
    </main>
</body>
</html>
