"use strict";

class gsuiStepSelect extends gsui0ne {
	static #stepValues = [ 4, 2, 1, .5, .25, .125 ];
	static #stepFractions = "4/1 2/1 1/1 1/2 1/4 1/8".split( " " );
	#step = 1;
	#stepInd = gsuiStepSelect.#stepToIndex( 1 );

	constructor() {
		super( {
			$cmpName: "gsuiStepSelect",
			$tagName: "gsui-step-select",
			$elements: {
				$auto: "gsui-toggle",
				$frac: "span",
				$preview: "div div",
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
		this.#updateStep();
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
				this.#stepInd = gsuiStepSelect.#stepToIndex( this.#step );
				this.#updateStep();
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
				ppb < 16 ? 4 :
				ppb < 32 ? 2 :
				ppb < 64 ? 1 :
				ppb < 128 ? .5 :
				ppb < 160 ? .25 : .125
			);
	}

	// .........................................................................
	#updateStep() {
		const ind = this.#stepInd;
		const len = gsuiStepSelect.#stepValues.length;

		this.$elements.$frac.textContent = gsuiStepSelect.#stepFractions[ ind ];
		GSUdomStyle( this.$elements.$preview, {
			left: `${ ind / len * 100 }%`,
			width: `${ 100 / len }%`,
		} );
	}
	#onclick( e ) {
		if ( e.target.tagName !== "GSUI-TOGGLE" ) {
			const step = gsuiStepSelect.#stepValues[ ( this.#stepInd + 1 ) % gsuiStepSelect.#stepValues.length ];

			GSUdomSetAttr( this, "step", step );
			GSUdomDispatch( this, GSEV_STEPSELECT_ONCHANGE, step );
		}
	}
	static #stepToIndex( v ) {
		return (
			v >= 4 ? 0 :
			v >= 2 ? 1 :
			v >= 1 ? 2 :
			v >= .5 ? 3 :
			v >= .25 ? 4 : 5
		);
	}
}

GSUdomDefine( "gsui-step-select", gsuiStepSelect );
