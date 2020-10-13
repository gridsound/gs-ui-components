"use strict";

class gsuiDrums extends HTMLElement {
	constructor() {
		const drumrows = GSUI.createElement( "gsui-drumrows" ),
			win = GSUI.createElement( "gsui-timewindow", {
				panelsize: 140,
				panelsizemin: 70,
				panelsizemax: 240,
				lineheight: 48,
				lineheightmin: 48,
				lineheightmax: 48,
				pxperbeatmin: 50,
				pxperbeatmax: 160,
			} );

		super();
		this._win = win;
		this.drumrows = drumrows;
		this._hoverBeat =
		this._hoverPageX =
		this._linesPanelWidth = 0;
		this._stepsPerBeat = 4;
		this._pxPerBeat = 80;
		this._pxPerStep = this._pxPerBeat / this._stepsPerBeat;
		this._currAction = "";
		this._draggingRowId = null;
		this._draggingWhenStart = 0;
		this._hoveringStatus = "";
		this._drumsMap = new Map();
		this._previewsMap = new Map();
		this._sliderGroups = new Map();
		this._elLines = null;
		this._elHover = null;
		this._elCurrentTime = null;
		this._elDrumHover = GSUI.createElement( "div", { class: "gsuiDrums-drumHover" },
			GSUI.createElement( "div", { class: "gsuiDrums-drumHoverIn" } ) );
		this._elDrumcutHover = GSUI.createElement( "div", { class: "gsuiDrums-drumcutHover" },
			GSUI.createElement( "div", { class: "gsuiDrums-drumcutHoverIn" } ) );
		this._nlLinesIn = this.getElementsByClassName( "gsuiDrums-lineIn" );
		this._onmouseupNew = this._onmouseupNew.bind( this );
		this._mousemoveLines = this._mousemoveLines.bind( this );
		this._dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiDrums" );
		Object.seal( this );

		this.addEventListener( "gsuiEvents", e => {
			const d = e.detail,
				dt = e.target.dataset;

			switch ( d.component ) {
				case "gsuiTimewindow":
					switch ( d.eventName ) {
						case "pxperbeat":
							this.setPxPerBeat( d.args[ 0 ] );
							e.stopPropagation();
							break;
					}
					break;
				case "gsuiSliderGroup":
					switch ( d.eventName ) {
						case "change":
							d.args.unshift( "changeDrumsProps", dt.currentProp );
							break;
						case "input":
							this.changeDrumProp( d.args[ 0 ], dt.currentProp, d.args[ 1 ] );
							d.args = [ dt.id, d.args[ 0 ], dt.currentProp, d.args[ 1 ] ];
							break;
						case "inputEnd":
							d.args = [ dt.id, dt.currentProp ];
							break;
					}
					break;
			}
		} );
		win.setAttribute( "step", 1 );
		win.onscroll = this.__mousemoveLines.bind( this );
		this._elDrumHover.remove();
		this._elDrumcutHover.remove();
		this._elDrumHover.onmousedown = this._onmousedownNew.bind( this, "Drums" );
		this._elDrumcutHover.onmousedown = this._onmousedownNew.bind( this, "Drumcuts" );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.setAttribute( "tabindex", -1 );
			this.append( this._win, GSUI.createElement( "div", { class: "gsuiDrums-shadow" } ) );
			this.classList.add( "gsuiDrums" );
			this._win.querySelector( ".gsuiTimewindow-panelContent" ).append( this.drumrows );
			this._elCurrentTime = this._win.querySelector( ".gsuiTimewindow-currentTime" );
			this._elLines = this._win.querySelector( ".gsuiTimewindow-rows" );
			this._elLines.onmousemove = this._mousemoveLines;
			this._elLines.onmouseleave = this._onmouseleaveLines.bind( this );
			this.drumrows.setLinesParent( this._elLines, "gsuiDrums-line" );
		}
	}

	// .........................................................................
	toggleShadow( b ) {
		this.classList.toggle( "gsuiDrums-shadowed", b );
	}
	currentTime( beat ) {
		this._win.setAttribute( "currenttime", beat );
	}
	loop( a, b ) {
		a !== false
			? this._win.setAttribute( "loop", `${ a }-${ b }` )
			: this._win.removeAttribute( "loop" )
	}
	timeSignature( a, b ) {
		this._stepsPerBeat = b;
		this._win.setAttribute( "timesignature", `${ a },${ b }` );
		this._win.setAttribute( "currenttimestep", 1 / b );
		this.setPxPerBeat( this._pxPerBeat );
		this._elDrumHover.style.width =
		this._elDrumcutHover.style.width =
		this._elCurrentTime.style.width = `${ 1 / b }em`;
	}
	setFontSize( fs ) {
		this._win.setAttribute( "lineheight", fs );
	}
	setPxPerBeat( ppb ) {
		const ppbpx = `${ ppb }px`;

		this._pxPerBeat = ppb;
		this._pxPerStep = ppb / this._stepsPerBeat;
		this._win.setAttribute( "pxperbeat", ppb );
		this._sliderGroups.forEach( grp => grp.setPxPerBeat( ppb ) );
	}
	setPropValues( rowId, prop, arr ) {
		const grp = this._sliderGroups.get( rowId );

		this._qS( `line[data-id='${ rowId }']` ).dataset.prop = prop;
		grp.dataset.currentProp = prop;
		switch ( prop ) {
			case "pan": grp.minMaxStep( -1, 1, .05 ); break;
			case "gain": grp.minMaxStep( 0, 1, .02 ); break;
			case "detune": grp.minMaxStep( -12, 12, 1 ); break;
		}
		arr.forEach( kv => grp.setProp( kv[ 0 ], "value", kv[ 1 ] ) );
	}

	// .........................................................................
	addDrum( id, drum ) {
		const grp = this._sliderGroups.get( drum.row ),
			prop = grp.dataset.currentProp;

		this._addItem( id, "drum", drum, "gsui-drums-drum" );
		grp.set( id, drum.when, 1 / this._stepsPerBeat, 0 );
	}
	removeDrum( id ) {
		const rowId = this._drumsMap.get( id )[ 0 ];

		this._sliderGroups.get( rowId ).delete( id );
		this._removeItem( id );
	}
	addDrumcut( id, drumcut ) {
		this._addItem( id, "drumcut", drumcut, "gsui-drums-drumcut" );
	}
	removeDrumcut( id ) {
		this._removeItem( id );
	}
	createDrumrow( id ) {
		const elLine = GSUI.getTemplate( "gsui-drums-line" ),
			grp = elLine.querySelector( "gsui-slidergroup" );

		grp.setPxPerBeat( this._pxPerBeat );
		grp.dataset.id = id;
		this._sliderGroups.set( id, grp );
		return elLine;
	}
	changeDrum( id, prop, val ) {
		const rowId = this._drumsMap.get( id )[ 0 ],
			grp = this._sliderGroups.get( rowId );

		this.changeDrumProp( id, prop, val );
		if ( prop === grp.dataset.currentProp ) {
			grp.setProp( id, "value", val );
		}
	}
	changeDrumProp( id, prop, val ) {
		const sel = `.gsuiDrums-drumProp[data-value="${ prop }"] .gsuiDrums-drumPropValue`,
			st = this._drumsMap.get( id )[ 3 ].querySelector( sel ).style;

		switch ( prop ) {
			case "detune":
				st.left = val > 0 ? "50%" : `${ ( 1 + val / 12 ) * 50 }%`;
				st.width = `${ Math.abs( val / 12 ) * 50 }%`;
				break;
			case "pan":
				st.left = val > 0 ? "50%" : `${ ( 1 + val ) * 50 }%`;
				st.width = `${ Math.abs( val ) * 50 }%`;
				break;
			case "gain":
				st.left = 0;
				st.width = `${ val * 100 }%`;
				break;
		}
	}
	_addItem( id, itemType, item, template ) {
		const elItem = GSUI.getTemplate( template ),
			stepDur = 1 / this._stepsPerBeat;

		elItem.dataset.id = id;
		elItem.style.left = `${ item.when }em`;
		elItem.style.width = `${ stepDur }em`;
		this._qS( `line[data-id='${ item.row }'] .gsuiDrums-lineIn` ).append( elItem );
		this._drumsMap.set( id, [ item.row, itemType, Math.round( item.when / stepDur ), elItem ] );
	}
	_removeItem( id ) {
		const elItem = this._drumsMap.get( id )[ 3 ];

		elItem.remove();
		this._drumsMap.delete( id );
	}

	// .........................................................................
	_qS( c ) {
		return ( this.firstChild ? this : this._win ).querySelector( `.gsuiDrums-${ c }` );
	}
	_has( el, c ) {
		return el.classList.contains( `gsuiDrums-${ c }` );
	}
	_createPreview( template, rowId, when ) {
		const el = GSUI.getTemplate( template );

		el.classList.add( "gsuiDrums-preview" );
		el.style.left = `${ when }em`;
		el.style.width = `${ 1 / this._stepsPerBeat }em`;
		this._qS( `line[data-id='${ rowId }'] .gsuiDrums-lineIn` ).append( el );
		return el;
	}
	_createPreviews( whenFrom, whenTo ) {
		const rowId = this._draggingRowId,
			stepDur = 1 / this._stepsPerBeat,
			whenA = Math.round( Math.min( whenFrom, whenTo ) / stepDur ),
			whenB = Math.round( Math.max( whenFrom, whenTo ) / stepDur ),
			added = new Map(),
			map = this._previewsMap,
			adding = this._currAction.startsWith( "add" ),
			itemType = this._currAction.endsWith( "Drums" ) ? "drum" : "drumcut",
			template = itemType === "drum"
				? "gsui-drums-drum"
				: "gsui-drums-drumcut",
			drumsArr = [];

		this._drumsMap.forEach( ( arr, id ) => {
			if ( arr[ 0 ] === rowId && arr[ 1 ] === itemType ) {
				drumsArr.push( arr );
			}
		} );
		for ( let w = whenA; w <= whenB; ++w ) {
			added.set( w );
			if ( !map.has( w ) ) {
				if ( adding ) {
					map.set( w, this._createPreview( template, rowId, w * stepDur ) );
				} else {
					drumsArr.find( arr => {
						if ( arr[ 2 ] === w ) {
							arr[ 3 ].classList.add( "gsuiDrums-previewDeleted" );
							map.set( w, arr[ 3 ] );
							return true;
						}
					} );
				}
			}
		}
		map.forEach( ( el, w ) => {
			if ( !added.has( w ) ) {
				adding
					? el.remove()
					: el.classList.remove( "gsuiDrums-previewDeleted" );
				map.delete( w );
			}
		} );
	}
	_removePreviews( adding ) {
		this._previewsMap.forEach( adding
			? el => el.remove()
			: el => el.classList.remove( "gsuiDrums-previewDeleted" ) );
		this._previewsMap.clear();
	}

	// events:
	// .........................................................................
	_mousemoveLines( e ) {
		if ( e.target !== this._elHover ) {
			if ( this._currAction ) {
				this._hoverPageX = e.pageX;
				this.__mousemoveLines();
			} else {
				const tar = e.target,
					elLine = this._has( tar, "lineIn" )
						? tar
						: this._has( tar, "drum" ) || this._has( tar, "drumcut" )
							? tar.parentNode
							: null;

				if ( elLine ) {
					const bcr = elLine.getBoundingClientRect(),
						y = ( e.pageY - bcr.top ) / bcr.height,
						elHover =  y > .66 ? this._elDrumcutHover : this._elDrumHover;

					this._hoverPageX = e.pageX;
					this._hoveringStatus = elHover === this._elDrumHover ? "drum" : "drumcut";
					if ( elHover !== this._elHover ) {
						if ( this._elHover ) {
							this._elHover.remove();
						}
						this._elHover = elHover;
					}
					this.__mousemoveLines();
					if ( this._elHover.parentNode !== elLine ) {
						elLine.append( this._elHover );
					}
				} else if ( this._elHover ) {
					this._elHover.remove();
				}
			}
		}
	}
	__mousemoveLines() {
		if ( this._hoveringStatus ) {
			const el = this._elHover,
				left = this._elLines.getBoundingClientRect().left,
				beat = ( ( this._hoverPageX - left ) / this._pxPerStep | 0 ) / this._stepsPerBeat;

			this._hoverBeat = beat;
			el.style.left = `${ beat }em`;
			if ( this._currAction ) {
				this._createPreviews( this._draggingWhenStart, beat );
			}
		}
	}
	_onmouseleaveLines() {
		if ( !this._currAction ) {
			this._hoveringStatus = "";
			this._elHover.remove();
		}
	}
	_onmousedownNew( itemType, e ) {
		if ( !this._currAction ) {
			this._currAction = e.button === 0
				? `add${ itemType }`
				: `remove${ itemType }`;
			this._draggingRowId = this._elHover.closest( ".gsuiDrums-line" ).dataset.id;
			this._draggingWhenStart = this._hoverBeat;
			this._createPreviews( this._hoverBeat, this._hoverBeat );
			GSUI.unselectText();
			this._elLines.onmousemove = null;
			document.addEventListener( "mousemove", this._mousemoveLines );
			document.addEventListener( "mouseup", this._onmouseupNew );
		}
	}
	_onmouseupNew() {
		this._removePreviews( this._currAction.startsWith( "add" ) );
		document.removeEventListener( "mousemove", this._mousemoveLines );
		document.removeEventListener( "mouseup", this._onmouseupNew );
		this._elLines.onmousemove = this._mousemoveLines;
		this._dispatch( "change", this._currAction, this._draggingRowId,
			this._draggingWhenStart, this._hoverBeat );
		this._currAction = "";
	}
}

customElements.define( "gsui-drums", gsuiDrums );
