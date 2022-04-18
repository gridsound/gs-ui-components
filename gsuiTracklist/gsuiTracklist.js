"use strict";

class gsuiTracklist extends HTMLElement {
	#tracks = new Map();

	constructor() {
		super();
		Object.seal( this );

		this.oncontextmenu = () => false;
		this.onchange = this.#onchange.bind( this );
		this.onkeydown = this.#onkeydown.bind( this );
		this.ondblclick = this.#ondblclick.bind( this );
		this.onmousedown = this.#onmousedown.bind( this );
		this.addEventListener( "focusout", this.#onfocusout.bind( this ) );
	}

	// .........................................................................
	getTrack( id ) {
		return this.#tracks.get( id );
	}
	addTrack( id ) {
		const tr = GSUI.createElem( "gsui-track", { "data-id": id } );

		tr.rowElement.dataset.id = id;
		this.#tracks.set( id, tr );
		this.append( tr );
		return tr;
	}
	removeTrack( id ) {
		const tr = this.#tracks.get( id );

		tr.remove();
		tr.rowElement.remove();
		this.#tracks.delete( id );
	}

	// .........................................................................
	#onkeydown( e ) {
		const inp = e.target;

		if ( inp.dataset.action === "rename" ) {
			e.stopPropagation();
			switch ( e.key ) {
				case "Escape": inp.value = GSUI.getAttr( inp.parentNode.parentNode, "name" );
				case "Enter": inp.blur();
			}
		}
	}
	#onfocusout( e ) {
		if ( e.target.dataset.action === "rename" ) {
			e.target.disabled = true;
		}
	}
	#onchange( e ) {
		const inp = e.target;
		const id = inp.parentNode.parentNode.dataset.id;
		const name = inp.value.trim();

		inp.disabled = true;
		GSUI.dispatchEv( this, "gsuiTracklist", "renameTrack", id, name );
	}
	#ondblclick( e ) {
		const inp = e.target;

		if ( inp.dataset.action === "rename" ) {
			inp.disabled = false;
			inp.select();
			inp.focus();
		}
	}
	#onmousedown( e ) {
		if ( e.target.dataset.action === "toggle" ) {
			const par = e.target.parentNode;
			const id = par.dataset.id;

			if ( e.button === 2 ) {
				GSUI.dispatchEv( this, "gsuiTracklist", "toggleSoloTrack", id );
			} else if ( e.button === 0 ) {
				GSUI.dispatchEv( this, "gsuiTracklist", "toggleTrack", id );
			}
		}
	}
}

Object.freeze( gsuiTracklist );
customElements.define( "gsui-tracklist", gsuiTracklist );
