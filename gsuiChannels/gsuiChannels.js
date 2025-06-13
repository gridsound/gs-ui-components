"use strict";

class gsuiChannels extends gsui0ne {
	$oninput = null;
	$onchange = null;
	$onselectChan = null;
	$onselectEffect = null;
	#chans = {};
	#chanSelected = null;
	#analyserType = "hz";
	static #selectChanPopup = GSUgetTemplate( "gsui-channels-selectPopup" );
	static #selectChanInput = GSUdomQS( gsuiChannels.#selectChanPopup, "select" );

	constructor() {
		super( {
			$cmpName: "gsuiChannels",
			$tagName: "gsui-channels",
			$elements: {
				$vu: "gsui-analyser-vu",
				$pmain: ".gsuiChannels-panMain",
				$pchans: ".gsuiChannels-panChannels",
				$addBtn: ".gsuiChannels-addChan",
			},
		} );
		Object.seal( this );

		this.$elements.$addBtn.onclick = () => this.$onchange( "addChannel" );
		GSUlistenEvents( this, {
			gsuiChannel: {
				selectChannel: ( d, chan ) => this.$selectChannel( chan.dataset.id ),
				selectEffect: ( d, chan ) => this.$onselectEffect( chan.dataset.id, d.args[ 0 ] ),
				liveChange: ( d, chan ) => this.$oninput( chan.dataset.id, ...d.args ),
				change: ( d, chan ) => this.$onchange( "changeChannel", chan.dataset.id, ...d.args ),
				toggle: ( d, chan ) => this.$onchange( "toggleChannel", chan.dataset.id ),
			},
		} );
		new gsuiReorder( {
			$root: this.$elements.$pchans,
			$parentSelector: ".gsuiChannels-panChannels",
			$itemSelector: "gsui-channel",
			$itemGripSelector: ".gsuiChannel-grip",
			$onchange: ( obj, chanId ) => this.$onchange( "reorderChannel", chanId, obj ),
		} );
	}

	// .........................................................................
	$onresize() {
		Object.values( this.#chans ).forEach( chan => chan.$analyser.$updateResolution() );
	}
	$setAnalyserType( t ) {
		this.#analyserType = t;
		GSUdomQSA( this, "gsui-channel gsui-analyser-hist" ).forEach( el => GSUsetAttribute( el, "type", t ) );
	}
	$updateVu( ldata, rdata ) {
		this.$elements.$vu.$draw( ldata, rdata );
	}
	$updateAudioData( id, ldata, rdata ) {
		this.#chans[ id ].$analyser.$draw( ldata, rdata );
	}
	$selectChannel( id ) {
		GSUdomRmAttr( this.#chans[ this.#chanSelected ], "selected" );
		GSUsetAttribute( this.#chans[ id ], "selected", true );
		this.#chanSelected = id;
		this.#updateChanConnections();
		this.$onselectChan?.( id );
	}
	static $openSelectChannelPopup( chans, currChanId ) {
		return new Promise( res => {
			gsuiChannels.#selectChanInput.append(
				...Object.entries( chans ).map(
					kv => GSUcreateOption( { value: kv[ 0 ] }, kv[ 1 ].name ) )
			);
			gsuiChannels.#selectChanInput.value = currChanId;
			GSUpopup.$custom( {
				title: "Channels",
				element: gsuiChannels.#selectChanPopup,
				submit( data ) {
					res( data.channel !== currChanId ? data.channel : null );
				}
			} ).then(() => GSUemptyElement( gsuiChannels.#selectChanInput ) );
		} );
	}

	// .........................................................................
	$getChannel( id ) {
		return this.#chans[ id ];
	}
	$addChannel( id ) {
		const chan = GSUcreateElement( "gsui-channel", { "data-id": id } );

		( id === "main" ? this.$elements.$pmain : this.$elements.$pchans ).append( chan );
		this.#chans[ id ] = chan;
		GSUdomQS( chan, ".gsuiChannel-delete" ).onclick = () => this.$onchange( "removeChannel", id );
		GSUdomQS( chan, ".gsuiChannel-connect" ).onclick = () => this.$onchange( "redirectChannel", this.#chanSelected, id );
		GSUdomQS( chan, ".gsuiChannel-rename" ).onclick = () => {
			GSUpopup.$prompt( "Rename channel", "", GSUdomGetAttr( this.#chans[ id ], "name" ) )
				.then( name => this.$onchange( "renameChannel", id, name ) );
		};
		chan.$analyser.$updateResolution();
		GSUsetAttribute( chan.$analyser, "type", this.#analyserType );
		this.$dispatch( "nbChannelsChange" );
		if ( this.#chanSelected ) {
			this.#updateChanConnections();
		} else if ( id === "main" ) {
			this.$selectChannel( id );
		}
	}
	$removeChannel( id ) {
		const chan = this.#chans[ id ];

		if ( id === this.#chanSelected ) {
			const next = this.#getNextChan( chan, "nextElementSibling" );

			if ( next ) {
				this.$selectChannel( next.dataset.id );
			} else {
				const prev = this.#getNextChan( chan, "previousElementSibling" );

				this.$selectChannel( prev ? prev.dataset.id : "main" );
			}
		}
		delete this.#chans[ id ];
		chan.remove();
		this.$dispatch( "nbChannelsChange" );
	}
	$changeChannelProp( id, prop, val ) {
		const chan = this.#chans[ id ];

		switch ( prop ) {
			case "order":
			case "pan":
			case "gain":
			case "name": GSUsetAttribute( chan, prop, val ); break;
			case "toggle": GSUsetAttribute( chan, "muted", !val ); break;
			case "dest": chan.dataset.dest = val; this.#updateChanConnections(); break;
		}
	}

	// .........................................................................
	#getNextChan( el, dir ) {
		const sibling = el[ dir ];

		return sibling && "id" in sibling.dataset ? sibling : null;
	}
	#updateChanConnections() {
		const selId = this.#chanSelected;

		if ( selId ) {
			const chan = this.#chans[ selId ];
			const chanDest = chan.dataset.dest;
			let bOnce = false;

			Object.entries( this.#chans ).forEach( ( [ id, chan ] ) => {
				const a = id === chanDest;
				const b = chan.dataset.dest === selId;

				GSUsetAttribute( chan, "connecta", a ? "up" : "" );
				GSUsetAttribute( chan, "connectb", b ? "down" : "" );
				bOnce = bOnce || b;
			} );
			GSUsetAttribute( chan, "connecta", selId !== "main" ? "down" : "" );
			GSUsetAttribute( chan, "connectb", bOnce ? "up" : "" );
		}
	}
}

GSUdefineElement( "gsui-channels", gsuiChannels );
