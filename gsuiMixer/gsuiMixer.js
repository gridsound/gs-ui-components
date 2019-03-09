"use strict";

class gsuiMixer {
	constructor() {
		const root = gsuiMixer.template.cloneNode( true ),
			addBtn = root.querySelector( ".gsuiMixer-panAdd" );

		this.rootElement = root;
		this._pmain = root.querySelector( ".gsuiMixer-panMain" );
		this._pchannels = root.querySelector( ".gsuiMixer-panChannels" );
		this._channels = {};
		this._chanSelected = null;
		this.oninput =
		this.onchange =
		this.onaddChan =
		this.ondeleteChan =
		this.onupdateChan =
		this.onselectChan = () => {};
		this._maxId =
		this._maxOrder = 0;
		this.data = this._proxInit();
		this.data.main = {
			order: 0,
			toggle: true,
			name: "",
			gain: 1,
			pan: 0,
		};
		addBtn.onclick = this._onclickAddChan.bind( this );
		this._onclickSelectChan( "main" );
	}

	attached() {
		const pan = this._pchannels;

		this._attached = true;
		pan.style.marginBottom = pan.clientHeight - pan.offsetHeight + "px";
		Object.entries( this.data ).forEach( ( [ id, obj ] ) => {
			const html = this._channels[ id ];

			html.pan.attached();
			html.gain.attached();
			this.onaddChan( id, obj );
		} );
	}
	updateAudioData( id, ldata, rdata ) {
		this._channels[ id ].analyser.draw( ldata, rdata );
	}

	// events:
	_oninput( id, prop, val ) {
		this.oninput( id, prop, val );
	}
	_onchange( id, prop, val ) {
		this.data[ id ][ prop ] = val;
		this.onchange( { [ id ]: { [ prop ]: val } } );
	}
	_onclickToggleChan( id ) {
		this._onchange( id, "toggle", !this.data[ id ].toggle );
	}
	_onclickAddChan() {
		const id = this._maxId + 1,
			obj = {
				dest: "main",
				toggle: true,
				order: this._maxOrder + 1,
				name: `chan ${ this._pchannels.children.length }`,
				gain: 1,
				pan: 0,
			};

		this.data[ id ] = obj;
		this.onchange( { [ id ]: obj } );
	}
	_onclickDeleteChan( id ) {
		delete this.data[ id ];
		this.onchange( { [ id ]: undefined } );
	}
	_onclickSelectChan( id ) {
		const chan = this._channels[ id ].root,
			pchan = this._channels[ this._chanSelected ];

		pchan && pchan.root.classList.remove( "gsuiMixer-selected" );
		chan.classList.add( "gsuiMixer-selected" );
		this._chanSelected = id;
		this._updateChanConnections();
		this.onselectChan( id );
	}

