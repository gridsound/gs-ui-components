"use strict";

class gsuiTrack {
	constructor() {
		const root = gsuiTrack.template.cloneNode( true ),
			inp = root.querySelector( ".gsuiTrack-name" ),
			elToggle = root.querySelector( ".gsuiTrack-toggle" );

		this.onchange =
		this.onrightclickToggle = GSUtils.noop;
		this.rootElement = root;
		this.rowElement = root.querySelector( ".gsui-row" );
		this._inpName = inp;
		this.data = new Proxy( Object.seal( {
			order: 0,
			name: "",
			toggle: true
		} ), { set: this._setProp.bind( this ) } );
		Object.seal( this );

		root.ondblclick = e => {
			if ( e.target === this._inpName ) {
				inp.disabled = false;
				inp.select();
				inp.focus();
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
		inp.onblur = () => inp.disabled = true;
		inp.onchange = () => {
			const name = inp.value.trim();

			inp.disabled = true;
			this.data.name = name;
			this.onchange( { name } );
		};
		elToggle.oncontextmenu = () => false;
		elToggle.onmousedown = e => {
			if ( e.button === 2 ) {
				this.onrightclickToggle();
			} else if ( e.button === 0 ) {
				const toggle = !this.data.toggle;

				this.data.toggle = toggle;
				this.onchange( { toggle } );
			}
		};
		this.rowElement.remove();
		this._inpName.disabled = true;
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
