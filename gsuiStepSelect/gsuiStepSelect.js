"use strict";

class gsuiStepSelect extends gsui0ne {
	#step = 1;

	constructor() {
		super( {
			$cmpName: "gsuiStepSelect",
			$tagName: "gsui-step-select",
			$elements: {
				$frac: ".gsuiStepSelect-frac",
			},
			$attributes: {
				step: 1,
				title: "Grid snap",
			},
		} );
		Object.seal( this );
		this.onclick = this.#onclick.bind( this );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "step" ];
	}
	$attributeChanged( prop, val ) {
		if ( prop === "step" ) {
			this.#step = +val;
			this.$elements.$frac.textContent = gsuiStepSelect.#stepToFraction( this.#step );
		}
	}

	// .........................................................................
	$getStep() {
		return this.#step;
	}

	// .........................................................................
	#onclick() {
		const step = gsuiStepSelect.#nextStep( this.#step );

		GSUdomSetAttr( this, "step", step );
		GSUdomDispatch( this, GSEV_STEPSELECT_ONCHANGE, step );
	}
	static #nextStep( v ) {
		return (
			v >= 1 ? .5 :
			v >= .5 ? .25 :
			v >= .25 ? .125 : 1
		);
	}
	static #stepToFraction( v ) {
		return (
			v >= 1 ? "1" :
			v >= .5 ? "1/2" :
			v >= .25 ? "1/4" : "1/8"
		);
	}
}

GSUdomDefine( "gsui-step-select", gsuiStepSelect );
