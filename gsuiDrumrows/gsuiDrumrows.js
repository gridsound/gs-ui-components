"use strict";

class gsuiDrumrows {
	constructor() {
		const root = gsuiDrumrows.template.cloneNode( true ),
			reorder = new gsuiReorder(),
			gsdata = new GSDataDrumrows( {
				actionCallback: ( ...args ) => this.onchange( ...args ),
				dataCallbacks: {
					addDrumrow: this._add.bind( this ),
					removeDrumrow: this._remove.bind( this ),
					renameDrumrow: this._rename.bind( this ),
					toggleDrumrow: this._toggle.bind( this ),
					reorderDrumrow: this._reorder.bind( this ),
				},
			} );

		this.gsdata = gsdata;
		this.rootElement = root;
		this.onchange = GSData.noop;
		this.onaddDrumrow = null; // 1.
		this._rows = new Map();
		this._lines = new Map();
		this._reorder = reorder;
		this._elLinesParent = null;
		Object.seal( this );

		root.onclick = this._onclickRows.bind( this );
		root.oncontextmenu = this._oncontextmenuRows.bind( this );
		reorder.onchange = this._onreorderRows.bind( this );
		reorder.setRootElement( root );
		reorder.setSelectors( {
			item: ".gsuiDrumrows .gsuiDrumrow",
			handle: ".gsuiDrumrows .gsuiDrumrow-grip",
			parent: ".gsuiDrumrows",
		} );
	}

	change( obj ) {
		this.gsdata.change( obj );
		if ( obj.drumrows ) {
			gsuiReorder.listReorder( this.rootElement, obj.drumrows );
			gsuiReorder.listReorder( this._elLinesParent, obj.drumrows );
		}
	}
	empty() {
		this.gsdata.clear();
	}
	setLinesParent( el ) {
		this._elLinesParent = el;
		this._reorder.setShadowElement( el );
	}
	setFontSize( fs ) {
		this.rootElement.style.fontSize =
		this._elLinesParent.style.fontSize = `${ fs }px`;
	}

	// dataCallbacks:
	// .........................................................................
	_add( id ) {
		const elRow = gsuiDrumrows.templateRow.cloneNode( true ),
			elLine = this.onaddDrumrow( id );

		elRow.dataset.id =
		elLine.dataset.id = id;
		this._rows.set( id, elRow );
		this._lines.set( id, elLine );
		this.rootElement.append( elRow );
		this._elLinesParent.append( elLine );
	}
	_remove( id ) {
		this._rows.get( id ).remove();
		this._lines.get( id ).remove();
		this._rows.delete( id );
		this._lines.delete( id );
	}
	_toggle( id, b ) {
		this._rows.get( id ).classList.toggle( "gsuiDrumrow-mute", !b );
		this._lines.get( id ).classList.toggle( "gsuiDrumrow-mute", !b );
	}
	_rename( id, name ) {
		this._rows.get( id ).querySelector( ".gsuiDrumrow-name" ).textContent = name;
	}
	_reorder( id, order ) {
		this._rows.get( id ).dataset.order =
		this._lines.get( id ).dataset.order = order;
	}

	// events:
	// .........................................................................
	_onreorderRows( elRow ) {
		const drumrows = gsuiReorder.listComputeOrderChange( this.rootElement, {} ),
			patId = this.gsdata.data.drumrows[ elRow.dataset.id ].pattern,
			name = this.gsdata.data.patterns[ patId ].name;

		this.onchange( { drumrows }, [ "drumrows", "reorderDrumrow", name ] );
	}
	_onclickRows( e ) {
		const tar = e.target,
			id = tar.parentNode.dataset.id;

		if ( tar.classList.contains( "gsuiDrumrow-toggle" ) ) {
			this.gsdata.callAction( "toggleDrumrow", id );
		}
		if ( tar.classList.contains( "gsuiDrumrow-delete" ) ) {
			this.gsdata.callAction( "removeDrumrow", id );
		}
	}
	_oncontextmenuRows( e ) {
		const tar = e.target,
			id = tar.parentNode.dataset.id;

		if ( tar.classList.contains( "gsuiDrumrow-toggle" ) ) {
			this.gsdata.callAction( "toggleOnlyDrumrow", id );
		}
		e.preventDefault();
	}
}

gsuiDrumrows.template = document.querySelector( "#gsuiDrumrows-template" );
gsuiDrumrows.template.remove();
gsuiDrumrows.template.removeAttribute( "id" );

gsuiDrumrows.templateRow = document.querySelector( "#gsuiDrumrow-template" );
gsuiDrumrows.templateRow.remove();
gsuiDrumrows.templateRow.removeAttribute( "id" );

Object.freeze( gsuiDrumrows );

/*
1. The onaddDrumrow callback is needed to make the bridge between the rows and
   the lines, they are not from the same component.
*/
