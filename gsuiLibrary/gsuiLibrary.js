"use strict";

class gsuiLibrary extends gsui0ne {
	#idPlaying = null;
	#elCursor = null;
	#stopTimeout = null;
	#idFavs = new Map();

	constructor() {
		super( {
			$cmpName: "gsuiLibrary",
			$tagName: "gsui-library",
			$jqueryfy: true,
			$elements: {
				$body: ".gsuiLibrary-body",
				$placeholder: ".gsuiLibrary-placeholder",
			},
		} );
		Object.seal( this );
		this.#initReorder();
		this.$elements.$body.$on( {
			click: this.#onclick.bind( this ),
			contextmenu: this.#oncontextmenu.bind( this ),
		} );
	}

	// .........................................................................
	#initReorder() {
		new gsuiReorder( {
			$root: this.$elements.$body.$get( 0 ),
			$pxDelay: 6,
			$parentSelector: ".gsuiLibrary-body",
			$itemSelector: ".gsuiLibrary-sample",
			$getTargetList: () => [
				GSUdomQS( "[data-type=buffers] .gsuiPatterns-panel-list-wrap" ),
				GSUdomQS( "gsui-slicer" ),
				...GSUdomQSA( "gsui-oscillator:not([wavetable]) .gsuiOscillator-waveWrap" ),
				GSUdomQS( ".gsuiSynthesizer-newOsc" ),
				...GSUdomQSA( "gsui-drumrow" ),
				GSUdomQS( ".gsuiDrumrows-dropNew" ),
				...GSUdomQSA( ".gsuiTrack-row > div" ),
			],
			$ondrop: drop => {
				const tar = drop.$target;
				const dt = drop.$itemElement.dataset;
				const $name = `${ dt.id }:${ dt.name }`;
				const obj = { $name };

				if ( tar.tagName === "GSUI-SLICER" ) {
					this.$this.$dispatch( GSEV_LIBRARY_DROPONSLICER, obj );
				} else if ( GSUdomHasClass( tar, "gsuiPatterns-panel-list-wrap" ) ) {
					this.$this.$dispatch( GSEV_LIBRARY_DROPONPATTERNS, obj );
				} else if ( tar.tagName === "GSUI-DRUMROW" ) {
					obj.$drumrowId = tar.dataset.id;
					this.$this.$dispatch( GSEV_LIBRARY_DROPONDRUMROW, obj );
				} else if ( GSUdomHasClass( tar, "gsuiDrumrows-dropNew" ) ) {
					this.$this.$dispatch( GSEV_LIBRARY_DROPONDRUMROWNEW, obj );
				} else if ( GSUdomHasClass( tar, "gsuiOscillator-waveWrap" ) ) {
					obj.$synthId = tar.closest( "gsui-synthesizer" ).dataset.id;
					obj.$oscId = tar.closest( "gsui-oscillator" ).dataset.id;
					this.$this.$dispatch( GSEV_LIBRARY_DROPONOSC, obj );
				} else if ( GSUdomHasClass( tar, "gsuiSynthesizer-newOsc" ) ) {
					obj.$synthId = tar.closest( "gsui-synthesizer" ).dataset.id;
					this.$this.$dispatch( GSEV_LIBRARY_DROPONOSCNEW, obj );
				} else {
					obj.$when = Math.floor( drop.$offsetX / GSUdomGetAttrNum( tar.closest( "gsui-timewindow" ), "pxperbeat" ) );
					obj.$track = tar.parentNode.dataset.id;
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
		this.$elements.$body.$find( ".gsuiLibrary-sample" )
			.$attr( "data-loading", false )
			.$attr( "data-ready", false )
			.$attr( title, el => el.dataset.name );
	}
	$setPlaceholder( str ) {
		this.$elements.$placeholder.$text( str );
	}
	$setLibrary( lib ) {
		let lastSep;
		const prevLastSep = this.$elements.$body.$find( ".gsuiLibrary-sep" ).$get( -1 );
		const el = lib.map( smp => {
			if ( !GSUisStr( smp ) ) {
				const el = GSUgetTemplate( "gsui-library-sample", {
					id: smp[ 0 ],
					points: smp[ 1 ],
					name: smp[ 2 ] || smp[ 0 ],
				} );

				if ( this.#idFavs.has( smp[ 0 ] ) ) {
					GSUdomSetAttr( el, "data-fav", true );
				}
				return el;
			}
			return lastSep = GSUgetTemplate( "gsui-library-sep", smp );
		} );

		this.$elements.$body.$append( ...el );
		if ( lastSep && lastSep.dataset.id === prevLastSep?.dataset.id ) {
			lastSep.remove();
		}
	}

	// .........................................................................
	#getSample( id ) {
		return this.$elements.$body.$find( `[data-id="${ id }"]` );
	}
	$bookmarkSample( id, b ) {
		b
			? this.#idFavs.set( id )
			: this.#idFavs.delete( id );
		this.#getSample( id ).$attr( "data-fav", b );
	}
	$loadSample( id ) {
		this.#getSample( id ).$attr( {
			"data-loading": true,
			title: "loading...",
		} );
	}
	$readySample( id ) {
		this.#getSample( id )
			.$attr( "data-loading", false )
			.$attr( "data-ready", true )
			.$attr( "title", el => el.dataset.name );
	}
	$playSample( id, dur ) {
		const el = this.#getSample( id );

		this.$stopSample();
		this.#idPlaying = id;
		this.#elCursor = GSUcreateDiv( { class: "gsuiLibrary-sample-cursor" } );
		this.#elCursor.style.left = "0%";
		this.#elCursor.style.transitionDuration = `${ dur }s`;
		GSUdomAddClass( el.$get( 0 ), "gsuiLibrary-sample-playing" );
		el.$append( this.#elCursor );
		GSUsetTimeout( () => this.#elCursor.style.left = "100%", .01 );
		this.#stopTimeout = GSUsetTimeout( this.$stopSample.bind( this ), dur );
	}
	$stopSample() {
		if ( this.#idPlaying ) {
			const el = this.#getSample( this.#idPlaying );

			GSUclearTimeout( this.#stopTimeout );
			this.#elCursor.remove();
			GSUdomRmClass( el.$get( 0 ), "gsuiLibrary-sample-playing" );
			this.#elCursor =
			this.#idPlaying =
			this.#stopTimeout = null;
		}
	}

	// .........................................................................
	#expandGroup( elSep ) {
		const exp = !GSUdomHasAttr( elSep, "data-expanded" );

		for ( let el = elSep.nextElementSibling; el; el = el.nextElementSibling ) {
			if ( GSUdomHasClass( el, "gsuiLibrary-sample" ) ) {
				GSUdomSetAttr( el, "data-expanded", exp );
			} else {
				break;
			}
		}
		GSUdomSetAttr( elSep, "data-expanded", exp );
	}

	// .........................................................................
	#onclick( e ) {
		const el = e.target;

		if ( el.tagName === "BUTTON" ) {
			this.#expandGroup( el.parentNode );
		} else if ( GSUdomHasClass( el, "gsuiLibrary-sample" ) && !GSUdomHasAttr( el, "data-loading" ) ) {
			const act = GSUdomHasAttr( el, "data-ready" )
				? GSEV_LIBRARY_PLAYSAMPLE
				: GSEV_LIBRARY_LOADSAMPLE;

			this.$this.$dispatch( act, el.dataset.id );
		}
	}
	#oncontextmenu( e ) {
		if ( GSUdomHasClass( e.target, "gsuiLibrary-sample" ) ) {
			this.$this.$dispatch( GSEV_LIBRARY_STOPSAMPLE );
		}
		return false;
	}
}

GSUdomDefine( "gsui-library", gsuiLibrary );
