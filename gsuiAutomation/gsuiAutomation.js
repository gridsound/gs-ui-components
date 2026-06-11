"use strict";

class gsuiAutomation extends gsui0ne {
	#target = null;
	#askTargets = GSUnoop;

	constructor() {
		super( {
			$tagName: "gsui-automation",
			$elements: {
				$btnTarget: "[popovertarget]",
				$duration: "gsui-duration",
				$beatlines: "gsui-beatlines",
				$dotline: "gsui-dotline",
				$targets: "gsui-automation-targets",
			},
			$attributes: {
				duration: 1,
			},
		} );

		const dotline = this.$elements.$dotline.$get( 0 );

		dotline.$setDotOptions( 0, { freezeX: true, deletable: false } );
		dotline.$setDotOptions( 1, { freezeX: true, deletable: false } );
		dotline.$change( {
			0: { x: 0, y: 0 },
			1: { x: 1, y: 0, type: "curve", val: 0 },
		} );
		this.$this.$listen( {
			[ GSEV_DURATION_INPUT ]: ( _, dur ) => this.#updateBeatline( dur ),
			[ GSEV_DURATION_CHANGE ]: ( _, dur ) => this.#onchange( "duration", dur ),
			[ GSEV_DOTLINE_CHANGE ]: ( _, obj ) => this.#onchange( "curve", obj ),
			[ GSEV_DOTLINE_INPUT ]: GSUnoop,
			[ GSEV_DOTLINE_INPUTEND ]: GSUnoop,
			[ GSEV_DOTLINE_INPUTSTART ]: GSUnoop,
		} );
		this.$elements.$targets.$on( "beforetoggle", e => {
			e.newState === "open"
				? this.$elements.$targets.$append( ...this.#createMenuActions() )
				: this.$elements.$targets.$empty();
		} );
		this.$elements.$targets.$onchange( e => {
			const val = e.target.value;

			this.$elements.$targets.$togglePopover( false );
			if ( val !== this.#target ) {
				this.$this.$setAttr( "target", val );
				this.#onchange( "target", val );
			}
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
				$.$icon( { icon: "channels" } ),
				$.$span( null, tar.$channelId ),
				tar.$effectId && $.$icon( { icon: "effects" } ),
				tar.$effectId && $.$span( null, `${ tar.$effectId } ${ tar.$effectType }` ),
				$.$icon( { icon: "caret-right" } ),
				$.$span( null, tar.$prop ),
			);
		}
		this.#target = t || null;
	}
	#createMenuActions() {
		return this.#askTargets().map( t =>
			$.$label( null,
				$.$input( { type: "radio", name: "gsuiAutomation-target", value: t, checked: t === this.#target } ),
				$.$span( null, t ),
			)
		);
	}
}

$.$define( "gsui-automation", gsuiAutomation );
