"use strict";

class gsuiTempo extends gsui0ne {
	#dropdown = new gsuiDropdown();
	#popup = GSUdomFind( GSUgetTemplate( "gsui-tempo-dropdown" ), {
		$form: ".gsuiTempo-popup",
		$bpmTap: ".gsuiTempo-popup-bpm button",
	} );

	constructor() {
		super( {
			$cmpName: "gsuiTempo",
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
		Object.seal( this );
		this.#dropdown.$setDirection( "B" );
		this.#dropdown.$bindTargetElement( this.$element );
		this.#dropdown.$onopenCreateElement( this.#createPopup.bind( this ) );
		this.#popup.$form.onsubmit = this.$onsubmitPopup.bind( this );
		this.#popup.$form.onkeydown = e => e.stopPropagation();
		this.#popup.$bpmTap.onclick = () => this.#popup.$form[ 2 ].value = gswaBPMTap.$tap();
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "bpm", "timedivision" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "bpm":
				this.#popup.$form[ 2 ].value =
				this.$elements.$bpm.textContent = val;
				break;
			case "timedivision": {
				const div = GSUsplitNums( val, "/" );

				this.#popup.$form[ 0 ].value = this.$elements.$timediv.firstChild.textContent = div[ 0 ];
				this.#popup.$form[ 1 ].value = this.$elements.$timediv.lastChild.textContent = div[ 1 ];
			} break;
		}
	}

	// .........................................................................
	#createPopup() {
		const f = this.#popup.$form;
		const time = GSUsplitNums( GSUdomGetAttr( this, "timedivision" ), "/" );

		f[ 0 ].value = time[ 0 ];
		f[ 1 ].value = time[ 1 ];
		f[ 2 ].value = GSUdomGetAttrNum( this, "bpm" );
		return f;
	}
	$onsubmitPopup( e ) {
		const f = e.target;
		const time = `${ f[ 0 ].value }/${ f[ 1 ].value }`;
		const bpm = f[ 2 ].value;

		if ( time !== GSUdomGetAttr( this, "timedivision" ) || bpm !== GSUdomGetAttr( this, "bpm" ) ) {
			GSUdomDispatch( this, GSEV_TEMPO_CHANGE, {
				bpm: +bpm,
				timedivision: time,
			} );
		}
		this.#dropdown.$close();
		return false;
	}
}

GSUdomDefine( "gsui-tempo", gsuiTempo );
