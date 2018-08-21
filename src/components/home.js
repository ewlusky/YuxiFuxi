import React, { Component } from 'react';
import API from './APIman'
import Practice from './practice'
import Graph from './graph'
import Tesseract from './tesseract'
import Selector from './selector'
import XMLParser from 'react-xml-parser';


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
        rid: 0,
        lang: "zh-CN"
    }

    handleFieldChange = (evt) => {
        const stateToChange = {}
        stateToChange[evt.target.id] = evt.target.value
        this.setState(stateToChange)
    }

    changeLang = (language) => {
        console.log("CHANGE LANGUAGE", language)
        this.setState({ lang: language });
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
        fetch(`http://video.google.com/timedtext?lang=${this.state.lang}&v=${this.state.url}`)
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
                    block.value = block.value.replace(' ', '');

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
                        merged = [{
                            "traditional": "輝煌",
                            "definitions": {
                                "hui1 huang2": {
                                    "pinyin": "huī huáng",
                                    "translations": [
                                        "splendid",
                                        "glorious"
                                    ],
                                    "zhuyin": "ㄏㄨㄟ ㄏㄨㄤˊ"
                                }
                            },
                            "simplified": "辉煌",
                            "hsk": 6,
                            "key": "辉煌",
                            "score": 0,
                            "count": 0,
                            "id": 119
                        },
                        {
                            "traditional": "連",
                            "definitions": {
                                "lian2": {
                                    "pinyin": "lián",
                                    "translations": [
                                        "to link",
                                        "to join",
                                        "to connect",
                                        "continuously",
                                        "in succession",
                                        "including",
                                        "(used with 也, 都 etc) even",
                                        "company (military)"
                                    ],
                                    "zhuyin": "ㄌㄧㄢˊ"
                                }
                            },
                            "simplified": "连",
                            "hsk": 4,
                            "key": "连",
                            "score": 0,
                            "count": 0,
                            "id": 120
                        },
                        {
                            "traditional": "稱號",
                            "definitions": {
                                "cheng1 hao4": {
                                    "pinyin": "chēng hào",
                                    "translations": [
                                        "name",
                                        "term of address",
                                        "title"
                                    ],
                                    "zhuyin": "ㄔㄥ ㄏㄠ`"
                                }
                            },
                            "simplified": "称号",
                            "hsk": 6,
                            "key": "称号",
                            "score": 0,
                            "count": 0,
                            "id": 121
                        },
                        {
                            "traditional": "整個",
                            "definitions": {
                                "zheng3 ge4": {
                                    "pinyin": "zhěng gè",
                                    "translations": [
                                        "whole",
                                        "entire",
                                        "total"
                                    ],
                                    "zhuyin": "ㄓㄥˇ ㄍㄜ`"
                                }
                            },
                            "simplified": "整个",
                            "hsk": 5,
                            "key": "整个",
                            "score": 0,
                            "count": 0,
                            "id": 122
                        },
                        {
                            "traditional": "區",
                            "definitions": {
                                "ou1": {
                                    "pinyin": "ōu",
                                    "translations": [
                                        "surname Ou"
                                    ],
                                    "zhuyin": "ㄡ"
                                },
                                "qu1": {
                                    "pinyin": "qū",
                                    "translations": [
                                        "area",
                                        "region",
                                        "district",
                                        "small",
                                        "distinguish"
                                    ],
                                    "zhuyin": "ㄑㄩ",
                                    "classifiers": {
                                        "ge4": {
                                            "traditional": "個",
                                            "simplified": "个",
                                            "pinyin": "gè"
                                        }
                                    }
                                }
                            },
                            "simplified": "区",
                            "key": "区",
                            "score": 0,
                            "count": 0,
                            "id": 123
                        },
                        {
                            "traditional": "降臨",
                            "definitions": {
                                "jiang4 lin2": {
                                    "pinyin": "jiàng lín",
                                    "translations": [
                                        "to descend",
                                        "to arrive",
                                        "to come"
                                    ],
                                    "zhuyin": "ㄐㄧㄤ` ㄌㄧㄣˊ"
                                }
                            },
                            "simplified": "降临",
                            "hsk": 6,
                            "key": "降临",
                            "score": 0,
                            "count": 0,
                            "id": 124
                        },
                        {
                            "traditional": "就",
                            "definitions": {
                                "jiu4": {
                                    "pinyin": "jiù",
                                    "translations": [
                                        "at once",
                                        "right away",
                                        "only",
                                        "just (emphasis)",
                                        "as early as",
                                        "already",
                                        "as soon as",
                                        "then",
                                        "in that case",
                                        "as many as",
                                        "even if",
                                        "to approach",
                                        "to move towards",
                                        "to undertake",
                                        "to engage in",
                                        "to suffer",
                                        "subjected to",
                                        "to accomplish",
                                        "to take advantage of",
                                        "to go with (of foods)",
                                        "with regard to",
                                        "concerning"
                                    ],
                                    "zhuyin": "ㄐㄧㄡ`"
                                }
                            },
                            "hsk": 2,
                            "simplified": "就",
                            "key": "就",
                            "score": 0,
                            "count": 0,
                            "id": 125
                        },
                        {
                            "traditional": "共同",
                            "definitions": {
                                "gong4 tong2": {
                                    "pinyin": "gòng tóng",
                                    "translations": [
                                        "common",
                                        "joint",
                                        "jointly",
                                        "together",
                                        "collaborative"
                                    ],
                                    "zhuyin": "ㄍㄨㄥ` ㄊㄨㄥˊ"
                                }
                            },
                            "hsk": 4,
                            "simplified": "共同",
                            "key": "共同",
                            "score": 0,
                            "count": 0,
                            "id": 126
                        },
                        {
                            "traditional": "響徹",
                            "definitions": {
                                "xiang3 che4": {
                                    "pinyin": "xiǎng chè",
                                    "translations": [
                                        "to resound",
                                        "to resonate"
                                    ],
                                    "zhuyin": "ㄒㄧㄤˇ ㄔㄜ`"
                                }
                            },
                            "simplified": "响彻",
                            "key": "响彻",
                            "score": 0,
                            "count": 0,
                            "id": 127
                        },
                        {
                            "traditional": "讓",
                            "definitions": {
                                "rang4": {
                                    "pinyin": "ràng",
                                    "translations": [
                                        "to yield",
                                        "to permit",
                                        "to let sb do sth",
                                        "to have sb do sth",
                                        "to make sb (feel sad etc)",
                                        "by (indicates the agent in a passive clause, like 被[bei4])"
                                    ],
                                    "zhuyin": "ㄖㄤ`"
                                }
                            },
                            "simplified": "让",
                            "hsk": 2,
                            "key": "让",
                            "score": 0,
                            "count": 0,
                            "id": 128
                        }
                        ]
                        
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
                    {!this.state.practice && <Selector change={this.changeLang} />}
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