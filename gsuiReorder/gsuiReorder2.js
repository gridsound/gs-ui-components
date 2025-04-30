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
	#movingFake = null;
	#parentsCoord = null;
	#currentPx = 0;
	#ptrMargin = { x: 0, y: 0 };
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
				this.#movingItemParent = this.#movingItem.parentNode;
				this.#dirX = getComputedStyle( this.#movingItemParent ).gridAutoFlow !== "row";
				this.#currentPx = this.#dirX ? e.clientX : e.clientY;
				this.#createItemsData();
				this.#movingItem.classList.add( "gsuiReorder-moving" );
				this.#movingIndex = this.#findElemIndex( this.#movingItem );
				this.#parentsCoord = this.#calcParentsCoord();
				this.#dataSave = this.#createOrderMap();
				this.#root.setPointerCapture( e.pointerId );
				this.#root.addEventListener( "pointermove", this.#onptrmoveBind );
				this.#root.addEventListener( "pointerup", this.#onptrupBind );
				this.#root.style.cursor = "grabbing";
				this.#createFake( e, e.target );
				GSUunselectText();
			}
		}
	}
	#onptrmove( e ) {
		const oldPtr = this.#currentPx;
		const ptr = this.#dirX ? e.clientX : e.clientY;
		const par = this.#overWhichParent( e );

		e.preventDefault(); // 1.
		this.#movingFake.style.top = `${ e.clientY - this.#ptrMargin.y }px`;
		this.#movingFake.style.left = `${ e.clientX - this.#ptrMargin.x }px`;
		if ( par ) {
			const ind = this.#getIndexCrossing( ptr, oldPtr );

			this.#currentPx = ptr;
			if ( ind > -1 ) {
				this.#reorderMoving( ind );
				this.#createItemsData();
			}
		}
	}
	#onptrup( e ) {
		const orderDiff = GSUdiffObjects( this.#dataSave, this.#createOrderMap() );
		const movingId = this.#movingItem.dataset.id;

		this.#destroyFake();
		this.#itemsData = null;
		this.#dataSave = null;
		this.#movingItem.classList.remove( "gsuiReorder-moving" );
		this.#movingItem = null;
		this.#movingItemParent = null;
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
	#overWhichParent( e ) {
		const pX = e.offsetX;
		const pY = e.offsetY;
		const overRoot =
			GSUinRange( pX, 0, this.#rootBCR.width ) &&
			GSUinRange( pY, 0, this.#rootBCR.height );

		if ( overRoot ) {
			const par = this.#parentsCoord.find( par => {
				const parX = par.$bcr.x - this.#rootBCR.x;
				const parY = par.$bcr.y - this.#rootBCR.y;

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
	#calcParentsCoord() {
		return Array.from( this.#root.querySelectorAll( this.#parSel ) ).map( par => ( {
			$elem: par,
			$bcr: par.getBoundingClientRect(),
		} ) );
	}
	#getIndexCrossing( ptr, oldPtr ) {
		return this.#itemsData
			.reduce( ( arr, it, i ) => {
				if ( GSUinRange( it.$pos + it.$size / 2, ptr, oldPtr ) ) {
					arr.push( i );
				}
				return arr;
			}, [] )
			.reduce( ( ret, ind ) => {
				const diff = Math.abs( ind - this.#movingIndex );

				if ( diff > ret[ 1 ] ) {
					ret[ 0 ] = ind;
					ret[ 1 ] = diff;
				}
				return ret;
			}, [ -1, 0 ] )[ 0 ];
	}
	#createOrderMap() {
		return this.#itemsData.reduce( ( obj, it ) => ( obj[ it.$elem.dataset.id ] = { order: it.$order }, obj ), {} );
	}
	#findElemIndex( el ) {
		return this.#itemsData.findIndex( it => el === it.$elem );
	}
	#createItemsData() {
		this.#itemsData = Array.from( this.#movingItemParent.children )
			.filter( el => el.matches( this.#itemSel ) )
			.map( el => {
				const bcr = el.getBoundingClientRect();

				return {
					$elem: el,
					$pos: this.#dirX ? bcr.x : bcr.y,
					$size: this.#dirX ? el.clientWidth : el.clientHeight,
					$order: +getComputedStyle( el ).order,
				};
			} )
			.sort( ( a, b ) => a.$pos - b.$pos );
	}
	#reorderMoving( ind ) {
		GSUarrayRemove( this.#itemsData, it => it.$elem === this.#movingItem );
		this.#itemsData.forEach( ( it, i ) => this.#setElemOrder( it.$elem, i < ind ? i : i + 1 ) );
		this.#setElemOrder( this.#movingItem, ind );
		this.#movingIndex = ind;
	}
	#setElemOrder( el, n ) {
		el.style.order = n;
		if ( GSUdomIsCustomElement( el ) ) {
			GSUsetAttribute( el, "order", n );
		}
	}

	// .........................................................................
	#destroyFake() {
		this.#movingFake.remove();
		this.#movingFake = null;
	}
	#createFake( e, elGrip ) {
		const itemSt = getComputedStyle( this.#movingItem );
		const itemBCR = this.#movingItem.getBoundingClientRect();
		const gripBCR = elGrip.getBoundingClientRect();
		const w = this.#movingItem.clientWidth;
		const h = this.#movingItem.clientHeight;
		const style = {
			top: `${ itemBCR.y }px`,
			left: `${ itemBCR.x }px`,
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

		this.#ptrMargin.x = e.clientX - itemBCR.x;
		this.#ptrMargin.y = e.clientY - itemBCR.y;
		this.#movingFake = GSUcreateDiv( { id: "gsuiReorder-fake", style }, fakeGrip );
		document.body.append( this.#movingFake );
	}
}

/*
1. Needed for Apple.
*/
