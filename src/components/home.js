import React, { Component } from 'react';
import API from './APIman'
import Practice from './practice'
import Graph from './graph'
var XMLParser = require('react-xml-parser');


class Home extends Component {
    state = {
        vocab: [],
        Uwords: [],
        url: "MSjaP1eV5eQ",
        userUrl: "",
        user: "",
        practice: false,
        skip: false,
        valid: true,
        continue: false,
        vidLength: 60,
        start: 0
    }

    handleFieldChange = (evt) => {
        const stateToChange = {}
        stateToChange[evt.target.id] = evt.target.value
        this.setState(stateToChange)
    }

    componentDidMount() {
        this.setState({ practice: false })
        sessionStorage.setItem('UserId', '1') // DELETE THIS 
        const user = 1 // CHANGE THIS
        this.setState({ user: user });
        API.getField(`wordusers?_expand=word&&userId=${user}`)
            .then(userWords => {
                this.setState({ Uwords: userWords });
            })
        API.getField(`users/${user}`)
            .then(user => {
                console.log('TEST USER INFO', user)
                this.setState({ userUrl: user.url });
                this.setState({ start: user.time });
            })
    }

    continue = () => {
        this.setState({ url: this.state.userUrl });
        this.makeVocab(this.state.start)
    }

    finished = () => {
        API.patchUser(this.state.user, this.state.url, this.state.start + this.state.vidLength)
        .then(() => {
            this.setState({ practice: false });
        })

    }

    makeVocab = (vInit = 0) => {
        fetch(`http://video.google.com/timedtext?lang=zh-CN&v=${this.state.url}`)
            .catch(err => alert(err))
            .then(e => e.text())
            // .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
            .then(transcript => {
                this.setState({ valid: true });
                let trans = new XMLParser().parseFromString(transcript);    // Assume xmlText contains the example XML
                console.log('transcript', trans)
                if (trans.children.length < 2) {
                    this.setState({ valid: false });
                }
                let initial = 0;
                for (let i=0; trans.children[i].attributes.start <= vInit; i++){
                    initial = i;
                }
                let promises = []
                for (let i = initial; trans.children[i].attributes.start < this.state.vidLength; i++) {
                    const block = trans.children[i]
                    if (block.value.length === 0) {
                        block.value = "a"
                    }
                    const timer = block.attributes.start;
                    const prom = fetch(`https://pinyin-rest.pepebecker.com/hanzi/${block.value}`)
                        .catch(err => console.log('pinyin err', err))
                        .then(e => e.json())
                        .then(vWord => {
                            // console.log("sync test", i)
                            let totalWords = [];
                            let totalVocab = []
                            vWord.forEach(word => {

                                if (totalWords.includes(word.simplified)) {
                                    return
                                }
                                word["key"] = word.simplified
                                word["score"] = 0;
                                word["count"] = 0;
                                totalWords.push(word.simplified)
                                const duplicate = this.state.Uwords.filter(entry => (word.simplified === entry.word.simplified))
                                if (duplicate.length > 0) {
                                    if (duplicate[0].count < 5) {
                                        word["count"] = 1;
                                        totalVocab.push(word)
                                    }
                                } else {
                                    totalVocab.push(word)
                                }

                            });
                            return totalVocab;

                        })
                    promises.push(prom);
                }
                return promises;
            })
            .then(promises => {
                Promise.all(promises)
                    .catch(err => console.log(err))
                    .then(results => {
                        console.log("promise test", results) // could check for duplicates here by going through lists again
                        let merged = [].concat.apply([], results);
                        this.setState({ vocab: merged });
                        if (this.state.valid) {
                            if (this.state.vocab.length > 0) {
                                this.setState({ practice: true });
                            } else {
                                alert("You already know all the words for this clip!")
                                this.setState({ skip: true });
                                this.setState({ practice: true });
                            }
                        } else {
                            alert("This is not a valid video ID")
                        }
                    })
            })


    }




    render() {


        return (
            <div className="home">
                {this.state.practice && <Practice fin={() => this.finished()} url={this.state.url} dur={this.state.vidLength} start={this.state.start} skip={this.state.skip} words={this.state.vocab} known={this.state.Uwords} />}

                <h2>Data</h2>
                {!this.state.practice && <Graph />}
                <div className="bottom">
                {!this.state.practice && <button onClick={this.continue} className="btn btn-2 btn-2a">JIXU</button>}
                {!this.state.practice && <input onChange={this.handleFieldChange} type="text"
                    id="url"
                    placeholder="Youtube Video Id (v=...)"
                    required="" autoFocus="" />}
                {!this.state.practice && <button className="btn btn-2 btn-2a" onClick={this.makeVocab}>YUXI</button>}
                </div>
            </div>
        );
    }
}

export default Home;