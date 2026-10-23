async function HandleSignUp(event){
    event.preventDefault();

    full_name = event.target.FullName.value,
    email = event.target.Email.value,
    number = event.target.PhoneNumber.value,
    password = event.target.Password.value

    await axios.post("http://localhost:3000/api/v1/user/addUser",{full_name,email,number,password}).then((response) => {
        console.log(response);
    }).catch((err) => {
        console.log(err);
    })
}

async function HandleSignIn(event){
    event.preventDefault();

    email = event.target.Email.value,
    number = event.target.PhoneNumber.value,
    password = event.target.Password.value

    await axios.post("http://localhost:3000/api/v1/user/loginUser",{email,number,password}).then((response) => {
        console.log(response);
    }).catch((err) => {
        console.log(err);
    })
}