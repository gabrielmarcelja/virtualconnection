const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };
document.querySelector("#iacessarbtn").addEventListener("click", function(){
    let imail = document.querySelector("#imail");
    let ipass = document.querySelector("#ipass");
    if(validateEmail(imail.value)){
        //email correto
        if(ipass.value !== ''){
            let xhr = new XMLHttpRequest();
            xhr.open("POST", "../assets/files/login.php");
            xhr.setRequestHeader("Content-Type", "Application/x-www-form-urlencoded");
            xhr.onreadystatechange = function(){
                if(xhr.readyState === 4 && xhr.status == 202){
                    location.href = '../../../dashboard';
                }
                if(xhr.readyState === 4 && xhr.status == 400){
                    alert("Dados inválidos");
                }
            }
            xhr.send("imail="+imail.value+"&ipass="+ipass.value);
        }else{
            alert("Senha inválida")
        }
    }else{
        alert("E-mail inválido")
    }
})