"use strict";

class gsuiReorder {
	#dirRow = false;
	#onchange = null;
	#dataTransfer = null;
	#dataTransferType = "";
	#itemSelector = "";
	#handleSelector = "";
	#parentSelector = "";
	#preventDefault = false;
	#elClicked = null;
	#elDragged = null;
	#elDragover = null;
	#itemDragover = null;
	#parentDragover = null;
	#elShadowParent = null;
	#elShadowDragged = null;
	#elDraggedParent = null;
	#shadowClass = "";
	#indDragged = 0;
	#droppedInside = false;
	#ondropBind = this.#ondrop.bind( this );
	#ondragoverTop = e => e.preventDefault();
	#dragoverTime = 0;

	constructor( opt = {} ) {
		const root = opt.rootElement;

		this.#dirRow = opt.direction !== "column";
		this.#onchange = opt.onchange ?? ( () => console.warn( "gsuiReorder: no onchange set" ) );
		this.#dataTransfer = opt.dataTransfer ?? ( () => "" );
		this.#dataTransferType = opt.dataTransferType ?? "text";
		this.#itemSelector = opt.itemSelector ?? "";
		this.#handleSelector = opt.handleSelector ?? "";
		this.#parentSelector = opt.parentSelector ?? "";
		this.#preventDefault = opt.preventDefault ?? true;
		Object.seal( this );

		root.addEventListener( "mousedown", this.#onmousedown.bind( this ), { passive: true } );
		root.addEventListener( "dragstart", this.#ondragstart.bind( this ), { passive: false } );
		root.addEventListener( "dragover", this.#ondragover.bind( this ), { passive: true } );
		root.addEventListener( "dragend", this.#ondragend.bind( this ), { passive: true } );
	}

	setShadowElement( el ) {
		this.#elShadowParent = el;
	}
	setShadowChildClass( cl ) {
		this.#shadowClass = `.${ cl }`;
	}

	// .........................................................................
	#getIndex( el ) {
		return Array.prototype.indexOf.call( el.parentNode.children, el );
	}
	#getShadowChild( id ) {
		return this.#elShadowParent.querySelector( `${ this.#shadowClass }[data-id="${ id }"]` );
	}

	// .........................................................................
	#onmousedown( e ) {
		this.#elClicked = e.target;
	}
	#ondragstart( e ) {
		if ( this.#elClicked && this.#elClicked.matches( this.#handleSelector ) ) {
			const elItem = e.target;
			const itemId = elItem.dataset.id;

			document.addEventListener( "drop", this.#ondropBind );
			document.addEventListener( "dragover", this.#ondragoverTop );
			this.#elClicked = null;
			this.#elDragged = elItem;
			this.#elDraggedParent = elItem.parentNode;
			if ( this.#elShadowParent ) {
				this.#elShadowDragged = this.#getShadowChild( itemId );
			}
			this.#indDragged = this.#getIndex( elItem );
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData( this.#dataTransferType, this.#dataTransfer( elItem ) );
			setTimeout( () => {
				this.#elDragged.classList.add( "gsuiReorder-dragging" );
				if ( this.#elShadowDragged ) {
					this.#elShadowDragged.classList.add( "gsuiReorder-dragging" );
				}
			}, 20 );
		} else if ( this.#preventDefault ) {
			e.preventDefault();
		}
	}
	#ondragover( e ) {
		const now = Date.now();

		if ( this.#elDragged && now - this.#dragoverTime > 60 ) {
			const tar = e.target;
			const elDrag = this.#elDragged;
			const elOver = tar === this.#elDragover
				? this.#itemDragover
				: tar.closest( `${ this.#parentSelector } ${ this.#itemSelector }` );

			this.#dragoverTime = now;
			if ( !elOver ) {
				const elOver = tar === this.#elDragover
					? this.#parentDragover
					: tar.closest( this.#parentSelector );

				this.#parentDragover = elOver;
				if ( elOver && elOver.lastElementChild !== elDrag ) {
					elOver.append( elDrag );
					if ( this.#elShadowDragged ) {
						this.#elShadowParent.append( this.#elShadowDragged );
					}
				}
			} else {
				const bcr = elOver.getBoundingClientRect();

				if ( ( this.#dirRow && e.clientX < bcr.left + bcr.width / 2 ) ||
					( !this.#dirRow && e.clientY < bcr.top + bcr.height / 2 )
				) {
					if ( elOver.previousElementSibling !== elDrag ) {
						elOver.before( elDrag );
						if ( this.#elShadowDragged ) {
							this.#getShadowChild( elOver.dataset.id ).before( this.#elShadowDragged );
						}
					}
				} else if ( elOver.nextElementSibling !== elDrag ) {
					elOver.after( elDrag );
					if ( this.#elShadowDragged ) {
						this.#getShadowChild( elOver.dataset.id ).after( this.#elShadowDragged );
					}
				}
			}
			this.#elDragover = tar;
			this.#itemDragover = elOver;
		}
	}
	#ondrop( e ) {
		this.#droppedInside = this.#elDragged && e.target.closest( this.#parentSelector );
	}
	#ondragend() {
		if ( this.#elDragged ) {
			const el = this.#elDragged;
			const oldInd = this.#indDragged;
			const oldPar = this.#elDraggedParent;

			this.#elDragged =
			this.#elDragover =
			this.#itemDragover = null;
			el.classList.remove( "gsuiReorder-dragging" );
			if ( this.#elShadowDragged ) {
				this.#elShadowDragged.classList.remove( "gsuiReorder-dragging" );
			}
			if ( this.#droppedInside ) {
				const ind = this.#getIndex( el );

				this.#droppedInside = false;
				if ( ind !== oldInd || el.parentNode !== oldPar ) {
					this.#onchange( el, oldInd, ind, oldPar, el.parentNode );
				}
			} else {
				el.remove();
				oldInd === 0
					? oldPar.prepend( el )
					: oldPar.children[ oldInd - 1 ].after( el );
			}
			document.removeEventListener( "drop", this.#ondropBind );
			document.removeEventListener( "dragover", this.#ondragoverTop );
		}
	}
}
