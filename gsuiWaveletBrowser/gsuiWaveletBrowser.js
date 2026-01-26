"use strict";

class gsuiWaveletBrowser extends gsui0ne {
	#waves = [];
	#selectedWaveInd = -1;

	constructor() {
		super( {
			$cmpName: "gsuiWaveletBrowser",
			$tagName: "gsui-wavelet-browser",
			$elements: {
				$list: ".gsuiWaveletBrowser-list > *",
				$wave: "gsui-wavelet-svg",
			},
			$attributes: {
			},
		} );
		Object.seal( this );
		this.$elements.$list.$on( {
			click: this.#onclick.bind( this ),
			scroll: this.#onscroll.bind( this ),
		} );
	}

	// .........................................................................
	$onresize() {
		this.$elements.$list.$css( "--gsui-h", this.$elements.$wave.$height(), "px" );
		this.$elements.$wave.$get( 0 ).$resolution();
		this.#drawWave();
	}
	static get observedAttributes() {
		return [ "xxx" ];
	}
	$attributeChanged( prop, val, prev ) {
		switch ( prop ) {
			case "xxx":
				break;
		}
	}

	// .........................................................................
	$setList( list ) {
		this.#waves.length = 0;
		GSUforEach( list, w => this.#waves.push( [ w[ 0 ], [ ...w[ 1 ] ] ] ) );
		this.$elements.$list.$empty().$append( ...this.#waves.map( w => GSUcreateDiv( { "data-id": gsuiWaveletBrowser.#formatName( w[ 0 ] ) } ) ) );
		this.#onscroll();
	}
	static #formatName( s ) {
		const ar = s.split( "_" );
		const n = +ar.pop();

		if ( !GSUisNaN( n ) ) {
			return `${ ar.join( "_" ) }_${ n.toString().padStart( 3, "0" ) }`;
		}
		return s;
	}

	// .........................................................................
	#drawWave() {
		this.$elements.$wave.$get( 0 ).$draw( this.#waves[ this.#selectedWaveInd ]?.[ 1 ] );
	}
	#selectWave( ind ) {
		if ( ind >= 0 && ind !== this.#selectedWaveInd ) {
			this.#selectedWaveInd = ind;
			this.#drawWave();
		}
	}
	#onclick( e ) {
		this.$elements.$list.$scrollY( $( e.target ).$index() * 12 );
	}
	#onscroll() {
		const scrY = this.$elements.$list.$scrollY();
		let ind = -1;

		this.$elements.$list.$children().$setAttr( "data-selected", ( _, i ) => {
			const ret = GSUmathApprox( i * 12, scrY, 6 );

			if ( ret ) {
				ind = i;
			}
			return ret;
		} );
		this.#selectWave( ind );
	}
}

GSUdomDefine( "gsui-wavelet-browser", gsuiWaveletBrowser );
