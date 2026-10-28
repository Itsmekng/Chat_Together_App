window.addEventListener('load', onload);

function onload(){

    if(localStorage.getItem('token') == null){
        window.location.href = './AuthenticateUserPage/signUp.html';
    }

}