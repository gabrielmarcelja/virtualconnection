<?php
try{
    $mycon = new PDO("mysql:host=localhost;dbname=virtualconnection",'root','');
}catch(PDOException){
    http_response_code(500);
}