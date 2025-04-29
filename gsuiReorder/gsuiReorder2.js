"use strict";

class gsuiReorder2 {
	#dirX = true;
	#parent = null;
	#itemSel = "";
	#gripSel = "";
	#onchange = null;
	#onptrdownBind = this.#onptrdown.bind( this );
	#onptrmoveBind = this.#onptrmove.bind( this );
	#onptrupBind = this.#onptrup.bind( this );
	#movingItem = null;
	#movingFake = null;
	#currentIndex = -1;
	#ptrMargin = { x: 0, y: 0 };
	#itemsData = null;
	#dataSave = null;

	constructor( opt ) {
		this.#parent = opt.$parent;
		this.#itemSel = opt.$itemSelector;
		this.#gripSel = opt.$itemGripSelector;
		this.#onchange = opt.$onchange;
		this.#parent.addEventListener( "pointerdown", this.#onptrdownBind );
	}

	// .........................................................................
	#onptrdown( e ) {
		if ( e.target.matches( this.#gripSel ) ) {
			this.#movingItem = e.target.closest( this.#itemSel );
			if ( this.#movingItem ) {
				e.preventDefault();
				this.#dirX = getComputedStyle( this.#parent ).gridAutoFlow !== "row";
				this.#movingItem.classList.add( "gsuiReorder-moving" );
				this.#createItemsData();
				this.#dataSave = this.#createOrderMap();
				this.#parent.setPointerCapture( e.pointerId );
				this.#parent.addEventListener( "pointermove", this.#onptrmoveBind );
				this.#parent.addEventListener( "pointerup", this.#onptrupBind );
				this.#parent.style.cursor = "grabbing";
				this.#createFake( e, e.target );
				GSUunselectText();
			}
		}
	}
	#onptrmove( e ) {
		const ptr = this.#dirX ? e.clientX : e.clientY;
		const ind = this.#itemsData.findIndex( it => GSUinRange( ptr, it.$pos, it.$pos + it.$size ) );

		this.#movingFake.style.top = `${ e.clientY - this.#ptrMargin.y }px`;
		this.#movingFake.style.left = `${ e.clientX - this.#ptrMargin.x }px`;
		if ( ind > -1 && ind !== this.#currentIndex ) {
			this.#currentIndex = ind;
			this.#reorderMoving( ind );
			this.#createItemsData();
		}
	}
	#onptrup( e ) {
		const orderDiff = GSUdiffObjects( this.#dataSave, this.#createOrderMap() );
		const movingId = this.#movingItem.dataset.id;

		this.#destroyFake();
		this.#currentIndex = -1;
		this.#itemsData = null;
		this.#dataSave = null;
		this.#movingItem.classList.remove( "gsuiReorder-moving" );
		this.#movingItem = null;
		this.#parent.style.cursor = "";
		this.#parent.removeEventListener( "pointermove", this.#onptrmoveBind );
		this.#parent.removeEventListener( "pointerup", this.#onptrupBind );
		this.#parent.releasePointerCapture( e.pointerId );
		if ( orderDiff ) {
			this.#onchange?.( orderDiff, movingId );
		}
	}

	// .........................................................................
	#createOrderMap() {
		return this.#itemsData.reduce( ( obj, it ) => ( obj[ it.$elem.dataset.id ] = { order: it.$order }, obj ), {} );
	}
	#createItemsData() {
		this.#itemsData = Array.from( this.#parent.children )
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
		this.#itemsData.forEach( ( it, i ) => it.$elem.style.order = i < ind ? i : i + 1 );
		this.#movingItem.style.order = ind;
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
