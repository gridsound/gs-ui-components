"use strict";

class gsuiMixer extends HTMLElement {
	#chans = {}
	#chanSelected = null
	#analyserW = 0
	#analyserH = 0
	#attached = false
	#children = GSUI.getTemplate( "gsui-mixer" )
	#elements = GSUI.findElements( this.#children, {
		pmain: ".gsuiMixer-panMain",
		pchans: ".gsuiMixer-panChannels",
		addBtn: ".gsuiMixer-addChan",
	} )

	constructor() {
		super();

		this.oninput =
		this.onchange =
		this.onselectChan = null;
		Object.seal( this );

		this.#elements.addBtn.onclick = () => this.onchange( "addChannel" );
		new gsuiReorder( {
			rootElement: this,
			direction: "row",
			dataTransferType: "channel",
			itemSelector: ".gsuiMixerChannel",
			handleSelector: ".gsuiMixerChannel-grip",
			parentSelector: ".gsuiMixer-panChannels",
			onchange: elChan => {
				this.onchange( "reorderChannel", elChan.dataset.id,
					gsuiReorder.listComputeOrderChange( this.#elements.pchans, {} ) );
			},
		} );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			const pan = this.#elements.pchans;

			this.classList.add( "gsuiMixer" );
			this.append( ...this.#children );
			this.#children = null;
			pan.style.bottom = `${ pan.clientHeight - pan.offsetHeight }px`;
		}
		this.resized();
		this.#attached = true;
	}
	disconnectedCallback() {
		this.#attached = false;
	}

	// .........................................................................
	resized() {
		const chans = Object.values( this.#chans );

		if ( chans.length ) {
			const { width, height } = chans[ 0 ].analyser.getBoundingClientRect();

			this.#analyserW = width;
			this.#analyserH = height;
			chans.forEach( html => html.analyser.setResolution( width, height ) );
		}
	}
	updateAudioData( id, ldata, rdata ) {
		this.#chans[ id ].analyser.draw( ldata, rdata );
	}
	getSelectedChannelId() {
		return this.#chanSelected;
	}
	selectChannel( id ) {
		const chan = this.#chans[ id ].root,
			pchan = this.#chans[ this.#chanSelected ];

		pchan && pchan.root.classList.remove( "gsuiMixer-selected" );
		chan.classList.add( "gsuiMixer-selected" );
		this.#chanSelected = id;
		this.#updateChanConnections();
		this.onselectChan( id );
	}

	// .........................................................................
	addChannel( id, chan ) {
		const root = GSUI.getTemplate( "gsui-mixer-channel" ),
			qs = n => root.querySelector( `.gsuiMixerChannel-${ n }` ),
			pan = qs( "pan gsui-slider" ),
			gain = qs( "gain gsui-slider" ),
			html = { root, pan, gain,
				name: qs( "name" ),
				connectA: qs( "connectA" ),
				connectB: qs( "connectB" ),
				analyser: qs( "analyser" ),
			};

		this.#chans[ id ] = html;
		root.dataset.id = id;
		pan.oninput = val => this.oninput( id, "pan", val );
		gain.oninput = val => this.oninput( id, "gain", val );
		pan.onchange = val => this.onchange( "changeChannel", id, "pan", val );
		gain.onchange = val => this.onchange( "changeChannel", id, "gain", val );
		html.analyser.onclick =
		qs( "nameWrap" ).onclick = this.selectChannel.bind( this, id );
		qs( "toggle" ).onclick = () => this.onchange( "toggleChannel", id );
		qs( "delete" ).onclick = () => this.onchange( "removeChannel", id );
		qs( "connect" ).onclick = () => this.onchange( "redirectChannel", this.#chanSelected, id );
		( id === "main" ? this.#elements.pmain : this.#elements.pchans ).append( root );
		if ( this.#attached ) {
			if ( !this.#analyserW ) {
				this.resized();
			}
			html.analyser.setResolution( this.#analyserW, this.#analyserH );
		}
		if ( this.#chanSelected ) {
			this.#updateChanConnections();
		} else if ( id === "main" ) {
			this.selectChannel( id );
		}
	}
	removeChannel( id ) {
		const el = this.#chans[ id ].root;

		if ( id === this.#chanSelected ) {
			const next = this.#getNextChan( el, "nextElementSibling" );

			if ( next ) {
				this.selectChannel( next.dataset.id );
			} else {
				const prev = this.#getNextChan( el, "previousElementSibling" );

				this.selectChannel( prev ? prev.dataset.id : "main" );
			}
		}
		delete this.#chans[ id ];
		el.remove();
	}
	toggleChannel( id, b ) {
		this.#chans[ id ].root.classList.toggle( "gsuiMixerChannel-muted", !b );
	}
	changePanChannel( id, val ) {
		this.#chans[ id ].pan.setValue( val );
	}
	changeGainChannel( id, val ) {
		this.#chans[ id ].gain.setValue( val );
	}
	renameChannel( id, name ) {
		this.#chans[ id ].name.textContent = name;
	}
	reorderChannel( id, n ) {
		this.#chans[ id ].root.dataset.order = n;
	}
	reorderChannels( channels ) {
		gsuiReorder.listReorder( this.#elements.pchans, channels );
	}
	redirectChannel( id, dest ) {
		this.#chans[ id ].root.dataset.dest = dest;
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
			const html = this.#chans[ selId ],
				chanDest = html.root.dataset.dest;
			let bOnce = false;

			Object.entries( this.#chans ).forEach( ( [ id, html ] ) => {
				const a = id === chanDest,
					b = html.root.dataset.dest === selId;

				html.connectA.dataset.icon = a ? "caret-up" : "";
				html.connectB.dataset.icon = b ? "caret-down" : "";
				bOnce = bOnce || b;
			} );
			html.connectA.dataset.icon = selId !== "main" ? "caret-down" : "";
			html.connectB.dataset.icon = bOnce ? "caret-up" : "";
		}
	}
}

Object.freeze( gsuiMixer );

customElements.define( "gsui-mixer", gsuiMixer );
