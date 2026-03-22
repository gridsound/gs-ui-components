"use strict";

class gsuiAutomation extends gsui0ne {
	constructor() {
		super( {
			$tagName: "gsui-automation",
			$elements: {
				$btnTarget: ".gsuiAutomation-btnTarget",
				$duration: "gsui-duration",
				$beatlines: "gsui-beatlines",
			},
			$attributes: {
				duration: 1,
			},
		} );
		GSUdomListen( this, {
			[ GSEV_DURATION_INPUT ]: ( _, dur ) => this.#updateBeatline( dur ),
			[ GSEV_DURATION_CHANGE ]: ( _, dur ) => this.#onchange( "duration", dur ),
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "target", "duration" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "target": this.#updateTarget( val ); break;
			case "duration": this.#updateDuration( val ); break;
		}
	}
	$onresize() {
		this.#updateBeatline( +this.$elements.$duration.$getAttr( "value" ) );
	}

	// .........................................................................
	#onchange( prop, val ) {
		this.$this.$dispatch( GSEV_AUTOMATION_CHANGE, { [ prop ]: val } );
	}
	#updateBeatline( dur ) {
		const bl = this.$elements.$beatlines;

		bl.$setAttr( "pxperbeat", bl.$width() / dur );
	}
	#updateDuration( dur ) {
		this.$elements.$duration.$setAttr( "value", dur );
		this.#updateBeatline( dur );
	}
	#updateTarget( t ) {
		this.$elements.$btnTarget.$empty();
		if ( t ) {
			const [ chan, fx, prop ] = t.split( "." ); // "chanId[.fxId_fxType].prop"
			const prop2 = prop || fx;
			const fx2 = prop ? fx : null;

			this.$elements.$btnTarget.$append(
				GSUcreateIcon( { icon: "channels" } ),
				GSUcreateSpan( null, chan ),
				fx2 && GSUcreateIcon( { icon: "effects" } ),
				fx2 && GSUcreateSpan( null, fx2 ),
				GSUcreateIcon( { icon: "caret-right" } ),
				GSUcreateSpan( null, prop2 ),
			);
		}
	}
}

GSUdomDefine( "gsui-automation", gsuiAutomation );
