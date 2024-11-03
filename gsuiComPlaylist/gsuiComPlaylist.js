"use strict";

class gsuiComPlaylist extends gsui0ne {
	#dawURL = "";
	#cmps = new Map();
	#itsMe = false;
	#forkPromise = null;
	#deletePromise = null;
	#restorePromise = null;

	constructor() {
		super( {
			$cmpName: "gsuiComPlaylist",
			$tagName: "gsui-com-playlist",
			$elements: {
				$headLinkCmps: ".gsuiComPlaylist-head-btn:first-child",
				$headLinkBin: ".gsuiComPlaylist-head-btn:last-child",
				$listCmps: ".gsuiComPlaylist-list[data-list=cmps]",
				$listBin: ".gsuiComPlaylist-list[data-list=bin]",
			},
		} );
		Object.seal( this );
		this.#updateNbCmps();
		this.$elements.$headLinkCmps.onclick = () => GSUsetAttribute( this, "bin", false );
		this.$elements.$headLinkBin.onclick = () => GSUsetAttribute( this, "bin", true );
		GSUlistenEvents( this, {
			gsuiComPlayer: {
				fork: ( d, t ) => this.#onforkComposition( t ),
				delete: ( d, t ) => this.#ondeleteRestoreCmp( t, "delete" ),
				restore: ( d, t ) => this.#ondeleteRestoreCmp( t, "restore" ),
			},
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "itsme" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "itsme":
				this.#itsMe = val === "";
				!this.#itsMe && GSUsetAttribute( this, "bin", false );
				break;
		}
	}

	// .........................................................................
	$setDAWURL( url ) { this.#dawURL = url; }
	$setForkCallbackPromise( fn ) { this.#forkPromise = fn; }
	$setDeleteCallbackPromise( fn ) { this.#deletePromise = fn; }
	$setRestoreCallbackPromise( fn ) { this.#restorePromise = fn; }
	$clearCompositions() {
		GSUemptyElement( this.$elements.$listCmps );
		GSUemptyElement( this.$elements.$listBin );
		this.#updateNbCmps();
		this.#cmps.clear();
	}
	$changeCompositionProp( id, prop, val ) {
		GSUsetAttribute( this.#cmps.get( id ), prop, val );
	}
	$addCompositions( arr ) {
		arr.forEach( cmp => {
			const elCmp = this.#createCmp( cmp );

			this.#cmps.set( cmp.id, elCmp );
			( cmp.deleted
				? this.$elements.$listBin
				: this.$elements.$listCmps
			).append( elCmp );
		} );
		this.#updateNbCmps();
	}

	// .........................................................................
	#updateNbCmps() {
		this.$elements.$headLinkCmps.firstChild.textContent = this.$elements.$listCmps.childElementCount;
		this.$elements.$headLinkBin.firstChild.textContent = this.$elements.$listBin.childElementCount;
	}
	#createCmp( cmp ) {
		const id = cmp.id;
		const elCmp = GSUcreateElement( "gsui-com-player", {
			"data-id": id,
			itsmine: this.#itsMe,
			private: !cmp.public,
			opensource: cmp.opensource,
			name: cmp.name,
			bpm: cmp.bpm,
			duration: cmp.durationSec,
		} );

		this.#updateCmpLinks( elCmp, cmp.deleted );
		return elCmp;
	}
	#updateCmpLinks( elCmp, del ) {
		GSUsetAttribute( elCmp, {
			link: del ? false : `#/cmp/${ elCmp.dataset.id }`,
			dawlink: del ? false : `${ this.#dawURL }#${ elCmp.dataset.id }`,
			actions: !this.#itsMe ? "fork" : del ? "restore" : "fork delete",
		} );
	}

	// .........................................................................
	#onforkComposition( elCmp ) {
		const id = elCmp.dataset.id;

		GSUsetAttribute( elCmp, "actionloading", true );
		this.#forkPromise?.( id )
			.then( obj => {
				const elNewCmp = this.#itsMe && this.#createCmp( obj );

				if ( elNewCmp ) {
					GSUsetAttribute( elNewCmp, "forking", true );
					this.$elements.$listCmps.prepend( elNewCmp );
					this.#updateNbCmps();
					GSUsetAttribute( elCmp, "actionloading", false );
					setTimeout( () => {
						GSUsetAttribute( elNewCmp, "forking", false );
					}, 350 );
				}
			} )
			.finally( () => GSUsetAttribute( elCmp, "actionloading", false ) );
	}
	#ondeleteRestoreCmp( elCmp, act ) {
		const id = elCmp.dataset.id;
		const del = act === "delete";
		const prom = del ? this.#deletePromise : this.#restorePromise;

		GSUsetAttribute( elCmp, "actionloading", true );
		prom?.( id )
			.then( () => {
				const attr = del ? "deleting" : "restoring";

				GSUsetAttribute( elCmp, attr, true );
				setTimeout( () => {
					del
						? this.$elements.$listBin.prepend( elCmp )
						: this.$elements.$listCmps.prepend( elCmp );
					GSUsetAttribute( elCmp, attr, false );
					GSUsetAttribute( elCmp, "actionloading", false );
					this.#updateNbCmps();
					this.#updateCmpLinks( elCmp, del );
				}, 350 );
			} )
			.catch( () => {
				GSUsetAttribute( elCmp, "actionloading", false );
			} );
	}
}

GSUdefineElement( "gsui-com-playlist", gsuiComPlaylist );
