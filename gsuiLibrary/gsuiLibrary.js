"use strict";

class gsuiLibrary extends gsui0ne {
	#idPlaying = null;
	#elCursor = null;
	#stopTimeout = null;
	#idFavs = new Map();

	constructor() {
		super( {
			$tagName: "gsui-library",
			$elements: {
				$body: "gsui-library-body",
				$placeholder: "gsui-library-placeholder",
			},
		} );
		this.#initReorder();
		this.$elements.$body.$on( {
			click: this.#onclick.bind( this ),
			contextmenu: this.#oncontextmenu.bind( this ),
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "placeholder" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "placeholder":
				this.$elements.$placeholder.$text( val );
				break;
		}
	}
	$onmessage( evt, a, b ) {
		switch ( evt ) {
			case GSEV_LIBRARY_LOAD: this.#setSamples( a ); break;
			case GSEV_LIBRARY_UNLOAD: this.#unloadSamples(); break;
			case GSEV_LIBRARY_CLEAR: this.#clear(); break;
			case GSEV_LIBRARY_LOADSAMPLE: this.#loadSample( a ); break;
			case GSEV_LIBRARY_PLAYSAMPLE: this.#playSample( a, b ); break;
			case GSEV_LIBRARY_STOPSAMPLE: this.#stopSample( a ); break;
			case GSEV_LIBRARY_READYSAMPLE: this.#readySample( a ); break;
			case GSEV_LIBRARY_FAVSAMPLE: this.#favSample( a, b ); break;
		}
	}

	// .........................................................................
	#initReorder() {
		new gsuiReorder( {
			$root: this.$elements.$body,
			$pxDelay: 6,
			$parentSelector: "gsui-library-body",
			$itemSelector: "gsui-library-sample",
			$getTargetList: () => $( [
				$( "[data-type=buffers] .gsuiPatterns-panel-list-wrap" ),
				$( "gsui-slicer" ),
				$( "gsui-oscillator:not([wavetable]) gsui-osc-wavewrap" ),
				$( ".gsuiSynthesizer-newOsc" ),
				$( "gsui-drumrow" ),
				$( ".gsuiDrumrows-dropNew" ),
				$( ".gsuiTrack-row > div" ),
			] ),
			$ondrop: drop => {
				const tar = drop.$target;
				const tag = tar.$tag();
				const $name = `${ drop.$itemElement.$dataId() }:${ drop.$itemElement.$getAttr( "name" ) }`;
				const obj = { $name };

				if ( tag === "gsui-slicer" ) {
					this.$this.$dispatch( GSEV_LIBRARY_DROPONSLICER, obj );
				} else if ( tar.$hasClass( "gsuiPatterns-panel-list-wrap" ) ) {
					this.$this.$dispatch( GSEV_LIBRARY_DROPONPATTERNS, obj );
				} else if ( tag === "gsui-drumrow" ) {
					obj.$drumrowId = tar.$dataId();
					this.$this.$dispatch( GSEV_LIBRARY_DROPONDRUMROW, obj );
				} else if ( tar.$hasClass( "gsuiDrumrows-dropNew" ) ) {
					this.$this.$dispatch( GSEV_LIBRARY_DROPONDRUMROWNEW, obj );
				} else if ( tag === "gsui-osc-wavewrap" ) {
					obj.$synthId = tar.$closest( "gsui-synthesizer" ).$dataId();
					obj.$oscId = tar.$closest( "gsui-oscillator" ).$dataId();
					this.$this.$dispatch( GSEV_LIBRARY_DROPONOSC, obj );
				} else if ( tar.$hasClass( "gsuiSynthesizer-newOsc" ) ) {
					obj.$synthId = tar.$closest( "gsui-synthesizer" ).$dataId();
					this.$this.$dispatch( GSEV_LIBRARY_DROPONOSCNEW, obj );
				} else {
					obj.$when = Math.floor( drop.$offsetX / +tar.$closest( "gsui-timewindow" ).$getAttr( "pxperbeat" ) );
					obj.$track = tar.$parent().$dataId();
					this.$this.$dispatch( GSEV_LIBRARY_DROPONTRACKS, obj );
				}
			},
		} );
	}

