"use strict";

class gsuiChannels extends HTMLElement {
	#chans = {};
	#chanSelected = null;
	#analyserW = 10;
	#analyserH = 50;
	#attached = false;
	#onresizeBind = this.#onresize.bind( this );
	#children = GSUI.getTemplate( "gsui-channels" );
	#elements = GSUI.findElem( this.#children, {
		pmain: ".gsuiChannels-panMain",
		pchans: ".gsuiChannels-panChannels",
		addBtn: ".gsuiChannels-addChan",
	} );
	static #selectChanPopup = GSUI.getTemplate( "gsui-channels-selectPopup" );
	static #selectChanInput = gsuiChannels.#selectChanPopup.querySelector( "select" );

	constructor() {
		super();

		this.oninput =
		this.onchange =
		this.onselectChan = null;
		Object.seal( this );

		this.#elements.addBtn.onclick = () => this.onchange( "addChannel" );
		GSUI.listenEv( this, {
			gsuiChannel: {
				liveChange: ( d, chan ) => this.oninput( chan.dataset.id, ...d.args ),
				change: ( d, chan ) => this.onchange( "changeChannel", chan.dataset.id, ...d.args ),
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
				this.onchange( "reorderChannel", elChan.dataset.id,
					gsuiReorder.listComputeOrderChange( this.#elements.pchans, {} ) );
			},
		} );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( ...this.#children );
			this.#children = null;
		}
		this.#attached = true;
		GSUI.observeSizeOf( this, this.#onresizeBind );
	}
	disconnectedCallback() {
		this.#attached = false;
		GSUI.unobserveSizeOf( this, this.#onresizeBind );
	}

	// .........................................................................
	#onresize() {
		const chans = Object.values( this.#chans );

		if ( chans.length ) {
			const { width, height } = chans[ 0 ].analyser.getBoundingClientRect();

			this.#analyserW = width;
			this.#analyserH = height;
			chans.forEach( chan => chan.analyser.setResolution( width, height ) );
		}
	}
	updateAudioData( id, ldata, rdata ) {
		this.#chans[ id ].analyser.draw( ldata, rdata );
	}
	getSelectedChannelId() {
		return this.#chanSelected;
	}
	selectChannel( id ) {
		const chan = this.#chans[ id ];
		const pchan = this.#chans[ this.#chanSelected ];

		pchan && GSUI.setAttr( pchan, "selected", false );
		GSUI.setAttr( chan, "selected", true );
		this.#chanSelected = id;
		this.#updateChanConnections();
		this.onselectChan( id );
	}
	static openSelectChannelPopup( currChanId ) {
		return new Promise( res => {
			gsuiChannels.#selectChanInput.value = currChanId;
			GSUI.popup.custom( {
				title: "Channels",
				element: gsuiChannels.#selectChanPopup,
				submit( data ) {
					res( data.channel !== currChanId ? data.channel : null );
				}
			} );
		} );
	}

	// .........................................................................
	addChannel( id ) {
		const chan = GSUI.createElem( "gsui-channel", { "data-id": id } );
		const qs = n => chan.querySelector( `.gsuiChannel-${ n }` );

		( id === "main" ? this.#elements.pmain : this.#elements.pchans ).append( chan );
		gsuiChannels.#selectChanInput.append( GSUI.createElem( "option", { value: id }, name ) );
		this.#chans[ id ] = chan;
		chan.analyser.onclick =
		qs( "nameWrap" ).onclick = this.selectChannel.bind( this, id );
		qs( "toggle" ).onclick = () => this.onchange( "toggleChannel", id );
		qs( "delete" ).onclick = () => this.onchange( "removeChannel", id );
		qs( "connect" ).onclick = () => this.onchange( "redirectChannel", this.#chanSelected, id );
		chan.analyser.setResolution( this.#analyserW, this.#analyserH );
		if ( this.#chanSelected ) {
			this.#updateChanConnections();
		} else if ( id === "main" ) {
			this.selectChannel( id );
		}
	}
	removeChannel( id ) {
		const chan = this.#chans[ id ];

		if ( id === this.#chanSelected ) {
			const next = this.#getNextChan( chan, "nextElementSibling" );

			if ( next ) {
				this.selectChannel( next.dataset.id );
			} else {
				const prev = this.#getNextChan( chan, "previousElementSibling" );

				this.selectChannel( prev ? prev.dataset.id : "main" );
			}
		}
		delete this.#chans[ id ];
		chan.remove();
		gsuiChannels.#selectChanInput.querySelector( `option[value="${ id }"]` ).remove();
	}
	toggleChannel( id, b ) {
		GSUI.setAttr( this.#chans[ id ], "muted", !b );
	}
	changePanChannel( id, val ) {
		GSUI.setAttr( this.#chans[ id ], "pan", val );
	}
	changeGainChannel( id, val ) {
		GSUI.setAttr( this.#chans[ id ], "gain", val );
	}
	renameChannel( id, name ) {
		GSUI.setAttr( this.#chans[ id ], "name", name );
		gsuiChannels.#selectChanInput.querySelector( `option[value="${ id }"]` ).textContent = name;
	}
	reorderChannel( id, n ) {
		this.#chans[ id ].dataset.order = n;
	}
	reorderChannels( channels ) {
		gsuiReorder.listReorder( this.#elements.pchans, channels );
	}
	redirectChannel( id, dest ) {
		this.#chans[ id ].dataset.dest = dest;
		this.#updateChanConnections();
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

				GSUI.setAttr( chan, "connecta", a ? "up" : "" );
				GSUI.setAttr( chan, "connectb", b ? "down" : "" );
				bOnce = bOnce || b;
			} );
			GSUI.setAttr( chan, "connecta", selId !== "main" ? "down" : "" );
			GSUI.setAttr( chan, "connectb", bOnce ? "up" : "" );
		}
	}
}

Object.freeze( gsuiChannels );
customElements.define( "gsui-channels", gsuiChannels );
