"use strict";

class gsuiWaveform extends gsui0ne {
	#w = 0;
	#h = 0;
	#a = 0;
	#b = 0;
	#refBuf = null;
	#setAttrRes = GSUdebounce( this.$this.$setAttr.bind( this.$this ), .2 );

	constructor() {
		super( {
			$tagName: "gsui-waveform",
			$template: $.$elem( "svg", { preserveAspectRatio: "none" },
				$.$elem( "path" ),
				$.$elem( "path" ),
			),
			$elements: {
				$svg: "svg",
				$paths: "path",
			},
			$attributes: {
				view: "0 1",
			},
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "res", "view" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "res": this.#setResolution( val ); break;
			case "view": this.#setView( ...GSUsplitNums( val ) ); break;
		}
	}
	$onresize( w, h ) {
		this.#setAttrRes( "res", `${ w } ${ h }` );
	}
	$onmessage( key, a, b ) {
		switch ( key ) {
			case GSEV_WAVEFORM_BUFFER: this.#setBuffer( a ); break;
		}
	}

	// .........................................................................
	#setBuffer( buf ) {
		if ( buf ) {
			this.#refBuf = new WeakRef( buf );
			this.#updateView();
		} else {
			this.#refBuf = null
			this.$elements.$paths.$rmAttr( "d" );
		}
	}
	#setResolution( v ) {
		const [ w, h ] = GSUsplitNums( v );

		this.#w = w;
		this.#h = h;
		this.$elements.$svg.$viewbox( w, h );
		this.#updateView();
	}
	#setView( a = 0, b = 1 ) {
		this.#a = a;
		this.#b = b;
		this.#updateView();
	}
	#updateView() {
		const buf = this.#refBuf?.deref();

		if ( buf && this.#w ) {
			const data = gsuiWaveform.$getPathChans( buf, this.#w, this.#h, this.#a * buf.duration, this.#b * buf.duration );

			this.$elements.$paths.$setAttr( "d", ( _, i ) => `M${ data[ i ].replaceAll( ",", "L" ) }` );
		}
	}

	// .........................................................................
	static $getPathChans( buf, w, h, start, duration ) {
		const bufDur = buf.duration;
		const sta = start ?? 0;
		const dur = duration ?? bufDur;
		const chanL = buf.getChannelData( 0 );
		const chanR = buf.numberOfChannels > 1 ? buf.getChannelData( 1 ) : "";

		return [
			gsuiWaveform.#getPathChan( w, h, chanL, bufDur, sta, dur ).join( "," ),
			chanR && gsuiWaveform.#getPathChan( w, h, chanR, bufDur, sta, dur ).join( "," ),
		];
	}
	static #getPathChan( w, h, data, bufDur, start, dur ) {
		const sampleRate = data.length / bufDur;
		const startSample = start * sampleRate;
		const spp = dur * sampleRate / w;

		return spp < 1
			? gsuiWaveform.#getPathPerSample( w, h, data, startSample, spp )
			: gsuiWaveform.#getPathPerGroup( w, h, data, startSample, spp );
	}
	static #getPathPerGroup( w, h, data, startSample, spp ) {
		const grpSize = Math.max( 1, Math.round( spp ) );
		const grpFirst = Math.floor( startSample / grpSize ) - 1;
		const grpLast = Math.ceil( ( startSample + spp * w ) / grpSize ) + 1;
		const arrA = [];
		const arrB = [];

		for ( let k = grpFirst; k <= grpLast; ++k ) {
			const a = k * grpSize;
			const b = a + grpSize;
			const x = gsuiWaveform.#round( ( a - startSample ) / spp );
			let min = 0;
			let max = 0;

			if ( b > 0 && a < data.length ) {
				const end = Math.min( b, data.length );

				min = Infinity;
				max = -Infinity;
				for ( let i = Math.max( 0, a ); i < end; ++i ) {
					const v = data[ i ];

					if ( v < min ) { min = v; }
					if ( v > max ) { max = v; }
				}
				min = GSUmathClamp( min, -1, 1 );
				max = GSUmathClamp( max, -1, 1 );
			}
			min = gsuiWaveform.#calcSmp( min, h );
			max = gsuiWaveform.#calcSmp( max, h );
			arrA.push( `${ x } ${ max }` );
			arrB.push( `${ x } ${ GSUmathApprox( min, max, h / 200 ) ? max - h / 200 : min }` );
		}
		return arrA.concat( arrB.reverse() );
	}
	static #getPathPerSample( w, h, data, startSample, spp ) {
		const smpFirst = Math.max( 0, Math.floor( startSample ) - 1 );
		const smpLast = Math.min( data.length - 1, Math.ceil( startSample + spp * w ) + 1 );
		const arrA = [];
		const arrB = [];

		for ( let i = smpFirst; i <= smpLast; ++i ) {
			const x = gsuiWaveform.#round( ( i - startSample ) / spp );
			const y = gsuiWaveform.#calcSmp( data[ i ], h );

			arrA.push( `${ x } ${ y }` );
			arrB.push( `${ x } ${ y - h / 200 }` );
		}
		return arrA.concat( arrB.reverse() );
	}
	static #calcSmp( smp, h ) {
		return gsuiWaveform.#round( h - GSUmathClamp( ( smp + 1 ) / 2, 0, 1 ) * h );
	}
	static #round( n ) {
		return +n.toFixed( 2 );
	}
}

$.$define( "gsui-waveform", gsuiWaveform );
