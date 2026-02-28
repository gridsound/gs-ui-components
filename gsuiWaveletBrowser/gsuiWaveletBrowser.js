"use strict";

class gsuiWaveletBrowser extends gsui0ne {
	#waves = [];
	#currentWaveInd = -1;
	#selectedWaveInd = -1;
	#selectedMark = GSUcreateIcon( { icon: "caret-right" } );

	constructor() {
		super( {
			$cmpName: "gsuiWaveletBrowser",
			$tagName: "gsui-wavelet-browser",
			$elements: {
				$list: ".gsuiWaveletBrowser-list > *",
				$svgs: ".gsuiWaveletBrowser-svgs",
				$btn: "button",
			},
			$attributes: {
				wave: "sine",
			},
		} );
		Object.seal( this );
		gsuiTexture.$set( this.$elements.$svgs, "dots" );
		this.$elements.$btn.$on( "click", this.#onsubmit.bind( this ) );
		this.$elements.$list.$on( {
			click: this.#onclick.bind( this ),
			scroll: this.#onscroll.bind( this ),
		} );
	}

	// .........................................................................
	$onresize() {
		this.$elements.$list.$css( "--gsui-h", this.$elements.$svgs.$height(), "px" );
		this.$elements.$svgs.$children()
			.$message( GSEV_PERIODICWAVE_RESIZE )
			.$message( GSEV_PERIODICWAVE_DRAW );
		this.#drawWave( 0, this.#selectedWaveInd );
		this.#drawWave( 1, this.#currentWaveInd );
	}
	static get observedAttributes() {
		return [ "wave" ];
	}
	$attributeChanged( prop, val, prev ) {
		switch ( prop ) {
			case "wave": this.#selectWave( val ); break;
		}
	}
	$onmessage( ev, val ) {
		if ( ev === GSEV_WAVELETBROWSER_DATA ) {
			this.#setList( val );
		}
	}

	// .........................................................................
	#setList( list ) {
		this.#waves.length = 0;
		GSUforEach( list, w => this.#waves.push( [ w[ 0 ], [ ...w[ 1 ] ] ] ) );
		this.$elements.$list.$empty().$append( ...this.#waves.map( w => GSUcreateDiv( null, gsuiWaveletBrowser.#formatName( w[ 0 ] ) ) ) );
		this.#onscroll();
		this.#selectWave( this.$this.$getAttr( "wave" ) );
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
	#selectWave( name ) {
		const ind = Math.max( 0, this.#waves.findIndex( w => w[ 0 ] === name ) );

		this.#selectedWaveInd = ind;
		this.$elements.$list.$child( ind ).$prepend( this.#selectedMark );
		this.#drawWave( 0, ind );
	}
	#drawWave( ch, ind ) {
		this.$elements.$svgs.$child( ch )
			.$setAttr( "data-ind", ind )
			.$message( GSEV_PERIODICWAVE_DATA, this.#waves[ ind ]?.[ 1 ] )
			.$message( GSEV_PERIODICWAVE_DRAW );
	}
	#scrollY( ind ) {
		this.$elements.$list.$scrollY( ind * 12 );
	}
	#onsubmit() {
		const name = this.#waves[ this.#currentWaveInd ]?.[ 0 ];

		if ( this.#currentWaveInd !== this.#selectedWaveInd && name ) {
			this.$this.$setAttr( "wave", name )
				.$dispatch( GSEV_WAVELETBROWSER_SUBMIT, name );
		}
	}
	#onclick( e ) {
		this.#scrollY( $( e.target ).$index() );
	}
	#onscroll() {
		const list = this.$elements.$list;
		const scrY = list.$scrollY();
		const ind = list.$children().$findIndex( ( _, i ) => GSUmathApprox( i * 12, scrY, 6 ) );

		if ( ind >= 0 && ind !== this.#currentWaveInd ) {
			list.$child( this.#currentWaveInd ).$rmAttr( "data-selected" );
			list.$child( ind ).$addAttr( "data-selected" );
			this.#currentWaveInd = ind;
			this.#drawWave( 1, ind );
		}
	}
}

GSUdomDefine( "gsui-wavelet-browser", gsuiWaveletBrowser );
