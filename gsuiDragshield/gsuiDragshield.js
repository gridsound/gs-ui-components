"use strict";

class gsuiDragshield extends HTMLElement {
	connectedCallback() {
		this.classList.add( "gsuiDragshield" );
	}
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

customElements.define( "gsui-dragshield", gsuiDragshield );
