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
			$pxDelay: 10,
			$parentSelector: ".gsuiLibrary-body",
			$itemSelector: ".gsuiLibrary-sample",
			$getTargetList: () => [
				document.querySelector( "[data-type=buffers] .gsuiPatterns-panel-list-wrap" ),
				...document.querySelectorAll( ".gsuiOscillator-waveWrap" ),
				document.querySelector( ".gsuiSynthesizer-newOsc" ),
				...document.querySelectorAll( "gsui-drumrow" ),
				document.querySelector( ".gsuiDrumrows-dropNew" ),
				...document.querySelectorAll( ".gsuiTrack-row > div" ),
			],
			$ondrop: drop => {
				const tar = drop.$target;
				const dt = drop.$itemElement.dataset;
				const $name = `${ dt.id }:${ dt.name }`;
				const obj = { $name };

				if ( tar.classList.contains( "gsuiPatterns-panel-list-wrap" ) ) {
					this.$dispatch( "dropOnPatterns", obj );
				} else if ( tar.tagName === "GSUI-DRUMROW" ) {
					obj.$drumrowId = tar.dataset.id;
					this.$dispatch( "dropOnDrumrow", obj );
				} else if ( tar.classList.contains( "gsuiDrumrows-dropNew" ) ) {
					this.$dispatch( "dropOnDrumrowNew", obj );
				} else if ( tar.classList.contains( "gsuiOscillator-waveWrap" ) ) {
					obj.$synthId = tar.closest( "gsui-synthesizer" ).dataset.id;
					obj.$oscId = tar.closest( "gsui-oscillator" ).dataset.id;
					this.$dispatch( "dropOnOsc", obj );
				} else if ( tar.classList.contains( "gsuiSynthesizer-newOsc" ) ) {
					obj.$synthId = tar.closest( "gsui-synthesizer" ).dataset.id;
					this.$dispatch( "dropOnOscNew", obj );
				} else {
					obj.$when = Math.floor( drop.$offsetX / GSUgetAttributeNum( tar.closest( "gsui-timewindow" ), "pxperbeat" ) );
					obj.$track = tar.parentNode.dataset.id;
					this.$dispatch( "dropOnTracks", obj );
				}
			},
		} );
	}

	// .........................................................................
	$clear() {
		this.#samplesMap.forEach( el => el.remove() );
		this.#samplesMap.clear();
		this.#idFavs.clear();
		this.$elements.$body.querySelectorAll( ".gsuiLibrary-sep" ).forEach( el => el.remove() );
	}
	$unloadSamples() {
		this.#samplesMap.forEach( el => {
			el.classList.remove( "gsuiLibrary-sample-loading", "gsuiLibrary-sample-ready" );
			el.title = el.dataset.name;
		} );
	}
	$setPlaceholder( str ) {
		this.$elements.$placeholder.textContent = str;
	}
	$setLibrary( lib ) {
		let lastSep;
		const prevLastSep = Array.from( this.$elements.$body.children )
			.findLast( el => el.classList.contains( "gsuiLibrary-sep" ) );
		const el = lib.map( smp => {
			if ( typeof smp !== "string" ) {
				const el = GSUgetTemplate( "gsui-library-sample", {
					id: smp[ 0 ],
					points: smp[ 1 ],
					name: smp[ 2 ] || smp[ 0 ],
				} );

				if ( this.#idFavs.has( smp[ 0 ] ) ) {
					el.classList.add( "gsuiLibrary-sample-fav" );
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
		this.#samplesMap.get( id )?.classList.toggle( "gsuiLibrary-sample-fav", b );
	}
	$loadSample( id ) {
		const el = this.#samplesMap.get( id );

		el.classList.add( "gsuiLibrary-sample-loading" );
		el.title = "loading...";
	}
	$readySample( id ) {
		const el = this.#samplesMap.get( id );

		el.classList.remove( "gsuiLibrary-sample-loading" );
		el.classList.add( "gsuiLibrary-sample-ready" );
		el.title = el.dataset.name;
	}
	$playSample( id, dur ) {
		const el = this.#samplesMap.get( id );

		this.$stopSample();
		this.#idPlaying = id;
		this.#elCursor = GSUcreateDiv( { class: "gsuiLibrary-sample-cursor" } );
		this.#elCursor.style.left = "0%";
		this.#elCursor.style.transitionDuration = `${ dur }s`;
		el.classList.add( "gsuiLibrary-sample-playing" );
		el.append( this.#elCursor );
		setTimeout( () => this.#elCursor.style.left = "100%", 10 );
		this.#stopTimeout = setTimeout( this.$stopSample.bind( this ), dur * 1000 );
	}
	$stopSample() {
		if ( this.#idPlaying ) {
			const el = this.#samplesMap.get( this.#idPlaying );

			clearTimeout( this.#stopTimeout );
			this.#elCursor.remove();
			el.classList.remove( "gsuiLibrary-sample-playing" );
			this.#elCursor = null;
			this.#idPlaying = null;
			this.#stopTimeout = null;
		}
	}

	// .........................................................................
	#expandGroup( elSep ) {
		const exp = !elSep.classList.contains( "gsuiLibrary-sep-expanded" );

		for ( let el = elSep.nextElementSibling; el; el = el.nextElementSibling ) {
			if ( el.classList.contains( "gsuiLibrary-sample" ) ) {
				el.classList.toggle( "gsuiLibrary-sample-expanded", exp );
			} else {
				break;
			}
		}
		elSep.classList.toggle( "gsuiLibrary-sep-expanded", exp );
	}

	// .........................................................................
	#onclick( e ) {
		const el = e.target;
		const cl = el.classList;

		if ( cl.contains( "gsuiLibrary-sep-btn" ) ) {
			this.#expandGroup( el.parentNode );
		} else if ( cl.contains( "gsuiLibrary-sample" ) && !cl.contains( "gsuiLibrary-sample-loading" ) ) {
			const act = cl.contains( "gsuiLibrary-sample-ready" )
				? "playSample"
				: "loadSample";

			this.$dispatch( act, el.dataset.id );
		}
	}
	#oncontextmenu( e ) {
		if ( e.target.classList.contains( "gsuiLibrary-sample" ) ) {
			this.$dispatch( "stopSample" );
		}
		return false;
	}
}

GSUdefineElement( "gsui-library", gsuiLibrary );
