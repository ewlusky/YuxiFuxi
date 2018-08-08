import React, { Component } from "react"
import logo from "../img/fuxi.png"

export default class Header extends Component {
  render() {
    return (
      <React.Fragment>
        <div className="header" id="main-image-container">
          <h1 onClick={this.props.deauth} className="header-text"><img className="logo" src={logo} /></h1 >
        </div>
      </React.Fragment>
    )
  }
}