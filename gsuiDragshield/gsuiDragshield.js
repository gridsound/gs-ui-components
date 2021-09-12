"use strict";

class gsuiDragshield extends HTMLElement {
	show( cursor ) {
		if ( cursor ) {
			this.style.cursor = cursor;
		}
		this.classList.add( "gsuiDragshield-show" );
	}
	hide() {
		this.style.cursor = "";
		this.classList.remove( "gsuiDragshield-show" );
	}
}

Object.freeze( gsuiDragshield );
customElements.define( "gsui-dragshield", gsuiDragshield );
