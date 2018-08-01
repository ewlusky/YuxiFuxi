import React, { Component } from 'react';

const Flashcard = (props) => {
		return (
		<div className="container">
			<div className="front" style={{ backgroundImage: 'url("https://unsplash.it/500/500/")' }}>
				<div className="inner">
					<p className="flash-simp">{props.fin?  "" : props.card.simplified}</p>
					<p className="flash-trad">{props.fin? "" : props.card.traditional}</p>
					<span>{props.fin? "" : props.card.definitions? Object.keys(props.card.definitions).map(key => props.card.definitions[key].pinyin + " ") : console.log('null')}</span>
				</div>
			</div>
			<div className="back">
				<div className="inner">
		{props.fin? "" : props.card.definitions? Object.keys(props.card.definitions).map(key => <div>{props.card.definitions[key].pinyin + ": " + props.card.definitions[key].translations.map(trans => " " + trans)}</div>) : console.log('null')}

				</div>
				<div className="flash-buttons">
				<div onClick={() => props.nextCard(0)} className="Fbutton glass3 clear">No Idea
        	<div className="glass3hover">No Idea</div>
					<div className="glass3ref"></div>
					<div className="glass3hi"></div>
					<div id="hi3" className="glass3hi"></div>
					<div id="hi3" className="glass3hi"></div>
				</div>
				<div onClick={() => props.nextCard(0.5)} className="Fbutton glass3 clear">Almost
        	<div className="glass3hover">Almost</div>
					<div className="glass3ref"></div>
					<div className="glass3hi"></div>
					<div id="hi3" className="glass3hi"></div>
					<div id="hi3" className="glass3hi"></div>
				</div>
				<div onClick={() => props.nextCard(1)} className="Fbutton glass3 clear">Know It
        	<div className="glass3hover">Know It</div>
					<div className="glass3ref"></div>
					<div className="glass3hi"></div>
					<div id="hi3" className="glass3hi"></div>
					<div id="hi3" className="glass3hi"></div>
				</div>
				</div>
			</div>
		</div>
	);
}

export default Flashcard;



