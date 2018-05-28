"use strict";

class gsuiTrack {
	constructor() {
		const root = gsuiTrack.template.cloneNode( true );

		this.rootElement = root;
		this.rowElement = root.querySelector( ".gsui-row" );
		this.rowElement.remove();
		this.uiToggle = new gsuiToggle();
		this.uiSpan = new gsuiSpanEditable();
		root.append( this.uiToggle.rootElement, this.uiSpan.rootElement );

		this.onchange = () => {};
		this.uiSpan.onchange = name => {
			this.data.name = name;
			this.onchange( { name } );
		};
		this.uiToggle.onchange = toggle => {
			this.data.toggle = toggle;
			this.onchange( { toggle } );
		};
		this.data = new Proxy( Object.seal( {
			order: 0,
			name: "",
			toggle: true
		} ), { set: this._setProp.bind( this ) } );
		this.data.toggle = true;
	}

	remove() {
		this.rootElement.remove();
		this.rowElement.remove();
	}
	setPlaceholder( p ) {
		this.uiSpan.setPlaceholder( p );
	}

	// private:
	_setProp( tar, prop, val ) {
		tar[ prop ] = val;
		switch ( prop ) {
			case "name": this._setName( val ); break;
			case "toggle": this._setToggle( val ); break;
		}
		return true;
	}
	_setName( name ) {
		this.uiSpan.setValue( name );
	}
	_setToggle( b ) {
		this.rootElement.classList.toggle( "gsui-mute", !b );
		this.rowElement.classList.toggle( "gsui-mute", !b );
		this.uiToggle.toggle( b );
	}
}

gsuiTrack.template = document.querySelector( "#gsuiTrack-template" );
gsuiTrack.template.remove();
gsuiTrack.template.removeAttribute( "id" );
