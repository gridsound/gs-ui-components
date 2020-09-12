"use strict";

class gsuiTracklist {
	constructor() {
		const root = gsuiTracklist.template.cloneNode( true );

		this.rootElement = root;
		this.onchange =
		this.ontrackadded = () => {};
		this._tracks = new Map();
		this.data = new Proxy( {}, {
			set: this._addTrack.bind( this ),
			deleteProperty: this._delTrack.bind( this )
		} );
		Object.seal( this );

		root.oncontextmenu = () => false;
		root.onchange = this._onchange.bind( this );
		root.onkeydown = this._onkeydown.bind( this );
		root.ondblclick = this._ondblclick.bind( this );
		root.onmousedown = this._onmousedown.bind( this );
		root.addEventListener( "focusout", this._onfocusout.bind( this ) );
	}

	// .........................................................................
	remove() {
		this.empty();
		this.rootElement.remove();
	}
	empty() {
		Object.keys( this.data ).forEach( id => delete this.data[ id ] );
	}

	// private:
	// .........................................................................
	_addTrack( tar, id, track ) {
		const tr = new gsuiTrack();

		tar[ id ] = tr.data;
		tr.setPlaceholder( `Track ${ this._tracks.size + 1 }` );
		tr.rootElement.dataset.track =
		tr.rowElement.dataset.track = id;
		Object.assign( tr.data, track );
		this._tracks.set( id, tr );
		this.rootElement.append( tr.rootElement );
		this.ontrackadded( tr );
		return true;
	}
	_delTrack( tar, id ) {
		this._tracks.get( id ).remove();
		this._tracks.delete( id );
		delete tar[ id ];
		return true;
	}
	_muteAll( id ) {
		const obj = {},
			trClicked = this._tracks.get( id );
		let allMute = true;

		this._tracks.forEach( tr => {
			allMute = allMute && ( !tr.data.toggle || tr === trClicked );
		} );
		this._tracks.forEach( ( tr, id ) => {
			const toggle = allMute || tr === trClicked;

			if ( toggle !== tr.data.toggle ) {
				obj[ id ] = { toggle };
			}
		} );
		this.onchange( obj );
	}

	// .........................................................................
	_onkeydown( e ) {
		const inp = e.target;

		if ( inp.dataset.action === "rename" ) {
			e.stopPropagation();
			switch ( e.key ) {
				case "Escape": inp.value = this.data[ inp.parentNode.parentNode.dataset.track ].name;
				case "Enter": inp.blur();
			}
		}
	}
	_onfocusout( e ) {
		e.target.disabled = true;
	}
	_onchange( e ) {
		const inp = e.target,
			id = inp.parentNode.parentNode.dataset.track,
			name = inp.value.trim();

		inp.disabled = true;
		this.onchange( { [ id ]: { name } } );
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
				id = par.dataset.track;

			if ( e.button === 2 ) {
				this._muteAll( id );
			} else if ( e.button === 0 ) {
				const toggle = par.classList.contains( "gsui-mute" );

				this.onchange( { [ id ]: { toggle } } );
			}
		}
	}
}

gsuiTracklist.template = document.querySelector( "#gsuiTracklist-template" );
gsuiTracklist.template.remove();
gsuiTracklist.template.removeAttribute( "id" );
