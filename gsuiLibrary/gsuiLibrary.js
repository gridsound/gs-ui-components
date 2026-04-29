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
				$body: ".gsuiLibrary-body",
				$placeholder: ".gsuiLibrary-placeholder",
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

	// .........................................................................
	#initReorder() {
		new gsuiReorder( {
			$root: this.$elements.$body,
			$pxDelay: 6,
			$parentSelector: ".gsuiLibrary-body",
			$itemSelector: ".gsuiLibrary-sample",
			$getTargetList: () => $( [
				$( "[data-type=buffers] .gsuiPatterns-panel-list-wrap" ),
				$( "gsui-slicer" ),
				$( "gsui-oscillator:not([wavetable]) .gsuiOscillator-waveWrap" ),
				$( ".gsuiSynthesizer-newOsc" ),
				$( "gsui-drumrow" ),
				$( ".gsuiDrumrows-dropNew" ),
				$( ".gsuiTrack-row > div" ),
			] ),
			$ondrop: drop => {
				const tar = drop.$target;
				const dt = drop.$itemElement.dataset;
				const $name = `${ dt.id }:${ dt.name }`;
				const obj = { $name };

				if ( tar.$tag() === "gsui-slicer" ) {
					this.$this.$dispatch( GSEV_LIBRARY_DROPONSLICER, obj );
				} else if ( tar.$hasClass( "gsuiPatterns-panel-list-wrap" ) ) {
					this.$this.$dispatch( GSEV_LIBRARY_DROPONPATTERNS, obj );
				} else if ( tar.$tag() === "gsui-drumrow" ) {
					obj.$drumrowId = tar.$dataId();
					this.$this.$dispatch( GSEV_LIBRARY_DROPONDRUMROW, obj );
				} else if ( tar.$hasClass( "gsuiDrumrows-dropNew" ) ) {
					this.$this.$dispatch( GSEV_LIBRARY_DROPONDRUMROWNEW, obj );
				} else if ( tar.$hasClass( "gsuiOscillator-waveWrap" ) ) {
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
	$clear() {
		this.#idFavs.clear();
		this.$elements.$body.$empty();
	}
	$unloadSamples() {
		this.$elements.$body.$query( ".gsuiLibrary-sample" )
			.$rmAttr( "data-loading", "data-ready" )
			.$setAttr( title, el => el.dataset.name );
	}
	$setLibrary( lib ) {
		let lastSep = $noop;
		const prevLastSep = this.$elements.$body.$query( ".gsuiLibrary-sep" ).$at( -1 );
		const el = lib.map( smp => {
			return GSUisStr( smp )
				? ( lastSep = $( $.$getTemplate( "gsui-library-sep", smp ) ) )
				: $( $.$getTemplate( "gsui-library-sample", {
					id: smp[ 0 ],
					points: smp[ 1 ],
					name: smp[ 2 ] || smp[ 0 ],
				} ) ).$setAttr( "data-fav", this.#idFavs.has( smp[ 0 ] ) );
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
	$bookmarkSample( id, b ) {
		b
			? this.#idFavs.set( id )
			: this.#idFavs.delete( id );
		this.#getSample( id ).$setAttr( "data-fav", b );
	}
	$loadSample( id ) {
		this.#getSample( id ).$setAttr( {
			"data-loading": true,
			title: "loading...",
		} );
	}
	$readySample( id ) {
		this.#getSample( id )
			.$rmAttr( "data-loading" )
			.$addAttr( "data-ready" )
			.$setAttr( "title", el => el.dataset.name );
	}
	$playSample( id, dur ) {
		const el = this.#getSample( id );

		this.$stopSample();
		this.#idPlaying = id;
		this.#elCursor = $( "<div>" )
			.$addClass( "gsuiLibrary-sample-cursor" )
			.$css( {
				left: "0%",
				transitionDuration: `${ dur }s`,
			} );
		el.$addClass( "gsuiLibrary-sample-playing" ).$append( this.#elCursor );
		GSUsetTimeout( () => this.#elCursor.$left( "100%" ), .01 );
		this.#stopTimeout = GSUsetTimeout( this.$stopSample.bind( this ), dur );
	}
	$stopSample() {
		if ( this.#idPlaying ) {
			const el = this.#getSample( this.#idPlaying );

			GSUclearTimeout( this.#stopTimeout );
			this.#elCursor.$remove();
			el.$rmClass( "gsuiLibrary-sample-playing" );
			this.#elCursor =
			this.#idPlaying =
			this.#stopTimeout = null;
		}
	}

	// .........................................................................
	#onclick( e ) {
		const el = $( e.target );

		if ( el.$tag() === "button" ) {
			el.$parent().$togAttr( "data-expanded" )
				.$nextUntil( ":not(.gsuiLibrary-sample)" ).$togAttr( "data-expanded" );
		} else if ( el.$hasClass( "gsuiLibrary-sample" ) && !el.$hasAttr( "data-loading" ) ) {
			const act = el.$hasAttr( "data-ready" )
				? GSEV_LIBRARY_PLAYSAMPLE
				: GSEV_LIBRARY_LOADSAMPLE;

			this.$this.$dispatch( act, el.$dataId() );
		}
	}
	#oncontextmenu( e ) {
		e.preventDefault();
		if ( $( e.target ).$hasClass( "gsuiLibrary-sample" ) ) {
			this.$this.$dispatch( GSEV_LIBRARY_STOPSAMPLE );
		}
	}
}

$.$define( "gsui-library", gsuiLibrary );
