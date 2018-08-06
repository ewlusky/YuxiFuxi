import React, { Component } from 'react';
import Flashcard from './flashcard'
import CircularProgressbar from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import API from './APIman'


class Practice extends Component {
    state = {
        finished: false,
        possible: 0,  //Total possible score, sum of words.
        Cscore: 0,     //Current score, sub of all word scores.
        total: 0,     //Total number of cards, less removed cards.
        curr: 0,      //Current number of cards reviewed, when this reaches total we shuffle.
        flashCrabs: [],
        currentWord: {},
        percentage: 0,
        flip: false
    }

    flipIt = () => {
        console.log('flipped')
        this.setState(prevState => ({flip : !prevState.flip }));
    }

    shuffle = (cards) => {
        console.log('SHUFFLESHUFFLESHUFFLE')
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        return cards;
    }

    nextCard = (points) => {
        let tempState = Object.assign({}, this.state);  //watch out for memory leak here
        tempState.Cscore += (points - tempState.currentWord.score)
        tempState.currentWord.score = points;
        tempState.percentage = tempState.Cscore ? Math.floor((tempState.Cscore / tempState.possible) * 100) : 0

        if (points === 0) {
            let third = Math.floor(tempState.flashCrabs.length / 3)
            tempState.flashCrabs.splice(third, 0, tempState.currentWord)
        }
        else if (points === 0.5) {
            let half = Math.floor(tempState.flashCrabs.length / 2)
            tempState.flashCrabs.splice(half, 0, tempState.currentWord)
        }
        else {
            if (!tempState.currentWord.count) {  // If the count is 0, add the card to the back.
                tempState.flashCrabs.unshift(tempState.currentWord)
            }
        }
        if (tempState.currentWord.count === 1 && points === 1) {
            tempState.total -= 1;
            const duplicate = this.props.known.filter(entry => entry.word.simplified == tempState.currentWord.simplified)
            if (duplicate.length > 0) {
                API.putWordUser(duplicate[0].id, duplicate[0].wordId, duplicate[0].count + 1)
            } else {
                API.getField(`words?simplified=${tempState.currentWord.simplified}`)
                    .then(word => {
                        if (word.length > 0) {
                            API.postWordUser(word[0].id)
                        } else {
                            API.postWord(tempState.currentWord)
                                .then(word => {
                                    API.postWordUser(word.id)
                                })
                        }
                    })
            }

        } else {
            tempState.currentWord.count = 1;
            tempState.curr += 1;
        }
        if (tempState.curr >= tempState.total) {
            tempState.flashCrabs = this.shuffle(tempState.flashCrabs)
            tempState.curr = 0
        }
        if (tempState.Cscore >= tempState.possible) {
            tempState.finished = true;
            this.state.flashCrabs.forEach(crab => {
                const duplicate = this.props.known.filter(entry => entry.word.simplified == crab.simplified)
                if (duplicate.length > 0) {
                    API.putWordUser(duplicate[0].id, duplicate[0].wordId, duplicate[0].count + 1)
                } else {
                    API.getField(`words?simplified=${crab.simplified}`)
                        .then(word => {
                            if (word.length > 0) {
                                API.postWordUser(word[0].id).then(response => console.log('post user', response))
                            } else {
                                API.postWord(crab)
                                    .then(word => {
                                        API.postWordUser(word.id)
                                    })
                            }
                        })
                }
            })
        }
        this.setState(tempState);
        let crabs = this.state.flashCrabs
        let newCard = crabs.pop()
        this.setState({ flashCrabs: crabs });
        this.setState({ currentWord: newCard });
    }

    componentDidMount() {
        let flash = this.shuffle(this.props.words).map(word => ({ ...word }));
        this.setState({ total: flash.length });
        this.setState({ possible: flash.length });
        const cardOne = flash.pop()
        this.setState({ currentWord: cardOne });
        this.setState({ flashCrabs: flash });
        if (this.props.skip) {
            this.setState({ finished: true });
        }

    }
    render() {
        return (
            <div className={this.state.finished ? "practiceFH" : "practiceF"}>
                <div className="practice Pfront" >
                    <Flashcard flipIt={this.flipIt} flip={this.state.flip} card={this.state.currentWord} nextCard={this.nextCard} fin={this.state.finished} />
                    <div className="score-card">
                        <div id='figure' className="progress">
                            <CircularProgressbar
                                percentage={this.state.percentage}
                                text={`${this.state.percentage}%`}
                                background
                                backgroundPadding={6}
                                styles={{
                                    background: {
                                        fill: '#24c1ed', //'#3e98c7',
                                    },
                                    text: {
                                        fill: '#000000', //#fff,
                                        textShadow: '0px 4px 6px #fff',
                                        fontSize: '20px',
                                        fontWeight: '900',
                                    },
                                    path: {
                                        stroke: '#fff',
                                    },
                                    trail: { stroke: 'transparent' },

                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="practice Pback">
                    <div className="Pinner">
                        <div className="resp-container">
                            <iframe className="resp-iframe"
                                src={`https://www.youtube.com/embed/${this.props.url}?start=${this.props.start}&end=${this.props.start+this.props.dur}&modestbranding=1`}>
                            </iframe>
                        </div>
                    </div>
                    <div className="wan-div">
                        <button onClick={this.props.fin} className="btn btn-2 btn-2a wan" >完</button>
                    </div>
                </div>
            </div>

        );
    }
}

export default Practice;