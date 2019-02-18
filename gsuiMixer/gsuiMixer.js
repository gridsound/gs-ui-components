"use strict";

class gsuiMixer {
	constructor() {
		const root = gsuiMixer.template.cloneNode( true );

		this.rootElement = root;
		this._pmain = root.querySelector( ".gsuiMixer-panMain" );
		this._pchannels = root.querySelector( ".gsuiMixer-panChannels" );
		this._channels = {};
		this._chanSelected = null;
		this.data = this._proxInit();
		this.data[ "main" ] = {
			toggle: true,
			gain: 1,
			pan: 0,
			name: "",
		};
		this._selectChan( "main" );
	}

	attached() {
		const pan = this._pchannels;

		this._attached = true;
		pan.style.marginBottom = pan.clientHeight - pan.offsetHeight + "px";
		Object.values( this._channels ).forEach( html => {
			html.pan.attached();
			html.gain.attached();
		} );
	}

	// private:
	_onchange( chanId, prop, val ) {
		if ( this.onchange ) {
			this.onchange( { [ chanId ]: { [ prop ]: val } } );
		}
	}
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
			pan = new gsuiSlider(),
			gain = new gsuiSlider(),
			nameWrap = root.querySelector( ".gsuiMixerChannel-nameWrap" ),
			name = root.querySelector( ".gsuiMixerChannel-name" ),
			toggle = root.querySelector( ".gsuiMixerChannel-toggle" ),
			connect = root.querySelector( ".gsuiMixerChannel-connect" ),
			canvas = root.querySelector( ".gsuiMixerChannel-analyser" ),
			html = { root, pan, gain, toggle, name, connect };

		this._channels[ id ] = html;
		root.dataset.id = id;
		root.querySelector( ".gsuiMixerChannel-pan" ).append( pan.rootElement );
		root.querySelector( ".gsuiMixerChannel-gain" ).append( gain.rootElement );
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
		pan.onchange = this._onchange.bind( this, id, "pan" );
		gain.onchange = this._onchange.bind( this, id, "gain" );
		canvas.onclick =
		nameWrap.onclick = this._selectChan.bind( this, id );
		toggle.onclick = this._toggleChan.bind( this, id );
		connect.onclick = this._setChanDest.bind( this, id );
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

			next && this._selectChan( next.dataset.id );
		}
		el.remove();
	}
	_selectChan( id ) {
		const chan = this._channels[ id ].root,
			pchan = this._channels[ this._chanSelected ];

		pchan && pchan.root.classList.remove( "gsuiMixer-selected" );
		chan.classList.add( "gsuiMixer-selected" );
		this._chanSelected = id;
		this._updateChanConnections();
	}
	_toggleChan( id ) {
		const chan = this.data[ id ],
			t = !chan.toggle;

		chan.toggle = t;
		this._onchange( id, "toggle", t );
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
			case "toggle": el.root.classList.toggle( "gsuiMixerChannel-muted", !val ); break;
			case "dest": this._updateChanConnections(); break;
		}
	}

	// proxy:
	_proxInit() {
		return new Proxy( {}, {
			set: this._proxAddChan.bind( this ),
			deleteProperty: this._proxDeleteChan.bind( this ),
		} );
	}
	_proxAddChan( tar, prop, val ) {
		this._proxDeleteChan( tar, prop );
		return this.__proxAddChan( tar, prop, val );
	}
	_proxDeleteChan( tar, prop ) {
		if ( prop in tar ) {
			this._deleteChan( prop );
			delete tar[ prop ];
		}
		return true;
	}
	__proxAddChan( tar, id, obj ) {
		const tarchan = {
				id,
				pan: 0,
				gain: 0,
				name: "",
				toggle: true,
			},
			_ = id !== "main" ? ( tarchan.dest = "main" ) : null,
			updateChan = this._proxUpdateChan.bind( this, id ),
			chan = new Proxy( Object.seal( tarchan ), { set: updateChan } );

		tar[ id ] = chan;
		this._addChan( id, chan );
		chan.pan = obj.pan;
		chan.gain = obj.gain;
		chan.name = obj.name;
		chan.toggle = obj.toggle;
		if ( obj.dest ) {
			chan.dest = obj.dest;
		}
		return true;
	}
	_proxUpdateChan( id, tar, prop, val ) {
		tar[ prop ] = val;
		this._updateChan( id, prop, val );
		return true;
	}
}

gsuiMixer.template = document.querySelector( "#gsuiMixer-template" );
gsuiMixer.template.remove();
gsuiMixer.template.removeAttribute( "id" );

gsuiMixer.channelTemplate = document.querySelector( "#gsuiMixerChannel-template" );
gsuiMixer.channelTemplate.remove();
gsuiMixer.channelTemplate.removeAttribute( "id" );
