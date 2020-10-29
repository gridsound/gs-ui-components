"use strict";

class gsuiPianoroll {
	constructor( cb ) {
		const root = gsuiPianoroll.template.cloneNode( true ),
			win = GSUI.createElement( "gsui-timewindow", {
				panelsize: 90,
				panelsizemin: 70,
				panelsizemax: 120,
				lineheight: 20,
				lineheightmin: 12,
				lineheightmax: 32,
				pxperbeat: 64,
				pxperbeatmin: 20,
				pxperbeatmax: 200,
				downpanel: "",
				downpanelsize: 100,
				downpanelsizemin: 84,
				downpanelsizemax: 150,
			} ),
			selectionElement = GSUI.createElement( "div", { class: "gsuiBlocksManager-selection gsuiBlocksManager-selection-hidden" } ),
			blcManager = new gsuiBlocksManager( {
				rootElement: root,
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
				managercallAttack: ( keysMap, val ) => this.onchange( "changeEnv", Array.from( keysMap.keys() ), "attack", val ),
				managercallRelease: ( keysMap, val ) => this.onchange( "changeEnv", Array.from( keysMap.keys() ), "release", val ),
				mouseup: () => {
					if ( this._blcManager.__status === "cropping-b" ) {
						this._blcManager.__blcsEditing.forEach( blc => {
							blc._attack.style.maxWidth =
							blc._release.style.maxWidth = "";
						} );
					}
				},
				...cb,
			} );

		this._win = win;
		this.rootElement = root;
		this.timeline = win._elTimeline;
		this.uiKeys = GSUI.createElement( "gsui-keys" );
		this.onchange = cb.onchange;
		this._blcManager = blcManager;
		this._rowsByMidi = {};
		this._currKeyDuration = 1;
		this._selectionElement = selectionElement;
		this._uiSliderGroup = GSUI.createElement( "gsui-slidergroup", { beatlines: "" } );
		this._slidersSelect = GSUI.createElement( "select", { class: "gsuiPianoroll-slidersSelect", size: 4 },
			GSUI.createElement( "option", { value: "gain", selected: "" }, "gain" ),
			GSUI.createElement( "option", { value: "pan" }, "pan" ),
			GSUI.createElement( "option", { value: "lowpass" }, "lowpass" ),
			GSUI.createElement( "option", { value: "highpass" }, "highpass" ),
		);

		root.addEventListener( "gsuiEvents", this._ongsuiEvents.bind( this ) );
		this._slidersSelect.onchange = this._onchangeSlidersSelect.bind( this );

		this._ongsuiTimewindowPxperbeat( 64 );
		this._ongsuiTimewindowLineheight( 20 );
		this._onchangeSlidersSelect();
		this.reset();
	}

	reset() {
		this._currKeyDuration = 1;
	}
	attached() {
		this.rootElement.append( this._win );
		this._win.querySelector( ".gsuiTimewindow-panelContent" ).append( this.uiKeys );
		this._win.querySelector( ".gsuiTimewindow-panelContentDown" ).prepend( this._slidersSelect );
		this._win.querySelector( ".gsuiTimewindow-contentDown" ).prepend( this._uiSliderGroup );
		this._win.querySelector( ".gsuiTimewindow-mainContent" ).append( this._selectionElement );
		this.scrollToMiddle();
	}
	timeSignature( a, b ) {
		GSUI.setAttribute( this._win, "timesignature", `${ a },${ b }` );
		GSUI.setAttribute( this._uiSliderGroup, "timesignature", `${ a },${ b }` );
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
		const blc = gsuiPianoroll.blockTemplate.cloneNode( true ),
			dragline = new gsuiDragline();

		blc.dataset.id = id;
		blc.onmousedown = this._blcMousedown.bind( this, id );
		dragline.onchange = this._onchangeDragline.bind( this, id );
		blc._attack = blc.querySelector( ".gsuiPianoroll-block-attack" );
		blc._release = blc.querySelector( ".gsuiPianoroll-block-release" );
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
		this._blockDOMChange( blc, "attack", obj.attack );
		this._blockDOMChange( blc, "release", obj.release );
		this._blockDOMChange( blc, "pan", obj.pan );
		this._blockDOMChange( blc, "gain", obj.gain );
		this._blockDOMChange( blc, "lowpass", obj.lowpass );
		this._blockDOMChange( blc, "highpass", obj.highpass );
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
		blc.dataset[ prop === "key" ? "keyNote" : prop ] = val;
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
			case "attack": el._attack.style.width = `${ val }em`; break;
			case "release": el._release.style.width = `${ val }em`; break;
			case "pan": this._blockSliderUpdate( "pan", el, val ); break;
			case "gain": this._blockSliderUpdate( "gain", el, val ); break;
			case "lowpass": this._blockSliderUpdate( "lowpass", el, val ); break;
			case "highpass": this._blockSliderUpdate( "highpass", el, val ); break;
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
					case "change": return this._ongsuiSliderGroupChange( e );
				}
				break;
		}
		e.stopPropagation();
	}
	_ongsuiTimewindowPxperbeat( ppb ) {
		this._blcManager.__pxPerBeat = ppb;
		this._blcManager.__blcs.forEach( blc => blc._dragline.redraw() );
		this._uiSliderGroup.setPxPerBeat( ppb );
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
	_ongsuiSliderGroupChange( e ) {
		e.detail.component = "gsuiPianoroll";
		e.detail.eventName = "changeKeysProps";
		e.detail.args.unshift( this._slidersSelect.value );
	}

	// ........................................................................
	_blcMousedown( id, e ) {
		const dline = e.currentTarget._dragline.rootElement;

		e.stopPropagation();
		if ( !dline.contains( e.target ) ) {
			this._blcManager.__mousedown( e );
			if ( this._blcManager.__status === "cropping-b" ) {
				this._blcManager.__blcsEditing.forEach( ( blc, id ) => {
					const att = +blc.dataset.attack,
						rel = +blc.dataset.release;

					blc._attack.style.maxWidth = `${ att / ( att + rel ) * 100 }%`;
					blc._release.style.maxWidth = `${ rel / ( att + rel ) * 100 }%`;
				} );
			}
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
		const nodeName = this._slidersSelect.value,
			slidGroup = this._uiSliderGroup;

		switch ( nodeName ) {
			case "pan":      slidGroup.minMaxStep( -1, 1, .02 ); break;
			case "gain":     slidGroup.minMaxStep(  0, 1, .01 ); break;
			case "lowpass":  slidGroup.minMaxStep(  0, 1, .01, 3 ); break;
			case "highpass": slidGroup.minMaxStep(  0, 1, .01, 3 ); break;
		}
		this._blcManager.__blcs.forEach( ( blc, id ) => {
			this._uiSliderGroup.setProp( id, "value", blc.dataset[ nodeName ] );
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

			if ( +d.when >= when && ( d.prev === "null" || d.prev === id ) ) {
				arr.push( blc.firstElementChild );
			}
		} );
		return arr;
	}
	_onchangeDragline( id, el ) {
		this.onchange( "redirect", id, el ? el.parentNode.dataset.id : null );
	}
}

gsuiPianoroll.template = document.querySelector( "#gsuiPianoroll-template" );
gsuiPianoroll.template.remove();
gsuiPianoroll.template.removeAttribute( "id" );

gsuiPianoroll.blockTemplate = document.querySelector( "#gsuiPianoroll-block-template" );
gsuiPianoroll.blockTemplate.remove();
gsuiPianoroll.blockTemplate.removeAttribute( "id" );
