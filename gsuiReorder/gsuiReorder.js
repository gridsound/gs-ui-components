"use strict";

class gsuiReorder {
	#opt = Object.seal( {
		$root: null,
		$parentSelector: "",
		$itemSelector: "",
		$itemGripSelector: "*",
		$getTargetList: null,
		$onchange: null,
		$ondrop: null,
		$ondragoverenter: null,
	} );
	#onkeydownBind = this.#onkeydown.bind( this );
	#onptrdownBind = this.#onptrdown.bind( this );
	#onptrmoveBind = this.#onptrmove.bind( this );
	#onptrupBind = this.#onptrup.bind( this );
	#ptrId = null;
	#rootBCR = null;
	#elDragovering = null;
	#elAreaDragovering = null;
	#movingIndex = -1;
	#movingItem = null;
	#movingItemParent = null;
	#movingItemParentLast = null;
	#movingFake = null;
	#currentPx = 0;
	#itemsData = null;
	#dataSave = null;
	#dropAreaList = null;

	constructor( opt ) {
		Object.assign( this.#opt, opt );
		this.#opt.$root.addEventListener( "pointerdown", this.#onptrdownBind );
	}

	// .........................................................................
	#onptrdown( e ) {
		if ( e.target.matches( this.#opt.$itemGripSelector ) ) {
			this.#movingItem = e.target.closest( this.#opt.$itemSelector );
			if ( this.#movingItem ) {
				e.preventDefault();
				this.#rootBCR = this.#opt.$root.getBoundingClientRect();
				this.#movingItemParent =
				this.#movingItemParentLast = this.#movingItem.parentNode;
				this.#currentPx = gsuiReorder.#getGlobalPtr( this.#movingItemParent, e );
				this.#itemsData = gsuiReorder.#createItemsData( this.#movingItemParent, this.#opt.$itemSelector );
				this.#movingItem.classList.add( "gsuiReorder-dragging" );
				if ( this.#opt.$onchange ) {
					this.#movingItem.classList.add( "gsuiReorder-reordering" );
				}
				this.#movingIndex = gsuiReorder.#findElemIndex( this.#itemsData, this.#movingItem );
				this.#dataSave = gsuiReorder.#createOrderMap( this.#opt.$root, this.#opt.$itemSelector );
				this.#opt.$root.style.cursor = "grabbing";
				this.#ptrId = e.pointerId;
				this.#opt.$root.setPointerCapture( this.#ptrId );
				this.#opt.$root.addEventListener( "pointermove", this.#onptrmoveBind );
				this.#opt.$root.addEventListener( "pointerup", this.#onptrupBind );
				document.body.addEventListener( "keydown", this.#onkeydownBind );
				this.#movingFake = gsuiReorder.#createGhostElement( this.#movingItem, this.#opt.$itemGripSelector === "*" ? null : e.target, e );
				GSUunselectText();
				this.#showTargetList();
			}
		}
	}
	#onptrmove( e ) {
		const oldPtr = this.#currentPx;
		const par = gsuiReorder.#overWhichParent( this.#opt.$root, this.#rootBCR, this.#opt.$parentSelector, e );
		const ptr = gsuiReorder.#getGlobalPtr( par, e );

		e.preventDefault(); // 1.
		this.#movingFake.style.top = `${ e.clientY }px`;
		this.#movingFake.style.left = `${ e.clientX }px`;
		this.#whatAreDraggingOver( e );
		if ( par && this.#opt.$onchange ) {
			if ( par === this.#movingItemParentLast ) {
				const ind = gsuiReorder.#getIndexCrossing( this.#itemsData, this.#movingIndex, ptr, oldPtr );

				this.#currentPx = ptr;
				if ( ind > -1 ) {
					gsuiReorder.#reorderMoving( this.#itemsData, this.#movingItem, ind );
					this.#movingIndex = ind;
					this.#itemsData = gsuiReorder.#createItemsData( par, this.#opt.$itemSelector );
				}
			} else {
				const items = gsuiReorder.#createItemsData( par, this.#opt.$itemSelector );
				const newInd = gsuiReorder.#getIndexHovering( items, ptr );

				this.#currentPx = ptr;
				par.append( this.#movingItem );
				gsuiReorder.#reorderMoving( this.#itemsData, this.#movingItem, Infinity );
				gsuiReorder.#reorderMoving( items, this.#movingItem, newInd );
				this.#movingIndex = newInd;
				this.#itemsData = gsuiReorder.#createItemsData( par, this.#opt.$itemSelector );
			}
			this.#movingItemParentLast = par;
		}
		this.#movingItemParent = par;
	}
	#onptrup( e ) {
		if ( !this.#movingItemParent ) {
			const dropInfo = this.#opt.$ondrop && gsuiReorder.#getDropTargetInfo( this.#elAreaDragovering, this.#movingItem, e );

			if ( dropInfo ) {
				this.#opt.$ondrop( dropInfo );
			}
			gsuiReorder.#reorderMoving( this.#itemsData, this.#movingItem, Infinity );
			gsuiReorder.#cancelAllChanges( this.#dataSave );
		}

		const newOrderMap = gsuiReorder.#createOrderMap( this.#opt.$root, this.#opt.$itemSelector );
		const orderDiff = gsuiReorder.#diffOrderMaps( this.#dataSave, newOrderMap );
		const movingId = this.#movingItem.dataset.id;

		this.#reset();
		if ( orderDiff ) {
			this.#opt.$onchange?.( orderDiff, movingId );
		}
	}
	#onkeydown( e ) {
		if ( e.key === "Escape" ) {
			gsuiReorder.#reorderMoving( this.#itemsData, this.#movingItem, Infinity );
			gsuiReorder.#cancelAllChanges( this.#dataSave );
			this.#reset();
		}
	}
	#whatAreDraggingOver( e ) {
		const elem = document.elementFromPoint( e.clientX, e.clientY );

		if ( elem !== this.#elDragovering ) {
			this.#elDragovering = elem;
			this.#opt.$ondragoverenter?.( elem );
			if ( this.#dropAreaList ) {
				if ( this.#elAreaDragovering ) {
					this.#elAreaDragovering.classList.remove( "gsuiReorder-dropArea-hover" );
				}

				const area = this.#dropAreaList.find( el => el.contains( elem ) ) || null;

				this.#elAreaDragovering = area;
				if ( area ) {
					area.classList.add( "gsuiReorder-dropArea-hover" );
				}
			}
		}
	}
	#showTargetList() {
		const list = this.#opt.$getTargetList?.();

		if ( !GSUisEmpty( list ) ) {
			this.#dropAreaList = GSUforEach( list, ( el, i ) => {
				el.classList.add( "gsuiReorder-dropArea" );
				el.style.animationDelay = `${ i * .0125 }s`;
			} );
		}
	}
	#reset() {
		this.#movingFake.remove();
		this.#movingFake = null;
		this.#elDragovering = null;
		if ( this.#elAreaDragovering ) {
			this.#elAreaDragovering.classList.remove( "gsuiReorder-dropArea-hover" );
			this.#elAreaDragovering = null;
		}
		GSUforEach( this.#dropAreaList, el => {
			el.classList.remove( "gsuiReorder-dropArea" );
			el.style.animationDelay = "";
		} );
		this.#dropAreaList = null;
		this.#itemsData = null;
		this.#dataSave = null;
		if ( this.#movingItem ) {
			this.#movingItem.classList.remove( "gsuiReorder-dragging", "gsuiReorder-reordering" );
			this.#movingItem = null;
		}
		this.#movingItemParent = null;
		this.#movingItemParentLast = null;
		this.#movingIndex = -1;
		this.#rootBCR = null;
		if ( this.#opt.$root ) {
			this.#opt.$root.style.cursor = "";
			this.#opt.$root.removeEventListener( "pointermove", this.#onptrmoveBind );
			this.#opt.$root.removeEventListener( "pointerup", this.#onptrupBind );
			this.#opt.$root.releasePointerCapture( this.#ptrId );
			document.body.removeEventListener( "keydown", this.#onkeydownBind );
			this.#ptrId = null;
		}
	}

	// .........................................................................
	static #getDropTargetInfo( elArea, elItem, e ) {
		if ( elArea ) {
			const elemBCR = elArea.getBoundingClientRect();

			return {
				$item: elItem.dataset.id,
				$target: elArea,
				$offsetX: e.clientX - elemBCR.x,
				$offsetY: e.clientY - elemBCR.y,
			};
		}
		return null;
	}
	static #cancelAllChanges( orderMapSave ) {
		GSUforEach( orderMapSave, it => {
			gsuiReorder.#setElemOrder( it.$elem, it.order );
			if ( it.$elemParent !== it.$elem.parentNode ) {
				it.$elemParent.append( it.$elem );
			}
		} );
	}

	// .........................................................................
	static #getGlobalPtr( par, e ) {
		return gsuiReorder.#isDirX( par ) ? e.clientX : e.clientY;
	}
	static #isDirX( el ) {
		return !!el && getComputedStyle( el ).flexDirection === "row";
	}
	static #overWhichParent( elRoot, rootBCR, parSel, e ) {
		const pX = e.offsetX;
		const pY = e.offsetY;
		const overRoot =
			GSUinRange( pX, 0, rootBCR.width ) &&
			GSUinRange( pY, 0, rootBCR.height );

		if ( overRoot ) {
			const parents = gsuiReorder.#calcParentsCoord( elRoot, parSel );
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
		}, [ 0, Infinity, 0 ] );

		if ( res[ 2 ] > 0 && items.length > 0 ) {
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
		gsuiReorder.#cleanOrderMap( a );
		gsuiReorder.#cleanOrderMap( b );
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
					parent: el.parentNode.closest( "[data-id]" )?.dataset.id || null,
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
		const dirX = gsuiReorder.#isDirX( par );

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

		items2.forEach( ( it, i ) => gsuiReorder.#setElemOrder( it.$elem, i < ind ? i : i + 1 ) );
		if ( elItem ) {
			gsuiReorder.#setElemOrder( elItem, ind );
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
		const gripBCR = elGrip?.getBoundingClientRect();
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
		const fakeGrip = elGrip && GSUcreateDiv( { id: "gsuiReorder-fake-grip", style: {
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
