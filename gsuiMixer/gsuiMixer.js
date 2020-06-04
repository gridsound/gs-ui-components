"use strict";

class gsuiMixer {
	constructor( opt ) {
		const root = gsuiMixer.template.cloneNode( true ),
			addBtn = root.querySelector( ".gsuiMixer-addChan" );

		this.rootElement = root;
		this._pmain = root.querySelector( ".gsuiMixer-panMain" );
		this._pchans = root.querySelector( ".gsuiMixer-panChannels" );
		this._chans = {};
		this._chanSelected = null;
		this.oninput = opt.oninput;
		this.onchange = opt.onchange;
		this.onselectChan = opt.onselectChan;
		this._analyserW =
		this._analyserH = 0;
		this._attached = false;
		Object.seal( this );

		addBtn.onclick = () => this.onchange( "addChannel" );
		new gsuiReorder( {
			rootElement: root,
			direction: "row",
			dataTransferType: "channel",
			itemSelector: ".gsuiMixerChannel",
			handleSelector: ".gsuiMixerChannel-grip",
			parentSelector: ".gsuiMixer-panChannels",
			onchange: elChan => {
				this.onchange( "reorderChannel", elChan.dataset.id,
					gsuiReorder.listComputeOrderChange( this._pchans, {} ) );
			},
		} );
	}

	// .........................................................................
	attached() {
		const pan = this._pchans;

		this._attached = true;
		pan.style.bottom = `${ pan.clientHeight - pan.offsetHeight }px`;
		Object.entries( this._chans ).forEach( ( [ id, html ] ) => {
			html.pan.attached();
			html.gain.attached();
		} );
		this.resized();
	}
	resized() {
		const chans = Object.values( this._chans );

		if ( chans.length ) {
			const { width, height } = chans[ 0 ].analyser.rootElement.getBoundingClientRect();

			this._analyserW = width;
			this._analyserH = height;
			chans.forEach( html => html.analyser.setResolution( width, height ) );
		}
	}
	updateAudioData( id, ldata, rdata ) {
		this._chans[ id ].analyser.draw( ldata, rdata );
	}
	getSelectedChannelId() {
		return this._chanSelected;
	}
	selectChannel( id ) {
		const chan = this._chans[ id ].root,
			pchan = this._chans[ this._chanSelected ];

		pchan && pchan.root.classList.remove( "gsuiMixer-selected" );
		chan.classList.add( "gsuiMixer-selected" );
		this._chanSelected = id;
		this._updateChanConnections();
		this.onselectChan( id );
	}

	// .........................................................................
	addChannel( id, chan ) {
		const root = gsuiMixer.channelTemplate.cloneNode( true ),
			qs = n => root.querySelector( `.gsuiMixerChannel-${ n }` ),
			pan = new gsuiSlider(),
			gain = new gsuiSlider(),
			canvas = qs( "analyser" ),
			html = { root, pan, gain,
				name: qs( "name" ),
				connectA: qs( "connectA" ),
				connectB: qs( "connectB" ),
				analyser: new gsuiAnalyser(),
			};

		this._chans[ id ] = html;
		root.dataset.id = id;
		qs( "pan" ).append( pan.rootElement );
		qs( "gain" ).append( gain.rootElement );
		html.analyser.setCanvas( canvas );
		pan.options( { min: -1, max: 1, step: .02, type: "circular", mousemoveSize: 800, strokeWidth: 3 } );
		gain.options( { min: 0, max: 1, step: .01, type: "linear-y", mousemoveSize: 400 } );
		pan.oninput = val => this.oninput( id, "pan", val );
		gain.oninput = val => this.oninput( id, "gain", val );
		pan.onchange = val => this.onchange( "changeChannel", id, "pan", val );
		gain.onchange = val => this.onchange( "changeChannel", id, "gain", val );
		canvas.onclick =
		qs( "nameWrap" ).onclick = this.selectChannel.bind( this, id );
		qs( "toggle" ).onclick = () => this.onchange( "toggleChannel", id );
		qs( "delete" ).onclick = () => this.onchange( "removeChannel", id );
		qs( "connect" ).onclick = () => this.onchange( "redirectToChannel", "channel", this._chanSelected, id );
		( id === "main" ? this._pmain : this._pchans ).append( root );
		if ( this._attached ) {
			pan.attached();
			gain.attached();
			if ( !this._analyserW ) {
				this.resized();
			}
			html.analyser.setResolution( this._analyserW, this._analyserH );
		}
		if ( this._chanSelected ) {
			this._updateChanConnections();
		} else if ( id === "main" ) {
			this.selectChannel( id );
		}
	}
	removeChannel( id ) {
		const el = this._chans[ id ].root;

		if ( id === this._chanSelected ) {
			const next = this._getNextChan( el, "nextElementSibling" );

			if ( next ) {
				this.selectChannel( next.dataset.id );
			} else {
				const prev = this._getNextChan( el, "previousElementSibling" );

				this.selectChannel( prev ? prev.dataset.id : "main" );
			}
		}
		delete this._chans[ id ];
		el.remove();
	}
	toggleChannel( id, b ) {
		this._chans[ id ].root.classList.toggle( "gsuiMixerChannel-muted", !b );
	}
	changePanChannel( id, val ) {
		this._chans[ id ].pan.setValue( val );
	}
	changeGainChannel( id, val ) {
		this._chans[ id ].gain.setValue( val );
	}
	renameChannel( id, name ) {
		this._chans[ id ].name.textContent = name;
	}
	reorderChannel( id, n ) {
		this._chans[ id ].root.dataset.order = n;
	}
	reorderChannels( channels ) {
		gsuiReorder.listReorder( this._pchans, channels );
	}
	redirectChannel( id, dest ) {
		this._chans[ id ].root.dataset.dest = dest;
		this._updateChanConnections();
	}

	// private:
	// .........................................................................
	_getNextChan( el, dir ) {
		const sibling = el[ dir ];

		return sibling && "id" in sibling.dataset ? sibling : null;
	}
	_updateChanConnections() {
		const selId = this._chanSelected;

		if ( selId ) {
			const html = this._chans[ selId ],
				chanDest = html.root.dataset.dest;
			let bOnce = false;

			Object.entries( this._chans ).forEach( ( [ id, html ] ) => {
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

gsuiMixer.template = document.querySelector( "#gsuiMixer-template" );
gsuiMixer.template.remove();
gsuiMixer.template.removeAttribute( "id" );

gsuiMixer.channelTemplate = document.querySelector( "#gsuiMixerChannel-template" );
gsuiMixer.channelTemplate.remove();
gsuiMixer.channelTemplate.removeAttribute( "id" );
