import React, { Component } from 'react';
import Flashcard from './flashcard'
import CircularProgressbar from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';


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
        console.log('points', points)
        let tempState = Object.assign({}, this.state);
        console.log('next bug', tempState)
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
        if (tempState.currentWord.count && points === 1) {
            tempState.total -= 1;
        } else {
            tempState.currentWord.count = 1;
            tempState.curr += 1;
        }
        if (tempState.curr >= tempState.total) {
            tempState.flashCrabs = this.shuffle(tempState.flashCrabs)
            tempState.curr = 0
        }
        if (tempState.Cscore === tempState.possible) {
            console.log('FINISHED')
            tempState.finished = true;
        }
        console.log("set state test", { ...tempState })
        this.setState(tempState);
        let crabs = this.state.flashCrabs
        let newCard = crabs.pop()
        this.setState({ flashCrabs: crabs });
        this.setState({ currentWord: newCard });
        console.log("set state test2", this.state)
    }

    componentDidMount() {
        let flash = this.shuffle(this.props.words);
        this.setState({ total: flash.length });
        this.setState({ possible: flash.length });
        const cardOne = flash.pop()
        this.setState({ currentWord: cardOne });
        this.setState({ flashCrabs: flash });
    }
    render() {
        console.log("render state check", this.state)

        return (
            <div className={this.state.finished ? "practiceFH" : "practiceF"}>
                <div className="practice Pfront" >
                    <Flashcard card={this.state.currentWord} nextCard={this.nextCard} fin={this.state.finished} />
                    <div className="score-card">
                        <div id='figure' className="progress">
                            <CircularProgressbar
                                percentage={this.state.percentage}
                                text={`${this.state.percentage}%`}
                                background
                                backgroundPadding={6}
                                styles={{
                                    background: {
                                        fill: '#3e98c7',
                                    },
                                    text: {
                                        fill: '#fff',
                                        textShadow: '0px 2px 3px rgba(255,255,255,0.5)',

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
                        <iframe width="420" height="315"
                            src="https://www.youtube.com/embed/MSjaP1eV5eQ">
                        </iframe>

                    </div>
                </div>
            </div>

        );
    }
}

export default Practice;