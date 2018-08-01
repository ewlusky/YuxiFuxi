import React from 'react';
import ReactSignupLoginComponent from 'react-signup-login-component';
import API from './APIman'

const LoginPage = (props) => {
    const signupWasClickedCallback = (data) => {
        console.log(data);
        if (data.password === data.passwordConfirmation) {
            API.postUser(data.username, data.password)
                .then(user => {
                    props.auth()
                    sessionStorage.setItem('UserId', user.id)
                })
        } else {
            alert('Password does not match');
        }
    };
    const loginWasClickedCallback = (data) => {
        console.log(data);
        API.getField(`users?name=${data.username}`)
        .then(user => {
            console.log(user)
            console.log('passcheck', data.password, user[0].password)
            if(data.password === user[0].password){
                props.auth();
                sessionStorage.setItem('UserId', user[0].id)

            } else {
                alert('User name or password not found.')
            }
        })
    };
    const recoverPasswordWasClickedCallback = (data) => {
        API.getField(`users?name=${data.username}`)
            .then(user => {
                alert(`Your Password is ${user[0].password}`)
            })
    };
    return (
        <div>
            <ReactSignupLoginComponent
                title="Yuxi  預習復習  Fuxi"
                handleSignup={signupWasClickedCallback}
                handleLogin={loginWasClickedCallback}
                handleRecoverPassword={recoverPasswordWasClickedCallback}
            />
        </div>
    );
};

export default LoginPage;