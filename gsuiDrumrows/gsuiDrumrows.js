"use strict";

class gsuiDrumrows extends HTMLElement {
	#rows = new Map();
	#lines = new Map();
	#dragoverId = null;
	#elDragover = null;
	#elLinesParent = null;
	#timeoutIdDragleave = null;
	#dispatch = GSUI.$dispatchEvent.bind( null, this, "gsuiDrumrows" );
	#reorder = new gsuiReorder( {
		rootElement: this,
		direction: "column",
		dataTransferType: "drumrow",
		itemSelector: ".gsuiDrumrow",
		handleSelector: ".gsuiDrumrow-grip",
		parentSelector: "gsui-drumrows",
		onchange: this.#onreorderRows.bind( this ),
	} );

	constructor() {
		super();
		Object.seal( this );

		this.ondrop = this.#ondropRows.bind( this );
		this.onclick = this.#onclickRows.bind( this );
		this.onchange = this.#onchangeRows.bind( this );
		this.ondragover = this.#ondragoverRows.bind( this );
		this.ondragstart = e => e.stopPropagation();
		this.onmousedown = this.#onmousedownRows.bind( this );
		this.oncontextmenu = this.#oncontextmenuRows.bind( this );
		this.onanimationend = this.#onanimationendRows.bind( this );
		GSUI.$listenEvents( this, {
			gsuiToggle: {
				toggle: ( d, btn ) => {
					const id = btn.parentNode.parentNode.dataset.id;

					this.#changeToggle( id, d.args[ 0 ] );
					this.#dispatch( "change", "toggleDrumrow", id, d.args[ 0 ] );
				},
				toggleSolo: ( d, btn ) => {
					const id = btn.parentNode.parentNode.dataset.id;

					this.#changeToggle( id, true );
					this.#dispatch( "change", "toggleSoloDrumrow", id );
				},
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
	setLinesParent( el, childClass ) {
		this.#elLinesParent = el;
		this.#reorder.setShadowElement( el );
		this.#reorder.setShadowChildClass( childClass );
	}
	reorderDrumrows( obj ) {
		gsuiReorder.listReorder( this, obj );
		gsuiReorder.listReorder( this.#elLinesParent, obj );
	}
	playRow( id ) {
		this.#rows.get( id ).root.querySelector( ".gsuiDrumrow-waveWrap" ).append(
			GSUI.$createElement( "div", { class: "gsuiDrumrow-startCursor" } ) );
	}
	stopRow( id ) {
		this.#rows.get( id ).root.querySelectorAll( ".gsuiDrumrow-startCursor" )
			.forEach( el => el.remove() );
	}
	setPropFilter( id, prop ) {
		this.#rows.get( id ).root.querySelector( `.gsuiDrumrow-propRadio[value="${ prop }"]` ).checked = true;
	}
	setDrumPropValue( rowId, prop, val ) {
		const el = this.#getPropBtn( rowId, prop );
		const fixval = prop === "detune" ? val : val.toFixed( 2 );
		const txtval = prop !== "gain"
			? `${ val > 0 ? "+" : "" }${ fixval }`
			: fixval;

		el.classList.add( "gsuiDrumrow-propSpanValue" );
		el.textContent = txtval;
	}
	removeDrumPropValue( rowId, prop ) {
		const el = this.#getPropBtn( rowId, prop );

		el.classList.remove( "gsuiDrumrow-propSpanValue" );
		el.textContent = prop === "detune" ? "pitch" : prop;
	}

	// .........................................................................
	add( id, elLine ) {
		const html = GSUI.$findElements( GSUI.$getTemplate( "gsui-drumrow" ), {
			root: ".gsuiDrumrow",
			name: ".gsuiDrumrow-name",
			toggle: "gsui-toggle",
			detune: ".gsuiDrumrow-detune gsui-slider",
			gain: ".gsuiDrumrow-gain gsui-slider",
			pan: ".gsuiDrumrow-pan gsui-slider",
		} );

		html.root.dataset.id =
		elLine.dataset.id = id;
		this.#rows.set( id, html );
		this.#lines.set( id, elLine );
		this.append( html.root );
		this.#elLinesParent.append( elLine );
		GSUI.$listenEvents( html.root, {
			gsuiSlider: {
				change: ( d, sli ) => this.#onchangeRowSlider( id, sli.dataset.prop, d.args[ 0 ] ),
				input: ( d, sli ) => {
					this.#namePrint( id, sli.dataset.prop, d.args[ 0 ] );
					this.#dispatch( "liveChangeDrumrow", id, sli.dataset.prop, d.args[ 0 ] );
				},
				inputStart: GSUI.$noop,
				inputEnd: () => this.#oninputendRowSlider( id ),
			},
		} );
	}
	remove( id ) {
		this.#rows.get( id ).root.remove();
		this.#lines.get( id ).remove();
		this.#rows.delete( id );
		this.#lines.delete( id );
	}
	change( id, prop, val ) {
		switch ( prop ) {
			case "pan": this.#changePan( id, val ); break;
			case "name": this.#changeName( id, val ); break;
			case "gain": this.#changeGain( id, val ); break;
			case "order": this.#changeOrder( id, val ); break;
			case "detune": this.#changeDetune( id, val ); break;
			case "toggle": this.#changeToggle( id, val ); break;
			case "pattern": this.#changePattern( id, val ); break;
			case "duration": this.#changeDuration( id, val ); break;
		}
	}
	#changePan( id, val ) {
		this.#rows.get( id ).pan.setValue( val );
	}
	#changeGain( id, val ) {
		this.#rows.get( id ).gain.setValue( val );
	}
	#changeDetune( id, val ) {
		this.#rows.get( id ).detune.setValue( val );
	}
	#changeName( id, name ) {
		const el = this.#rows.get( id ).name;

		el.dataset.name =
		el.textContent = name;
	}
	#changeToggle( id, b ) {
		GSUI.$setAttribute( this.#rows.get( id ).toggle, "off", !b );
		this.#rows.get( id ).root.classList.toggle( "gsuiDrumrow-mute", !b );
		this.#lines.get( id ).classList.toggle( "gsuiDrumrow-mute", !b );
	}
	#changeDuration( id, dur ) {
		this.#rows.get( id ).root.querySelector( ".gsuiDrumrow-waveWrap" ).style.animationDuration = `${ dur * 2 }s`;
	}
	#changePattern( id, svg ) {
		const elWave = this.#rows.get( id ).root.querySelector( ".gsuiDrumrow-waveWrap" );

		GSUI.$emptyElement( elWave );
		if ( svg ) {
			svg.classList.add( "gsuiDrumrow-wave" );
			elWave.append( svg );
		}
	}
	#changeOrder( id, order ) {
		this.#rows.get( id ).root.dataset.order =
		this.#lines.get( id ).dataset.order = order;
	}

	// .........................................................................
	#namePrint( id, prop, val ) {
		const el = this.#rows.get( id ).name;
		const text = prop === "pan"
			? `pan: ${ val > 0 ? "+" : "" }${ val.toFixed( 2 ) }`
			: prop === "gain"
				? `gain: ${ val.toFixed( 2 ) }`
				: `pitch: ${ val > 0 ? "+" : "" }${ val }`;

		el.textContent = text;
		el.classList.add( "gsuiDrumrow-nameInfo" );
	}
	#expandProps( id ) {
		this.#rows.get( id ).root.classList.toggle( "gsuiDrumrow-open" );
		this.#lines.get( id ).classList.toggle( "gsuiDrums-lineOpen" );
	}
	#getPropBtn( rowId, prop ) {
		return this.#rows.get( rowId ).root
			.querySelector( `.gsuiDrumrow-propRadio[value="${ prop }"] + .gsuiDrumrow-propSpan` );
	}

	// .........................................................................
	#oninputendRowSlider( id ) {
		const el = this.#rows.get( id ).name;

		el.textContent = el.dataset.name;
		el.classList.remove( "gsuiDrumrow-nameInfo" );
	}
	#onchangeRowSlider( id, prop, val ) {
		this.#dispatch( "change", "changeDrumrow", id, prop, val );
	}
	#onreorderRows( elRow ) {
		const rows = gsuiReorder.listComputeOrderChange( this, {} );

		this.#dispatch( "change", "reorderDrumrow", elRow.dataset.id, rows );
	}
	#onchangeRows( e ) {
		const id = e.target.closest( ".gsuiDrumrow" ).dataset.id;

		this.#dispatch( "propFilter", id, e.target.value );
	}
	#onclickRows( e ) {
		if ( e.target !== this ) {
			const id = e.target.closest( ".gsuiDrumrow" ).dataset.id;

			switch ( e.target.dataset.action ) {
				case "props": this.#expandProps( id ); break;
				case "delete": this.#dispatch( "change", "removeDrumrow", id ); break;
			}
		}
	}
	#onmousedownRows( e ) {
		if ( ( e.button === 0 || e.button === 2 ) && e.target.classList.contains( "gsuiDrumrow-main" ) ) {
			this.#dispatch(
				e.button === 0 ? "liveStartDrum" : "liveStopDrum",
				e.target.parentNode.dataset.id );
		}
	}
	#onanimationendRows( e ) {
		if ( e.target.classList.contains( "gsuiDrumrow-startCursor" ) ) {
			e.target.remove();
		}
	}
	#oncontextmenuRows( e ) {
		e.preventDefault();
		if ( e.target.classList.contains( "gsuiDrumrow-propSpan" ) ) {
			this.#dispatch( "propFilters", e.target.previousElementSibling.value );
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
