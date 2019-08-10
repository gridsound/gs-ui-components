"use strict";

class gsuiReorder {
	constructor() {
		this.onchange = () => {};
		this.rootElement =
		this._elClicked =
		this._elDragged =
		this._elDragover =
		this._itemDragover =
		this._elDraggedParent = null;
		this._indDragged = 0;
		this._droppedInside = false;
		this._selectors = Object.seal( { item: "", handle: "", parent: "" } );
		this._onmousedown = this._onmousedown.bind( this );
		this._ondragstart = this._ondragstart.bind( this );
		this._ondragover = this._ondragover.bind( this );
		this._ondragend = this._ondragend.bind( this );
		this._ondrop = this._ondrop.bind( this );
		Object.seal( this );
	}

	setSelectors( sels ) {
		Object.assign( this._selectors, sels );
	}
	setRootElement( el ) {
		const elPrev = this.rootElement;

		if ( elPrev ) {
			elPrev.removeEventListener( "mousedown", this._onmousedown );
			elPrev.removeEventListener( "dragstart", this._ondragstart );
			elPrev.removeEventListener( "dragover", this._ondragover );
			elPrev.removeEventListener( "dragend", this._ondragend );
		}
		this.rootElement = el;
		if ( el ) {
			el.addEventListener( "mousedown", this._onmousedown );
			el.addEventListener( "dragstart", this._ondragstart );
			el.addEventListener( "dragover", this._ondragover );
			el.addEventListener( "dragend", this._ondragend );
		}
	}

	// private:
	// .........................................................................
	_getIndex( el ) {
		return Array.prototype.indexOf.call( el.parentNode.children, el );
	}

	// events:
	// .........................................................................
	_onmousedown( e ) {
		this._elClicked = e.target;
	}
	_ondragstart( e ) {
		if ( this._elClicked.matches( this._selectors.handle ) ) {
			const elItem = e.target;

			document.addEventListener( "drop", this._ondrop );
			this._elClicked = null;
			this._elDragged = elItem;
			this._elDraggedParent = elItem.parentNode;
			this._indDragged = this._getIndex( elItem );
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData( "text", "" );
			setTimeout( () => this._elDragged.classList.add( "gsuiReorder-dragging" ), 20 );
		}
	}
	_ondragover( e ) {
		const elDrag = this._elDragged;

		if ( elDrag ) {
			const elOver = e.target === this._elDragover
					? this._itemDragover
					: lg(e.target.closest( this._selectors.item ), "CLOSEST A");

			this._elDragover = e.target;
			this._itemDragover = elOver;
			if ( elOver ) {
				const bcr = elOver.getBoundingClientRect();

				if ( e.clientY < bcr.top + bcr.height / 2 ) {
					if ( elOver.previousElementSibling !== elDrag ) {
						elOver.before( elDrag );
					}
				} else if ( elOver.nextElementSibling !== elDrag ) {
					elOver.after( elDrag );
				}
				e.preventDefault();
			} else {
				const elOver = lg(e.target.closest( this._selectors.parent ), "CLOSEST B");

				if ( elOver && elOver.lastElementChild !== elDrag ) {
					elOver.append( elDrag );
				}
			}
		}
	}
	_ondrop( e ) {
		this._droppedInside = this._elDragged && e.target.closest( this._selectors.parent );
	}
	_ondragend( e ) {
		if ( this._elDragged ) {
			const el = this._elDragged,
				oldInd = this._indDragged,
				oldPar = this._elDraggedParent;

			this._elDragged =
			this._elDragover =
			this._itemDragover = null;
			el.classList.remove( "gsuiReorder-dragging" );
			document.removeEventListener( "drop", this._ondrop );
			if ( this._droppedInside ) {
				const ind = this._getIndex( el );

				this._droppedInside = false;
				if ( ind !== oldInd || el.parentNode !== oldPar ) {
					this.onchange( el, oldInd, ind, oldPar, el.parentNode );
				}
			} else {
				el.remove();
				oldInd === 0
					? oldPar.prepend( el )
					: oldPar.children[ oldInd - 1 ].after( el );
			}
		}
	}
}
