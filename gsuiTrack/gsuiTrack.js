"use strict";

class gsuiTrack {
	constructor() {
		const root = gsuiTrack.template.cloneNode( true );

		this.rootElement = root;
		this.rowElement = root.querySelector( ".gsui-row" );
		this._inpName = root.querySelector( ".gsuiTrack-name" );
		this.data = new Proxy( Object.seal( {
			order: 0,
			name: "",
			toggle: true
		} ), { set: this._setProp.bind( this ) } );
		Object.seal( this );

		this.rowElement.remove();
		this.data.toggle = true;
	}

	remove() {
		this.rootElement.remove();
		this.rowElement.remove();
	}
	setPlaceholder( p ) {
		this._inpName.placeholder = p;
	}

	// private:
	_setProp( tar, prop, val ) {
		tar[ prop ] = val;
		if ( prop === "name" ) {
			this._inpName.value = val;
		} else if ( prop === "toggle" ) {
			this.rootElement.classList.toggle( "gsui-mute", !val );
			this.rowElement.classList.toggle( "gsui-mute", !val );
		}
		return true;
	}
}

gsuiTrack.template = document.querySelector( "#gsuiTrack-template" );
gsuiTrack.template.remove();
gsuiTrack.template.removeAttribute( "id" );
