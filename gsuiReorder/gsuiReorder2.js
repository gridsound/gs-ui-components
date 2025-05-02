"use strict";

class gsuiReorder2 {
	#root = null;
	#rootBCR = null;
	#parSel = "";
	#itemSel = "";
	#gripSel = "";
	#ondrop = null;
	#onchange = null;
	#ondragover = null;
	#onkeydownBind = this.#onkeydown.bind( this );
	#onptrdownBind = this.#onptrdown.bind( this );
	#onptrmoveBind = this.#onptrmove.bind( this );
	#onptrupBind = this.#onptrup.bind( this );
	#ptrId = null;
	#elDragovering = null;
	#movingIndex = -1;
	#movingItem = null;
	#movingItemParent = null;
	#movingItemParentOriginal = null;
	#movingFake = null;
	#parentsCoord = null;
	#currentPx = 0;
	#itemsData = null;
	#dataSave = null;

	constructor( opt ) {
		this.#root = opt.$parent;
		this.#parSel = opt.$parentSelector;
		this.#itemSel = opt.$itemSelector;
		this.#gripSel = opt.$itemGripSelector;
		this.#ondrop = opt.$ondrop;
		this.#onchange = opt.$onchange;
		this.#ondragover = opt.$ondragover;
		this.#root.addEventListener( "pointerdown", this.#onptrdownBind );
	}

