"use strict";

class gsuiTempo extends gsui0ne {
	#dropdown = new gsuiDropdown();
	#popup = $( GSUgetTemplate( "gsui-tempo-dropdown" ) ).$queryMap( {
		$form: ".gsuiTempo-popup",
		$inputs: "input",
		$bpmTap: ".gsuiTempo-popup-bpm button",
	} );

	constructor() {
		super( {
			$tagName: "gsui-tempo",
			$elements: {
				$bpm: ".gsuiTempo-bpm",
				$timediv: ".gsuiTempo-timeDivision",
			},
			$attributes: {
				timedivision: "4/4",
				bpm: 60,
			},
		} );
		this.#dropdown.$setDirection( "B" );
		this.#dropdown.$bindTargetElement( this.$element );
		this.#dropdown.$onopenCreateElement( this.#createPopup.bind( this ) );
		this.#popup.$form.$on( {
			submit: this.$onsubmitPopup.bind( this ),
			keydown: e => e.stopPropagation(),
		} );
		this.#popup.$bpmTap.$onclick( () => this.#popup.$inputs.$at( 2 ).$value( gswaBPMTap.$tap() ) );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "bpm", "timedivision" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "bpm":
				this.#popup.$inputs.$at( 2 ).$value( val );
				this.$elements.$bpm.$text( val );
				break;
			case "timedivision": {
				const div = GSUsplitNums( val, "/" );

				this.#popup.$inputs.$at( 0 ).$value( div[ 0 ] );
				this.#popup.$inputs.$at( 1 ).$value( div[ 1 ] );
				this.$elements.$timediv.$child( 0 ).$text( div[ 0 ] );
				this.$elements.$timediv.$child( -1 ).$text( div[ 1 ] );
			} break;
		}
	}

	// .........................................................................
	#createPopup() {
		const [ bpm, time ] = this.$this.$getAttr( "bpm", "timedivision" );
		const time2 = GSUsplitNums( time, "/" );

		this.#popup.$inputs.$at( 0 ).$value( time2[ 0 ] );
		this.#popup.$inputs.$at( 1 ).$value( time2[ 1 ] );
		this.#popup.$inputs.$at( 2 ).$value( +bpm );
		return this.#popup.$form;
	}
	$onsubmitPopup() {
		const inp = this.#popup.$inputs;
		const time = `${ inp.$at( 0 ).$value() }/${ inp.$at( 1 ).$value() }`;
		const bpm = inp.$at( 2 ).$value();

		if ( time !== this.$this.$getAttr( "timedivision" ) || bpm !== this.$this.$getAttr( "bpm" ) ) {
			this.$this.$dispatch( GSEV_TEMPO_CHANGE, {
				bpm: +bpm,
				timedivision: time,
			} );
		}
		this.#dropdown.$close();
		return false;
	}
}

GSUdomDefine( "gsui-tempo", gsuiTempo );
