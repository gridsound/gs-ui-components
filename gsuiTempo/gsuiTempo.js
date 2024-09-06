"use strict";

class gsuiTempo extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiTempo",
			$tagName: "gsui-tempo",
			$elements: {
				$btn: ".gsuiTempo-btn",
				$bpm: ".gsuiTempo-bpm",
				$timediv: ".gsuiTempo-timeDivision",
				$popup: ".gsuiTempo-popup",
				$bpmTap: ".gsuiTempo-tap",
			},
			$attributes: {
				timedivision: "4/4",
				bpm: 60,
			},
		} );
		Object.seal( this );
		this.$elements.$btn.onclick = this.$onclickBtn.bind( this );
		this.$elements.$popup.onsubmit = this.$onsubmitPopup.bind( this );
		this.$elements.$popup.onkeydown = e => e.stopPropagation();
		this.$elements.$bpmTap.onclick = () => this.$elements.$popup[ 2 ].value = gswaBPMTap.$tap();
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "bpm", "timedivision" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "bpm":
				this.$elements.$popup[ 2 ].value =
				this.$elements.$bpm.textContent = val;
				break;
			case "timedivision": {
				const div = GSUsplitNums( val, "/" );

				this.$elements.$popup[ 0 ].value =
				this.$elements.$timediv.firstChild.textContent = div[ 0 ];
				this.$elements.$popup[ 1 ].value =
				this.$elements.$timediv.lastChild.textContent = div[ 1 ];
			} break;
		}
	}

	// .........................................................................
	$onclickBtn() {
		const f = this.$elements.$popup;
		const div = GSUsplitNums( GSUgetAttribute( this, "timedivision" ), "/" );

		f[ 0 ].value = div[ 0 ];
		f[ 1 ].value = div[ 1 ];
		f[ 2 ].value = GSUgetAttributeNum( this, "bpm" );
	}
	$onsubmitPopup( e ) {
		const f = e.target;
		const div = `${ f[ 0 ].value }/${ f[ 1 ].value }`;
		const bpm = f[ 2 ].value;

		if ( div !== GSUgetAttribute( this, "timedivision" ) || bpm !== GSUgetAttribute( this, "bpm" ) ) {
			this.$dispatch( "change", {
				bpm: +bpm,
				timedivision: div,
			} );
		}
		document.activeElement.blur();
		return false;
	}
}

GSUdefineElement( "gsui-tempo", gsuiTempo );
