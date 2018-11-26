"use strict";

class gsuiMixer {
	constructor() {
		const root = gsuiMixer.template.cloneNode( true ),
			panMaster = root.querySelector( ".gsuiMixer-panMaster" ),
			panEffects = root.querySelector( ".gsuiMixer-panEffects" ),
			panChannels = root.querySelector( ".gsuiMixer-panChannels" );

		this.rootElement = root;
		this._channels = [];
		this._panMaster = panMaster;
		this._panEffects = panEffects;
		this._panChannels = panChannels;
		for ( let i = 0; i < 10; ++i ) {
			this._createChannel();
		}
	}

	attached() {
		const pan = this._panChannels;

		pan.style.marginBottom = pan.clientHeight - pan.offsetHeight + "px";
	}

	_createChannel() {
		const chan = gsuiMixer.channelTemplate.cloneNode( true ),
			len = this._channels.push( chan ),
			par = len > 1 ? this._panChannels : this._panMaster;

		par.append( chan );
		if ( len > 1 ) { // tmp
			chan.querySelector( ".gsuiMixerChannel-name" ).textContent = `chan #${ len }`;
		}
		return chan;
	}
}

gsuiMixer.template = document.querySelector( "#gsuiMixer-template" );
gsuiMixer.template.remove();
gsuiMixer.template.removeAttribute( "id" );

gsuiMixer.channelTemplate = document.querySelector( "#gsuiMixerChannel-template" );
gsuiMixer.channelTemplate.remove();
gsuiMixer.channelTemplate.removeAttribute( "id" );
