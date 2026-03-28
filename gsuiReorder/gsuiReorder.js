"use strict";

class gsuiReorder {
	#opt = Object.seal( {
		$root: $noop,
		$pxDelay: 0,
		$parentSelector: "",
		$itemSelector: "",
		$itemGripSelector: "*",
		$getTargetList: () => $noop,
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
	#elPtrDown = $noop;
	#movingItem = $noop;
	#movingFake = $noop;
	#dropAreaList = $noop;
	#elDragovering = $noop;
	#elAreaDragovering = $noop;
	#movingItemParent = $noop;
	#movingItemParentLast = $noop;
	#movingIndex = -1;
	#currentPtr = null;
	#itemsData = null;
	#dataSave = null;

	constructor( opt ) {
		Object.assign( this.#opt, opt );
		this.#opt.$root.$addEventListener( "pointerdown", this.#onptrdownBind );
	}

	// .........................................................................
	#onptrdown( e ) {
		const tar = $( e.target );

		if ( tar.$is( this.#opt.$itemGripSelector ) ) {
			GSUdomUnselect();
			this.#movingItem = tar.$closest( this.#opt.$itemSelector );
			if ( this.#movingItem.$size() ) {
				e.preventDefault();
				this.#movingItemParent =
				this.#movingItemParentLast = this.#movingItem.$parent();
				this.#currentPtr = gsuiReorder.#getGlobalPtr( this.#movingItemParent, e );
				this.#ptrId = e.pointerId;
				this.#opt.$root.$addEventListener( "pointermove", this.#onptrmoveBind );
				this.#opt.$root.$addEventListener( "pointerup", this.#onptrupBind );
				$body.$addEventListener( "keydown", this.#onkeydownBind );
				this.#elPtrDown = tar.$css( "cursor", "grabbing" );
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
		this.#opt.$root.$css( "cursor", "grabbing" );
		this.#elPtrDown.$css( "cursor", "" );
		this.#movingItem.$addClass( "gsuiReorder-dragging" );
		if ( this.#opt.$onchange ) {
			this.#movingItem.$addClass( "gsuiReorder-reordering" );
		}
		this.#movingFake = gsuiReorder.#createGhostElement( this.#movingItem, this.#opt.$itemGripSelector === "*" ? null : e.target, e );
		this.#showTargetList();
		this.#opt.$root.$get( 0 ).setPointerCapture( this.#ptrId );
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

		this.#movingFake
			.$top( e.clientY, "px" )
			.$left( e.clientX, "px" );
		this.#whatAreDraggingOver( e );
		if ( par.$size() && this.#opt.$onchange ) {
			if ( par.$is( this.#movingItemParentLast ) ) {
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
				this.#movingItem.$appendTo( par );
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
		if ( !this.#movingItemParent.$size() ) {
			const dropInfo = this.#opt.$ondrop && gsuiReorder.#getDropTargetInfo( this.#elAreaDragovering, this.#movingItem, e );

			if ( dropInfo ) {
				this.#opt.$ondrop( dropInfo );
			}
			gsuiReorder.#reorderMoving( this.#itemsData, this.#movingItem, Infinity );
			gsuiReorder.#cancelAllChanges( this.#dataSave );
		}

		const newOrderMap = gsuiReorder.#createOrderMap( this.#opt.$root, this.#opt.$itemSelector );
		const orderDiff = gsuiReorder.#diffOrderMaps( this.#dataSave, newOrderMap );
		const movingId = this.#movingItem.$dataId();

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
		const elem = $.$getElemByPoint( e.clientX, e.clientY );

		if ( !elem.$is( this.#elDragovering ) ) {
			this.#elDragovering = elem;
			this.#opt.$ondragoverenter?.( elem );
			this.#elAreaDragovering.$rmClass( "gsuiReorder-dropArea-hover" );
			this.#elAreaDragovering = $( this.#dropAreaList.$find( el => el.contains( elem.$get( 0 ) ) ) );
			this.#elAreaDragovering.$addClass( "gsuiReorder-dropArea-hover" );
		}
	}
	#showTargetList() {
		this.#dropAreaList = this.#opt.$getTargetList()
			.$addClass( "gsuiReorder-dropArea" )
			.$css( "animationDelay", ( _, i ) => `${ i * .0125 }s` );
	}
	#reset() {
		this.#dragging = false;
		this.#elPtrDown.$css( "cursor", "" );
		this.#movingFake.$remove();
		this.#movingItem.$rmClass( "gsuiReorder-dragging", "gsuiReorder-reordering" );
		this.#elAreaDragovering.$rmClass( "gsuiReorder-dropArea-hover" );
		this.#dropAreaList
			.$rmClass( "gsuiReorder-dropArea" )
			.$css( "animationDelay", "" );
		this.#dataSave =
		this.#itemsData =
		this.#currentPtr = null;
		this.#elPtrDown =
		this.#movingItem =
		this.#movingFake =
		this.#dropAreaList =
		this.#elDragovering =
		this.#elAreaDragovering =
		this.#movingItemParent =
		this.#movingItemParentLast = $noop;
		this.#movingIndex = -1;
		if ( this.#opt.$root.$size() ) {
			this.#opt.$root
				.$css( "cursor", "" )
				.$rmEventListener( "pointermove", this.#onptrmoveBind )
				.$rmEventListener( "pointerup", this.#onptrupBind )
				.$get( 0 ).releasePointerCapture( this.#ptrId );
			$body.$rmEventListener( "keydown", this.#onkeydownBind );
			this.#ptrId = null;
		}
	}

	// .........................................................................
	static #getDropTargetInfo( elArea, elItem, e ) {
		if ( elArea.$size() ) {
			const { x, y } = elArea.$bcr();

			return {
				$item: elItem.$dataId(), // to delete (should be the element)
				$itemElement: elItem.$get( 0 ),
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
			if ( !it.$elem.$parent().$is( it.$elemParent ) ) {
				it.$elem.$appendTo( it.$elemParent );
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
		return el.$css( "flexDirection" ) === "row";
	}
	static #overWhichParent( elRoot, parSel, e ) {
		const pX = e.offsetX;
		const pY = e.offsetY;
		const { x, y, w, h } = elRoot.$bcr();

		if ( GSUmathInRange( pX, 0, w ) && GSUmathInRange( pY, 0, h ) ) {
			const parents = gsuiReorder.#calcParentsCoord( elRoot.$get( 0 ), parSel );
			const par = parents.find( par => {
				const parX = par.$bcr.x - x;
				const parY = par.$bcr.y - y;

				return (
					GSUmathInRange( pX, parX, parX + par.$bcr.w ) &&
					GSUmathInRange( pY, parY, parY + par.$bcr.h )
				);
			} );

			if ( par ) {
				return par.$elem;
			}
		}
		return $noop;
	}
	static #calcParentsCoord( root, parSel ) {
		const parents = root.matches( parSel )
			? $( root )
			: $( root ).$query( parSel );

		return parents.$map( par => {
			const par2 = $( par );

			return {
				$elem: par2,
				$bcr: par2.$bcr(),
			};
		} );
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
		return root.$query( itemSel ).$reduce( ( obj, el ) => {
			const el2 = $( el );

			obj[ el2.$dataId() ] = {
				order: +el2.$css( "order" ),
				parent: el2.$parent().$closest( "[data-id]" ).$dataId(),
				$elemParent: el2.$parent(),
				$elem: el2,
			};
			return obj;
		}, {} );
	}
	static #findElemIndex( items, el ) {
		return items.findIndex( it => it.$elem.$is( el ) );
	}
	static #createItemsData( par, itemSel ) {
		const dirX = gsuiReorder.#isDirX( par );

		return par.$children()
			.$filter( itemSel )
			.$map( el => {
				const el2 = $( el );
				const { x, y } = el2.$bcr();

				return {
					$elem: el2,
					$pos: dirX ? x : y,
					$size: dirX ? el2.$width() : el2.$height(),
					$order: +el2.$css( "order" ),
				};
			} )
			.sort( ( a, b ) => a.$pos - b.$pos );
	}
	static #reorderMoving( items, elItem, ind ) {
		const items2 = items.filter( it => !it.$elem.$is( elItem ) );

		items2.forEach( ( it, i ) => gsuiReorder.#setElemOrder( it.$elem, i < ind ? i : i + 1 ) );
		if ( elItem.$size() ) {
			gsuiReorder.#setElemOrder( elItem, ind );
		}
	}
	static #setElemOrder( el, n ) {
		el.$css( "order", n );
		if ( el.$tag().includes( "-" ) ) {
			el.$setAttr( "order", n );
		}
	}
	static #createGhostElement( elItem, elGrip, e ) {
		const { x, y, w, h } = elItem.$bcr();
		const movFake = $( "<div>" )
			.$setAttr( "id", "gsuiReorder-fake" )
			.$css( {
				top: `${ e.clientY }px`,
				left: `${ e.clientX }px`,
				marginTop: `-${ e.clientY - y }px`,
				marginLeft: `-${ e.clientX - x }px`,
				width: `${ w }px`,
				height: `${ h }px`,
				borderRadius: elItem.$css( "borderRadius" ),
			} );

		if ( elGrip ) {
			const grBCR = $( elGrip ).$bcr();

			$( "<div>" )
				.$setAttr( "id", "gsuiReorder-fake-grip" )
				.$css( {
					top: `${ grBCR.y - y }px`,
					left: `${ grBCR.x - x }px`,
					width: `${ grBCR.w }px`,
					height: `${ grBCR.h }px`,
				} )
				.$appendTo( movFake );
		}
		$body.$append( movFake );
		return movFake;
	}
}

/*
1. Needed for Apple.
*/
