import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import LoginPage from './components/login'
import Home from './components/home'
import Header from './components/header'

class App extends Component {
  state = {
    authorized: true
  }

  authorize = () => {
    console.log("Authorized")
    this.setState({ authorized: true });
  }

  deauthorize = () => {
    this.setState({ authorized: false });
  }

  componentDidMount() {
    if (sessionStorage.getItem('userId') != null){
      this.authorize();
    }
  }
  render() {
    return (
      <div className="App">
      <Header deauth={() => this.deauthorize()}/>
      <div className="log">
    { this.state.authorized ? <Home /> : <LoginPage auth={() => this.authorize()} /> }
      </div>
      </div>
    );
  }
}

export default App;
