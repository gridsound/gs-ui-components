"use strict";

class gsuiPianoroll extends HTMLElement {
	#rowsByMidi = {};
	#currKeyDuration = 1;
	#uiSliderGroup = GSUI.$createElement( "gsui-slidergroup", { beatlines: "" } );
	#selectionElement = GSUI.$createElement( "div", { class: "gsuiBlocksManager-selection gsuiBlocksManager-selection-hidden" } );
	#slidersSelect = GSUI.$createElement( "select", { class: "gsuiPianoroll-slidersSelect", size: 6 },
		GSUI.$createElement( "option", { value: "gain", selected: "" }, "gain" ),
		GSUI.$createElement( "option", { value: "pan" }, "pan" ),
		GSUI.$createElement( "option", { value: "lowpass" }, "lowpass" ),
		GSUI.$createElement( "option", { value: "highpass" }, "highpass" ),
		GSUI.$createElement( "option", { value: "gainLFOSpeed" }, "gain.lfo.speed" ),
		GSUI.$createElement( "option", { value: "gainLFOAmp" }, "gain.lfo.amp" ),
	);
	#win = GSUI.$createElement( "gsui-timewindow", {
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
	} );
	#blcManager = new gsuiBlocksManager( {
		rootElement: this,
		selectionElement: this.#selectionElement,
		timeline: this.#win.timeline,
		blockDOMChange: this.#blockDOMChange.bind( this ),
		managercallDuplicating: ( keysMap, wIncr ) => this.onchange( "clone", Array.from( keysMap.keys() ), wIncr ),
		managercallSelecting: ids => this.onchange( "selection", ids ),
		managercallUnselecting: () => this.onchange( "unselection" ),
		managercallUnselectingOne: keyId => this.onchange( "unselectionOne", keyId ),
		managercallMoving: ( keysMap, wIncr, kIncr ) => this.onchange( "move", Array.from( keysMap.keys() ), wIncr, kIncr ),
		managercallCroppingB: ( keysMap, dIncr ) => this.onchange( "cropEnd", Array.from( keysMap.keys() ), dIncr ),
		managercallDeleting: keysMap => this.onchange( "remove", Array.from( keysMap.keys() ) ),
	} );

	constructor() {
		super();
		this.timeline = this.#win.timeline;
		this.uiKeys = GSUI.$createElement( "gsui-keys" );
		this.onchange = null;
		Object.seal( this );

		GSUI.$listenEvents( this, {
			gsuiTimewindow: {
				pxperbeat: d => this.#ongsuiTimewindowPxperbeat( d.args[ 0 ] ),
				lineheight: d => this.#ongsuiTimewindowLineheight( d.args[ 0 ] ),
			},
			gsuiTimeline: {
				inputLoop: d => this.#ongsuiTimelineChangeLoop( false, ...d.args ),
				changeLoop: d => this.#ongsuiTimelineChangeLoop( true, ...d.args ),
				changeCurrentTime: d => this.#ongsuiTimelineChangeCurrentTime( d.args[ 0 ] ),
			},
			gsuiSliderGroup: {
				input: d => this.#ongsuiSliderGroupInput( d.args[ 1 ] ),
				inputEnd: () => this.#ongsuiSliderGroupInputEnd(),
				change: d => this.#ongsuiSliderGroupChange( d ),
			},
		} );
		this.#slidersSelect.onchange = this.#onchangeSlidersSelect.bind( this );
		this.#ongsuiTimewindowPxperbeat( 64 );
		this.#ongsuiTimewindowLineheight( 20 );
		this.#onchangeSlidersSelect();
		this.reset();
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.classList.add( "gsuiBlocksManager" );
			GSUI.$setAttribute( this, "tabindex", -1 );
			this.append( this.#win );
			this.#win.querySelector( ".gsuiTimewindow-panelContent" ).append( this.uiKeys );
			this.#win.querySelector( ".gsuiTimewindow-panelContentDown" ).prepend( this.#slidersSelect );
			this.#win.querySelector( ".gsuiTimewindow-contentDown" ).prepend( this.#uiSliderGroup );
			this.#win.querySelector( ".gsuiTimewindow-mainContent" ).append( this.#selectionElement );
			this.scrollToMiddle();
		}
	}
	static get observedAttributes() {
		return [ "disabled", "currenttime" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "disabled":
					GSUI.$setAttribute( this.#win, "disabled", val );
					break;
				case "currenttime":
					GSUI.$setAttribute( this.#win, "currenttime", val );
					GSUI.$setAttribute( this.#uiSliderGroup, "currenttime", val );
					break;
			}
		}
	}

	// .........................................................................
	reset() {
		this.#currKeyDuration = 1;
	}
	setData( data ) {
		this.#blcManager.setData( data );
	}
	setCallbacks( cb ) {
		this.onchange = cb.onchange;
	}
	timedivision( timediv ) {
		GSUI.$setAttribute( this.#win, "timedivision", timediv );
		GSUI.$setAttribute( this.#uiSliderGroup, "timedivision", timediv );
	}
	loop( a, b ) {
		GSUI.$setAttribute( this.#win, "loop", Number.isFinite( a ) && `${ a }-${ b }` );
		GSUI.$setAttribute( this.#uiSliderGroup, "loopa", a );
		GSUI.$setAttribute( this.#uiSliderGroup, "loopb", b );
	}
	scrollToMiddle() {
		this.#win.scrollTop = this.#win.querySelector( ".gsuiTimewindow-rows" ).clientHeight / 2;
	}
	scrollToKeys() {
		const blc = this.#win.querySelector( ".gsuiBlocksManager-block" );

		if ( blc ) {
			const key = +blc.dataset.keyNote;
			const maxRow = +this.#win.querySelector( ".gsui-row" ).dataset.midi;

			this.#win.scrollTop = ( maxRow - key - 3.5 ) * GSUI.$getAttributeNum( this.#win, "lineheight" );
		}
	}
	octaves( from, nb ) {
		const rows = this.uiKeys.octaves( from, nb );

		Object.keys( this.#rowsByMidi ).forEach( k => delete this.#rowsByMidi[ k ] );
		rows.forEach( el => {
			const midi = +el.dataset.midi;

			el.onmousedown = this.#rowMousedown.bind( this, midi );
			this.#rowsByMidi[ midi ] = el;
		} );
		this.#win.querySelector( ".gsuiTimewindow-rows" ).append( ...rows );
		this.#win.querySelector( ".gsuiTimewindow-rows" ).style.height = `${ rows.length }em`;
		this.scrollToMiddle();
		this.reset();
	}

	// Block's UI functions
	// ........................................................................
	addKey( id, obj ) {
		const blc = GSUI.$getTemplate( "gsui-pianoroll-block" );
		const dragline = new gsuiDragline();

		blc.dataset.id = id;
		blc.onmousedown = this.#blcMousedown.bind( this, id );
		dragline.onchange = this.#onchangeDragline.bind( this, id );
		blc._dragline = dragline;
		blc._draglineDrop = blc.querySelector( ".gsuiDragline-drop" );
		blc.append( dragline.rootElement );
		dragline.getDropAreas = this.#getDropAreas.bind( this, id );
		this.#blcManager.getBlocks().set( id, blc );
		obj.selected
			? this.#blcManager.getSelectedBlocks().set( id, blc )
			: this.#blcManager.getSelectedBlocks().delete( id );
		this.#uiSliderGroup.set( id, obj.when, obj.duration, obj[ this.#slidersSelect.value ] );
		this.#blockDOMChange( blc, "key", obj.key );
		this.#blockDOMChange( blc, "when", obj.when );
		this.#blockDOMChange( blc, "duration", obj.duration );
		this.#blockDOMChange( blc, "selected", obj.selected );
		this.#blockDOMChange( blc, "pan", obj.pan );
		this.#blockDOMChange( blc, "gain", obj.gain );
		this.#blockDOMChange( blc, "lowpass", obj.lowpass );
		this.#blockDOMChange( blc, "highpass", obj.highpass );
		this.#blockDOMChange( blc, "gainLFOSpeed", obj.gainLFOSpeed );
		this.#blockDOMChange( blc, "gainLFOAmp", obj.gainLFOAmp );
		this.#blockDOMChange( blc, "prev", obj.prev );
		this.#blockDOMChange( blc, "next", obj.next );
	}
	removeKey( id ) {
		const blc = this.#blcManager.getBlocks().get( id );
		const blcPrev = this.#blcManager.getBlocks().get( blc.dataset.prev );

		blc.remove();
		if ( blcPrev ) {
			blcPrev._dragline.linkTo( null );
		}
		this.#blcManager.getBlocks().delete( id );
		this.#blcManager.getSelectedBlocks().delete( id );
		this.#uiSliderGroup.delete( id );
	}
	changeKeyProp( id, prop, val ) {
		const blc = this.#blcManager.getBlocks().get( id );

		this.#blockDOMChange( blc, prop, val );
		if ( val === null ) {
			delete blc.dataset[ prop ];
		} else {
			blc.dataset[ prop === "key" ? "keyNote" : prop ] = val;
		}
		if ( prop === "selected" ) {
			val
				? this.#blcManager.getSelectedBlocks().set( id, blc )
				: this.#blcManager.getSelectedBlocks().delete( id );
		}
	}
	#blockDOMChange( el, prop, val ) {
		switch ( prop ) {
			case "when":
				el.style.left = `${ val }em`;
				this.#uiSliderGroup.setProp( el.dataset.id, "when", val );
				this.#blockRedrawDragline( el );
				break;
			case "duration":
				el.style.width = `${ val }em`;
				this.#uiSliderGroup.setProp( el.dataset.id, "duration", val );
				this.#currKeyDuration = val;
				this.#blockRedrawDragline( el );
				break;
			case "deleted":
				el.classList.toggle( "gsuiBlocksManager-block-hidden", !!val );
				break;
			case "selected":
				el.classList.toggle( "gsuiBlocksManager-block-selected", !!val );
				this.#uiSliderGroup.setProp( el.dataset.id, "selected", !!val );
				break;
			case "row":
				this.#blockDOMChange( el, "key", el.dataset.keyNote - val );
				break;
			case "key": {
				const row = this.#getRowByMidi( val );

				el.dataset.key = gsuiKeys.keyNames.en[ row.dataset.key ];
				row.firstElementChild.append( el );
				this.#blockRedrawDragline( el );
			} break;
			case "prev": {
				const blc = this.#blcManager.getBlocks().get( val );

				el.classList.toggle( "gsuiPianoroll-block-prevLinked", !!val );
				blc && blc._dragline.linkTo( el._draglineDrop );
			} break;
			case "next": {
				const blc = this.#blcManager.getBlocks().get( val );

				el.classList.toggle( "gsuiPianoroll-block-nextLinked", !!val );
				el._dragline.linkTo( blc && blc._draglineDrop );
			} break;
			case "pan":
			case "gain":
			case "lowpass":
			case "highpass":
				this.#blockSliderUpdate( prop, el, val );
				break;
			case "gainLFOAmp":
			case "gainLFOSpeed":
				this.#blockSliderUpdate( prop, el, gsuiPianoroll.#mulToX( val ) );
				break;
		}
	}
	#blockSliderUpdate( nodeName, el, val ) {
		if ( this.#slidersSelect.value === nodeName ) {
			this.#uiSliderGroup.setProp( el.dataset.id, "value", val );
		}
	}
	#blockRedrawDragline( el ) {
		const blcPrev = this.#blcManager.getBlocks().get( el.dataset.prev );

		el._dragline.redraw();
		blcPrev && blcPrev._dragline.redraw();
	}

	// Private small getters
	// ........................................................................
	#getRowByMidi( midi ) { return this.#rowsByMidi[ midi ]; }

	// ........................................................................
	#ongsuiTimewindowPxperbeat( ppb ) {
		this.#blcManager.setPxPerBeat( ppb );
		this.#blcManager.getBlocks().forEach( blc => blc._dragline.redraw() );
		GSUI.$setAttribute( this.#uiSliderGroup, "pxperbeat", ppb );
	}
	#ongsuiTimewindowLineheight( px ) {
		this.#blcManager.setFontSize( px );
		Array.from( this.#blcManager.getRows() ).forEach( el => el.classList.toggle( "gsui-row-small", px <= 44 ) );
		this.#blcManager.getBlocks().forEach( blc => blc._dragline.redraw() );
	}
	#ongsuiTimelineChangeCurrentTime( t ) {
		GSUI.$setAttribute( this.#uiSliderGroup, "currenttime", t );
		return true;
	}
	#ongsuiTimelineChangeLoop( ret, a, b ) {
		GSUI.$setAttribute( this.#uiSliderGroup, "loopa", a );
		GSUI.$setAttribute( this.#uiSliderGroup, "loopb", b );
		return ret;
	}
	#ongsuiSliderGroupInput( val ) {
		const prop = this.#slidersSelect.value;

		Array.prototype.find.call( this.#slidersSelect.children,
			o => o.value === prop ).dataset.number = ( prop.startsWith( "gainLFO" )
			? gsuiPianoroll.#xToMul( val )
			: val ).toFixed( 2 );
	}
	#ongsuiSliderGroupInputEnd() {
		const prop = this.#slidersSelect.value;

		delete Array.prototype.find.call( this.#slidersSelect.children,
			o => o.value === prop ).dataset.number;
	}
	#ongsuiSliderGroupChange( d ) {
		const prop = this.#slidersSelect.value;

		d.component = "gsuiPianoroll";
		d.eventName = "changeKeysProps";
		if ( prop.startsWith( "gainLFO" ) ) {
			d.args[ 0 ].forEach( v => v[ 1 ] = gsuiPianoroll.#xToMul( v[ 1 ] ) );
		}
		d.args.unshift( prop );
		return true;
	}
	static #xToMul( x ) {
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
	static #mulToX( mul ) {
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
	#blcMousedown( id, e ) {
		const dline = e.currentTarget._dragline.rootElement;

		e.stopPropagation();
		if ( !dline.contains( e.target ) ) {
			this.#blcManager.onmousedown( e );
		}
	}
	#rowMousedown( key, e ) {
		this.#blcManager.onmousedown( e );
		if ( e.button === 0 && !e.shiftKey ) {
			const when = this.#blcManager.roundBeat( this.#blcManager.getWhenByPageX( e.pageX ) );

			this.onchange( "add", key, when, this.#currKeyDuration );
		}
	}
	#onchangeSlidersSelect() {
		const prop = this.#slidersSelect.value;
		const grp = this.#uiSliderGroup;

		switch ( prop ) {
			case "pan":          grp.options( { min: -1, max: 1, def:  0, step: .05 } ); break;
			case "gain":         grp.options( { min:  0, max: 1, def: .8, step: .025 } ); break;
			case "lowpass":      grp.options( { min:  0, max: 1, def:  1, step: .025, exp: 3 } ); break;
			case "highpass":     grp.options( { min:  0, max: 1, def:  1, step: .025, exp: 3 } ); break;
			case "gainLFOAmp":   grp.options( { min: -6, max: 6, def:  0, step: 1 } ); break;
			case "gainLFOSpeed": grp.options( { min: -6, max: 6, def:  0, step: 1 } ); break;
		}
		this.#blcManager.getBlocks().forEach( ( blc, id ) => {
			const val = +blc.dataset[ prop ];
			const val2 = prop.startsWith( "gainLFO" )
				? gsuiPianoroll.#mulToX( val )
				: val;

			this.#uiSliderGroup.setProp( id, "value", val2 );
		} );
	}

	// Key's functions
	// ........................................................................
	#getDropAreas( id ) {
		const d = this.#blcManager.getBlocks().get( id ).dataset;
		const when = +d.when + +d.duration;
		const arr = [];

		this.#blcManager.getBlocks().forEach( blc => {
			const d = blc.dataset;

			if ( +d.when >= when && ( d.prev === undefined || d.prev === id ) ) {
				arr.push( blc.firstElementChild );
			}
		} );
		return arr;
	}
	#onchangeDragline( id, el ) {
		this.onchange( "redirect", id, el ? el.parentNode.dataset.id : null );
	}
}

Object.freeze( gsuiPianoroll );
customElements.define( "gsui-pianoroll", gsuiPianoroll );
