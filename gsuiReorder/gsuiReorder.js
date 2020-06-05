"use strict";

class gsuiReorder {
	constructor( opt = {} ) {
		const root = opt.rootElement;

		this.rootElement = root;
		this._dirRow = opt.direction !== "column";
		this._onchange = opt.onchange ?? ( () => console.warn( "gsuiReorder: no onchange set" ) );
		this._dataTransfer = opt.dataTransfer ?? ( () => "" );
		this._dataTransferType = opt.dataTransferType ?? "text";
		this._itemSelector = opt.itemSelector ?? "";
		this._handleSelector = opt.handleSelector ?? "";
		this._parentSelector = opt.parentSelector ?? "";
		this._preventDefault = opt.preventDefault ?? true;
		this._elClicked =
		this._elDragged =
		this._elDragover =
		this._itemDragover =
		this._parentDragover =
		this._elShadowParent =
		this._elShadowDragged =
		this._elDraggedParent = null;
		this._shadowClass = "";
		this._indDragged = 0;
		this._droppedInside = false;
		this._ondrop = this._ondrop.bind( this );
		this._dragoverTime = 0;
		Object.seal( this );

		root.addEventListener( "mousedown", this._onmousedown.bind( this ), { passive: true } );
		root.addEventListener( "dragstart", this._ondragstart.bind( this ), { passive: false } );
		root.addEventListener( "dragover", this._ondragover.bind( this ), { passive: true } );
		root.addEventListener( "dragend", this._ondragend.bind( this ), { passive: true } );
	}

	setShadowElement( el ) {
		this._elShadowParent = el;
	}
	setShadowChildClass( cl ) {
		this._shadowClass = `.${ cl }`;
	}

	// private:
	// .........................................................................
	_getIndex( el ) {
		return Array.prototype.indexOf.call( el.parentNode.children, el );
	}
	_getShadowChild( id ) {
		return this._elShadowParent.querySelector( `${ this._shadowClass }[data-id="${ id }"]` );
	}

	// events:
	// .........................................................................
	_onmousedown( e ) {
		this._elClicked = e.target;
	}
	_ondragstart( e ) {
		if ( this._elClicked && this._elClicked.matches( this._handleSelector ) ) {
			const elItem = e.target,
				itemId = elItem.dataset.id;

			document.addEventListener( "drop", this._ondrop );
			this._elClicked = null;
			this._elDragged = elItem;
			this._elDraggedParent = elItem.parentNode;
			if ( this._elShadowParent ) {
				this._elShadowDragged = this._getShadowChild( itemId );
			}
			this._indDragged = this._getIndex( elItem );
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData( this._dataTransferType, this._dataTransfer( elItem ) );
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
		const now = Date.now();

		if ( this._elDragged && now - this._dragoverTime > 60 ) {
			const tar = e.target,
				elDrag = this._elDragged,
				elOver = tar === this._elDragover
					? this._itemDragover
					: tar.closest( `${ this._parentSelector } ${ this._itemSelector }` );

			this._dragoverTime = now;
			if ( !elOver ) {
				const elOver = tar === this._elDragover
						? this._parentDragover
						: tar.closest( this._parentSelector );

				this._parentDragover = elOver;
				if ( elOver && elOver.lastElementChild !== elDrag ) {
					elOver.append( elDrag );
					if ( this._elShadowDragged ) {
						this._elShadowParent.append( this._elShadowDragged );
					}
				}
			} else {
				const bcr = elOver.getBoundingClientRect();

				if ( ( this._dirRow && e.clientX < bcr.left + bcr.width / 2 ) ||
					( !this._dirRow && e.clientY < bcr.top + bcr.height / 2 )
				) {
					if ( elOver.previousElementSibling !== elDrag ) {
						elOver.before( elDrag );
						if ( this._elShadowDragged ) {
							this._getShadowChild( elOver.dataset.id ).before( this._elShadowDragged );
						}
					}
				} else if ( elOver.nextElementSibling !== elDrag ) {
					elOver.after( elDrag );
					if ( this._elShadowDragged ) {
						this._getShadowChild( elOver.dataset.id ).after( this._elShadowDragged );
					}
				}
			}
			this._elDragover = tar;
			this._itemDragover = elOver;
		}
	}
	_ondrop( e ) {
		this._droppedInside = this._elDragged && e.target.closest( this._parentSelector );
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
					this._onchange( el, oldInd, ind, oldPar, el.parentNode );
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
