"use strict";

class gsuiDrumrows {
	constructor() {
		const root = gsuiDrumrows.template.cloneNode( true ),
			reorder = new gsuiReorder();

		this.rootElement = root;
		this.onchange = () => {};
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

	// .........................................................................
	setLinesParent( el, childClass ) {
		this._elLinesParent = el;
		this._reorder.setShadowElement( el );
		this._reorder.setShadowChildClass( childClass );
	}
	setFontSize( fs ) {
		this.rootElement.style.fontSize =
		this._elLinesParent.style.fontSize = `${ fs }px`;
	}
	empty() {
		this._rows.forEach( ( elRow, id ) => {
			elRow.remove();
			this._lines.get( id ).remove();
		} );
		this._rows.clear();
		this._lines.clear();
	}

	// .........................................................................
	addDrumrow( id, elLine ) {
		const elRow = gsuiDrumrows.templateRow.cloneNode( true );

		elRow.dataset.id =
		elLine.dataset.id = id;
		this._rows.set( id, elRow );
		this._lines.set( id, elLine );
		this.rootElement.append( elRow );
		this._elLinesParent.append( elLine );
	}
	removeDrumrow( id ) {
		this._rows.get( id ).remove();
		this._lines.get( id ).remove();
		this._rows.delete( id );
		this._lines.delete( id );
	}
	renameDrumrow( id, name ) {
		this._rows.get( id ).querySelector( ".gsuiDrumrow-name" ).textContent = name;
	}
	toggleDrumrow( id, b ) {
		this._rows.get( id ).classList.toggle( "gsuiDrumrow-mute", !b );
		this._lines.get( id ).classList.toggle( "gsuiDrumrow-mute", !b );
	}
	reorderDrumrow( id, order ) {
		this._rows.get( id ).dataset.order =
		this._lines.get( id ).dataset.order = order;
	}
	reorderDrumrows() {
		gsuiReorder.listReorder( this.rootElement );
		gsuiReorder.listReorder( this._elLinesParent );
	}

	// events:
	// .........................................................................
	_onreorderRows( elRow ) {
		const rows = gsuiReorder.listComputeOrderChange( this.rootElement, {} );

		this.onchange( "reorderDrumrow", elRow.dataset.id, rows );
	}
	_onclickRows( e ) {
		const { classList, parentNode } = e.target;

		if ( classList.contains( "gsuiDrumrow-toggle" ) ) {
			this.onchange( "toggleDrumrow", parentNode.dataset.id );
		}
		if ( classList.contains( "gsuiDrumrow-delete" ) ) {
			this.onchange( "removeDrumrow", parentNode.dataset.id );
		}
	}
	_oncontextmenuRows( e ) {
		const { classList, parentNode } = e.target;

		e.preventDefault();
		if ( classList.contains( "gsuiDrumrow-toggle" ) ) {
			this.onchange( "toggleOnlyDrumrow", parentNode.dataset.id );
		}
	}
}

gsuiDrumrows.template = document.querySelector( "#gsuiDrumrows-template" );
gsuiDrumrows.template.remove();
gsuiDrumrows.template.removeAttribute( "id" );

gsuiDrumrows.templateRow = document.querySelector( "#gsuiDrumrow-template" );
gsuiDrumrows.templateRow.remove();
gsuiDrumrows.templateRow.removeAttribute( "id" );

Object.freeze( gsuiDrumrows );
