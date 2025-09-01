"use strict";

class gsuiPianoroll extends gsui0ne {
	static #keyNotation = [];
	static $keyNotation( id ) {
		const kn = gsuiKeys.$keyNotations[ id ];

		gsuiPianoroll.#keyNotation = kn;
		GSUdomQSA( ".gsuiPianoroll-block" ).forEach( blc => {
			blc.firstChild.textContent = kn[ blc.parentNode.parentNode.dataset.key ];
		} );
	}
	$onchange = null;
	#rowsByMidi = {};
	#currKeyDuration = 1;
	#uiSliderGroup = GSUcreateElement( "gsui-slidergroup", { beatlines: "" } );
	#selectionElement = GSUcreateDiv( { class: "gsuiBlocksManager-selection gsuiBlocksManager-selection-hidden" } );
	#propSelectList = [
		"gain",
		"pan",
		"lowpass:lp",
		"highpass:hp",
		"---gain.LFO---",
		"gainLFOSpeed:speed",
		"gainLFOAmp:amp",
	];
	#propSelect = GSUcreateElement( "gsui-prop-select", { prop: "gain", props: this.#propSelectList.join( " " ) } );
	#win = GSUcreateElement( "gsui-timewindow", {
		panelsize: 100,
		panelsizemin: 100,
		panelsizemax: 160,
		lineheight: 20,
		lineheightmin: 12,
		lineheightmax: 32,
		pxperbeat: 64,
		pxperbeatmin: 20,
		pxperbeatmax: 200,
		downpanel: "",
		downpanelsize: 120,
		downpanelsizemin:  80,
		downpanelsizemax: 160,
	} );
	#blcManager = new gsuiBlocksManager( {
		rootElement: this,
		selectionElement: this.#selectionElement,
		timeline: this.#win.$getTimeline(),
		blockDOMChange: this.#blockDOMChange.bind( this ),
		managercallDuplicating: ( keysMap, wIncr ) => this.$onchange( "clone", Array.from( keysMap.keys() ), wIncr ),
		managercallSelecting: ids => this.$onchange( "selection", ids ),
		managercallUnselecting: () => this.$onchange( "unselection" ),
		managercallUnselectingOne: keyId => this.$onchange( "unselectionOne", keyId ),
		managercallCreate: obj => this.$onchange( "add", obj.midi, obj.when, obj.duration ),
		managercallMoving: ( keysMap, wIncr, kIncr ) => this.$onchange( "move", Array.from( keysMap.keys() ), wIncr, kIncr ),
		managercallCroppingB: ( keysMap, dIncr ) => this.$onchange( "cropEnd", Array.from( keysMap.keys() ), dIncr ),
		managercallDeleting: keysMap => this.$onchange( "remove", Array.from( keysMap.keys() ) ),
	} );

	constructor() {
		super( {
			$cmpName: "gsuiPianoroll",
			$tagName: "gsui-pianoroll",
			$attributes: { tabindex: -1 },
		} );
		this.uiKeys = GSUcreateElement( "gsui-keys" );
		Object.seal( this );
		GSUdomListen( this, {
			[ GSEV_TIMEWINDOW_PXPERBEAT ]: ( _, px ) => this.#ongsuiTimewindowPxperbeat( px ),
			[ GSEV_TIMEWINDOW_LINEHEIGHT ]: ( _, px ) => this.#ongsuiTimewindowLineheight( px ),
			[ GSEV_TIMELINE_INPUTLOOP ]: d => this.#ongsuiTimelineChangeLoop( false, ...d.$args ),
			[ GSEV_TIMELINE_CHANGELOOP ]: d => this.#ongsuiTimelineChangeLoop( true, ...d.$args ),
			[ GSEV_TIMELINE_CHANGECURRENTTIME ]: ( _, time ) => this.#ongsuiTimelineChangeCurrentTime( time ),
			[ GSEV_PROPSELECT_SELECT ]: () => this.#onchangePropSelect(),
			[ GSEV_SLIDERGROUP_INPUT ]: ( _, __, a ) => this.#ongsuiSliderGroupInput( a ),
			[ GSEV_SLIDERGROUP_INPUTEND ]: () => this.#ongsuiSliderGroupInputEnd(),
			[ GSEV_SLIDERGROUP_CHANGE ]: ( _, arr ) => this.#ongsuiSliderGroupChange( arr ),
			[ GSEV_BLOCKSMANAGER_DELETEPREVIEWBLOCK ]: () => this.$removeKey( "preview" ),
			[ GSEV_BLOCKSMANAGER_STARTPREVIEWAUDIO ]: ( _, __, a ) => {
				if ( !GSUdomQS( "gsui-daw[playing]" ) ) {
					this.uiKeys.$midiKeyDown( a ); // should be called differently
				}
			},
			[ GSEV_BLOCKSMANAGER_STOPPREVIEWAUDIO ]: ( _, __, a ) => {
				if ( !GSUdomQS( "gsui-daw[playing]" ) ) {
					this.uiKeys.$midiKeyUp( a );
				}
			},
		} );
		this.ondragover = GSUnoopFalse;
		this.ondrop = this.#ondrop.bind( this );
		this.#blcManager.$oncreatePreviewBlock = ( rowInd, when ) => {
			const rows = this.#blcManager.$getRows();
			const key = +rows[ rowInd ].dataset.midi;

			return this.$addKey( "preview", { when, key, duration: this.#currKeyDuration } );
		};
		this.#ongsuiTimewindowPxperbeat( 64 );
		this.#ongsuiTimewindowLineheight( 20 );
		this.#onchangePropSelect();
		this.$reset();
	}

	// .........................................................................
	$firstTimeConnected() {
		GSUdomAddClass( this, "gsuiBlocksManager" );
		this.append( this.#win );
		this.#win.$appendPanel( this.uiKeys );
		this.#win.$appendPanelDown( this.#propSelect );
		this.#win.$appendDown( this.#uiSliderGroup );
		this.#win.$appendMain( this.#selectionElement );
		this.$scrollToMiddle();
	}
	static get observedAttributes() {
		return [ "disabled", "currenttime" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "disabled":
				GSUdomSetAttr( this.#win, "disabled", val );
				break;
			case "currenttime":
				GSUdomSetAttr( this.#win, "currenttime", val );
				GSUdomSetAttr( this.#uiSliderGroup, "currenttime", val );
				break;
		}
	}

	// .........................................................................
	$reset() {
		this.#currKeyDuration = 1;
	}
	$changeDuration( dur ) {
		GSUdomSetAttr( this.#win, "duration", dur );
	}
	$setData( data ) {
		this.#blcManager.$setData( data );
	}
	$setCallbacks( cb ) {
		this.$onchange = cb.$onchange;
	}
	$timedivision( timediv ) {
		GSUdomSetAttr( this.#win, "timedivision", timediv );
		GSUdomSetAttr( this.#uiSliderGroup, "timedivision", timediv );
	}
	$loop( a, b ) {
		GSUdomSetAttr( this.#win, "loop", Number.isFinite( a ) && `${ a }-${ b }` );
		GSUdomSetAttr( this.#uiSliderGroup, { loopa: a, loopb: b } );
	}
	$scrollToMiddle() {
		this.#win.firstChild.scrollTop = GSUdomQS( this.#win, ".gsuiTimewindow-rows" ).clientHeight / 2;
	}
	$scrollToKeys() {
		const blc = GSUdomQS( this.#win, ".gsuiBlocksManager-block" );

		if ( blc ) {
			const key = +blc.dataset.keyNote;
			const maxRow = +GSUdomQS( this.#win, ".gsui-row" ).dataset.midi;

			this.#win.scrollTop = ( maxRow - key - 3.5 ) * GSUdomGetAttrNum( this.#win, "lineheight" );
		}
	}
	$octaves( from, nb ) {
		GSUdomSetAttr( this.uiKeys, "octaves", `${ from } ${ nb }` );

		const rows = this.uiKeys.$getRows();

		Object.keys( this.#rowsByMidi ).forEach( k => delete this.#rowsByMidi[ k ] );
		rows.forEach( el => {
			const midi = +el.dataset.midi;

			el.onmousedown = this.#rowMousedown.bind( this, midi );
			this.#rowsByMidi[ midi ] = el;
		} );
		GSUdomQS( this.#win, ".gsuiTimewindow-rows" ).append( ...rows );
		GSUdomQS( this.#win, ".gsuiTimewindow-rows" ).style.height = `${ rows.length }em`;
		this.$scrollToMiddle();
		this.$reset();
	}
	$setPropSelect( oscs ) {
		const props = [ ...this.#propSelectList ];
		const propsWT = GSUreduce( oscs, ( arr, osc, id ) => {
			if ( osc.wavetable ) {
				arr.push( `wtposCurves.${ id }:osc${ id }` );
			}
			return arr;
		}, [] );

		if ( propsWT.length ) {
			props.push( "---osc-wavetables---", ...propsWT );
		}
		GSUdomSetAttr( this.#propSelect, "props", props.join( " " ) );
	}

	// .........................................................................
	$addKey( id, obj ) {
		const blc = GSUgetTemplate( "gsui-pianoroll-block" );
		const dragline = new gsuiDragline();

		blc.dataset.id = id;
		blc.onmousedown = this.#blcMousedown.bind( this, id );
		dragline.onchange = this.#onchangeDragline.bind( this, id );
		blc._dragline = dragline;
		blc._draglineDrop = GSUdomQS( blc, ".gsuiDragline-drop" );
		blc.append( dragline.rootElement );
		dragline.getDropAreas = this.#getDropAreas.bind( this, id );
		this.#blcManager.$getBlocks().set( id, blc );
		obj.selected
			? this.#blcManager.$getSelectedBlocks().set( id, blc )
			: this.#blcManager.$getSelectedBlocks().delete( id );
		this.#uiSliderGroup.$set( id, obj.when, obj.duration, 0 );
		this.$changeKeyProp( id, "key", obj.key );
		this.$changeKeyProp( id, "when", obj.when );
		this.$changeKeyProp( id, "duration", obj.duration );
		this.#blockDOMChange( blc, "selected", obj.selected );
		this.#blockDOMChange( blc, "pan", obj.pan );
		this.#blockDOMChange( blc, "gain", obj.gain );
		this.#blockDOMChange( blc, "lowpass", obj.lowpass );
		this.#blockDOMChange( blc, "highpass", obj.highpass );
		this.#blockDOMChange( blc, "gainLFOSpeed", obj.gainLFOSpeed );
		this.#blockDOMChange( blc, "gainLFOAmp", obj.gainLFOAmp );
		this.#blockDOMChange( blc, "prev", obj.prev );
		this.#blockDOMChange( blc, "next", obj.next );
		GSUforEach( obj.wtposCurves, ( val, id ) => {
			this.#blockDOMChange( blc, `wtposCurves.${ id }`, obj.wtposCurves[ id ] || 0 );
		} );
		return blc;
	}
	$removeKey( id ) {
		const blc = this.#blcManager.$getBlocks().get( id );
		const blcPrev = this.#blcManager.$getBlocks().get( blc.dataset.prev );

		blc.remove();
		if ( blcPrev ) {
			blcPrev._dragline.linkTo( null );
		}
		this.#blcManager.$getBlocks().delete( id );
		this.#blcManager.$getSelectedBlocks().delete( id );
		this.#uiSliderGroup.$delete( id );
	}
	$changeKeyProp( id, prop, val ) {
		const blc = this.#blcManager.$getBlocks().get( id );

		this.#blockDOMChange( blc, prop, val );
		if ( val === null ) {
			delete blc.dataset[ prop ];
		} else {
			blc.dataset[ prop === "key" ? "keyNote" : prop ] = val;
		}
		if ( prop === "selected" ) {
			val
				? this.#blcManager.$getSelectedBlocks().set( id, blc )
				: this.#blcManager.$getSelectedBlocks().delete( id );
		}
	}
	#blockDOMChange( el, prop, val ) {
		switch ( prop ) {
			case "when":
				el.style.left = `${ val }em`;
				this.#uiSliderGroup.$setProp( el.dataset.id, "when", val );
				this.#blockRedrawDragline( el );
				break;
			case "duration":
				el.style.width = `${ val }em`;
				this.#uiSliderGroup.$setProp( el.dataset.id, "duration", val );
				this.#currKeyDuration = val;
				this.#blockRedrawDragline( el );
				break;
			case "deleted":
				GSUdomTogClass( el, "gsuiBlocksManager-block-hidden", !!val );
				break;
			case "selected":
				GSUdomTogClass( el, "gsuiBlocksManager-block-selected", !!val );
				this.#uiSliderGroup.$setProp( el.dataset.id, "selected", !!val );
				break;
			case "row":
				this.#blockDOMChange( el, "key", el.dataset.keyNote - val );
				break;
			case "key": {
				const row = this.#getRowByMidi( val );

				el.firstChild.textContent = gsuiPianoroll.#keyNotation[ row.dataset.key ];
				row.firstElementChild.append( el );
				this.#blockRedrawDragline( el );
			} break;
			case "prev": {
				const blc = this.#blcManager.$getBlocks().get( val );

				GSUdomTogClass( el, "gsuiPianoroll-block-prevLinked", !!val );
				blc && blc._dragline.linkTo( el._draglineDrop );
			} break;
			case "next": {
				const blc = this.#blcManager.$getBlocks().get( val );

				GSUdomTogClass( el, "gsuiPianoroll-block-nextLinked", !!val );
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
			default:
				if ( prop.startsWith( "wtposCurves" ) ) {
					this.#blockSliderUpdate( prop, el, +val );
				}
				break;
		}
	}
	#blockSliderUpdate( prop, el, val ) {
		if ( this.#propSelect.$getCurrentProp() === prop ) {
			this.#uiSliderGroup.$setProp( el.dataset.id, "value", val );
		}
	}
	#blockRedrawDragline( el ) {
		const blcPrev = this.#blcManager.$getBlocks().get( el.dataset.prev );

		el._dragline.redraw();
		blcPrev && blcPrev._dragline.redraw();
	}

	// .........................................................................
	#getRowByMidi( midi ) { return this.#rowsByMidi[ midi ]; }

	// .........................................................................
	#ongsuiTimewindowPxperbeat( ppb ) {
		this.#blcManager.$setPxPerBeat( ppb );
		this.#blcManager.$getBlocks().forEach( blc => blc._dragline.redraw() );
		GSUdomSetAttr( this.#uiSliderGroup, "pxperbeat", ppb );
	}
	#ongsuiTimewindowLineheight( px ) {
		this.#blcManager.$setFontSize( px );
		Array.from( this.#blcManager.$getRows() ).forEach( el => GSUdomTogClass( el, "gsui-row-small", px <= 44 ) );
		this.#blcManager.$getBlocks().forEach( blc => blc._dragline.redraw() );
	}
	#ongsuiTimelineChangeCurrentTime( t ) {
		GSUdomSetAttr( this.#uiSliderGroup, "currenttime", t );
		return true;
	}
	#ongsuiTimelineChangeLoop( ret, a, b ) {
		GSUdomSetAttr( this.#uiSliderGroup, { loopa: a, loopb: b } );
		return ret;
	}
	#ongsuiSliderGroupInput( val ) {
		const prop = this.#propSelect.$getCurrentProp();
		const val2 = prop.startsWith( "gainLFO" )
			? `x ${ gsuiPianoroll.#xToMul( val ).toFixed( 2 ) }`
			: val;

		GSUdomSetAttr( this.#propSelect, "value", val2 );
	}
	#ongsuiSliderGroupInputEnd() {
		GSUdomRmAttr( this.#propSelect, "value" );
	}
	#ongsuiSliderGroupChange( kvArr ) {
		const prop = this.#propSelect.$getCurrentProp();

		if ( prop.startsWith( "gainLFO" ) ) {
			kvArr.forEach( v => v[ 1 ] = gsuiPianoroll.#xToMul( v[ 1 ] ) );
		}
		GSUdomDispatch( this, GSEV_PIANOROLL_CHANGEKEYSPROPS, prop, kvArr );
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

	// .........................................................................
	#blcMousedown( id, e ) {
		const dline = e.currentTarget._dragline.rootElement;

		e.stopPropagation();
		if ( !dline.contains( e.target ) ) {
			this.#blcManager.$onmousedown( e );
		}
	}
	#rowMousedown( key, e ) {
		this.#blcManager.$onmousedown( e );
	}
	#onchangePropSelect() {
		const prop = this.#propSelect.$getCurrentProp();
		const grp = this.#uiSliderGroup;

		switch ( prop ) {
			case "pan":          grp.$options( { min: -1, max: 1, def:  0, step: .05          } ); break;
			case "gain":         grp.$options( { min:  0, max: 1, def: .8, step: .025         } ); break;
			case "lowpass":      grp.$options( { min:  0, max: 1, def:  1, step: .025, exp: 3 } ); break;
			case "highpass":     grp.$options( { min:  0, max: 1, def:  1, step: .025, exp: 3 } ); break;
			case "gainLFOAmp":   grp.$options( { min: -6, max: 6, def:  0, step: 1            } ); break;
			case "gainLFOSpeed": grp.$options( { min: -6, max: 6, def:  0, step: 1            } ); break;
		}
		if ( prop.startsWith( "wtposCurves." ) ) {
			grp.$options( { min: 0, max: 9, def: 0, step: 1 } );
		}
		this.#blcManager.$getBlocks().forEach( ( blc, id ) => {
			const val = +blc.dataset[ prop ] || 0;
			const val2 = prop.startsWith( "gainLFO" )
				? gsuiPianoroll.#mulToX( val )
				: val;

			grp.$setProp( id, "value", val2 );
		} );
	}
	#ondrop( e ) {
		const files = e.dataTransfer.items;

		if ( files.length === 1 ) {
			const ext = files[ 0 ].webkitGetAsEntry().name.split( "." ).at( -1 ).toLowerCase();

			if ( ext === "mid" || ext === "midi" ) {
				e.preventDefault();
				e.stopPropagation();
				GSUgetFilesDataTransfert( files )
					.then( files => this.#ondropMIDI( files[ 0 ] ) );
			}
		}
	}
	#ondropMIDI( mid ) {
		const rd = new FileReader();

		rd.onload = e => GSUdomDispatch( this, GSEV_PIANOROLL_MIDIDROPPED, new Uint8Array( e.target.result ) );
		rd.readAsArrayBuffer( mid );
	}

	// .........................................................................
	#getDropAreas( id ) {
		const d = this.#blcManager.$getBlocks().get( id ).dataset;
		const when = +d.when + +d.duration;
		const arr = [];

		this.#blcManager.$getBlocks().forEach( blc => {
			const d = blc.dataset;

			if ( +d.when >= when && ( d.prev === undefined || d.prev === id ) ) {
				arr.push( blc.getElementsByClassName( "gsuiDragline-drop" )[ 0 ] );
			}
		} );
		return arr;
	}
	#onchangeDragline( id, el ) {
		this.$onchange( "redirect", id, el ? el.parentNode.dataset.id : null );
	}
}

GSUdefineElement( "gsui-pianoroll", gsuiPianoroll );
