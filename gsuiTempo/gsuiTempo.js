"use strict";

class gsuiTempo extends gsui0ne {
	constructor() {
		super( {
			$tagName: "gsui-tempo",
			$elements: {
				$bpm: ".gsuiTempo-bpm",
				$timediv: ".gsuiTempo-timeDivision",
				$form: "form",
				$inputs: "input",
				$bpmTap: ".gsuiTempo-form-bpm button",
			},
			$attributes: {
				timedivision: "4/4",
				bpm: 60,
			},
		} );
		this.$elements.$form.$on( {
			submit: this.$onsubmitPopup.bind( this ),
			keydown: e => e.stopPropagation(),
		} );
		this.$elements.$bpmTap.$onclick( () => this.$elements.$inputs.$at( 2 ).$value( gswaBPMTap.$tap() ) );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "bpm", "timedivision" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "bpm":
				this.$elements.$inputs.$at( 2 ).$value( val );
				this.$elements.$bpm.$text( val );
				break;
			case "timedivision": {
				const div = GSUsplitNums( val, "/" );

				this.$elements.$inputs.$at( 0 ).$value( div[ 0 ] );
				this.$elements.$inputs.$at( 1 ).$value( div[ 1 ] );
				this.$elements.$timediv.$child( 0 ).$text( div[ 0 ] );
				this.$elements.$timediv.$child( -1 ).$text( div[ 1 ] );
			} break;
		}
	}

	// .........................................................................
	#createPopup() {
		const [ bpm, time ] = this.$this.$getAttr( "bpm", "timedivision" );
		const time2 = GSUsplitNums( time, "/" );

		this.$elements.$inputs.$at( 0 ).$value( time2[ 0 ] );
		this.$elements.$inputs.$at( 1 ).$value( time2[ 1 ] );
		this.$elements.$inputs.$at( 2 ).$value( +bpm );
		return this.$elements.$form;
	}
	$onsubmitPopup() {
		const inp = this.$elements.$inputs;
		const time = `${ inp.$at( 0 ).$value() }/${ inp.$at( 1 ).$value() }`;
		const bpm = inp.$at( 2 ).$value();

		if ( time !== this.$this.$getAttr( "timedivision" ) || bpm !== this.$this.$getAttr( "bpm" ) ) {
			this.$this.$dispatch( GSEV_TEMPO_CHANGE, {
				bpm: +bpm,
				timedivision: time,
			} );
		}
		this.$elements.$form.$togglePopover( false );
		return false;
	}
}

$.$define( "gsui-tempo", gsuiTempo );
