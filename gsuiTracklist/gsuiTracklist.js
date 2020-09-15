"use strict";

class gsuiTracklist {
	constructor() {
		const root = GSUI.createElement( "div", { class: "gsuiTracklist" } );

		this.rootElement = root;
		this._tracks = new Map();
		Object.seal( this );

		root.oncontextmenu = () => false;
		root.onchange = this._onchange.bind( this );
		root.onkeydown = this._onkeydown.bind( this );
		root.ondblclick = this._ondblclick.bind( this );
		root.onmousedown = this._onmousedown.bind( this );
		root.addEventListener( "focusout", this._onfocusout.bind( this ) );
	}

	// .........................................................................
	getTrack( id ) {
		return this._tracks.get( id );
	}
	addTrack( id ) {
		const tr = GSUI.createElement( "gsui-track" );

		tr.dataset.id =
		tr.rowElement.dataset.id = id;
		this._tracks.set( id, tr );
		this.rootElement.append( tr );
		return tr;
	}
	removeTrack( id ) {
		const tr = this._tracks.get( id );

		tr.remove();
		tr.rowElement.remove();
		this._tracks.delete( id );
	}

	// .........................................................................
	_onkeydown( e ) {
		const inp = e.target;

		if ( inp.dataset.action === "rename" ) {
			e.stopPropagation();
			switch ( e.key ) {
				case "Escape": inp.value = inp.parentNode.parentNode.getAttribute( "name" );
				case "Enter": inp.blur();
			}
		}
	}
	_onfocusout( e ) {
		if ( e.target.dataset.action === "rename" ) {
			e.target.disabled = true;
		}
	}
	_onchange( e ) {
		const inp = e.target,
			id = inp.parentNode.parentNode.dataset.id,
			name = inp.value.trim();

		inp.disabled = true;
		GSUI.dispatchEvent( this.rootElement, "gsuiTracklist", "renameTrack", id, name );
	}
	_ondblclick( e ) {
		const inp = e.target;

		if ( inp.dataset.action === "rename" ) {
			inp.disabled = false;
			inp.select();
			inp.focus();
		}
	}
	_onmousedown( e ) {
		if ( e.target.dataset.action === "toggle" ) {
			const par = e.target.parentNode,
				id = par.dataset.id;

			if ( e.button === 2 ) {
				GSUI.dispatchEvent( this.rootElement, "gsuiTracklist", "toggleSoloTrack", id );
			} else if ( e.button === 0 ) {
				GSUI.dispatchEvent( this.rootElement, "gsuiTracklist", "toggleTrack", id );
			}
		}
	}
}
