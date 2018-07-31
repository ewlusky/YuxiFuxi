import React, { Component } from 'react';
import API from './APIman'
import Practice from './practice'
var XMLParser = require('react-xml-parser');


class Home extends Component {
    state = {
        vocab: [],
        words: [],
        url: [],
        user: [],
        practice: false
    }

    handleFieldChange = (evt) => {
        const stateToChange = {}
        stateToChange[evt.target.id] = evt.target.value
        this.setState(stateToChange)
    }

    componentDidMount() {
        this.setState({ practice: false })
    }

    makeVocab = () => {
        fetch('http://video.google.com/timedtext?lang=zh-CN&v=MSjaP1eV5eQ')
            .then(e => e.text())
            // .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
            .then(transcript => {
                let trans = new XMLParser().parseFromString(transcript);    // Assume xmlText contains the example XML
                let promises = []
                for (let i = 0; trans.children[i].attributes.start < 30; i++) {
                    const block = trans.children[i]
                    const timer = block.attributes.start;
                    const prom = fetch(`https://pinyin-rest.pepebecker.com/hanzi/${block.value}`)
                        .then(e => e.json())
                        .then(vWord => {
                            // console.log("sync test", i)
                            let totalWords = [];
                            let totalVocab = []
                            vWord.forEach(word => {
                                word["key"] = word.simplified
                                word["score"] = 0;
                                word["count"] = 0;
                                if (totalWords.includes(word.simplified)) {
                                    return
                                }
                                totalWords.push(word.simplified)
                                totalVocab.push(word)
                            });
                            return totalVocab;

                        })
                    promises.push(prom);
                }
                return promises;
            })
            .then(promises => {
                Promise.all(promises)
                .then(results => {
                    console.log("promise test", results) // could check for duplicates here by going through lists again
                    let merged = [].concat.apply([], results);
                    this.setState({ vocab: merged });
                    this.setState({ practice: true });
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
                {this.state.practice && <Practice words={this.state.vocab} />}
            </div>
        );
    }
}

export default Home;