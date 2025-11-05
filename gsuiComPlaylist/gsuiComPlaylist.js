"use strict";

class gsuiComPlaylist extends gsui0ne {
	#dawURL = "";
	#cmps = new Map();
	#itsMe = false;
	#premium = false;
	#forkPromise = null;
	#deletePromise = null;
	#restorePromise = null;
	#visibilityPromise = null;
	#currentPlaying = null;

	constructor() {
		super( {
			$cmpName: "gsuiComPlaylist",
			$tagName: "gsui-com-playlist",
			$elements: {
				$listCmps: ".gsuiComPlaylist-list[data-list=cmps]",
				$listBin: ".gsuiComPlaylist-list[data-list=bin]",
			},
		} );
		Object.seal( this );
		this.#updateNbCmps();
		GSUdomListen( this, {
			[ GSEV_COMPLAYER_ACTION ]: ( d, act ) => this.#onactionComposition( d.$target, act ),
			[ GSEV_COMPLAYER_PLAY ]: d => {
				if ( this.#currentPlaying !== d.$targetId ) {
					const elCmp = GSUdomQS( this, `gsui-com-player[data-id="${ this.#currentPlaying }"]` );

					GSUdomSetAttr( elCmp, "playing", false );
					this.#currentPlaying = d.$targetId;
				}
			},
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "whoami" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "whoami":
				this.#itsMe = val === "itsme+" || val === "itsme";
				this.#premium = val === "itsme+";
				if ( !this.#premium ) {
					GSUdomRmAttr( this, "bin" );
				}
				this.#updateAllCmpsActions();
				break;
		}
	}

	// .........................................................................
	$setDAWURL( url ) { this.#dawURL = url; }
	$setForkCallbackPromise( fn ) { this.#forkPromise = fn; }
	$setDeleteCallbackPromise( fn ) { this.#deletePromise = fn; }
	$setRestoreCallbackPromise( fn ) { this.#restorePromise = fn; }
	$setVisibilityCallbackPromise( fn ) { this.#visibilityPromise = fn; }
	$clearCompositions() {
		GSUdomEmpty( this.$elements.$listCmps );
		GSUdomEmpty( this.$elements.$listBin );
		this.#updateNbCmps();
		this.#cmps.clear();
	}
	$changeCompositionProp( id, prop, val ) {
		GSUdomSetAttr( this.#cmps.get( id ), prop, val );
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
		GSUdomDispatch( this, GSEV_COMPLAYLIST_UPDATE_NB,
			this.$elements.$listCmps.childElementCount,
			this.$elements.$listBin.childElementCount );
	}
	#createCmp( cmp ) {
		const elCmp = GSUcreateElement( "gsui-com-player", {
			"data-id": cmp.id,
			private: !cmp.public,
			opensource: cmp.opensource,
			name: cmp.name,
			bpm: cmp.bpm,
			duration: cmp.durationSec,
			deleted: !!cmp.deleted,
			url: `https://compositions.gridsound.com/${ cmp.id }.opus`,
		} );

		this.#updateCmpLinks( elCmp );
		return elCmp;
	}
	#updateCmpLinks( elCmp ) {
		const del = GSUdomHasAttr( elCmp, "deleted" );
		const open = GSUdomHasAttr( elCmp, "opensource" );

		GSUdomSetAttr( elCmp, {
			link: del ? false : `#/cmp/${ elCmp.dataset.id }`,
			dawlink: del || !( this.#itsMe || open ) ? false : `${ this.#dawURL }#${ elCmp.dataset.id }`,
		} );
		this.#updateCmpActions( elCmp );
	}
	#updateAllCmpsActions() {
		GSUdomQSA( this, "gsui-com-player" ).forEach( elCmp => this.#updateCmpActions( elCmp ) );
	}
	#updateCmpActions( elCmp ) {
		const del = GSUdomHasAttr( elCmp, "deleted" );
		const isOpen = GSUdomHasAttr( elCmp, "opensource" );
		const isPrivate = GSUdomHasAttr( elCmp, "private" );
		const isVisible = !isPrivate && !isOpen;

		GSUdomSetAttr( elCmp, "itsmine", this.#itsMe );
		GSUdomSetAttr( elCmp, "actions",
			del ? "restore" :
			this.#premium ? `fork delete${ isPrivate ? "" : " private" }${ isOpen ? "" : " open" }${ isVisible ? "" : " visible" }` :
			this.#itsMe ? "fork delete" : "fork" );
	}

	// .........................................................................
	#onactionComposition( elCmp, act ) {
		switch ( act ) {
			case "delete":
			case "restore": return this.#ondeleteRestoreCmp( elCmp, act );
			case "fork": return this.#onforkComposition( elCmp );
			case "open":
			case "visible":
			case "private": return this.#onchangeVisibility( elCmp, act );
		}
	}
	#onchangeVisibility( elCmp, act ) {
		const id = elCmp.dataset.id;

		GSUdomSetAttr( elCmp, "actionloading" );
		this.#visibilityPromise?.( id, act )
			.then( () => {
				GSUdomSetAttr( elCmp, {
					private: act === "private",
					opensource: act === "open",
				} );
				this.#updateCmpActions( elCmp );
			} )
			.finally( () => GSUdomRmAttr( elCmp, "actionloading" ) );
	}
	#onforkComposition( elCmp ) {
		const id = elCmp.dataset.id;

		GSUdomSetAttr( elCmp, "actionloading" );
		this.#forkPromise?.( id )
			.then( obj => {
				const elNewCmp = this.#itsMe && this.#createCmp( obj );

				if ( elNewCmp ) {
					GSUdomSetAttr( elNewCmp, "forking" );
					this.$elements.$listCmps.prepend( elNewCmp );
					this.#updateNbCmps();
					GSUdomRmAttr( elCmp, "actionloading" );
					GSUsetTimeout( () => GSUdomRmAttr( elNewCmp, "forking" ), .35 );
				}
			} )
			.finally( () => GSUdomRmAttr( elCmp, "actionloading" ) );
	}
	#ondeleteRestoreCmp( elCmp, act ) {
		const id = elCmp.dataset.id;
		const del = act === "delete";
		const prom = del ? this.#deletePromise : this.#restorePromise;

		GSUdomSetAttr( elCmp, "actionloading" );
		prom?.( id )
			.then( () => {
				const attr = del ? "deleting" : "restoring";

				GSUdomSetAttr( elCmp, attr );
				GSUsetTimeout( () => {
					del
						? this.$elements.$listBin.prepend( elCmp )
						: this.$elements.$listCmps.prepend( elCmp );
					GSUdomRmAttr( elCmp, attr, "actionloading" );
					GSUdomSetAttr( elCmp, "deleted", del );
					this.#updateNbCmps();
					this.#updateCmpLinks( elCmp );
				}, .35 );
			} )
			.catch( () => GSUdomRmAttr( elCmp, "actionloading" ) );
	}
}

GSUdomDefine( "gsui-com-playlist", gsuiComPlaylist );
