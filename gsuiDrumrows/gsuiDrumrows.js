"use strict";

class gsuiDrumrows {
	constructor() {
		const root = gsuiDrumrows.template.cloneNode( true ),
			reorder = new gsuiReorder( {
				rootElement: root,
				direction: "column",
				dataTransferType: "drumrow",
				itemSelector: ".gsuiDrumrow",
				handleSelector: ".gsuiDrumrow-grip",
				parentSelector: ".gsuiDrumrows",
				onchange: this._onreorderRows.bind( this ),
			} );

		this.rootElement = root;
		this._rows = new Map();
		this._lines = new Map();
		this._reorder = reorder;
		this._dragoverId =
		this._elDragover =
		this._elLinesParent = null;
		this._dispatch = GSUtils.dispatchEvent.bind( null, root, "gsuiDrumrows" );
		Object.seal( this );

		root.ondrop = this._ondropRows.bind( this );
		root.onclick = this._onclickRows.bind( this );
		root.onchange = this._onchangeRows.bind( this );
		root.ondragover = this._ondragoverRows.bind( this );
		root.ondragleave = this._ondragleaveRows.bind( this );
		root.onmousedown = this._onmousedownRows.bind( this );
		root.oncontextmenu = this._oncontextmenuRows.bind( this );
		root.onanimationend = this._onanimationendRows.bind( this );
	}

	// .........................................................................
	setLinesParent( el, childClass ) {
		this._elLinesParent = el;
		this._reorder.setShadowElement( el );
		this._reorder.setShadowChildClass( childClass );
	}
	setFontSize( fs ) {
		this.rootElement.style.fontSize =
		this._elLinesParent.style.fontSize = `${ fs }px`;
	}
	reorderDrumrows( obj ) {
		gsuiReorder.listReorder( this.rootElement, obj );
		gsuiReorder.listReorder( this._elLinesParent, obj );
	}
	playRow( id ) {
		const rect = document.createElement( "div" );

		rect.classList.add( "gsuiDrumrow-startCursor" );
		this._rows.get( id ).root.querySelector( ".gsuiDrumrow-waveWrap" ).append( rect );
	}
	stopRow( id ) {
		this._rows.get( id ).root.querySelectorAll( ".gsuiDrumrow-startCursor" )
			.forEach( el => el.remove() );
	}
	setPropFilter( id, prop ) {
		this._rows.get( id ).root.querySelector( `.gsuiDrumrow-propRadio[value="${ prop }"]` ).checked = true;
	}
	setDrumPropValue( rowId, prop, val ) {
		const el = this._getPropBtn( rowId, prop ),
			fixval = prop === "detune" ? val : val.toFixed( 2 ),
			txtval = prop !== "gain"
				? `${ val > 0 ? "+" : "" }${ fixval }`
				: fixval;

		el.classList.add( "gsuiDrumrow-propSpanValue" );
		el.textContent = txtval;
	}
	removeDrumPropValue( rowId, prop ) {
		const el = this._getPropBtn( rowId, prop );

		el.classList.remove( "gsuiDrumrow-propSpanValue" );
		el.textContent = prop === "detune" ? "pitch" : prop;
	}

