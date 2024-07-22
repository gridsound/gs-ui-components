"use strict";

class gsuiChannels extends gsui0ne {
	$oninput = null;
	$onchange = null;
	$onselectChan = null;
	$onselectEffect = null;
	#chans = {};
	#chanSelected = null;
	#analyserW = 10;
	#analyserH = 50;
	#analyserType = "hz";
	static #selectChanPopup = GSUgetTemplate( "gsui-channels-selectPopup" );
	static #selectChanInput = gsuiChannels.#selectChanPopup.querySelector( "select" );

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
			rootElement: this,
			direction: "row",
			dataTransferType: "channel",
			itemSelector: "gsui-channel",
			handleSelector: ".gsuiChannel-grip",
			parentSelector: ".gsuiChannels-panChannels",
			onchange: elChan => {
				this.$onchange( "reorderChannel", elChan.dataset.id,
					gsuiReorder.listComputeOrderChange( this.$elements.$pchans, {} ) );
			},
		} );
	}

	// .........................................................................
	$onresize() {
		const chans = Object.values( this.#chans );

		if ( chans.length ) {
			const { width, height } = chans[ 0 ].$analyser.getBoundingClientRect();

			this.#analyserW = width;
			this.#analyserH = height;
			chans.forEach( chan => chan.$analyser.$setResolution( width, height ) );
		}
	}
	$setAnalyserType( t ) {
		this.#analyserType = t;
		this.querySelectorAll( "gsui-channel gsui-analyser-hist" ).forEach( el => GSUsetAttribute( el, "type", t ) );
	}
	$updateVu( ldata, rdata ) {
		this.$elements.$vu.$draw( ldata, rdata );
	}
	$updateAudioData( id, ldata, rdata ) {
		this.#chans[ id ].$analyser.$draw( ldata, rdata );
	}
	$selectChannel( id ) {
		const chan = this.#chans[ id ];
		const pchan = this.#chans[ this.#chanSelected ];

		pchan && GSUsetAttribute( pchan, "selected", false );
		GSUsetAttribute( chan, "selected", true );
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
	$reorderChannels( channels ) {
		gsuiReorder.listReorder( this.$elements.$pchans, channels );
	}
	$getChannel( id ) {
		return this.#chans[ id ];
	}
	$addChannel( id ) {
		const chan = GSUcreateElement( "gsui-channel", { "data-id": id } );
		const qs = n => chan.querySelector( `.gsuiChannel-${ n }` );

		( id === "main" ? this.$elements.$pmain : this.$elements.$pchans ).append( chan );
		this.#chans[ id ] = chan;
		qs( "delete" ).onclick = () => this.$onchange( "removeChannel", id );
		qs( "connect" ).onclick = () => this.$onchange( "redirectChannel", this.#chanSelected, id );
		qs( "rename" ).onclick = () => {
			GSUpopup.$prompt( "Rename channel", "", GSUgetAttribute( this.#chans[ id ], "name" ) )
				.then( name => this.$onchange( "renameChannel", id, name ) );
		};
		chan.$analyser.$setResolution( this.#analyserW, this.#analyserH );
		GSUsetAttribute( chan.$analyser, "type", this.#analyserType );
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