	// .........................................................................
	#onptrdown( e ) {
		if ( e.target.matches( this.#gripSel ) ) {
			this.#movingItem = e.target.closest( this.#itemSel );
			if ( this.#movingItem ) {
				e.preventDefault();
				this.#rootBCR = this.#root.getBoundingClientRect();
				this.#movingItemParent =
				this.#movingItemParentOriginal = this.#movingItem.parentNode;
				this.#currentPx = gsuiReorder2.#getGlobalPtr( this.#movingItemParent, e );
				this.#itemsData = gsuiReorder2.#createItemsData( this.#movingItemParent, this.#itemSel );
				this.#movingItem.classList.add( "gsuiReorder-moving" );
				this.#movingIndex = gsuiReorder2.#findElemIndex( this.#itemsData, this.#movingItem );
				this.#parentsCoord = gsuiReorder2.#calcParentsCoord( this.#root, this.#parSel );
				this.#dataSave = gsuiReorder2.#createOrderMap( this.#root, this.#itemSel );
				this.#root.style.cursor = "grabbing";
				this.#ptrId = e.pointerId;
				this.#root.setPointerCapture( this.#ptrId );
				this.#root.addEventListener( "pointermove", this.#onptrmoveBind );
				this.#root.addEventListener( "pointerup", this.#onptrupBind );
				document.body.addEventListener( "keydown", this.#onkeydownBind );
				this.#movingFake = gsuiReorder2.#createGhostElement( this.#movingItem, e.target, e );
				GSUunselectText();
			}
		}
	}
	#onptrmove( e ) {
		const oldPtr = this.#currentPx;
		const par = gsuiReorder2.#overWhichParent( this.#rootBCR, this.#parentsCoord, e );
		const ptr = gsuiReorder2.#getGlobalPtr( par, e );

		e.preventDefault(); // 1.
		this.#movingFake.style.top = `${ e.clientY }px`;
		this.#movingFake.style.left = `${ e.clientX }px`;
		this.#whatAreDraggingOver( e );
		if ( par ) {
			if ( par === this.#movingItemParent ) {
				const ind = gsuiReorder2.#getIndexCrossing( this.#itemsData, this.#movingIndex, ptr, oldPtr );

				this.#currentPx = ptr;
				if ( ind > -1 ) {
					gsuiReorder2.#reorderMoving( this.#itemsData, this.#movingItem, ind );
					this.#movingIndex = ind;
					this.#itemsData = gsuiReorder2.#createItemsData( this.#movingItemParent, this.#itemSel );
				}
			} else {
				const items = gsuiReorder2.#createItemsData( par, this.#itemSel );
				const newInd = gsuiReorder2.#getIndexHovering( items, ptr );

				this.#currentPx = ptr;
				par.append( this.#movingItem );
				this.#parentsCoord = gsuiReorder2.#calcParentsCoord( this.#root, this.#parSel );
				gsuiReorder2.#reorderMoving( this.#itemsData, this.#movingItem, Infinity );
				gsuiReorder2.#reorderMoving( items, this.#movingItem, newInd );
				this.#movingIndex = newInd;
				this.#itemsData = gsuiReorder2.#createItemsData( par, this.#itemSel );
			}
		}
		this.#movingItemParent = par;
	}
	#onptrup( e ) {
		if ( !this.#movingItemParent ) {
			const dropInfo = this.#ondrop && gsuiReorder2.#getDropTargetInfo( e );

			if ( dropInfo ) {
				this.#ondrop?.( dropInfo );
			}
			gsuiReorder2.#reorderMoving( this.#itemsData, this.#movingItem, Infinity );
			gsuiReorder2.#cancelAllChanges( this.#dataSave );
		}

		const newOrderMap = gsuiReorder2.#createOrderMap( this.#root, this.#itemSel );
		const orderDiff = gsuiReorder2.#diffOrderMaps( this.#dataSave, newOrderMap );
		const movingId = this.#movingItem.dataset.id;

		this.#reset();
		if ( orderDiff ) {
			this.#onchange?.( orderDiff, movingId );
		}
	}
	#onkeydown( e ) {
		if ( e.key === "Escape" ) {
			gsuiReorder2.#reorderMoving( this.#itemsData, this.#movingItem, Infinity );
			gsuiReorder2.#cancelAllChanges( this.#dataSave );
			this.#reset();
		}
	}
	#whatAreDraggingOver( e ) {
		if ( this.#ondragover ) {
			const elem = document.elementFromPoint( e.clientX, e.clientY );

			if ( elem !== this.#elDragovering ) {
				this.#elDragovering = elem;
				if ( elem?.classList.contains( "gsuiReorder-dropArea" ) ) {
					this.#ondragover( elem );
				}
			}
		}
	}
	#reset() {
		this.#movingFake.remove();
		this.#movingFake = null;
		this.#elDragovering = null;
		this.#itemsData = null;
		this.#dataSave = null;
		if ( this.#movingItem ) {
			this.#movingItem.classList.remove( "gsuiReorder-moving" );
			this.#movingItem = null;
		}
		this.#movingItemParent = null;
		this.#movingItemParentOriginal = null;
		this.#movingIndex = -1;
		this.#parentsCoord = null;
		this.#rootBCR = null;
		if ( this.#root ) {
			this.#root.style.cursor = "";
			this.#root.removeEventListener( "pointermove", this.#onptrmoveBind );
			this.#root.removeEventListener( "pointerup", this.#onptrupBind );
			this.#root.releasePointerCapture( this.#ptrId );
			document.body.removeEventListener( "keydown", this.#onkeydownBind );
			this.#ptrId = null;
		}
	}

	// .........................................................................
	static #getDropTargetInfo( e ) {
		const elem = document.elementFromPoint( e.clientX, e.clientY );
		const elemBCR = elem?.getBoundingClientRect();

		return !elem ? null : {
			$target: elem,
			$offsetX: e.clientX - elemBCR.x,
			$offsetY: e.clientY - elemBCR.y,
		};
	}
	static #cancelAllChanges( orderMapSave ) {
		GSUforEach( orderMapSave, it => {
			gsuiReorder2.#setElemOrder( it.$elem, it.order );
			if ( it.$elemParent !== it.$elem.parentNode ) {
				it.$elemParent.append( it.$elem );
			}
		} );
	}

	// .........................................................................
	static #getGlobalPtr( par, e ) {
		return gsuiReorder2.#isDirX( par ) ? e.clientX : e.clientY;
	}
	static #isDirX( el ) {
		return !!el && getComputedStyle( el ).gridAutoFlow !== "row";
	}
	static #overWhichParent( rootBCR, parents, e ) {
		const pX = e.offsetX;
		const pY = e.offsetY;
		const overRoot =
			GSUinRange( pX, 0, rootBCR.width ) &&
			GSUinRange( pY, 0, rootBCR.height );

		if ( overRoot ) {
			const par = parents.find( par => {
				const parX = par.$bcr.x - rootBCR.x;
				const parY = par.$bcr.y - rootBCR.y;

				return (
					GSUinRange( pX, parX, parX + par.$bcr.width ) &&
					GSUinRange( pY, parY, parY + par.$bcr.height )
				);
			} );

			if ( par ) {
				return par.$elem;
			}
		}
		return null;
	}
	static #calcParentsCoord( root, parSel ) {
		const parents = root.matches( parSel )
			? [ root ]
			: Array.from( root.querySelectorAll( parSel ) );

		return parents.map( par => ( {
			$elem: par,
			$bcr: par.getBoundingClientRect(),
		} ) );
	}
	static #getIndexHovering( items, ptr ) {
		const res = items.reduce( ( ret, it, i ) => {
			const diff = ptr - ( it.$pos + it.$size / 2 );
			const diffAbs = Math.abs( diff );

			if ( diffAbs < ret[ 1 ] ) {
				ret[ 0 ] = i;
				ret[ 1 ] = diffAbs;
				ret[ 2 ] = diff;
			}
			return ret;
		}, [ -1, Infinity, 0 ] );

		if ( res[ 0 ] > -1 && res[ 2 ] > 0 ) {
			++res[ 0 ];
		}
		return res[ 0 ];
	}
	static #getIndexCrossing( items, movingIndex, ptr, oldPtr ) {
		return items
			.reduce( ( arr, it, i ) => {
				if ( GSUinRange( it.$pos + it.$size / 2, ptr, oldPtr ) ) {
					arr.push( i );
				}
				return arr;
			}, [] )
			.reduce( ( ret, ind ) => {
				const diff = Math.abs( ind - movingIndex );

				if ( diff > ret[ 1 ] ) {
					ret[ 0 ] = ind;
					ret[ 1 ] = diff;
				}
				return ret;
			}, [ -1, 0 ] )[ 0 ];
	}
	static #diffOrderMaps( a, b ) {
		gsuiReorder2.#cleanOrderMap( a );
		gsuiReorder2.#cleanOrderMap( b );
		return GSUdiffObjects( a, b );
	}
	static #cleanOrderMap( map ) {
		GSUforEach( map, it => {
			delete it.$elemParent;
			delete it.$elem;
		} );
	}
	static #createOrderMap( root, itemSel ) {
		return Array.from( root.querySelectorAll( itemSel ) )
			.reduce( ( obj, el ) => {
				obj[ el.dataset.id ] = {
					order: +getComputedStyle( el ).order,
					parent: el.parentNode.dataset.id,
					$elemParent: el.parentNode,
					$elem: el,
				};
				return obj;
			}, {} );
	}
	static #findElemIndex( items, el ) {
		return items.findIndex( it => el === it.$elem );
	}
	static #createItemsData( par, itemSel ) {
		const dirX = gsuiReorder2.#isDirX( par );

		return Array.from( par.children )
			.filter( el => el.matches( itemSel ) )
			.map( el => {
				const bcr = el.getBoundingClientRect();

				return {
					$elem: el,
					$pos: dirX ? bcr.x : bcr.y,
					$size: dirX ? el.clientWidth : el.clientHeight,
					$order: +getComputedStyle( el ).order,
				};
			} )
			.sort( ( a, b ) => a.$pos - b.$pos );
	}
	static #reorderMoving( items, elItem, ind ) {
		const items2 = items.filter( it => it.$elem !== elItem );

		items2.forEach( ( it, i ) => gsuiReorder2.#setElemOrder( it.$elem, i < ind ? i : i + 1 ) );
		if ( elItem ) {
			gsuiReorder2.#setElemOrder( elItem, ind );
		}
	}
	static #setElemOrder( el, n ) {
		el.style.order = n;
		if ( GSUdomIsCustomElement( el ) ) {
			GSUsetAttribute( el, "order", n );
		}
	}
	static #createGhostElement( elItem, elGrip, e ) {
		const itemSt = getComputedStyle( elItem );
		const itemBCR = elItem.getBoundingClientRect();
		const gripBCR = elGrip.getBoundingClientRect();
		const w = elItem.clientWidth;
		const h = elItem.clientHeight;
		const style = {
			top: `${ e.clientY }px`,
			left: `${ e.clientX }px`,
			marginTop: `-${ e.clientY - itemBCR.y }px`,
			marginLeft: `-${ e.clientX - itemBCR.x }px`,
			width: `${ w }px`,
			height: `${ h }px`,
			borderRadius: itemSt.borderRadius,
		};
		const fakeGrip = GSUcreateDiv( { id: "gsuiReorder-fake-grip", style: {
			top: `${ gripBCR.y - itemBCR.y }px`,
			left: `${ gripBCR.x - itemBCR.x }px`,
			width: `${ elGrip.clientWidth }px`,
			height: `${ elGrip.clientHeight }px`,
		} } );
		const movingFake = GSUcreateDiv( { id: "gsuiReorder-fake", style }, fakeGrip );

		document.body.append( movingFake );
		return movingFake;
	}
}

/*
1. Needed for Apple.
*/