	// private:
	_updateChanConnections() {
		const selId = this._chanSelected;

		if ( selId ) {
			const data = this.data,
				chanDest = data[ selId ].dest,
				chan = this._channels[ selId ];
			let rdOnce = false;

			Object.values( this._channels ).forEach( html => {
				const conn = html.connect.classList,
					id = html.root.dataset.id,
					lu = id === chanDest,
					rd = data[ id ].dest === selId;

				conn.remove(
					"gsuiMixerChannel-leftdown",
					"gsuiMixerChannel-rightup" );
				conn.toggle( "gsuiMixerChannel-leftup", lu );
				conn.toggle( "gsuiMixerChannel-rightdown", rd );
				rdOnce = rdOnce || rd;
			} );
			chan.connect.classList.toggle( "gsuiMixerChannel-leftdown", selId !== "main" );
			chan.connect.classList.toggle( "gsuiMixerChannel-rightup", rdOnce );
		}
	}
	_getChan( id ) {
		return Array.from( this._channels ).find( chan => {
			if ( chan.dataset.id === id ) {
				return true;
			}
		} );
	}
	_addChan( id, obj ) {
		const root = gsuiMixer.channelTemplate.cloneNode( true ),
			qs = n => root.querySelector( `.gsuiMixerChannel-${ n }` ),
			pan = new gsuiSlider(),
			gain = new gsuiSlider(),
			canvas = qs( "analyser" ),
			html = { root, pan, gain,
				name: qs( "name" ),
				connect: qs( "connect" ),
				analyser: new gsuiAnalyser(),
			};

		this._channels[ id ] = html;
		root.dataset.id = id;
		qs( "pan" ).append( pan.rootElement );
		qs( "gain" ).append( gain.rootElement );
		html.analyser.setCanvas( canvas );
		html.analyser.setResolution( 32, 224 );
		pan.options( {
			max: 1,
			min: -1,
			step: .001,
			type: "circular",
			strokeWidth: 3,
		} );
		gain.options( {
			max: 1,
			min: 0,
			step: .001,
			type: "linear-y",
		} );
		pan.oninput = this._oninput.bind( this, id, "pan" );
		gain.oninput = this._oninput.bind( this, id, "gain" );
		pan.onchange = this._onchange.bind( this, id, "pan" );
		gain.onchange = this._onchange.bind( this, id, "gain" );
		canvas.onclick =
		qs( "nameWrap" ).onclick = this._onclickSelectChan.bind( this, id );
		qs( "toggle" ).onclick = this._onclickToggleChan.bind( this, id );
		qs( "delete" ).onclick = this._onclickDeleteChan.bind( this, id );
		html.connect.onclick = this._setChanDest.bind( this, id );
		( this._pmain.firstElementChild
			? this._pchannels
			: this._pmain ).append( root );
		if ( this._attached ) {
			pan.attached();
			gain.attached();
		}
		this._updateChanConnections();
	}
	_deleteChan( id ) {
		const el = this._channels[ id ].root;

		if ( id === this._chanSelected ) {
			const next = el.nextElementSibling
					|| el.previousElementSibling
					|| this._pmain.firstElementChild;

			next && this._onclickSelectChan( next.dataset.id );
		}
		delete this._channels[ id ];
		el.remove();
	}
	_setChanDest( destId ) {
		const id = this._chanSelected;

		if ( id !== "main" &&
			id !== destId &&
			this.data[ id ].dest !== destId
		) {
			this._onchange( id, "dest", destId );
			this._updateChanConnections();
		}
	}
	_updateChan( id, prop, val ) {
		const el = this._channels[ id ];

		switch ( prop ) {
			case "pan": el.pan.setValue( val ); break;
			case "gain": el.gain.setValue( val ); break;
			case "name": el.name.textContent = val; break;
			case "dest": this._updateChanConnections(); break;
			case "toggle": el.root.classList.toggle( "gsuiMixerChannel-muted", !val ); break;
		}
	}

	// proxy:
	_proxInit() {
		return new Proxy( {}, {
			set: this._proxAddChan.bind( this ),
			deleteProperty: this._proxDeleteChan.bind( this ),
		} );
	}
	_proxAddChan( tar, id, obj ) {
		this._proxDeleteChan( tar, id );
		return this.__proxAddChan( tar, id, obj );
	}
	_proxDeleteChan( tar, id ) {
		if ( id in tar ) {
			delete tar[ id ];
			this._deleteChan( id );
			this.ondeleteChan( id );
		}
		return true;
	}
	__proxAddChan( tar, id, obj ) {
		const tarchan = {
				toggle: true,
				order: 0,
				name: "",
				gain: 0,
				pan: 0,
			},
			_ = id !== "main" ? ( tarchan.dest = "main" ) : null,
			updateChan = this._proxUpdateChan.bind( this, id ),
			chan = new Proxy( Object.seal( tarchan ), { set: updateChan } );

		tar[ id ] = chan;
		this._maxId = Math.max( this._maxId, id ) || 0; // 1.
		this._maxOrder = Math.max( this._maxOrder, obj.order );
		this._addChan( id, chan );
		this.onaddChan( id, chan );
		chan.pan = obj.pan;
		chan.gain = obj.gain;
		chan.name = obj.name;
		chan.toggle = obj.toggle;
		chan.order = obj.order;
		if ( obj.dest ) {
			chan.dest = obj.dest;
		}
		return true;
	}
	_proxUpdateChan( id, tar, prop, val ) {
		tar[ prop ] = val;
		this._updateChan( id, prop, val );
		this.onupdateChan( id, prop, val );
		return true;
	}
}

gsuiMixer.template = document.querySelector( "#gsuiMixer-template" );
gsuiMixer.template.remove();
gsuiMixer.template.removeAttribute( "id" );

gsuiMixer.channelTemplate = document.querySelector( "#gsuiMixerChannel-template" );
gsuiMixer.channelTemplate.remove();
gsuiMixer.channelTemplate.removeAttribute( "id" );

/*
1.	Why `|| 0` after Math.max ?
	Because the ID of the main channel is "main".
*/
