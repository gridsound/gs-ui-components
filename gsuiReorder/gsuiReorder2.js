"use strict";

class gsuiReorder2 {
	#dirX = true;
	#root = null;
	#rootBCR = null;
	#parSel = "";
	#itemSel = "";
	#gripSel = "";
	#onchange = null;
	#onptrdownBind = this.#onptrdown.bind( this );
	#onptrmoveBind = this.#onptrmove.bind( this );
	#onptrupBind = this.#onptrup.bind( this );
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
		this.#onchange = opt.$onchange;
		this.#root.addEventListener( "pointerdown", this.#onptrdownBind );
	}

	// .........................................................................
	#onptrdown( e ) {
		if ( e.target.matches( this.#gripSel ) ) {
			this.#movingItem = e.target.closest( this.#itemSel );
			if ( this.#movingItem ) {
				e.preventDefault();
				this.#rootBCR = this.#root.getBoundingClientRect();
				this.#movingItemParentOriginal = this.#movingItem.parentNode;
				this.#movingItemParent = this.#movingItemParentOriginal;
				this.#dirX = gsuiReorder2.#getDirection( this.#movingItemParent );
				this.#currentPx = this.#dirX ? e.clientX : e.clientY;
				this.#itemsData = gsuiReorder2.#createItemsData( this.#movingItemParent, this.#itemSel );
				this.#movingItem.classList.add( "gsuiReorder-moving" );
				this.#movingIndex = gsuiReorder2.#findElemIndex( this.#itemsData, this.#movingItem );
				this.#parentsCoord = gsuiReorder2.#calcParentsCoord( this.#root, this.#parSel );
				this.#dataSave = gsuiReorder2.#createOrderMap( this.#itemsData );
				this.#root.setPointerCapture( e.pointerId );
				this.#root.addEventListener( "pointermove", this.#onptrmoveBind );
				this.#root.addEventListener( "pointerup", this.#onptrupBind );
				this.#root.style.cursor = "grabbing";
				this.#movingFake = gsuiReorder2.#createGhostElement( this.#movingItem, e.target, e );
				GSUunselectText();
			}
		}
	}
	#onptrmove( e ) {
		const oldPtr = this.#currentPx;
		const ptr = this.#dirX ? e.clientX : e.clientY;
		const par = gsuiReorder2.#overWhichParent( this.#rootBCR, this.#parentsCoord, e );

		e.preventDefault(); // 1.
		this.#movingFake.style.top = `${ e.clientY }px`;
		this.#movingFake.style.left = `${ e.clientX }px`;
		if ( par ) {
			const ind = gsuiReorder2.#getIndexCrossing( this.#itemsData, this.#movingIndex, ptr, oldPtr );

			this.#currentPx = ptr;
			if ( ind > -1 ) {
				gsuiReorder2.#reorderMoving( this.#itemsData, this.#movingItem, ind );
				this.#movingIndex = ind;
				this.#itemsData = gsuiReorder2.#createItemsData( this.#movingItemParent, this.#itemSel );
			}
		}
	}
	#onptrup( e ) {
		const orderDiff = GSUdiffObjects( this.#dataSave, gsuiReorder2.#createOrderMap( this.#itemsData ) );
		const movingId = this.#movingItem.dataset.id;

		this.#movingFake.remove();
		this.#movingFake = null;
		this.#itemsData = null;
		this.#dataSave = null;
		this.#movingItem.classList.remove( "gsuiReorder-moving" );
		this.#movingItem = null;
		this.#movingItemParent = null;
		this.#movingItemParentOriginal = null;
		this.#movingIndex = -1;
		this.#parentsCoord = null;
		this.#rootBCR = null;
		this.#root.style.cursor = "";
		this.#root.removeEventListener( "pointermove", this.#onptrmoveBind );
		this.#root.removeEventListener( "pointerup", this.#onptrupBind );
		this.#root.releasePointerCapture( e.pointerId );
		if ( orderDiff ) {
			this.#onchange?.( orderDiff, movingId );
		}
	}

	// .........................................................................
	static #getDirection( el ) {
		return getComputedStyle( el ).gridAutoFlow !== "row";
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
	static #createOrderMap( items ) {
		return items.reduce( ( obj, it ) => ( obj[ it.$elem.dataset.id ] = { order: it.$order }, obj ), {} );
	}
	static #findElemIndex( items, el ) {
		return items.findIndex( it => el === it.$elem );
	}
	static #createItemsData( par, itemSel ) {
		const dirX = gsuiReorder2.#getDirection( par );

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
		GSUarrayRemove( items, it => it.$elem === elItem );
		items.forEach( ( it, i ) => gsuiReorder2.#setElemOrder( it.$elem, i < ind ? i : i + 1 ) );
		gsuiReorder2.#setElemOrder( elItem, ind );
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
