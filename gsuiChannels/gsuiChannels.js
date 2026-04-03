"use strict";

class gsuiChannels extends gsui0ne {
	#chanSelected = null;
	#analyserType = "hz";
	static #selectChanPopup = $( GSUgetTemplate( "gsui-channels-selectPopup" ) );
	static #selectChanInput = gsuiChannels.#selectChanPopup.$query( "select" );

	constructor() {
		super( {
			$tagName: "gsui-channels",
			$elements: {
				$vu: "gsui-analyser-vu",
				$pmain: ".gsuiChannels-panMain",
				$pchans: ".gsuiChannels-panChannels",
				$addBtn: ".gsuiChannels-addChan",
			},
		} );
		this.$elements.$addBtn.$onclick( () => this.$this.$dispatch( GSEV_CHANNELS_ADDCHAN ) );
		GSUdomListen( this, {
			[ GSEV_CHANNEL_SELECTCHANNEL ]: d => this.#selectChannel( d.$targetId ),
			[ GSEV_CHANNEL_SELECTEFFECT ]: ( d, id ) => this.$this.$dispatch( GSEV_CHANNELS_SELECTEFFECT, d.$targetId, id ),
			[ GSEV_CHANNEL_CONNECT ]: d => this.$this.$dispatch( GSEV_CHANNELS_REDIRECT, this.#chanSelected, d.$targetId ),
		} );
		new gsuiReorder( {
			$root: this.$elements.$pchans,
			$parentSelector: ".gsuiChannels-panChannels",
			$itemSelector: "gsui-channel",
			$itemGripSelector: ".gsuiChannel-grip",
			$onchange: ( obj, chanId ) => this.$this.$dispatch( GSEV_CHANNELS_REORDER, chanId, obj ),
		} );
	}

	// .........................................................................
	$onresize() {
		this.#getAnalyser().$each( el => el.$updateResolution() );
	}
	$setAnalyserType( t ) {
		this.#analyserType = t;
		this.#getAnalyser().$setAttr( "type", t );
	}
	$updateVu( ldata, rdata ) {
		this.$elements.$vu.$get( 0 ).$draw( ldata, rdata );
	}
	$updateAudioData( id, ldata, rdata ) {
		this.#getAnalyser( id ).$get( 0 ).$draw( ldata, rdata );
	}
	#selectChannel( id ) {
		this.$getChannel().$setAttr( "selected", el => el.dataset.id === id );
		this.#chanSelected = id;
		this.#updateChanConnections();
		this.$this.$dispatch( GSEV_CHANNELS_SELECTCHAN, id );
	}
	$openSelectChannelPopup( currChanId ) {
		return new Promise( res => {
			gsuiChannels.#selectChanInput.$append( ...[
				GSUcreateOption( { value: "0" }, "0 (main)" ),
				...this.$this.$query( ".gsuiChannels-panChannels gsui-channel" )
					.$sort( ( a, b ) => a.dataset.order - b.dataset.order )
					.$map( el => {
						const ch = $( el );

						return GSUcreateOption( { value: ch.$dataId() }, ch.$getAttr( "name" ) );
					} ),
			] );
			gsuiChannels.#selectChanInput.$value( currChanId );
			GSUpopup.$custom( {
				title: "Channels",
				element: gsuiChannels.#selectChanPopup,
				submit( data ) {
					const chan = `${ data.channel }`;

					res( chan !== currChanId ? chan : null );
				},
			} ).then( () => gsuiChannels.#selectChanInput.$empty() );
		} );
	}

	// .........................................................................
	$getChannel( id ) {
		return this.$this.$query( `gsui-channel${ id ? `[data-id="${ id }"]` : "" }` );
	}
	$addChannel( id ) {
		const chan = $( "<gsui-channel>" )
			.$dataId( id )
			.$appendTo( id === "0" ? this.$elements.$pmain : this.$elements.$pchans );

		chan.$query( "gsui-analyser-hist" )
			.$setAttr( "type", this.#analyserType )
			.$get( 0 ).$updateResolution();
		this.$this.$dispatch( GSEV_CHANNELS_NBCHANNELSCHANGE );
		if ( this.#chanSelected ) {
			this.#updateChanConnections();
		} else if ( id === "0" ) {
			this.#selectChannel( id );
		}
	}
	$removeChannel( id ) {
		const chan = this.$getChannel( id );

		if ( id === this.#chanSelected ) {
			const next = this.#getNextChan( chan, 1 );

			next.$size()
				? this.#selectChannel( next.$dataId() )
				: this.#selectChannel( this.#getNextChan( chan, -1 ).$dataId() || "0" );
		}
		chan.$remove();
		this.$this.$dispatch( GSEV_CHANNELS_NBCHANNELSCHANGE );
	}
	$changeChannelProp( id, prop, val ) {
		const chan = this.$getChannel( id );

		switch ( prop ) {
			case "order":
			case "pan":
			case "gain":
			case "name": chan.$setAttr( prop, val ); break;
			case "toggle": chan.$setAttr( "muted", !val ); break;
			case "dest":
				chan.$setAttr( "data-dest", val );
				this.#updateChanConnections();
				break;
		}
	}

	// .........................................................................
	#getAnalyser( id ) {
		return this.$getChannel( id ).$query( "gsui-analyser-hist" );
	}
	#getNextChan( el, dir ) {
		const sibling = dir < 0 ? el.$prev() : el.$next();

		return sibling.$dataId() ? sibling : $noop;
	}
	#updateChanConnections() {
		const selId = this.#chanSelected;

		if ( selId ) {
			const chan = this.$getChannel( selId );
			const chanDest = chan.$getAttr( "data-dest" );
			let bOnce = false;

			this.$getChannel().$setAttr( chan => {
				const a = chan.dataset.id === chanDest;
				const b = chan.dataset.dest === selId;

				bOnce ||= b;
				return {
					connecta: a ? "up" : false,
					connectb: b ? "down" : false,
				};
			} );
			chan.$setAttr( {
				connecta: selId !== "0" ? "down" : false,
				connectb: bOnce ? "up" : false,
			} );
		}
	}
}

GSUdomDefine( "gsui-channels", gsuiChannels );
