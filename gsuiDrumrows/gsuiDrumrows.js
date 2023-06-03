"use strict";

class gsuiDrumrows extends HTMLElement {
	#rows = new Map();
	#dragoverId = null;
	#elDragover = null;
	#timeoutIdDragleave = null;
	#dispatch = GSUI.$dispatchEvent.bind( null, this, "gsuiDrumrows" );

	constructor() {
		super();
		Object.seal( this );
		this.ondrop = this.#ondropRows.bind( this );
		this.ondragover = this.#ondragoverRows.bind( this );
		this.ondragstart = e => e.stopPropagation();
		this.onmousedown = this.#onmousedownRows.bind( this );
		GSUI.$listenEvents( this, {
			gsuiDrumrow: {
				remove: ( d, el ) => this.#dispatch( "remove", el.dataset.id ),
				expand: ( d, el ) => this.#dispatch( "expand", el.dataset.id ),
				toggle: ( d, el ) => this.#dispatch( "toggle", el.dataset.id, ...d.args ),
				toggleSolo: ( d, el ) => this.#dispatch( "change", "toggleSoloDrumrow", el.dataset.id ),
				changeProp: ( d, el ) => this.#dispatch( "change", "changeDrumrow", el.dataset.id, ...d.args ),
				liveChangeProp: ( d, el ) => this.#dispatch( "liveChangeDrumrow", el.dataset.id, ...d.args ),
				propFilter: ( d, el ) => this.#dispatch( "propFilter", el.dataset.id, ...d.args ),
				propFilters: ( d, el ) => this.#dispatch( "propFilters", ...d.args ),
			},
		} );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( ...GSUI.$getTemplate( "gsui-drumrows" ) );
		}
	}

	// .........................................................................
	playRow( id ) {
		this.#rows.get( id ).$start();
	}
	stopRow( id ) {
		this.#rows.get( id ).$stop();
	}
	setPropFilter( id, prop ) {
		this.#rows.get( id ).querySelector( `.gsuiDrumrow-propRadio[value="${ prop }"]` ).checked = true;
	}
	$setDrumPropValue( rowId, prop, val ) {
		const el = this.#getPropBtn( rowId, prop );
		const fixval = prop === "detune" ? val : val.toFixed( 2 );
		const txtval = prop !== "gain"
			? `${ val > 0 ? "+" : "" }${ fixval }`
			: fixval;

		el.classList.add( "gsuiDrumrow-propSpanValue" );
		el.textContent = txtval;
	}
	$removeDrumPropValue( rowId, prop ) {
		const el = this.#getPropBtn( rowId, prop );

		el.classList.remove( "gsuiDrumrow-propSpanValue" );
		el.textContent = prop === "detune" ? "pitch" : prop;
	}

	// .........................................................................
	add( id ) {
		const elDrumrow = GSUI.$createElement( "gsui-drumrow", { "data-id": id } );

		this.#rows.set( id, elDrumrow );
		this.append( elDrumrow );
	}
	remove( id ) {
		this.#rows.get( id ).remove();
		this.#rows.delete( id );
	}
	change( id, prop, val ) {
		switch ( prop ) {
			case "pan":
			case "name":
			case "gain":
			case "detune":
			case "toggle":
			case "duration":
				GSUI.$setAttribute( this.#rows.get( id ), prop, val );
				break;
			case "pattern":
				this.#rows.get( id ).$changePattern( val );
				break;
		}
	}

	// .........................................................................
	#getPropBtn( rowId, prop ) {
		return this.#rows.get( rowId ).querySelector( `.gsuiDrumrow-propRadio[value="${ prop }"] + .gsuiDrumrow-propSpan` );
	}

	// .........................................................................
	#onmousedownRows( e ) {
		if ( ( e.button === 0 || e.button === 2 ) && e.target.classList.contains( "gsuiDrumrow-main" ) ) {
			this.#dispatch(
				e.button === 0 ? "liveStartDrum" : "liveStopDrum",
				e.target.parentNode.dataset.id );
		}
	}
	#ondropRows( e ) {
		if ( this.#dragoverId ) {
			const patId = e.dataTransfer.getData( "pattern-buffer" );

			if ( patId ) {
				this.#dragoverId === Infinity
					? this.#dispatch( "change", "addDrumrow", patId )
					: this.#dispatch( "change", "changeDrumrowPattern", this.#dragoverId, patId );
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
		if ( e.dataTransfer.types.includes( "pattern-buffer" ) ) {
			const tar = e.target;
			const isParent = tar.nodeName === "GSUI-DRUMROWS";
			const elDragover = isParent ? tar : tar.closest( ".gsuiDrumrow" );

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

Object.freeze( gsuiDrumrows );
customElements.define( "gsui-drumrows", gsuiDrumrows );
