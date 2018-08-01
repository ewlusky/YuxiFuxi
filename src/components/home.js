import React, { Component } from 'react';
import API from './APIman'
import Practice from './practice'
var XMLParser = require('react-xml-parser');


class Home extends Component {
    state = {
        vocab: [],
        Uwords: [],
        url: "",
        user: [],
        practice: false,
        skip: false,
        valid: true
    }

    handleFieldChange = (evt) => {
        const stateToChange = {}
        stateToChange[evt.target.id] = evt.target.value
        this.setState(stateToChange)
    }

    componentDidMount() {
        this.setState({ practice: false })
        sessionStorage.setItem('UserId', '1')
        const user = 1
        API.getField(`wordusers?_expand=word&&userId=${user}`)
            .then(userWords => {
                this.setState({ Uwords: userWords });
            })
    }

    makeVocab = () => {
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
                let promises = []
                for (let i = 0; trans.children[i].attributes.start < 30; i++) {
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
            <div>
                <h2>main</h2>
                <label htmlFor="inputURL">
                    YouTube URL
                </label>
                <input onChange={this.handleFieldChange} type="text"
                    id="url"
                    placeholder="everything after v="
                    required="" autoFocus="" />
                <button onClick={this.makeVocab}>YUXI</button>
                {this.state.practice && <Practice url={this.state.url} skip={this.state.skip} words={this.state.vocab} known={this.state.Uwords} />}
            </div>
        );
    }
}

export default Home;