	// .........................................................................
	add( id, elLine ) {
		const elRow = gsuiDrumrows.templateRow.cloneNode( true ),
			sliDetune = new gsuiSlider(),
			sliGain = new gsuiSlider(),
			sliPan = new gsuiSlider(),
			html = {
				root: elRow,
				name: elRow.querySelector( ".gsuiDrumrow-name" ),
				detune: sliDetune,
				gain: sliGain,
				pan: sliPan,
			};

		elRow.dataset.id =
		elLine.dataset.id = id;
		sliDetune.options( { min: -12, max: 12, step: 1, value: 0, type: "linear-y", mousemoveSize: 400 } );
		sliGain.options( { min: 0, max: 1, step: .01, value: 1, type: "linear-y", mousemoveSize: 400 } );
		sliPan.options( { min: -1, max: 1, step: .02, value: 0, type: "linear-y", mousemoveSize: 400 } );
		sliDetune.oninput = val => {
			this._namePrint( id, `pitch: ${ val > 0 ? "+" : "" }${ val }` );
			this._dispatch( "liveChangeDrumrow", id, "detune", val );
		};
		sliGain.oninput = val => {
			this._namePrint( id, `gain: ${ val.toFixed( 2 ) }` );
			this._dispatch( "liveChangeDrumrow", id, "gain", val );
		};
		sliPan.oninput = val => {
			this._namePrint( id, `pan: ${ val > 0 ? "+" : "" }${ val.toFixed( 2 ) }` );
			this._dispatch( "liveChangeDrumrow", id, "pan", val );
		};
		sliDetune.onchange = this._onchangeRowSlider.bind( this, id, "detune" );
		sliGain.onchange = this._onchangeRowSlider.bind( this, id, "gain" );
		sliPan.onchange = this._onchangeRowSlider.bind( this, id, "pan" );
		sliDetune.oninputend =
		sliGain.oninputend =
		sliPan.oninputend = this._oninputendRowSlider.bind( this, id );
		elRow.querySelector( ".gsuiDrumrow-detune" ).append( sliDetune.rootElement );
		elRow.querySelector( ".gsuiDrumrow-gain" ).append( sliGain.rootElement );
		elRow.querySelector( ".gsuiDrumrow-pan" ).append( sliPan.rootElement );
		this._rows.set( id, html );
		this._lines.set( id, elLine );
		this.rootElement.append( elRow );
		this._elLinesParent.append( elLine );
		sliDetune.attached();
		sliGain.attached();
		sliPan.attached();
	}
	remove( id ) {
		this._rows.get( id ).root.remove();
		this._lines.get( id ).remove();
		this._rows.delete( id );
		this._lines.delete( id );
	}
	change( id, prop, val ) {
		switch ( prop ) {
			case "pan": this._changePan( id, val ); break;
			case "name": this._changeName( id, val ); break;
			case "gain": this._changeGain( id, val ); break;
			case "order": this._changeOrder( id, val ); break;
			case "detune": this._changeDetune( id, val ); break;
			case "toggle": this._changeToggle( id, val ); break;
			case "pattern": this._changePattern( id, val ); break;
			case "duration": this._changeDuration( id, val ); break;
		}
	}
	_changePan( id, val ) {
		this._rows.get( id ).pan.setValue( val );
	}
	_changeGain( id, val ) {
		this._rows.get( id ).gain.setValue( val );
	}
	_changeDetune( id, val ) {
		this._rows.get( id ).detune.setValue( val );
	}
	_changeName( id, name ) {
		const el = this._rows.get( id ).name;

		el.dataset.name =
		el.textContent = name;
	}
	_changeToggle( id, b ) {
		this._rows.get( id ).root.classList.toggle( "gsuiDrumrow-mute", !b );
		this._lines.get( id ).classList.toggle( "gsuiDrumrow-mute", !b );
	}
	_changeDuration( id, dur ) {
		this._rows.get( id ).root.querySelector( ".gsuiDrumrow-waveWrap" ).style.animationDuration = `${ dur * 2 }s`;
	}
	_changePattern( id, svg ) {
		const elWave = this._rows.get( id ).root.querySelector( ".gsuiDrumrow-waveWrap" );

		if ( elWave.firstChild ) {
			elWave.firstChild.remove();
		}
		if ( svg ) {
			svg.classList.add( "gsuiDrumrow-wave" );
			elWave.append( svg );
		}
	}
	_changeOrder( id, order ) {
		this._rows.get( id ).root.dataset.order =
		this._lines.get( id ).dataset.order = order;
	}

	// .........................................................................
	_namePrint( id, msg ) {
		const el = this._rows.get( id ).name;

		el.textContent = msg;
		el.classList.add( "gsuiDrumrow-nameInfo" );
	}
	_expandProps( id ) {
		this._rows.get( id ).root.classList.toggle( "gsuiDrumrow-open" );
		this._lines.get( id ).classList.toggle( "gsuiDrums-lineOpen" );
	}
	_getPropBtn( rowId, prop ) {
		return this._rows.get( rowId ).root
			.querySelector( `.gsuiDrumrow-propRadio[value="${ prop }"] + .gsuiDrumrow-propSpan` );
	}

