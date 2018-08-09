import React, { Component } from 'react';
import API from './APIman'
import Practice from './practice'
import Graph from './graph'
import Tesseract from './tesseract'
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
        start: 0,
        userStart: 0,
        percentage: 0,
        last: 0,
        total: 0,
        record: [0],
        rid: 0
    }

    handleFieldChange = (evt) => {
        const stateToChange = {}
        stateToChange[evt.target.id] = evt.target.value
        this.setState(stateToChange)
    }

    componentDidMount() {
        this.setState({ practice: false })
        const uid = sessionStorage.getItem('UserId') // CHANGE THIS
        console.log("user GET", uid)
        this.setState({ user: uid });
        API.getField(`wordusers?_expand=word&&userId=${uid}`)
            .then(userWords => {
                this.setState({ Uwords: userWords });
                this.setState({ total: userWords.length });
            })
        API.getField(`users/${uid}`)
            .then(user => {
                // console.log('TEST USER INFO', user)
                this.setState({ userUrl: user.url });
                this.setState({ userStart: user.time });
                this.setState({ last: user.last });
                this.setState({ percentage: user.percent });
            })

        API.getField(`records?userId=${uid}`)
            .then(entry => {
                // console.log('record check', entry)
                this.setState({ record: entry[0] ? entry[0].record : [] });
                this.setState({ rid: entry[0] ? entry[0].id : 0 });
            })
        let now = Date.now()
        let day = new Date(now)
        this.setState({ today: day.getDate() });
    }

    continue = () => {
        // console.log("CONTINUE FUNCTION")
        this.setState({ url: this.state.userUrl });
        this.setState({ start: this.state.userStart });
        this.makeVocab()
    }

    finished = () => {
        // console.log('FINISHED')
        let tempRecord = this.state.record
        if (false && this.state.last === this.state.today) {  //won't catch one month apart
            let score = tempRecord.pop()
            score += this.state.vocab.length
            // console.log("compare ref", tempRecord, this.state.record)
            tempRecord.push(score)
        } else {
            if (this.state.record.length >= 14) {
                tempRecord.shift()
                tempRecord.push(this.state.vocab.length)
            } else {
                tempRecord.push(this.state.vocab.length)
            }
        }
        this.setState({ record: tempRecord });
        API.putRecord(this.state.rid, tempRecord)
        API.patchUser(this.state.user, this.state.url, (this.state.start + this.state.vidLength), this.state.percentage)
            .then(user => {
                this.setState({ practice: false });
                this.setState({ userStart: user.time });
                API.getField(`wordusers?userId=${user.id}`)
                    .then(userWords => {
                        this.setState({ total: userWords.length });
                    })
            })
        // console.log("Record", this.state.record)


    }

    makeVocab = () => {
        // console.log('MAKE VOCAB')
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
                for (let i = 0; trans.children[i].attributes.start <= this.state.start; i++) {
                    initial = i;
                }
                let ending = 0;
                for (let i = 0; trans.children[i].attributes.start <= (this.state.start + this.state.vidLength); i++) {
                    ending = i;
                }
                let percent = Math.floor(((ending) / (trans.children.length + 1)) * 100)
                this.setState({ percentage: percent });
                let promises = []
                for (let i = initial; i <= ending; i++) {
                    const block = trans.children[i]
                    if (block.value.length === 0) {
                        block.value = "a"
                    }
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
                        // console.log("promise test", results) // could check for duplicates here by going through lists again
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

                {!this.state.practice && <Tesseract />}
                {!this.state.practice && <Graph total={this.state.total} record={this.state.record} percent={this.state.percentage} />}
                <div className="bottom">
                    {!this.state.practice && <button onClick={this.continue} className="btn btn-2 btn-2a jixu"><span>JIXU</span></button>}
                    {!this.state.practice && <input onChange={this.handleFieldChange} type="text"
                        id="url"
                        placeholder="Youtube Video Id (v=...)"
                        required="" autoFocus="" />}
                    {!this.state.practice && <button className="btn btn-2 btn-2a yuxi" onClick={this.makeVocab}><span>YUXI</span></button>}
                </div>
            </div>
        );
    }
}

export default Home;