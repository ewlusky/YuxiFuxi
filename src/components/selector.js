import React, { Component } from 'react';


class Selector extends Component {
    state = {
        open: false
    }
    render() {
        return (
            <div className="scene">
                <div className="menu">
                    <input type="checkbox" id="open-menu" name="open-menu" />

                    <div onClick={() => this.props.change("zh-CN")} className="menu__layer top">
                        <label htmlFor="open-menu"><span className="fa fa-bars icon"></span><div className="A"><span className="layer__content">大陆</span></div></label>
                    </div>

                    <div onClick={() => this.props.change("zh-TW")} className="menu__layer middle">
                        <label htmlFor="open-menu"><div className="B"><span className="layer__content">台灣</span></div></label>
                    </div>


                    <div onClick={() => this.props.change("zh-Hans")} className="menu__layer bottom">
                        <label htmlFor="open-menu"><div className="C"><span className="layer__content">简体</span></div></label>
                    </div>
                </div>
            </div>
        );
    }
}

export default Selector;