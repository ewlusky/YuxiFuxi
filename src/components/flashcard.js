import React from 'react';

const Flashcard = (props) => {
	setTimeout(() => {
		speechSynthesis.cancel()
		let synth = window.speechSynthesis;
		let utterThis = new SpeechSynthesisUtterance();
		let voices = synth.getVoices();
		utterThis.voice = voices[63];
		utterThis.voiceURI = 'native';
		utterThis.volume = 0.4; // 0 to 1
		utterThis.rate = 0.9; // 0.1 to 10
		utterThis.pitch = 1; //0 to 2
		utterThis.text = props.card.traditional;
		utterThis.lang = 'zh-CN';
		synth.speak(utterThis)
	}, 800)
		return (
		<div onClick={() => props.flipIt()} className={props.flip ? "container containerH" : "container"}>
			<div className="front" style={{ backgroundImage: 'url("https://unsplash.it/500/500/")' }}>
				<div className="inner">
					<p className="flash-simp">{props.fin ? "" : props.card.simplified}</p>
					<p className="flash-trad">{props.fin ? "" : props.card.traditional}</p>
					<span>{props.fin ? "" : props.card.definitions ? Object.keys(props.card.definitions).map(key => props.card.definitions[key].pinyin + " ") : console.log('null')}</span>
				</div>
			</div>
			<div className="back">
				<div className="inner">
					{props.fin ? "" : props.card.definitions ? Object.keys(props.card.definitions).map(key => <div>{props.card.definitions[key].pinyin + ": " + props.card.definitions[key].translations.map(trans => " " + trans)}</div>) : console.log('null')}

				</div>
				<div className="flash-buttons">
					<div onClick={() => props.nextCard(0)} className="Fbutton glass3 clear"><span className="flash-text">No Idea</span>
						<div className="glass3hover">No Idea</div>
						<div className="glass3ref"></div>
						<div className="glass3hi"></div>
					</div>
					<div onClick={() => props.nextCard(0.5)} className="Fbutton glass3 clear"><span className="flash-text">Almost</span>
						<div className="glass3hover">Almost</div>
						<div className="glass3ref"></div>
						<div className="glass3hi"></div>
					</div>
					<div onClick={() => props.nextCard(1)} className="Fbutton glass3 clear"><span className="flash-text">Know It</span>
						<div className="glass3hover">Know It</div>
						<div className="glass3ref"></div>
						<div className="glass3hi"></div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Flashcard;



