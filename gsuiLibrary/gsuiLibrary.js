"use strict";

class gsuiLibrary extends gsui0ne {
	#samplesMap = new Map();
	#idPlaying = null;
	#elCursor = null;
	#stopTimeout = null;
	#idFavs = new Map();

	constructor() {
		super( {
			$cmpName: "gsuiLibrary",
			$tagName: "gsui-library",
			$elements: {
				$body: ".gsuiLibrary-body",
				$placeholder: ".gsuiLibrary-placeholder",
			},
		} );
		Object.seal( this );
		this.#initReorder();
		this.$elements.$body.onclick = this.#onclick.bind( this );
		this.$elements.$body.oncontextmenu = this.#oncontextmenu.bind( this );
	}

	// .........................................................................
	#initReorder() {
		new gsuiReorder( {
			$root: this.$elements.$body,
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
					GSUdomDispatch( this, GSEV_LIBRARY_DROPONSLICER, obj );
				} else if ( GSUdomHasClass( tar, "gsuiPatterns-panel-list-wrap" ) ) {
					GSUdomDispatch( this, GSEV_LIBRARY_DROPONPATTERNS, obj );
				} else if ( tar.tagName === "GSUI-DRUMROW" ) {
					obj.$drumrowId = tar.dataset.id;
					GSUdomDispatch( this, GSEV_LIBRARY_DROPONDRUMROW, obj );
				} else if ( GSUdomHasClass( tar, "gsuiDrumrows-dropNew" ) ) {
					GSUdomDispatch( this, GSEV_LIBRARY_DROPONDRUMROWNEW, obj );
				} else if ( GSUdomHasClass( tar, "gsuiOscillator-waveWrap" ) ) {
					obj.$synthId = tar.closest( "gsui-synthesizer" ).dataset.id;
					obj.$oscId = tar.closest( "gsui-oscillator" ).dataset.id;
					GSUdomDispatch( this, GSEV_LIBRARY_DROPONOSC, obj );
				} else if ( GSUdomHasClass( tar, "gsuiSynthesizer-newOsc" ) ) {
					obj.$synthId = tar.closest( "gsui-synthesizer" ).dataset.id;
					GSUdomDispatch( this, GSEV_LIBRARY_DROPONOSCNEW, obj );
				} else {
					obj.$when = Math.floor( drop.$offsetX / GSUdomGetAttrNum( tar.closest( "gsui-timewindow" ), "pxperbeat" ) );
					obj.$track = tar.parentNode.dataset.id;
					GSUdomDispatch( this, GSEV_LIBRARY_DROPONTRACKS, obj );
				}
			},
		} );
	}

	// .........................................................................
	$clear() {
		this.#samplesMap.forEach( el => el.remove() );
		this.#samplesMap.clear();
		this.#idFavs.clear();
		GSUdomQSA( this.$elements.$body, ".gsuiLibrary-sep" ).forEach( el => el.remove() );
	}
	$unloadSamples() {
		this.#samplesMap.forEach( el => {
			GSUdomRmClass( el, "gsuiLibrary-sample-loading", "gsuiLibrary-sample-ready" );
			el.title = el.dataset.name;
		} );
	}
	$setPlaceholder( str ) {
		this.$elements.$placeholder.textContent = str;
	}
	$setLibrary( lib ) {
		let lastSep;
		const prevLastSep = Array.from( this.$elements.$body.children )
			.findLast( el => GSUdomHasClass( el, "gsuiLibrary-sep" ) );
		const el = lib.map( smp => {
			if ( !GSUisStr( smp ) ) {
				const el = GSUgetTemplate( "gsui-library-sample", {
					id: smp[ 0 ],
					points: smp[ 1 ],
					name: smp[ 2 ] || smp[ 0 ],
				} );

				if ( this.#idFavs.has( smp[ 0 ] ) ) {
					GSUdomAddClass( el, "gsuiLibrary-sample-fav" );
				}
				this.#samplesMap.set( smp[ 0 ], el );
				return el;
			}
			return lastSep = GSUgetTemplate( "gsui-library-sep", smp );
		} );

		this.$elements.$body.append( ...el );
		if ( lastSep && lastSep.dataset.id === prevLastSep?.dataset.id ) {
			lastSep.remove();
		}
	}

	// .........................................................................
	$bookmarkSample( id, b ) {
		b
			? this.#idFavs.set( id )
			: this.#idFavs.delete( id );
		GSUdomTogClass( this.#samplesMap.get( id ), "gsuiLibrary-sample-fav", b );
	}
	$loadSample( id ) {
		const el = this.#samplesMap.get( id );

		GSUdomAddClass( el, "gsuiLibrary-sample-loading" );
		el.title = "loading...";
	}
	$readySample( id ) {
		const el = this.#samplesMap.get( id );

		GSUdomRmClass( el, "gsuiLibrary-sample-loading" );
		GSUdomAddClass( el, "gsuiLibrary-sample-ready" );
		el.title = el.dataset.name;
	}
	$playSample( id, dur ) {
		const el = this.#samplesMap.get( id );

		this.$stopSample();
		this.#idPlaying = id;
		this.#elCursor = GSUcreateDiv( { class: "gsuiLibrary-sample-cursor" } );
		this.#elCursor.style.left = "0%";
		this.#elCursor.style.transitionDuration = `${ dur }s`;
		GSUdomAddClass( el, "gsuiLibrary-sample-playing" );
		el.append( this.#elCursor );
		GSUsetTimeout( () => this.#elCursor.style.left = "100%", .01 );
		this.#stopTimeout = GSUsetTimeout( this.$stopSample.bind( this ), dur );
	}
	$stopSample() {
		if ( this.#idPlaying ) {
			const el = this.#samplesMap.get( this.#idPlaying );

			GSUclearTimeout( this.#stopTimeout );
			this.#elCursor.remove();
			GSUdomRmClass( el, "gsuiLibrary-sample-playing" );
			this.#elCursor =
			this.#idPlaying =
			this.#stopTimeout = null;
		}
	}

	// .........................................................................
	#expandGroup( elSep ) {
		const exp = !GSUdomHasClass( elSep, "gsuiLibrary-sep-expanded" );

		for ( let el = elSep.nextElementSibling; el; el = el.nextElementSibling ) {
			if ( GSUdomHasClass( el, "gsuiLibrary-sample" ) ) {
				GSUdomTogClass( el, "gsuiLibrary-sample-expanded", exp );
			} else {
				break;
			}
		}
		GSUdomTogClass( elSep, "gsuiLibrary-sep-expanded", exp );
	}

	// .........................................................................
	#onclick( e ) {
		const el = e.target;

		if ( GSUdomHasClass( el, "gsuiLibrary-sep-btn" ) ) {
			this.#expandGroup( el.parentNode );
		} else if ( GSUdomHasClass( el, "gsuiLibrary-sample" ) && !GSUdomHasClass( el, "gsuiLibrary-sample-loading" ) ) {
			const act = GSUdomHasClass( el, "gsuiLibrary-sample-ready" )
				? GSEV_LIBRARY_PLAYSAMPLE
				: GSEV_LIBRARY_LOADSAMPLE;

			GSUdomDispatch( this, act, el.dataset.id );
		}
	}
	#oncontextmenu( e ) {
		if ( GSUdomHasClass( e.target, "gsuiLibrary-sample" ) ) {
			GSUdomDispatch( this, GSEV_LIBRARY_STOPSAMPLE );
		}
		return false;
	}
}

GSUdefineElement( "gsui-library", gsuiLibrary );
