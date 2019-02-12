"use strict";

class gsuiMixer {
	constructor() {
		const root = gsuiMixer.template.cloneNode( true );

		this.rootElement = root;
		this._pmain = root.querySelector( ".gsuiMixer-panMain" );
		this._peffects = root.querySelector( ".gsuiMixer-panEffects" );
		this._pchannels = root.querySelector( ".gsuiMixer-panChannels" );
		this._channels = {};
		this._chanSelected = null;
		this.data = this._proxInit();
		this.data[ "main" ] = {
			id: "main",
			toggle: true,
			gain: .8,
			pan: 0,
			name: "",
			effects: {},
		};
	}

	attached() {
		const pan = this._pchannels;

		pan.style.marginBottom = pan.clientHeight - pan.offsetHeight + "px";
		Object.values( this._channels ).forEach( html => {
			html.pan.attached();
			html.gain.attached();
		} );
	}

	// private:
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
			gain = new gsuiSlider();

		this._channels[ id ] = {
			root,
			pan,
			gain,
			name: root.querySelector( ".gsuiMixerChannel-name" ),
			toggle: root.querySelector( ".gsuiMixerChannel-toggle" ),
		};
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
		root.onclick = this._selectChan.bind( this, id );
		( this._pmain.firstElementChild
			? this._pchannels
			: this._pmain ).append( root );
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
	}
	_updateChan( id, prop, val ) {
		const el = this._channels[ id ];

		switch ( prop ) {
			case "name":
				el.name.textContent = val;
				break;
			case "toggle":
				el.root.classList.toggle( "gsuiMixerChannel-muted", !val );
				break;
			case "gain":
				el.gain.setValue( val );
				break;
			case "pan":
				el.pan.setValue( val );
				break;
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
		const chan = new Proxy( Object.seal( {
				id,
				pan: 0,
				gain: 0,
				name: "",
				toggle: true,
				connectedTo: "main",
				effects: new Proxy( {}, {
					set: this._proxAddEffect.bind( this, id ),
					deleteProperty: this._proxDeleteEffect.bind( this, id ),
				} ),
			} ), {
				set: this._proxUpdateChan.bind( this, id ),
			} );

		tar[ id ] = chan;
		this._addChan( id, chan );
		chan.pan = obj.pan;
		chan.gain = obj.gain;
		chan.name = obj.name;
		chan.toggle = obj.toggle;
		chan.connectedTo = obj.connectedTo;
		Object.entries( obj.effects ).forEach( kv => {
			chan.effects[ kv[ 0 ] ] = Object.assign( {}, kv[ 1 ] );
		} );
		return true;
	}
	_proxUpdateChan( id, tar, prop, val ) {
		tar[ prop ] = val;
		this._updateChan( id, prop, val );
		return true;
	}
	_proxAddEffect( chanId, tar, id, obj ) {
		tar[ id ] = Object.assign( {}, obj );
		return true;
	}
	_proxDeleteEffect( chanId, tar, id ) {
		delete tar[ id ];
		return true;
	}
}

gsuiMixer.template = document.querySelector( "#gsuiMixer-template" );
gsuiMixer.template.remove();
gsuiMixer.template.removeAttribute( "id" );

gsuiMixer.channelTemplate = document.querySelector( "#gsuiMixerChannel-template" );
gsuiMixer.channelTemplate.remove();
gsuiMixer.channelTemplate.removeAttribute( "id" );
