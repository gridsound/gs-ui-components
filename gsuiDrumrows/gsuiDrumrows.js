"use strict";

class gsuiDrumrows extends gsui0ne {
	#rows = new Map();
	#dragoverId = null;
	#elDragover = null;
	#timeoutIdDragleave = null;

	constructor() {
		super( {
			$cmpName: "gsuiDrumrows",
			$tagName: "gsui-drumrows",
		} );
		Object.seal( this );
		this.ondrop = this.#ondropRows.bind( this );
		this.ondragover = this.#ondragoverRows.bind( this );
		this.ondragstart = e => e.stopPropagation();
		this.onmousedown = this.#onmousedownRows.bind( this );
		GSUlistenEvents( this, {
			gsuiDrumrow: {
				remove: ( d, el ) => this.$dispatch( "remove", el.dataset.id ),
				expand: ( d, el ) => this.$dispatch( "expand", el.dataset.id ),
				toggle: ( d, el ) => this.$dispatch( "toggle", el.dataset.id, ...d.args ),
				toggleSolo: ( d, el ) => this.$dispatch( "toggleSolo", el.dataset.id ),
				changeProp: ( d, el ) => this.$dispatch( "change", "changeDrumrow", el.dataset.id, ...d.args ),
				liveChangeProp: ( d, el ) => this.$dispatch( "liveChangeDrumrow", el.dataset.id, ...d.args ),
				propFilter: ( d, el ) => this.$dispatch( "propFilter", el.dataset.id, ...d.args ),
				propFilters: ( d, el ) => this.$dispatch( "propFilters", ...d.args ),
			},
		} );
	}

	// .........................................................................
	$playRow( id ) {
		this.#rows.get( id ).$play();
	}
	$stopRow( id ) {
		this.#rows.get( id ).$stop();
	}
	$setPropFilter( rowId, prop ) {
		GSUsetAttribute( this.#getPropSelect( rowId ), "prop", prop );
	}
	$setDrumPropValue( rowId, prop, val ) {
		GSUsetAttribute( this.#getPropSelect( rowId ), "value", val );
	}
	$removeDrumPropValue( rowId, prop ) {
		GSUsetAttribute( this.#getPropSelect( rowId ), "value", false );
	}
	#getPropSelect( rowId ) {
		return this.#rows.get( rowId ).querySelector( "gsui-prop-select" );
	}

	// .........................................................................
	$add( id ) {
		const elDrumrow = GSUcreateElement( "gsui-drumrow", { "data-id": id } );

		this.#rows.set( id, elDrumrow );
		this.append( elDrumrow );
		return elDrumrow;
	}
	$remove( id ) {
		this.#rows.get( id ).remove();
		this.#rows.delete( id );
	}
	$change( id, prop, val ) {
		switch ( prop ) {
			case "order":
			case "pan":
			case "name":
			case "gain":
			case "detune":
			case "toggle":
			case "duration":
				GSUsetAttribute( this.#rows.get( id ), prop, val );
				break;
			case "pattern":
				this.#rows.get( id ).$changePattern( val );
				break;
		}
	}

	// .........................................................................
	#onmousedownRows( e ) {
		if ( ( e.button === 0 || e.button === 2 ) && e.target.classList.contains( "gsuiDrumrow-main" ) ) {
			this.$dispatch(
				e.button === 0 ? "liveStartDrum" : "liveStopDrum",
				e.target.parentNode.dataset.id );
		}
	}
	#ondropRows( e ) {
		if ( this.#dragoverId ) {
			const [ bufType, bufId ] = GSUgetDataTransfer( e, [
				"pattern-buffer",
				"library-buffer:default",
				"library-buffer:local",
			] );

			if ( bufId ) {
				this.#dragoverId === Infinity
					? this.$dispatch( "change", "addDrumrow", bufType, bufId )
					: this.$dispatch( "change", "changeDrumrowPattern", this.#dragoverId, bufType, bufId );
			}
		}
		this.#ondragleaveRows();
	}
	#ondragleaveRows() {
		if ( this.#elDragover ) {
			this.#elDragover.classList.remove( "gsuiDrumrows-dragover" );
			this.#elDragover =
			this.#dragoverId = null;
		}
	}
	#ondragoverRows( e ) {
		if ( GSUhasDataTransfer( e, [ "pattern-buffer", "library-buffer:default", "library-buffer:local" ] ) ) {
			const tar = e.target;
			const isParent = tar.nodeName === "GSUI-DRUMROWS";
			const elDragover = isParent ? tar : tar.closest( "gsui-drumrow" );

			clearTimeout( this.#timeoutIdDragleave );
			this.#timeoutIdDragleave = setTimeout( () => this.#ondragleaveRows(), 125 );
			if ( elDragover !== this.#elDragover ) {
				this.#dragoverId = null;
				if ( isParent ) {
					this.#dragoverId = Infinity;
				} else if ( elDragover ) {
					this.#dragoverId = elDragover.dataset.id;
				}
				if ( this.#elDragover ) {
					this.#elDragover.classList.remove( "gsuiDrumrows-dragover" );
				}
				this.#elDragover = elDragover;
				if ( elDragover ) {
					elDragover.classList.add( "gsuiDrumrows-dragover" );
				}
			}
		}
	}
}

GSUdefineElement( "gsui-drumrows", gsuiDrumrows );