	// .........................................................................
	#clear() {
		this.#idFavs.clear();
		this.$elements.$body.$empty();
	}
	#unloadSamples() {
		this.$elements.$body.$query( "gsui-library-sample" )
			.$loading( false )
			.$rmAttr( "ready" )
			.$setAttr( "data-tooltip", el => $.$getAttr( el, "name" ) );
	}
	#setSamples( lib ) {
		let lastSep = $noop;
		const prevLastSep = this.$elements.$body.$query( "gsui-library-sep" ).$at( -1 );
		const el = lib.map( smp => {
			return GSUisStr( smp )
				? ( lastSep = $( $.$getTemplate( "gsui-library-sep", smp ) ) )
				: $( $.$getTemplate( "gsui-library-sample", {
					$id: smp[ 0 ],
					$data: smp[ 1 ],
					$name: smp[ 2 ] || smp[ 0 ],
				} ) ).$setAttr( "favorite", this.#idFavs.has( smp[ 0 ] ) );
		} );

		this.$elements.$body.$append( ...el );
		if ( lastSep.$size() && lastSep.$dataId() === prevLastSep.$dataId() ) {
			lastSep.$remove();
		}
	}

	// .........................................................................
	#getSample( id ) {
		return this.$elements.$body.$query( `[data-id="${ id }"]` );
	}
	#favSample( id, b ) {
		b
			? this.#idFavs.set( id )
			: this.#idFavs.delete( id );
		this.#getSample( id ).$setAttr( "favorite", b );
	}
	#loadSample( id ) {
		this.#getSample( id ).$setAttr( {
			loading: true,
			"data-tooltip": GSTX.$loading,
		} );
	}
	#readySample( id ) {
		this.#getSample( id )
			.$loading( false )
			.$addAttr( "ready" )
			.$setAttr( "data-tooltip", el => $.$getAttr( el, "name" ) );
	}
	#playSample( id, dur ) {
		const el = this.#getSample( id );

		this.#stopSample();
		this.#idPlaying = id;
		this.#elCursor = $( "<gsui-library-sample-cursor>" ).$css( {
			left: "0%",
			transitionDuration: `${ dur }s`,
		} );
		el.$addAttr( "playing" ).$append( this.#elCursor );
		GSUsetTimeout( () => this.#elCursor.$left( "100%" ), .01 );
		this.#stopTimeout = GSUsetTimeout( this.#stopSample.bind( this ), dur );
	}
	#stopSample() {
		if ( this.#idPlaying ) {
			const el = this.#getSample( this.#idPlaying );

			GSUclearTimeout( this.#stopTimeout );
			this.#elCursor.$remove();
			el.$rmAttr( "playing" );
			this.#elCursor =
			this.#idPlaying =
			this.#stopTimeout = null;
		}
	}

	// .........................................................................
	#onclick( e ) {
		const el = $( e.target );

		if ( el.$tag() === "button" ) {
			el.$parent().$togAttr( "expanded" )
				.$nextUntil( ":not(gsui-library-sample)" ).$togAttr( "expanded" );
		} else if ( el.$tag() === "gsui-library-sample" && !el.$hasAttr( "loading" ) ) {
			const act = el.$hasAttr( "ready" )
				? GSEV_LIBRARY_PLAYSAMPLE
				: GSEV_LIBRARY_LOADSAMPLE;

			this.$this.$dispatch( act, el.$dataId() );
		}
	}
	#oncontextmenu( e ) {
		e.preventDefault();
		if ( $.$tag( e.target ) === "gsui-library-sample" ) {
			this.$this.$dispatch( GSEV_LIBRARY_STOPSAMPLE );
		}
	}
}

$.$define( "gsui-library", gsuiLibrary );
