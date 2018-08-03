import React from 'react';
import ReactSignupLoginComponent from 'react-signup-login-component';
import API from './APIman'

const LoginPage = (props) => {
    const signupWasClickedCallback = (data) => {
        API.getField(`users?name=${data.username}`)
            .then(user => {
                if (user.length > 0) {
                    alert("That user name is already registered.")
                } else {
                    if (data.password === data.passwordConfirmation) {
                        API.postUser(data.username, data.password)
                            .then(user => {
                                props.auth()
                                sessionStorage.setItem('UserId', user.id)
                                API.postRecord()
                            })
                    } else {
                        alert('Password does not match');
                    }
                }
            })

    };
    const loginWasClickedCallback = (data) => {
        console.log(data);
        API.getField(`users?name=${data.username}`)
            .then(user => {
                if (user.length > 0) {
                    if (data.password === user[0].password) {
                        props.auth();
                        sessionStorage.setItem('UserId', user[0].id)

                    } else {
                        alert('Password Incorrect.')
                    }
                } else {
                    alert('User name not found.')
                }
            })
    };
    const recoverPasswordWasClickedCallback = (data) => {
        API.getField(`users?name=${data.username}`)
            .then(user => {
                if (user.length > 0) {
                    alert(`Your Password is ${user[0].password}`)
                } else {
                    alert('Account not found.')
                }
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