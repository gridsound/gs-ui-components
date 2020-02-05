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
		this._dragoverId =
		this._elDragover =
		this._elLinesParent = null;
		Object.seal( this );

		root.ondrop = this._ondropRows.bind( this );
		root.onclick = this._onclickRows.bind( this );
		root.ondragover = this._ondragoverRows.bind( this );
		root.ondragleave = this._ondragleaveRows.bind( this );
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
	reorderDrumrows( obj ) {
		gsuiReorder.listReorder( this.rootElement, obj );
		gsuiReorder.listReorder( this._elLinesParent, obj );
	}

	// .........................................................................
	static _isDrumrow( el ) {
		return (
			el.classList.contains( "gsuiDrumrow" ) ? el :
			el.classList.contains( "gsuiDrumrow-grip" ) ||
			el.classList.contains( "gsuiDrumrow-toggle" ) ||
			el.classList.contains( "gsuiDrumrow-delete" ) ? el.parentNode : null
		);
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
	_ondropRows( e ) {
		if ( this._dragoverId ) {
			const data = e.dataTransfer.getData( "text" );

			if ( data ) {
				this._dragoverId === Infinity
					? this.onchange( "addDrumrow", data )
					: this.onchange( "changeDrumrowPattern", this._dragoverId, data );
			}
		}
		this._ondragleaveRows();
	}
	_ondragleaveRows() {
		if ( this._elDragover ) {
			this._elDragover.classList.remove( "gsuiDrumrows-dragover" );
			this._elDragover =
			this._dragoverId = null;
		}
	}
	_ondragoverRows( e ) {
		const tar = e.target,
			isParent = tar.classList.contains( "gsuiDrumrows" ),
			elDragover = isParent
				? tar
				: gsuiDrumrows._isDrumrow( tar );

		if ( elDragover !== this._elDragover ) {
			this._dragoverId = null;
			if ( isParent ) {
				this._dragoverId = Infinity;
			} else if ( elDragover ) {
				this._dragoverId = elDragover.dataset.id;
			}
			if ( this._elDragover ) {
				this._elDragover.classList.remove( "gsuiDrumrows-dragover" );
			}
			this._elDragover = elDragover;
			if ( elDragover ) {
				elDragover.classList.add( "gsuiDrumrows-dragover" );
			}
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
