"use strict";

class gsuiReorder {
	#opt = Object.seal( {
		$root: null,
		$pxDelay: 0,
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
	#dragging = false;
	#elDragovering = null;
	#elAreaDragovering = null;
	#elPtrDown = null;
	#movingIndex = -1;
	#movingItem = null;
	#movingItemParent = null;
	#movingItemParentLast = null;
	#movingFake = null;
	#currentPtr = null;
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
			GSUunselectText();
			this.#movingItem = e.target.closest( this.#opt.$itemSelector );
			if ( this.#movingItem ) {
				e.preventDefault();
				this.#movingItemParent =
				this.#movingItemParentLast = this.#movingItem.parentNode;
				this.#currentPtr = gsuiReorder.#getGlobalPtr( this.#movingItemParent, e );
				this.#ptrId = e.pointerId;
				this.#opt.$root.addEventListener( "pointermove", this.#onptrmoveBind );
				this.#opt.$root.addEventListener( "pointerup", this.#onptrupBind );
				document.body.addEventListener( "keydown", this.#onkeydownBind );
				this.#elPtrDown = e.target;
				this.#elPtrDown.style.cursor = "grabbing";
			}
		}
	}
	#onptrmove( e ) {
		e.preventDefault(); // 1.
		this.#dragging
			? this.#onptrmoveDrag( e )
			: this.#onptrmovePreDrag( e );
	}
	#onptrup( e ) {
		if ( this.#dragging ) {
			this.#onptrupDrag( e );
		}
		this.#reset();
	}
	#startDragging( e ) {
		this.#itemsData = gsuiReorder.#createItemsData( this.#movingItemParent, this.#opt.$itemSelector );
		this.#movingIndex = gsuiReorder.#findElemIndex( this.#itemsData, this.#movingItem );
		this.#dataSave = gsuiReorder.#createOrderMap( this.#opt.$root, this.#opt.$itemSelector );
		this.#opt.$root.style.cursor = "grabbing";
		this.#elPtrDown.style.cursor = "";
		this.#movingItem.classList.add( "gsuiReorder-dragging" );
		if ( this.#opt.$onchange ) {
			this.#movingItem.classList.add( "gsuiReorder-reordering" );
		}
		this.#movingFake = gsuiReorder.#createGhostElement( this.#movingItem, this.#opt.$itemGripSelector === "*" ? null : e.target, e );
		this.#showTargetList();
		this.#opt.$root.setPointerCapture( this.#ptrId );
		this.#dragging = true;
	}
	#onptrmovePreDrag( e ) {
		const ptr = gsuiReorder.#getGlobalPtr( this.#movingItemParent, e );
		const x = Math.abs( this.#currentPtr.x - ptr.x );
		const y = Math.abs( this.#currentPtr.y - ptr.y );

		if ( x >= this.#opt.$pxDelay || y >= this.#opt.$pxDelay ) {
			this.#currentPtr = ptr;
			this.#startDragging( e );
		}
	}
	#onptrmoveDrag( e ) {
		const oldPtr = this.#currentPtr;
		const par = gsuiReorder.#overWhichParent( this.#opt.$root, this.#opt.$parentSelector, e );
		const ptr = gsuiReorder.#getGlobalPtr( par, e );

		this.#movingFake.style.top = `${ e.clientY }px`;
		this.#movingFake.style.left = `${ e.clientX }px`;
		this.#whatAreDraggingOver( e );
		if ( par && this.#opt.$onchange ) {
			if ( par === this.#movingItemParentLast ) {
				const ind = gsuiReorder.#getIndexCrossing( this.#itemsData, this.#movingIndex, ptr.xy, oldPtr.xy );

				this.#currentPtr = ptr;
				if ( ind > -1 ) {
					gsuiReorder.#reorderMoving( this.#itemsData, this.#movingItem, ind );
					this.#movingIndex = ind;
					this.#itemsData = gsuiReorder.#createItemsData( par, this.#opt.$itemSelector );
				}
			} else {
				const items = gsuiReorder.#createItemsData( par, this.#opt.$itemSelector );
				const newInd = gsuiReorder.#getIndexHovering( items, ptr.xy );

				this.#currentPtr = ptr;
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
	#onptrupDrag( e ) {
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

		if ( orderDiff ) {
			this.#opt.$onchange?.( orderDiff, movingId );
		}
	}
	#onkeydown( e ) {
		if ( e.key === "Escape" ) {
			if ( this.#dragging ) {
				gsuiReorder.#reorderMoving( this.#itemsData, this.#movingItem, Infinity );
				gsuiReorder.#cancelAllChanges( this.#dataSave );
			}
			this.#reset();
		}
	}

	// .........................................................................
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
		const list = this.#opt.$getTargetList?.().filter( Boolean );

		if ( !GSUisEmpty( list ) ) {
			this.#dropAreaList = GSUforEach( list, ( el, i ) => {
				el.classList.add( "gsuiReorder-dropArea" );
				el.style.animationDelay = `${ i * .0125 }s`;
			} );
		}
	}
	#reset() {
		this.#dragging = false;
		this.#elDragovering = null;
		if ( this.#elPtrDown ) {
			this.#elPtrDown.style.cursor = "";
			this.#elPtrDown = null;
		}
		this.#currentPtr = null;
		if ( this.#movingFake ) {
			this.#movingFake.remove();
			this.#movingFake = null;
		}
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
			const [ x, y ] = GSUdomBCRxy( elArea );

			return {
				$item: elItem.dataset.id, // to delete (should be the element)
				$itemElement: elItem,
				$target: elArea,
				$offsetX: e.clientX - x,
				$offsetY: e.clientY - y,
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
		return {
			x: e.clientX,
			y: e.clientY,
			xy: gsuiReorder.#isDirX( par ) ? e.clientX : e.clientY,
		};
	}
	static #isDirX( el ) {
		return !!el && GSUgetStyle( el, "flexDirection" ) === "row";
	}
	static #overWhichParent( elRoot, parSel, e ) {
		const pX = e.offsetX;
		const pY = e.offsetY;
		const [ x, y, w, h ] = GSUdomBCRxywh( elRoot );

		if ( GSUmathInRange( pX, 0, w ) && GSUmathInRange( pY, 0, h ) ) {
			const parents = gsuiReorder.#calcParentsCoord( elRoot, parSel );
			const par = parents.find( par => {
				const parX = par.$bcr[ 0 ] - x;
				const parY = par.$bcr[ 1 ] - y;

				return (
					GSUmathInRange( pX, parX, parX + par.$bcr[ 2 ] ) &&
					GSUmathInRange( pY, parY, parY + par.$bcr[ 3 ] )
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
			: Array.from( GSUdomQSA( root, parSel ) );

		return parents.map( par => ( {
			$elem: par,
			$bcr: GSUdomBCRxywh( par ),
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
				if ( GSUmathInRange( it.$pos + it.$size / 2, ptr, oldPtr ) ) {
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
		return Array.from( GSUdomQSA( root, itemSel ) )
			.reduce( ( obj, el ) => {
				obj[ el.dataset.id ] = {
					order: +GSUgetStyle( el, "order" ),
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
				const [ x, y ] = GSUdomBCRxy( el );

				return {
					$elem: el,
					$pos: dirX ? x : y,
					$size: dirX ? el.clientWidth : el.clientHeight,
					$order: +GSUgetStyle( el, "order" ),
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
			GSUdomSetAttr( el, "order", n );
		}
	}
	static #createGhostElement( elItem, elGrip, e ) {
		const [ x, y, w, h ] = GSUdomBCRxywh( elItem );
		const [ gx, gy, gw, gh ] = GSUdomBCRxywh( elGrip );
		const fakeGrip = elGrip && GSUcreateDiv( { id: "gsuiReorder-fake-grip", style: {
			top: `${ gy - y }px`,
			left: `${ gx - x }px`,
			width: `${ gw }px`,
			height: `${ gh }px`,
		} } );
		const movingFake = GSUcreateDiv( { id: "gsuiReorder-fake", style: {
			top: `${ e.clientY }px`,
			left: `${ e.clientX }px`,
			marginTop: `-${ e.clientY - y }px`,
			marginLeft: `-${ e.clientX - x }px`,
			width: `${ w }px`,
			height: `${ h }px`,
			borderRadius: GSUgetStyle( elItem, "borderRadius" ),
		} }, fakeGrip );

		document.body.append( movingFake );
		return movingFake;
	}
}

/*
1. Needed for Apple.
*/
