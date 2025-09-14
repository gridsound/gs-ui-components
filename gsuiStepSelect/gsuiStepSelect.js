"use strict";

class gsuiStepSelect extends gsui0ne {
	#step = 1;

	constructor() {
		super( {
			$cmpName: "gsuiStepSelect",
			$tagName: "gsui-step-select",
			$elements: {
				$auto: "gsui-toggle",
				$frac: "span",
			},
			$attributes: {
				step: 1,
				auto: true,
				title: "Grid snap",
			},
		} );
		Object.seal( this );
		this.onclick = this.#onclick.bind( this );
		GSUdomListen( this, {
			[ GSEV_TOGGLE_TOGGLE ]: ( _, b ) => {
				GSUdomSetAttr( this, "auto", b );
				GSUdomDispatch( this, GSEV_STEPSELECT_AUTO, b );
			},
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "auto", "step" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "auto": GSUdomSetAttr( this.$elements.$auto, "off", val === null ); break;
			case "step":
				this.#step = +val;
				this.$elements.$frac.textContent = gsuiStepSelect.#stepToFraction( this.#step );
				break;
		}
	}

	// .........................................................................
	$getStep() {
		return this.#step;
	}
	$getStepFromPxPerBeat( ppb ) {
		return !GSUdomHasAttr( this, "auto" )
			? GSUdomGetAttrNum( this, "step" )
			: (
				ppb < 80 ? 1 :
				ppb < 100 ? .5 :
				ppb < 150 ? .25 : .125
			);
	}

	// .........................................................................
	#onclick( e ) {
		if ( e.target.tagName !== "GSUI-TOGGLE" ) {
			const step = gsuiStepSelect.#nextStep( this.#step );

			GSUdomSetAttr( this, "step", step );
			GSUdomDispatch( this, GSEV_STEPSELECT_ONCHANGE, step );
		}
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
			v >= 1 ? "1/1" :
			v >= .5 ? "1/2" :
			v >= .25 ? "1/4" : "1/8"
		);
	}
}

GSUdomDefine( "gsui-step-select", gsuiStepSelect );
