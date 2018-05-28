"use strict";

class gsuiTrack {
	constructor() {
		const root = gsuiTrack.template.cloneNode( true );

		this.onchange =
		this.onrightclickToggle = () => {};
		this.rootElement = root;
		this.rowElement = root.querySelector( ".gsui-row" );
		this._inpName = root.querySelector( ".gsuiTrack-name" );
		this._nameReadonly = true;

		this.rowElement.remove();
		this._setToggleEvents( root.querySelector( ".gsuiTrack-toggle" ) );
		this._setNameEvents( this._inpName );
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
	_setToggleEvents( el ) {
		el.oncontextmenu = () => false;
		el.onmousedown = e => {
			if ( e.button === 2 ) {
				this.onrightclickToggle();
			} else if ( e.button === 0 ) {
				this.onchange( { toggle:
					this.data.toggle = !this.data.toggle
				} );
			}
		};
	}
	_setNameEvents( inp ) {
		inp.ondblclick = e => {
			this._nameReadonly = false;
			inp.select();
			inp.focus();
		};
		inp.onfocus = e => {
			if ( this._nameReadonly ) {
				inp.blur();
			}
		};
		inp.onkeydown = e => {
			e.stopPropagation();
			if ( e.key === "Escape" ) {
				inp.value = this.data.name;
				inp.blur();
			} else if ( e.key === "Enter" ) {
				inp.blur();
			}
		};
		inp.onchange = () => {
			this._nameReadonly = true;
			this.onchange( { name:
				this.data.name = inp.value.trim()
			} );
		};
	}
}

gsuiTrack.template = document.querySelector( "#gsuiTrack-template" );
gsuiTrack.template.remove();
gsuiTrack.template.removeAttribute( "id" );
