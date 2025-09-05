"use strict";

class gsuiFxWaveShaper extends gsui0ne {
	static #wavesNbPts = 256;
	static #sinePts = GSUnewArray( gsuiFxWaveShaper.#wavesNbPts, i => Math.sin( i / gsuiFxWaveShaper.#wavesNbPts * Math.PI * 2 ) );
	static #defPtsAsym = {
		0: { x: -1, y: -1, type: null,    val: null },
		1: { x:  1, y:  1, type: "curve", val: 0 },
		2: { x:  0, y:  0, type: "curve", val: 0 },
	};
	static #defPtsSym = {
		0: { x:  0, y:  0, type: null,    val: null },
		1: { x:  1, y:  1, type: "curve", val: 0 },
	};
	#wavesW = 0;
	#wavesH = 0;

	constructor() {
		super( {
			$cmpName: "gsuiFxWaveShaper",
			$tagName: "gsui-fx-waveshaper",
			$elements: {
				$symmetryToggle: ".gsuiFxWaveShaper-symmetry gsui-toggle",
				$oversampleSelect: ".gsuiFxWaveShaper-oversample select",
				$oversampleToggle: ".gsuiFxWaveShaper-oversample gsui-toggle",
				$reset: ".gsuiFxWaveShaper-reset",
				$svgDiag: ".gsuiFxWaveShaper-graph-diag",
				$dotline: "gsui-dotline",
				$waves: ".gsuiFxWaveShaper-waves",
				$waveA: ".gsuiFxWaveShaper-waveA",
				$waveB: ".gsuiFxWaveShaper-waveB",
			},
			$attributes: {
				symmetry: true,
				oversample: "none",
			},
		} );
		Object.seal( this );
		this.$elements.$dotline.$setDotOptions( 0, { freezeX: true, deletable: false } );
		this.$elements.$dotline.$setDotOptions( 1, { freezeX: true, deletable: false } );
		this.$changeCurveData( gsuiFxWaveShaper.#defPtsSym );
		this.$elements.$reset.onclick = this.#onreset.bind( this );
		this.$elements.$oversampleSelect.onchange = e => {
			if ( this.$elements.$oversampleToggle.$isOn() ) {
				this.#onchangeOversample();
			}
		};
		GSUdomListen( this, {
			[ GSEV_DOTLINE_INPUTEND ]: GSUnoop,
			[ GSEV_DOTLINE_INPUTSTART ]: GSUnoop,
			[ GSEV_DOTLINE_CHANGE ]: ( _, obj ) => GSUdomDispatch( this, GSEV_EFFECT_FX_CHANGEPROP, "curve", obj ),
			[ GSEV_DOTLINE_INPUT ]: ( _, obj ) => {
				this.#updateWaveB();
				GSUdomDispatch( this, GSEV_EFFECT_FX_LIVECHANGE, "curve", obj.$data );
			},
			[ GSEV_TOGGLE_TOGGLE ]: ( d, b ) => {
				switch ( d.$target.dataset.prop ) {
					case "oversample": this.#onchangeOversample(); break;
					case "symmetry": this.#onchangeSymmetry( b ); break;
				}
			},
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "symmetry", "oversample" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "symmetry":
				GSUdomSetAttr( this.$elements.$symmetryToggle, "off", val !== "" );
				GSUdomSetAttr( this.$elements.$dotline, "viewbox", val !== "" ? "-1 -1 1 1" : "0 0 1 1" );
				this.#updateWaveB();
				break;
			case "oversample":
				GSUdomSetAttr( this.$elements.$oversampleToggle, "off", val === "none" );
				if ( val !== "none" ) {
					this.$elements.$oversampleSelect.value = val;
				}
				break;
		}
	}
	$onresize() {
		const svg = this.$elements.$svgDiag;
		const w = svg.clientWidth;
		const h = svg.clientHeight;

		this.#wavesW = this.$elements.$waves.clientWidth;
		this.#wavesH = this.$elements.$waves.clientHeight;
		GSUdomViewBox( svg, w, h );
		GSUdomSetAttr( svg.firstChild, { y1: h, x2: w } );
		this.#updateWaveA();
		this.#updateWaveB();
	}

	// .........................................................................
	$changeCurveData( diff ) {
		this.$elements.$dotline.$change( diff );
		this.#updateWaveB();
	}

	// .........................................................................
	#onreset() {
		const diff = GSUdiffObjects(
			this.$elements.$dotline.$getData(),
			GSUdomHasAttr( this, "symmetry" )
				? gsuiFxWaveShaper.#defPtsSym
				: gsuiFxWaveShaper.#defPtsAsym
		);

		if ( diff ) {
			GSUdomDispatch( this, GSEV_EFFECT_FX_CHANGEPROP, "curve", diff );
		}
	}
	#onchangeOversample() {
		const val = this.$elements.$oversampleToggle.$isOn()
			? this.$elements.$oversampleSelect.value
			: "none";

		GSUdomDispatch( this, GSEV_EFFECT_FX_CHANGEPROP, "oversample", val );
	}
	#onchangeSymmetry( symmetry ) {
		const curve = {};
		const obj = { symmetry, curve };
		const srcData = this.$elements.$dotline.$getData();

		if ( symmetry ) {
			GSUforEach( srcData, ( d, id ) => {
				if ( d.x <= 0 ) {
					curve[ id ] = undefined;
				} else if ( d.y < 0 ) {
					curve[ id ] = { y: 0 };
				}
			} );
			curve[ 0 ] = { x: 0, y: 0 };
		} else {
			curve[ GSUgetNewId( srcData ) ] = { ...srcData[ 0 ] };
			curve[ 0 ] = { x: -1, y: -1 };
		}
		GSUdomDispatch( this, GSEV_EFFECT_FX_CHANGEPROPS, "symmetry", obj );
	}
	#updateWaveA() {
		const len = gsuiFxWaveShaper.#sinePts.length;
		const svg = this.$elements.$waves;
		const w = svg.clientWidth;
		const h = svg.clientHeight;
		const pts = gsuiFxWaveShaper.#sinePts.map( ( y, i ) => `${ i / len * w },${ this.#calcY( y ) }` );

		GSUdomViewBox( svg, w, h );
		GSUdomSetAttr( this.$elements.$waveA, "points", pts.join( " " ) );
	}
	#updateWaveB() {
		const len = gsuiFxWaveShaper.#sinePts.length;
		const graphData = GSUmathSampleDotLine( this.$elements.$dotline.$getData(), len ).map( d => d[ 1 ] );
		const graphData2 = GSUdomHasAttr( this, "symmetry" )
			? this.#addGraphSymmetry( graphData )
			: graphData;
		const w = this.$elements.$waves.clientWidth;
		const h = this.$elements.$waves.clientHeight;
		const pts = gsuiFxWaveShaper.#sinePts.map( ( y, i ) => `${ i / len * w },${ this.#calcY( graphData2[ Math.round( ( ( y + 1 ) / 2 ) * ( len - 1 ) ) ] || 0 ) }` );

		GSUdomSetAttr( this.$elements.$waveB, "points", pts.join( " " ) );
	}
	#addGraphSymmetry( curve ) {
		const cpy = [ ...curve ].reverse();

		cpy.forEach( ( v, i, arr ) => arr[ i ] *= -1 );
		return cpy.concat( ...curve ).filter( ( v, i ) => i % 2 === 0 );
	}
	#calcY( y ) {
		return ( y * .9 + 1 ) / 2 * this.#wavesH;
	}
}

GSUdomDefine( "gsui-fx-waveshaper", gsuiFxWaveShaper );
