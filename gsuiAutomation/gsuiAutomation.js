"use strict";

class gsuiAutomation extends gsui0ne {
	#target = null;
	#targetMenu = new gsuiActionMenu();

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
		this.#targetMenu.$setDirection( "BR" );
		this.#targetMenu.$setCallback( this.#onchangeTarget.bind( this ) );
		this.#targetMenu.$bindTargetElement( this.$elements.$btnTarget );
		GSUdomListen( this, {
			[ GSEV_DURATION_INPUT ]: ( _, dur ) => this.#updateBeatline( dur ),
			[ GSEV_DURATION_CHANGE ]: ( _, dur ) => this.#onchange( "duration", dur ),
		} );
	}

	// .........................................................................
	$onresize() {
		this.#updateBeatline( +this.$elements.$duration.$getAttr( "value" ) );
	}
	static get observedAttributes() {
		return [ "target", "duration" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "target": this.#updateTarget( val ); break;
			case "duration": this.#updateDuration( val ); break;
		}
	}
	$onmessage( ev, val ) {
		switch ( ev ) {
			case GSEV_AUTOMATION_TARGETS: this.#updateTargetList( val ); break;
		}
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

			this.#targetMenu.$changeAction( this.#target, "icon", "radio-btn" );
			this.#targetMenu.$changeAction( t, "icon", "radio-btn-checked" );
			this.$elements.$btnTarget.$append(
				GSUcreateIcon( { icon: "channels" } ),
				GSUcreateSpan( null, chan ),
				fx2 && GSUcreateIcon( { icon: "effects" } ),
				fx2 && GSUcreateSpan( null, fx2 ),
				GSUcreateIcon( { icon: "caret-right" } ),
				GSUcreateSpan( null, prop2 ),
			);
		}
		this.#target = t || null;
	}
	#onchangeTarget( val ) {
		if ( val !== this.#target ) {
			this.$this.$setAttr( "target", val );
			this.#onchange( "target", val );
		}
	}
	#updateTargetList( list ) {
		this.#targetMenu.$setActions( list.map( t => ( {
			id: t,
			name: t,
			icon: "radio-btn",
		} ) ) );
		this.#targetMenu.$changeAction( this.#target, "icon", "radio-btn-checked" );
	}
}

GSUdomDefine( "gsui-automation", gsuiAutomation );
