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
		this.onchange =
		this.onlivestop =
		this.onlivestart =
		this.onlivechange = GSUtils.noop;
		this._rows = new Map();
		this._lines = new Map();
		this._reorder = reorder;
		this._dragoverId =
		this._elDragover =
		this._elLinesParent = null;
		Object.seal( this );

		root.ondrop = this._ondropRows.bind( this );
		root.onclick = this._onclickRows.bind( this );
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

	// .........................................................................
	add( id, elLine ) {
		const elRow = gsuiDrumrows.templateRow.cloneNode( true ),
			sliDetune = new gsuiSlider(),
			sliGain = new gsuiSlider(),
			html = {
				root: elRow,
				name: elRow.querySelector( ".gsuiDrumrow-name" ),
				gain: sliGain,
				detune: sliDetune,
			};

		elRow.dataset.id =
		elLine.dataset.id = id;
		sliDetune.options( { min: -12, max: 12, step: 1, value: 0, type: "linear-y", mousemoveSize: 400 } );
		sliGain.options( { min: 0, max: 1, step: .01, value: 1, type: "linear-y", mousemoveSize: 400 } );
		sliDetune.oninput = val => {
			this._namePrint( id, `pitch: ${ val > 0 ? `+${ val }` : val }` );
			this.onlivechange( id, "detune", val );
		};
		sliGain.oninput = val => {
			this._namePrint( id, `gain: ${ val.toFixed( 2 ) }` );
			this.onlivechange( id, "gain", val );
		};
		sliDetune.onchange = this._onchangeRowSlider.bind( this, id, "detune" );
		sliGain.onchange = this._onchangeRowSlider.bind( this, id, "gain" );
		sliDetune.oninputend = this._oninputendRowSlider.bind( this, id );
		sliGain.oninputend = this._oninputendRowSlider.bind( this, id );
		elRow.querySelector( ".gsuiDrumrow-detune" ).append( sliDetune.rootElement );
		elRow.querySelector( ".gsuiDrumrow-gain" ).append( sliGain.rootElement );
		this._rows.set( id, html );
		this._lines.set( id, elLine );
		this.rootElement.append( elRow );
		this._elLinesParent.append( elLine );
		sliDetune.attached();
		sliGain.attached();
	}
	remove( id ) {
		this._rows.get( id ).root.remove();
		this._lines.get( id ).remove();
		this._rows.delete( id );
		this._lines.delete( id );
	}
	change( id, prop, val ) {
		switch ( prop ) {
			case "name": this._changeName( id, val ); break;
			case "gain": this._changeGain( id, val ); break;
			case "order": this._changeOrder( id, val ); break;
			case "detune": this._changeDetune( id, val ); break;
			case "toggle": this._changeToggle( id, val ); break;
			case "pattern": this._changePattern( id, val ); break;
			case "duration": this._changeDuration( id, val ); break;
		}
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

	// events:
	// .........................................................................
	_oninputendRowSlider( id ) {
		const el = this._rows.get( id ).name;

		el.textContent = el.dataset.name;
		el.classList.remove( "gsuiDrumrow-nameInfo" );
	}
	_onchangeRowSlider( id, prop, val ) {
		this.onchange( "changeDrumrow", id, prop, val );
	}
	_onreorderRows( elRow ) {
		const rows = gsuiReorder.listComputeOrderChange( this.rootElement, {} );

		this.onchange( "reorderDrumrow", elRow.dataset.id, rows );
	}
	_onclickRows( e ) {
		const id = e.target.closest( ".gsuiDrumrow" ).dataset.id;

		switch ( e.target.dataset.action ) {
			case "props": this._expandProps( id ); break;
			case "toggle": this.onchange( "toggleDrumrow", id ); break;
			case "delete": this.onchange( "removeDrumrow", id ); break;
		}
	}
	_onmousedownRows( e ) {
		if ( e.target.classList.contains( "gsuiDrumrow-main" ) ) {
			const id = e.target.parentNode.dataset.id;

			if ( e.button === 0 ) {
				this.onlivestart( id );
			} else if ( e.button === 2 ) {
				this.onlivestop( id );
			}
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
			this.onchange( "toggleOnlyDrumrow", e.target.closest( ".gsuiDrumrow" ).dataset.id );
		}
	}
	_ondropRows( e ) {
		if ( this._dragoverId ) {
			const [ patId ] = e.dataTransfer.getData( "pattern-buffer" ).split( ":" );

			if ( patId ) {
				this._dragoverId === Infinity
					? this.onchange( "addDrumrow", patId )
					: this.onchange( "changeDrumrowPattern", this._dragoverId, patId );
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
