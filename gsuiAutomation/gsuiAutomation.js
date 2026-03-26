"use strict";

class gsuiAutomation extends gsui0ne {
	#target = null;
	#targetMenu = new gsuiActionMenu();
	#askTargets = GSUnoop;

	constructor() {
		super( {
			$tagName: "gsui-automation",
			$elements: {
				$btnTarget: ".gsuiAutomation-btnTarget",
				$duration: "gsui-duration",
				$beatlines: "gsui-beatlines",
				$dotline: "gsui-dotline",
			},
			$attributes: {
				duration: 1,
			},
		} );

		const menu = this.#targetMenu;
		const dotline = this.$elements.$dotline.$get( 0 );

		menu.$setDirection( "BR" );
		menu.$setActions( this.#createMenuActions.bind( this ) );
		menu.$setCallback( this.#onchangeTarget.bind( this ) );
		menu.$bindTargetElement( this.$elements.$btnTarget );
		dotline.$setDotOptions( 0, { freezeX: true, deletable: false } );
		dotline.$setDotOptions( 1, { freezeX: true, deletable: false } );
		dotline.$change( {
			0: { x: 0, y: 0 },
			1: { x: 1, y: 0, type: "curve", val: 0 },
		} );
		GSUdomListen( this, {
			[ GSEV_DURATION_INPUT ]: ( _, dur ) => this.#updateBeatline( dur ),
			[ GSEV_DURATION_CHANGE ]: ( _, dur ) => this.#onchange( "duration", dur ),
			[ GSEV_DOTLINE_CHANGE ]: ( _, obj ) => this.#onchange( "curve", obj ),
			[ GSEV_DOTLINE_INPUT ]: GSUnoop,
			[ GSEV_DOTLINE_INPUTEND ]: GSUnoop,
			[ GSEV_DOTLINE_INPUTSTART ]: GSUnoop,
		} );
	}

	// .........................................................................
	$onresize() {
		this.#updateBeatline( +this.$elements.$duration.$getAttr( "value" ) );
	}
	static get observedAttributes() {
		// + "disabled"
		return [ "target", "duration", "timedivision" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "target": this.#updateTarget( val ); break;
			case "duration": this.#updateDuration( val ); break;
			case "timedivision": this.$elements.$beatlines.$setAttr( "timedivision", val ); break;
		}
	}
	$onmessage( ev, val ) {
		switch ( ev ) {
			case GSEV_AUTOMATION_TARGETS: this.#askTargets = val; break;
			case GSEV_AUTOMATION_CURVE: this.$elements.$dotline.$get( 0 ).$change( val ); break;
			case GSEV_AUTOMATION_CURVE_RESET: this.$elements.$dotline.$get( 0 ).$clear(); break;
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
			const tar = GSUaudioParseTarget( t );

			this.$elements.$btnTarget.$append(
				GSUcreateIcon( { icon: "channels" } ),
				GSUcreateSpan( null, tar.$channelId ),
				tar.$effectId && GSUcreateIcon( { icon: "effects" } ),
				tar.$effectId && GSUcreateSpan( null, `${ tar.$effectId } ${ tar.$effectType }` ),
				GSUcreateIcon( { icon: "caret-right" } ),
				GSUcreateSpan( null, tar.$prop ),
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
	#createMenuActions() {
		return this.#askTargets().map( t => ( {
			id: t,
			name: t,
			icon: t === this.#target ? "radio-btn-checked" : "radio-btn",
		} ) );
	}
}

GSUdomDefine( "gsui-automation", gsuiAutomation );
