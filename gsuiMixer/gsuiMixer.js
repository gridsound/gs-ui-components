"use strict";

class gsuiMixer {
	constructor() {
		const root = gsuiMixer.template.cloneNode( true ),
			addBtn = root.querySelector( ".gsuiMixer-addChan" ),
			dnd = new gsuiReorder(),
			gsdata = new GSDataMixer( {
				actionCallback: ( obj, msg ) => this.onchange( obj, msg ),
				dataCallbacks: {
					addChan: this._addChan.bind( this ),
					removeChan: this._removeChan.bind( this ),
					redirectChan: this._updateChanConnections.bind( this ),
					toggleChan: ( id, b ) => this._chans[ id ].root.classList.toggle( "gsuiMixerChannel-muted", !b ),
					changePanChan: ( id, val ) => this._chans[ id ].pan.setValue( val ),
					changeGainChan: ( id, val ) => this._chans[ id ].gain.setValue( val ),
					changeOrderChan: ( id, val ) => this._chans[ id ].root.dataset.order = val,
					renameChan: ( id, val ) => {
						this._chans[ id ].name.textContent = val;
						this.onupdateChan( id, "name", val );
					},
				},
			} );

		this.rootElement = root;
		this.gsdata = gsdata;
		this._pmain = root.querySelector( ".gsuiMixer-panMain" );
		this._pchans = root.querySelector( ".gsuiMixer-panChannels" );
		this._chans = {};
		this._chanSelected = null;
		this.oninput =
		this.onchange =
		this.onaddChan =
		this.ondeleteChan =
		this.onupdateChan =
		this.onselectChan = GSData.noop;
		this._analyserH = 10;
		this._attached = false;
		Object.seal( this );

		addBtn.onclick = gsdata.callAction.bind( gsdata, "addChan" );
		dnd.setDirection( "h" );
		dnd.setRootElement( root );
		dnd.setSelectors( {
			item: ".gsuiMixerChannel",
			handle: ".gsuiMixerChannel-grip",
			parent: ".gsuiMixer-panChannels",
		} );
		dnd.onchange = elChan => {
			const obj = gsuiReorder.listComputeOrderChange( this._pchans, {} ),
				chanName = this.gsdata.data[ elChan.dataset.id ].name;

			this.onchange( obj, [ "mixer", "reorderChan", chanName ] );
		};
		this.empty();
		this.selectChan( "main" );
	}

	attached() {
		const pan = this._pchans;

		this._attached = true;
		pan.style.bottom = `${ pan.clientHeight - pan.offsetHeight }px`;
		Object.entries( this.gsdata.data ).forEach( ( [ id, obj ] ) => {
			const html = this._chans[ id ];

			html.pan.attached();
			html.gain.attached();
			this.onaddChan( id, obj );
		} );
		this.resized();
	}
	resized() {
		const chans = Object.values( this._chans ),
			h = chans[ 0 ].analyser.rootElement.getBoundingClientRect().height;

		this._analyserH = h;
		chans.forEach( html => html.analyser.setResolution( h ) );
	}
	updateAudioData( id, ldata, rdata ) {
		this._chans[ id ].analyser.draw( ldata, rdata );
	}
	empty() {
		this.gsdata.clear();
		this.gsdata.change( {
			main: {
				toggle: true,
				name: "main",
				gain: 1,
				pan: 0,
			},
		} );
		this.selectChan( "main" );
	}
	change( obj ) {
		this.gsdata.change( obj );
		gsuiReorder.listReorder( this._pchans, obj );
	}
	selectChan( id ) {
		if ( id in this.gsdata.data ) {
			const chan = this._chans[ id ].root,
				pchan = this._chans[ this._chanSelected ];

			pchan && pchan.root.classList.remove( "gsuiMixer-selected" );
			chan.classList.add( "gsuiMixer-selected" );
			this._chanSelected = id;
			this._updateChanConnections();
			this.onselectChan( id );
		}
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
			const chanDest = this.gsdata.data[ selId ].dest,
				html = this._chans[ selId ];
			let bOnce = false;

			Object.entries( this.gsdata.data ).forEach( ( [ id, chan ] ) => {
				const html = this._chans[ id ],
					a = id === chanDest,
					b = chan.dest === selId;

				html.connectA.dataset.icon = a ? "caret-up" : "";
				html.connectB.dataset.icon = b ? "caret-down" : "";
				bOnce = bOnce || b;
			} );
			html.connectA.dataset.icon = selId !== "main" ? "caret-down" : "";
			html.connectB.dataset.icon = bOnce ? "caret-up" : "";
		}
	}
	_addChan( id, chan ) {
		const root = gsuiMixer.channelTemplate.cloneNode( true ),
			qs = n => root.querySelector( `.gsuiMixerChannel-${ n }` ),
			pan = new gsuiSlider(),
			gain = new gsuiSlider(),
			canvas = qs( "analyser" ),
			call = this.gsdata.callAction,
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
		pan.options( { min: -1, max: 1, step: .001, type: "circular", strokeWidth: 3 } );
		gain.options( { min: 0, max: 1, step: .001, type: "linear-y" } );
		pan.oninput = this.oninput.bind( null, id, "pan" );
		gain.oninput = this.oninput.bind( null, id, "gain" );
		pan.onchange = call.bind( this.gsdata, "updateChanProp", id, "pan" );
		gain.onchange = call.bind( this.gsdata, "updateChanProp", id, "gain" );
		canvas.onclick =
		qs( "nameWrap" ).onclick = this.selectChan.bind( this, id );
		qs( "toggle" ).onclick = call.bind( this.gsdata, "toggleChan", id );
		qs( "delete" ).onclick = call.bind( this.gsdata, "removeChan", id );
		qs( "connect" ).onclick = () => this.gsdata.callAction( "redirectChan", this._chanSelected, id );
		( id === "main" ? this._pmain : this._pchans ).append( root );
		if ( this._attached ) {
			pan.attached();
			gain.attached();
			html.analyser.setResolution( this._analyserH );
		}
		this.onaddChan( id, chan );
		this._updateChanConnections();
	}
	_removeChan( id ) {
		const el = this._chans[ id ].root;

		if ( id === this._chanSelected ) {
			const next = this._getNextChan( el, "nextElementSibling" );

			if ( next ) {
				this.selectChan( next.dataset.id );
			} else {
				const prev = this._getNextChan( el, "previousElementSibling" );

				this.selectChan( prev ? prev.dataset.id : "main" );
			}
		}
		this.ondeleteChan( id );
		delete this._chans[ id ];
		el.remove();
	}
}

gsuiMixer.template = document.querySelector( "#gsuiMixer-template" );
gsuiMixer.template.remove();
gsuiMixer.template.removeAttribute( "id" );

gsuiMixer.channelTemplate = document.querySelector( "#gsuiMixerChannel-template" );
gsuiMixer.channelTemplate.remove();
gsuiMixer.channelTemplate.removeAttribute( "id" );
