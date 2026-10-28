async function HandleSignUp(event){
    event.preventDefault();

    full_name = event.target.FullName.value,
    email = event.target.Email.value,
    number = event.target.PhoneNumber.value,
    password = event.target.Password.value

    await axios.post("http://localhost:3000/api/v1/user/addUser",{full_name,email,number,password}).then((response) => {
        localStorage.setItem('token',JSON.stringify(response.data.data));
        alert("User created successfully");
        window.location.href = '../../Client/index.html';
    }).catch((err) => {
        alert(err.response.data.message);
        if(err.response.data.message == "User already exist"){
            window.location.href = '../../Client/AuthenticateUserPage/signIn.html';
        }
    });

    event.target.reset();
    return true
}

async function HandleSignIn(event){
    event.preventDefault();

    email = event.target.Email.value,
    number = event.target.PhoneNumber.value,
    password = event.target.Password.value

    await axios.post("http://localhost:3000/api/v1/user/loginUser",{email,number,password}).then((response) => {
        localStorage.setItem('token',JSON.stringify(response.data.data));
        alert("Login Success");
        window.location.href = '../../Client/index.html';
    }).catch((err) => {
        alert(err.response.data.message);
    });

    event.target.reset();
    return true
}