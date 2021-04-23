"use strict";

class gsuiPianoroll extends HTMLElement {
	constructor() {
		const win = GSUI.createElement( "gsui-timewindow", {
				panelsize: 100,
				panelsizemin: 100,
				panelsizemax: 130,
				lineheight: 20,
				lineheightmin: 12,
				lineheightmax: 32,
				pxperbeat: 64,
				pxperbeatmin: 20,
				pxperbeatmax: 200,
				downpanel: "",
				downpanelsize: 120,
				downpanelsizemin: 120,
				downpanelsizemax: 160,
			} ),
			selectionElement = GSUI.createElement( "div", { class: "gsuiBlocksManager-selection gsuiBlocksManager-selection-hidden" } );

		super();
		this.timeline = win._elTimeline;
		this.uiKeys = GSUI.createElement( "gsui-keys" );
		this.onchange = null;
		this._win = win;
		this._blcManager = new gsuiBlocksManager( {
			rootElement: this,
			selectionElement,
			timeline: win._elTimeline,
			blockDOMChange: this._blockDOMChange.bind( this ),
			managercallDuplicating: ( keysMap, wIncr ) => this.onchange( "clone", Array.from( keysMap.keys() ), wIncr ),
			managercallSelecting: ids => this.onchange( "selection", ids ),
			managercallUnselecting: () => this.onchange( "unselection" ),
			managercallUnselectingOne: keyId => this.onchange( "unselectionOne", keyId ),
			managercallMoving: ( keysMap, wIncr, kIncr ) => this.onchange( "move", Array.from( keysMap.keys() ), wIncr, kIncr ),
			managercallCroppingB: ( keysMap, dIncr ) => this.onchange( "cropEnd", Array.from( keysMap.keys() ), dIncr ),
			managercallDeleting: keysMap => this.onchange( "remove", Array.from( keysMap.keys() ) ),
		} );
		this._rowsByMidi = {};
		this._currKeyDuration = 1;
		this._selectionElement = selectionElement;
		this._uiSliderGroup = GSUI.createElement( "gsui-slidergroup", { beatlines: "" } );
		this._slidersSelect = GSUI.createElement( "select", { class: "gsuiPianoroll-slidersSelect", size: 6 },
			GSUI.createElement( "option", { value: "gain", selected: "" }, "gain" ),
			GSUI.createElement( "option", { value: "pan" }, "pan" ),
			GSUI.createElement( "option", { value: "lowpass" }, "lowpass" ),
			GSUI.createElement( "option", { value: "highpass" }, "highpass" ),
			GSUI.createElement( "option", { value: "gainLFOSpeed" }, "gain.lfo.speed" ),
			GSUI.createElement( "option", { value: "gainLFOAmp" }, "gain.lfo.amp" ),
		);

		this.addEventListener( "gsuiEvents", this._ongsuiEvents.bind( this ) );
		this._slidersSelect.onchange = this._onchangeSlidersSelect.bind( this );

		this._ongsuiTimewindowPxperbeat( 64 );
		this._ongsuiTimewindowLineheight( 20 );
		this._onchangeSlidersSelect();
		this.reset();
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			GSUI.setAttribute( this, "tabindex", -1 );
			this.classList.add( "gsuiBlocksManager", "gsuiPianoroll" );
			this.append( this._win );
			this._win.querySelector( ".gsuiTimewindow-panelContent" ).append( this.uiKeys );
			this._win.querySelector( ".gsuiTimewindow-panelContentDown" ).prepend( this._slidersSelect );
			this._win.querySelector( ".gsuiTimewindow-contentDown" ).prepend( this._uiSliderGroup );
			this._win.querySelector( ".gsuiTimewindow-mainContent" ).append( this._selectionElement );
			this.scrollToMiddle();
		}
	}

	// .........................................................................
	reset() {
		this._currKeyDuration = 1;
	}
	setData( data ) {
		this._blcManager.setData( data );
	}
	setCallbacks( cb ) {
		this.onchange = cb.onchange;
	}
	timeDivision( a, b ) {
		GSUI.setAttribute( this._win, "timedivision", `${ a }/${ b }` );
		GSUI.setAttribute( this._uiSliderGroup, "timedivision", `${ a }/${ b }` );
	}
	currentTime( t ) {
		GSUI.setAttribute( this._win, "currenttime", t );
		GSUI.setAttribute( this._uiSliderGroup, "currenttime", t );
	}
	loop( a, b ) {
		GSUI.setAttribute( this._win, "loop", Number.isFinite( a ) && `${ a }-${ b }` );
		GSUI.setAttribute( this._uiSliderGroup, "loopa", a );
		GSUI.setAttribute( this._uiSliderGroup, "loopb", b );
	}
	scrollToMiddle() {
		this._win.scrollTop = this._win.querySelector( ".gsuiTimewindow-rows" ).clientHeight / 2;
	}
	scrollToKeys() {
		const blc = this._win.querySelector( ".gsuiBlocksManager-block" );

		if ( blc ) {
			const key = +blc.dataset.keyNote,
				maxRow = +this._win.querySelector( ".gsui-row" ).dataset.midi;

			this._win.scrollTop = ( maxRow - key - 3.5 ) * this._win.getAttribute( "lineheight" );
		}
	}
	octaves( from, nb ) {
		const rows = this.uiKeys.octaves( from, nb );

		Object.keys( this._rowsByMidi ).forEach( k => delete this._rowsByMidi[ k ] );
		rows.forEach( el => {
			const midi = +el.dataset.midi;

			el.onmousedown = this._rowMousedown.bind( this, midi );
			this._rowsByMidi[ midi ] = el;
		} );
		this._win.querySelector( ".gsuiTimewindow-rows" ).append( ...rows );
		this._win.querySelector( ".gsuiTimewindow-rows" ).style.height = `${ rows.length }em`;
		this.scrollToMiddle();
		this.reset();
	}

	// Block's UI functions
	// ........................................................................
	addKey( id, obj ) {
		const blc = GSUI.getTemplate( "gsui-pianoroll-block" ),
			dragline = new gsuiDragline();

		blc.dataset.id = id;
		blc.onmousedown = this._blcMousedown.bind( this, id );
		dragline.onchange = this._onchangeDragline.bind( this, id );
		blc._dragline = dragline;
		blc._draglineDrop = blc.querySelector( ".gsuiDragline-drop" );
		blc.append( dragline.rootElement );
		dragline.getDropAreas = this._getDropAreas.bind( this, id );
		this._blcManager.__blcs.set( id, blc );
		obj.selected
			? this._blcManager.__blcsSelected.set( id, blc )
			: this._blcManager.__blcsSelected.delete( id );
		this._uiSliderGroup.set( id, obj.when, obj.duration, obj[ this._slidersSelect.value ] );
		this._blockDOMChange( blc, "key", obj.key );
		this._blockDOMChange( blc, "when", obj.when );
		this._blockDOMChange( blc, "duration", obj.duration );
		this._blockDOMChange( blc, "selected", obj.selected );
		this._blockDOMChange( blc, "pan", obj.pan );
		this._blockDOMChange( blc, "gain", obj.gain );
		this._blockDOMChange( blc, "lowpass", obj.lowpass );
		this._blockDOMChange( blc, "highpass", obj.highpass );
		this._blockDOMChange( blc, "gainLFOSpeed", obj.gainLFOSpeed );
		this._blockDOMChange( blc, "gainLFOAmp", obj.gainLFOAmp );
		this._blockDOMChange( blc, "prev", obj.prev );
		this._blockDOMChange( blc, "next", obj.next );
	}
	removeKey( id ) {
		const blc = this._blcManager.__blcs.get( id ),
			blcPrev = this._blcManager.__blcs.get( blc.dataset.prev );

		blc.remove();
		if ( blcPrev ) {
			blcPrev._dragline.linkTo( null );
		}
		this._blcManager.__blcs.delete( id );
		this._blcManager.__blcsSelected.delete( id );
		this._uiSliderGroup.delete( id );
	}
	changeKeyProp( id, prop, val ) {
		const blc = this._blcManager.__blcs.get( id );

		this._blockDOMChange( blc, prop, val );
		if ( val === null ) {
			delete blc.dataset[ prop ];
		} else {
			blc.dataset[ prop === "key" ? "keyNote" : prop ] = val;
		}
		if ( prop === "selected" ) {
			val
				? this._blcManager.__blcsSelected.set( id, blc )
				: this._blcManager.__blcsSelected.delete( id );
		}
	}
	_blockDOMChange( el, prop, val ) {
		switch ( prop ) {
			case "when": {
				el.style.left = `${ val }em`;
				this._uiSliderGroup.setProp( el.dataset.id, "when", val );
				this._blockRedrawDragline( el );
			} break;
			case "duration": {
				el.style.width = `${ val }em`;
				this._uiSliderGroup.setProp( el.dataset.id, "duration", val );
				this._currKeyDuration = val;
				this._blockRedrawDragline( el );
			} break;
			case "deleted": {
				el.classList.toggle( "gsuiBlocksManager-block-hidden", !!val );
			} break;
			case "selected": {
				el.classList.toggle( "gsuiBlocksManager-block-selected", !!val );
				this._uiSliderGroup.setProp( el.dataset.id, "selected", !!val );
			} break;
			case "row": {
				this._blockDOMChange( el, "key", el.dataset.keyNote - val );
			} break;
			case "key": {
				const row = this._getRowByMidi( val );

				el.dataset.key = gsuiKeys.keyNames.en[ row.dataset.key ];
				row.firstElementChild.append( el );
				this._blockRedrawDragline( el );
			} break;
			case "prev": {
				const blc = this._blcManager.__blcs.get( val );

				el.classList.toggle( "gsuiPianoroll-block-prevLinked", !!val );
				blc && blc._dragline.linkTo( el._draglineDrop );
			} break;
			case "next": {
				const blc = this._blcManager.__blcs.get( val );

				el.classList.toggle( "gsuiPianoroll-block-nextLinked", !!val );
				el._dragline.linkTo( blc && blc._draglineDrop );
			} break;
			case "pan":
			case "gain":
			case "lowpass":
			case "highpass":
				this._blockSliderUpdate( prop, el, val );
				break;
			case "gainLFOAmp":
			case "gainLFOSpeed":
				this._blockSliderUpdate( prop, el, gsuiPianoroll._mulToX( val ) );
				break;
		}
	}
	_blockSliderUpdate( nodeName, el, val ) {
		if ( this._slidersSelect.value === nodeName ) {
			this._uiSliderGroup.setProp( el.dataset.id, "value", val );
		}
	}
	_blockRedrawDragline( el ) {
		const blcPrev = this._blcManager.__blcs.get( el.dataset.prev );

		el._dragline.redraw();
		blcPrev && blcPrev._dragline.redraw();
	}

	// Private small getters
	// ........................................................................
	_getRowByMidi( midi ) { return this._rowsByMidi[ midi ]; }

	// ........................................................................
	_ongsuiEvents( e ) {
		switch ( e.detail.component ) {
			case "gsuiTimewindow":
				switch ( e.detail.eventName ) {
					case "pxperbeat": this._ongsuiTimewindowPxperbeat( e.detail.args[ 0 ] ); break;
					case "lineheight": this._ongsuiTimewindowLineheight( e.detail.args[ 0 ] ); break;
				}
				break;
			case "gsuiTimeline":
				switch ( e.detail.eventName ) {
					case "inputLoop":
					case "changeLoop": this._ongsuiTimelineChangeLoop( ...e.detail.args ); break;
					case "changeCurrentTime": this._ongsuiTimelineChangeCurrentTime( e.detail.args[ 0 ] ); break;
				}
				break;
			case "gsuiSliderGroup":
				switch ( e.detail.eventName ) {
					case "input": return this._ongsuiSliderGroupInput( e.detail.args[ 1 ] );
					case "inputEnd": return this._ongsuiSliderGroupInputEnd();
					case "change": return this._ongsuiSliderGroupChange( e );
				}
				break;
		}
		e.stopPropagation();
	}
	_ongsuiTimewindowPxperbeat( ppb ) {
		this._blcManager.__pxPerBeat = ppb;
		this._blcManager.__blcs.forEach( blc => blc._dragline.redraw() );
		GSUI.setAttribute( this._uiSliderGroup, "pxperbeat", ppb );
	}
	_ongsuiTimewindowLineheight( px ) {
		this._blcManager.__fontSize = px;
		Array.from( this._blcManager.__rows ).forEach( el => el.classList.toggle( "gsui-row-small", px <= 44 ) );
		this._blcManager.__blcs.forEach( blc => blc._dragline.redraw() );
	}
	_ongsuiTimelineChangeCurrentTime( t ) {
		GSUI.setAttribute( this._uiSliderGroup, "currenttime", t );
	}
	_ongsuiTimelineChangeLoop( a, b ) {
		GSUI.setAttribute( this._uiSliderGroup, "loopa", a );
		GSUI.setAttribute( this._uiSliderGroup, "loopb", b );
	}
	_ongsuiSliderGroupInput( val ) {
		const prop = this._slidersSelect.value;

		Array.prototype.find.call( this._slidersSelect.children,
			o => o.value === prop ).dataset.number = ( prop.startsWith( "gainLFO" )
			? gsuiPianoroll._xToMul( val )
			: val ).toFixed( 2 );
	}
	_ongsuiSliderGroupInputEnd() {
		const prop = this._slidersSelect.value;

		delete Array.prototype.find.call( this._slidersSelect.children,
			o => o.value === prop ).dataset.number;
	}
	_ongsuiSliderGroupChange( e ) {
		const d = e.detail,
			prop = this._slidersSelect.value;

		d.component = "gsuiPianoroll";
		d.eventName = "changeKeysProps";
		if ( prop.startsWith( "gainLFO" ) ) {
			d.args[ 0 ].forEach( v => v[ 1 ] = gsuiPianoroll._xToMul( v[ 1 ] ) );
		}
		d.args.unshift( prop );
	}
	static _xToMul( x ) {
		switch ( x ) {
			case 6:  return 4;
			case 5:  return 3.5;
			case 4:  return 3;
			case 3:  return 2.5;
			case 2:  return 2;
			case 1:  return 1.5;
			default: return 1;
			case -1: return  .75;
			case -2: return  .5;
			case -3: return  .4;
			case -4: return  .3333;
			case -5: return  .2857;
			case -6: return  .25;
		}
	}
	static _mulToX( mul ) {
		if ( mul >= 4      ) { return 6; }
		if ( mul >= 3.5    ) { return 5; }
		if ( mul >= 3      ) { return 4; }
		if ( mul >= 2.5    ) { return 3; }
		if ( mul >= 2      ) { return 2; }
		if ( mul >= 1.5    ) { return 1; }
		if ( mul >= 1      ) { return 0; }
		if ( mul >=  .75   ) { return -1; }
		if ( mul >=  .5    ) { return -2; }
		if ( mul >=  .4    ) { return -3; }
		if ( mul >=  .3333 ) { return -4; }
		if ( mul >=  .2857 ) { return -5; }
		if ( mul >=  .25   ) { return -6; }
	}

	// ........................................................................
	_blcMousedown( id, e ) {
		const dline = e.currentTarget._dragline.rootElement;

		e.stopPropagation();
		if ( !dline.contains( e.target ) ) {
			this._blcManager.__mousedown( e );
		}
	}
	_rowMousedown( key, e ) {
		this._blcManager.__mousedown( e );
		if ( e.button === 0 && !e.shiftKey ) {
			const when = this._blcManager.__roundBeat( this._blcManager.__getWhenByPageX( e.pageX ) );

			this.onchange( "add", key, when, this._currKeyDuration );
		}
	}
	_onchangeSlidersSelect() {
		const prop = this._slidersSelect.value,
			grp = this._uiSliderGroup;

		switch ( prop ) {
			case "pan":          grp.options( { min: -1, max: 1, def:  0, step: .05 } ); break;
			case "gain":         grp.options( { min:  0, max: 1, def: .8, step: .025 } ); break;
			case "lowpass":      grp.options( { min:  0, max: 1, def:  1, step: .025, exp: 3 } ); break;
			case "highpass":     grp.options( { min:  0, max: 1, def:  1, step: .025, exp: 3 } ); break;
			case "gainLFOAmp":   grp.options( { min: -6, max: 6, def:  0, step: 1 } ); break;
			case "gainLFOSpeed": grp.options( { min: -6, max: 6, def:  0, step: 1 } ); break;
		}
		this._blcManager.__blcs.forEach( ( blc, id ) => {
			const val = +blc.dataset[ prop ],
				val2 = prop.startsWith( "gainLFO" )
					? gsuiPianoroll._mulToX( val )
					: val;

			this._uiSliderGroup.setProp( id, "value", val2 );
		} );
	}

	// Key's functions
	// ........................................................................
	_getDropAreas( id ) {
		const d = this._blcManager.__blcs.get( id ).dataset,
			when = +d.when + +d.duration,
			arr = [];

		this._blcManager.__blcs.forEach( blc => {
			const d = blc.dataset;

			if ( +d.when >= when && ( d.prev === undefined || d.prev === id ) ) {
				arr.push( blc.firstElementChild );
			}
		} );
		return arr;
	}
	_onchangeDragline( id, el ) {
		this.onchange( "redirect", id, el ? el.parentNode.dataset.id : null );
	}
}

customElements.define( "gsui-pianoroll", gsuiPianoroll );

Object.freeze( gsuiPianoroll );
