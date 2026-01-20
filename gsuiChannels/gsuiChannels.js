"use strict";

class gsuiChannels extends gsui0ne {
	#chans = {};
	#chanSelected = null;
	#analyserType = "hz";
	static #selectChanPopup = GSUgetTemplate( "gsui-channels-selectPopup" );
	static #selectChanInput = GSUdomQS( gsuiChannels.#selectChanPopup, "select" );

	constructor() {
		super( {
			$cmpName: "gsuiChannels",
			$tagName: "gsui-channels",
			$jqueryfy: true,
			$elements: {
				$vu: "gsui-analyser-vu",
				$pmain: ".gsuiChannels-panMain",
				$pchans: ".gsuiChannels-panChannels",
				$addBtn: ".gsuiChannels-addChan",
			},
		} );
		Object.seal( this );
		this.$elements.$addBtn.$on( "click", () => GSUdomDispatch( this, GSEV_CHANNELS_ADDCHAN ) );
		GSUdomListen( this, {
			[ GSEV_CHANNEL_SELECTCHANNEL ]: d => this.#selectChannel( d.$targetId ),
			[ GSEV_CHANNEL_SELECTEFFECT ]: ( d, id ) => GSUdomDispatch( this, GSEV_CHANNELS_SELECTEFFECT, d.$targetId, id ),
			[ GSEV_CHANNEL_CONNECT ]: d => GSUdomDispatch( this, GSEV_CHANNELS_REDIRECT, this.#chanSelected, d.$targetId ),
		} );
		new gsuiReorder( {
			$root: this.$elements.$pchans.$at( 0 ),
			$parentSelector: ".gsuiChannels-panChannels",
			$itemSelector: "gsui-channel",
			$itemGripSelector: ".gsuiChannel-grip",
			$onchange: ( obj, chanId ) => GSUdomDispatch( this, GSEV_CHANNELS_REORDER, chanId, obj ),
		} );
	}

	// .........................................................................
	$onresize() {
		GSUforEach( this.#chans, ch => ch.$analyser.$updateResolution() );
	}
	$setAnalyserType( t ) {
		this.#analyserType = t;
		this.$this.$find( "gsui-channel gsui-analyser-hist" ).$attr( "type", t );
	}
	$updateVu( ldata, rdata ) {
		this.$elements.$vu.$at( 0 ).$draw( ldata, rdata );
	}
	$updateAudioData( id, ldata, rdata ) {
		this.#chans[ id ].$analyser.$draw( ldata, rdata );
	}
	#selectChannel( id ) {
		GSUdomRmAttr( this.#chans[ this.#chanSelected ], "selected" );
		GSUdomSetAttr( this.#chans[ id ], "selected" );
		this.#chanSelected = id;
		this.#updateChanConnections();
		GSUdomDispatch( this, GSEV_CHANNELS_SELECTCHAN, id );
	}
	$openSelectChannelPopup( currChanId ) {
		___( currChanId, "string" );
		return new Promise( res => {
			gsuiChannels.#selectChanInput.append( ...[
				GSUcreateOption( { value: "main" } ),
				...Object.entries( this.#chans )
					.filter( kv => kv[ 0 ] !== "main" )
					.sort( ( a, b ) => GSUdomGetAttrNum( a[ 1 ], "order" ) - GSUdomGetAttrNum( b[ 1 ], "order" ) )
					.map( kv => GSUcreateOption( { value: kv[ 0 ] }, GSUdomGetAttr( kv[ 1 ], "name" ) ) ),
			] );
			gsuiChannels.#selectChanInput.value = currChanId;
			GSUpopup.$custom( {
				title: "Channels",
				element: gsuiChannels.#selectChanPopup,
				submit( data ) {
					const chan = `${ data.channel }`;

					res( chan !== currChanId ? chan : null );
				},
			} ).then( () => GSUdomEmpty( gsuiChannels.#selectChanInput ) );
		} );
	}

	// .........................................................................
	$getChannel( id ) {
		return this.#chans[ id ];
	}
	$addChannel( id ) {
		const chan = GSUcreateElement( "gsui-channel", { "data-id": id } );

		( id === "main" ? this.$elements.$pmain : this.$elements.$pchans ).$append( chan );
		this.#chans[ id ] = chan;
		chan.$analyser.$updateResolution();
		GSUdomSetAttr( chan.$analyser, "type", this.#analyserType );
		GSUdomDispatch( this, GSEV_CHANNELS_NBCHANNELSCHANGE );
		if ( this.#chanSelected ) {
			this.#updateChanConnections();
		} else if ( id === "main" ) {
			this.#selectChannel( id );
		}
	}
	$removeChannel( id ) {
		const chan = this.#chans[ id ];

		if ( id === this.#chanSelected ) {
			const next = this.#getNextChan( chan, "nextElementSibling" );

			if ( next ) {
				this.#selectChannel( next.dataset.id );
			} else {
				const prev = this.#getNextChan( chan, "previousElementSibling" );

				this.#selectChannel( prev ? prev.dataset.id : "main" );
			}
		}
		delete this.#chans[ id ];
		chan.remove();
		GSUdomDispatch( this, GSEV_CHANNELS_NBCHANNELSCHANGE );
	}
	$changeChannelProp( id, prop, val ) {
		const chan = this.#chans[ id ];

		switch ( prop ) {
			case "order":
			case "pan":
			case "gain":
			case "name": GSUdomSetAttr( chan, prop, val ); break;
			case "toggle": GSUdomSetAttr( chan, "muted", !val ); break;
			case "dest":
				chan.dataset.dest = val;
				this.#updateChanConnections();
				break;
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

			GSUforEach( this.#chans, ( chan, id ) => {
				const a = id === chanDest;
				const b = chan.dataset.dest === selId;

				GSUdomSetAttr( chan, {
					connecta: a ? "up" : false,
					connectb: b ? "down" : false,
				} );
				bOnce = bOnce || b;
			} );
			GSUdomSetAttr( chan, {
				connecta: selId !== "main" ? "down" : false,
				connectb: bOnce ? "up" : false,
			} );
		}
	}
}

GSUdomDefine( "gsui-channels", gsuiChannels );