	// events:
	// .........................................................................
	_oninputendRowSlider( id ) {
		const el = this._rows.get( id ).name;

		el.textContent = el.dataset.name;
		el.classList.remove( "gsuiDrumrow-nameInfo" );
	}
	_onchangeRowSlider( id, prop, val ) {
		this._dispatch( "change", "changeDrumrow", id, prop, val );
	}
	_onreorderRows( elRow ) {
		const rows = gsuiReorder.listComputeOrderChange( this.rootElement, {} );

		this._dispatch( "change", "reorderDrumrow", elRow.dataset.id, rows );
	}
	_onchangeRows( e ) {
		const id = e.target.closest( ".gsuiDrumrow" ).dataset.id;

		this._dispatch( "propFilter", id, e.target.value );
	}
	_onclickRows( e ) {
		if ( e.target !== this.rootElement ) {
			const id = e.target.closest( ".gsuiDrumrow" ).dataset.id;

			switch ( e.target.dataset.action ) {
				case "props": this._expandProps( id ); break;
				case "toggle": this._dispatch( "change", "toggleDrumrow", id ); break;
				case "delete": this._dispatch( "change", "removeDrumrow", id ); break;
			}
		}
	}
	_onmousedownRows( e ) {
		if ( ( e.button === 0 || e.button === 2 ) && e.target.classList.contains( "gsuiDrumrow-main" ) ) {
			this._dispatch(
				e.button === 0 ? "liveStartDrum" : "liveStopDrum",
				e.target.parentNode.dataset.id );
		}
	}
	_onanimationendRows( e ) {
		if ( e.target.classList.contains( "gsuiDrumrow-startCursor" ) ) {
			e.target.remove();
		}
	}
	_oncontextmenuRows( e ) {
		e.preventDefault();
		if ( e.target.dataset.action === "toggle" ) {
			this._dispatch( "change", "toggleOnlyDrumrow", e.target.closest( ".gsuiDrumrow" ).dataset.id );
		} else if ( e.target.classList.contains( "gsuiDrumrow-propSpan" ) ) {
			this._dispatch( "propFilters", e.target.previousElementSibling.value );
		}
	}
	_ondropRows( e ) {
		if ( this._dragoverId ) {
			const [ patId ] = e.dataTransfer.getData( "pattern-buffer" ).split( ":" );

			if ( patId ) {
				this._dragoverId === Infinity
					? this._dispatch( "change", "addDrumrow", patId )
					: this._dispatch( "change", "changeDrumrowPattern", this._dragoverId, patId );
			}
		}
		this._ondragleaveRows();
	}
	_ondragleaveRows() {
		if ( this._elDragover ) {
			this._elDragover.classList.remove( "gsuiDrumrows-dragover" );
			this._elDragover =
			this._dragoverId = null;
		}
	}
	_ondragoverRows( e ) {
		if ( e.dataTransfer.types.includes( "pattern-buffer" ) ) {
			const tar = e.target,
				isParent = tar.classList.contains( "gsuiDrumrows" ),
				elDragover = isParent ? tar : tar.closest( ".gsuiDrumrow" );

			if ( elDragover !== this._elDragover ) {
				this._dragoverId = null;
				if ( isParent ) {
					this._dragoverId = Infinity;
				} else if ( elDragover ) {
					this._dragoverId = elDragover.dataset.id;
				}
				if ( this._elDragover ) {
					this._elDragover.classList.remove( "gsuiDrumrows-dragover" );
				}
				this._elDragover = elDragover;
				if ( elDragover ) {
					elDragover.classList.add( "gsuiDrumrows-dragover" );
				}
			}
		}
	}
}

gsuiDrumrows.template = document.querySelector( "#gsuiDrumrows-template" );
gsuiDrumrows.template.remove();
gsuiDrumrows.template.removeAttribute( "id" );

gsuiDrumrows.templateRow = document.querySelector( "#gsuiDrumrow-template" );
gsuiDrumrows.templateRow.remove();
gsuiDrumrows.templateRow.removeAttribute( "id" );

Object.freeze( gsuiDrumrows );
