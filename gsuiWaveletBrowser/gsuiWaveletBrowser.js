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
		gsuiTexture.$set( this.$elements.$wave.$get( 0 ), "dots" );
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
		this.$elements.$list.$empty().$append( ...this.#waves.map( w => GSUcreateDiv( null, gsuiWaveletBrowser.#formatName( w[ 0 ] ) ) ) );
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
	#onclick( e ) {
		this.$elements.$list.$scrollY( $( e.target ).$index() * 12 );
	}
	#onscroll() {
		const list = this.$elements.$list;
		const scrY = list.$scrollY();
		const ind = list.$children().$findIndex( ( _, i ) => GSUmathApprox( i * 12, scrY, 6 ) );

		if ( ind >= 0 && ind !== this.#selectedWaveInd ) {
			list.$child( this.#selectedWaveInd ).$rmAttr( "data-selected" );
			list.$child( ind ).$addAttr( "data-selected" );
			this.#selectedWaveInd = ind;
			this.#drawWave();
		}
	}
}

GSUdomDefine( "gsui-wavelet-browser", gsuiWaveletBrowser );
