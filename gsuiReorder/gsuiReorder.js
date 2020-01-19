"use strict";

class gsuiReorder {
	constructor() {
		this.onchange = () => {};
		this.setDataTransfert = () => "";
		this.rootElement =
		this._elClicked =
		this._elDragged =
		this._elDragover =
		this._itemDragover =
		this._parentDragover =
		this._elShadowParent =
		this._elShadowDragged =
		this._elDraggedParent = null;
		this._indDragged = 0;
		this._droppedInside = false;
		this._isVertical =
		this._preventDefault = true;
		this._selectors = Object.seal( { item: "", handle: "", parent: "" } );
		this._onmousedown = this._onmousedown.bind( this );
		this._ondragstart = this._ondragstart.bind( this );
		this._ondragover = this._ondragover.bind( this );
		this._ondragend = this._ondragend.bind( this );
		this._ondrop = this._ondrop.bind( this );
		Object.seal( this );
	}

	setDirection( dir ) {
		this._isVertical = dir === "v";
	}
	setSelectors( sels ) {
		Object.assign( this._selectors, sels );
	}
	preventDefault( b ) {
		this._preventDefault = b;
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
	setShadowElement( el ) {
		this._elShadowParent = el;
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
		if ( this._elClicked && this._elClicked.matches( this._selectors.handle ) ) {
			const elItem = e.target,
				itemId = elItem.dataset.id;

			document.addEventListener( "drop", this._ondrop );
			this._elClicked = null;
			this._elDragged = elItem;
			this._elDraggedParent = elItem.parentNode;
			if ( this._elShadowParent ) {
				this._elShadowDragged = this._elShadowParent.querySelector( `[data-id="${ itemId }"]` );
			}
			this._indDragged = this._getIndex( elItem );
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData( "text", this.setDataTransfert( elItem ) );
			setTimeout( () => {
				this._elDragged.classList.add( "gsuiReorder-dragging" );
				if ( this._elShadowDragged ) {
					this._elShadowDragged.classList.add( "gsuiReorder-dragging" );
				}
			}, 20 );
		} else if ( this._preventDefault ) {
			e.preventDefault();
		}
	}
	_ondragover( e ) {
		if ( this._elDragged ) {
			const tar = e.target,
				elDrag = this._elDragged,
				elOver = tar === this._elDragover
					? this._itemDragover
					: tar.closest( this._selectors.item );

			if ( !elOver ) {
				const elOver = tar === this._elDragover
						? this._parentDragover
						: tar.closest( this._selectors.parent );

				this._parentDragover = elOver;
				if ( elOver && elOver.lastElementChild !== elDrag ) {
					elOver.append( elDrag );
				}
			} else {
				const bcr = elOver.getBoundingClientRect(),
					isV = this._isVertical,
					overId = elOver.dataset.id;

				if ( ( isV && e.clientY < bcr.top + bcr.height / 2 ) ||
					( !isV && e.clientX < bcr.left + bcr.width / 2 )
				) {
					if ( elOver.previousElementSibling !== elDrag ) {
						elOver.before( elDrag );
						if ( this._elShadowDragged ) {
							this._elShadowParent.querySelector( `[data-id="${ overId }"]` )
								.before( this._elShadowDragged );
						}
					}
				} else if ( elOver.nextElementSibling !== elDrag ) {
					elOver.after( elDrag );
					if ( this._elShadowDragged ) {
						this._elShadowParent.querySelector( `[data-id="${ overId }"]` )
							.after( this._elShadowDragged );
					}
				}
			}
			this._elDragover = tar;
			this._itemDragover = elOver;
		}
	}
	_ondrop( e ) {
		this._droppedInside = this._elDragged && e.target.closest( this._selectors.parent );
	}
	_ondragend() {
		if ( this._elDragged ) {
			const el = this._elDragged,
				oldInd = this._indDragged,
				oldPar = this._elDraggedParent;

			this._elDragged =
			this._elDragover =
			this._itemDragover = null;
			el.classList.remove( "gsuiReorder-dragging" );
			if ( this._elShadowDragged ) {
				this._elShadowDragged.classList.remove( "gsuiReorder-dragging" );
			}
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
