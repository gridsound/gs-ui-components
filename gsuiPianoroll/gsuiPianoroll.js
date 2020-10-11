"use strict";

class gsuiPianoroll {
	constructor( cb ) {
		const root = gsuiPianoroll.template.cloneNode( true ),
			sideTop = root.querySelector( ".gsuiPianoroll-sidePanelTop" ),
			gridTop = root.querySelector( ".gsuiPianoroll-gridPanelTop" ),
			sideBottom = root.querySelector( ".gsuiPianoroll-sidePanelBottom" ),
			gridBottom = root.querySelector( ".gsuiPianoroll-gridPanelBottom" ),
			blcManager = new gsuiBlocksManager( root, {
				blockDOMChange: this._blockDOMChange.bind( this ),
				managercallDuplicating: ( keysMap, wIncr ) => this.onchange( "clone", Array.from( keysMap.keys() ), wIncr ),
				managercallSelecting: keysMap => this.onchange( "selection", Array.from( keysMap.keys() ) ),
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
				oninputLoop: this._loop.bind( this ),
				oninputCurrentTime: this._currentTime.bind( this ),
				onchangePxPerBeat: this._setPxPerBeat.bind( this ),
				onscrollRows: this._onscrollRows.bind( this ),
				...cb,
			} );

		this.rootElement = root;
		this.timeline = blcManager.timeline;
		this.onchange = cb.onchange;
		this._blcManager = blcManager;
		this._uiSliderGroup = root.querySelector( "gsui-slidergroup" );
		this._slidersSelect = root.querySelector( ".gsuiPianoroll-slidersSelect" );
		this._slidersSelect.onchange = this._onchangeSlidersSelect.bind( this );
		sideBottom.onresizing =
		gridBottom.onresizing = panel => {
			const topH = panel.previousElementSibling.style.height,
				bottomH = panel.style.height;

			if ( panel === gridBottom ) {
				sideTop.style.height = topH;
				sideBottom.style.height = bottomH;
			} else {
				gridTop.style.height = topH;
				gridBottom.style.height = bottomH;
			}
		};

		this.uiKeys = new gsuiKeys();
		this._rowsByMidi = {};
		this._currKeyDuration = 1;
		this.reset();
		this._blcManager.__sideContent.append( this.uiKeys.rootElement );
		this._blcManager.__onclickMagnet();
		this._onchangeSlidersSelect();
		root.addEventListener( "gsuiEvents", e => {
			switch ( e.detail.component ) {
				case "gsuiSliderGroup":
					if ( e.detail.eventName === "change" ) {
						e.detail.component = "gsuiPianoroll";
						e.detail.eventName = "changeKeysProps";
						e.detail.args.unshift( this._slidersSelect.value );
					}
					break;
			}
		} );
		this.setPxPerBeat( 64 );
	}

	reset() {
		this._currKeyDuration = 1;
	}
	resized() {
		this._blcManager.__resized();
		this._blcManager.__gridPanelResized();
	}
	attached() {
		this._uiSliderGroup.scrollElement.onscroll = this._onscrollSliderGroup.bind( this,
			this._uiSliderGroup.scrollElement, this._blcManager.__rowsContainer );
		this._blcManager.__attached();
		this.scrollToMiddle();
	}
	setPxPerBeat( px ) {
		if ( this._blcManager.setPxPerBeat( px ) ) {
			this._blcManager.__blcs.forEach( blc => blc._dragline.redraw() );
		}
	}
	setFontSize( px ) {
		if ( this._blcManager.setFontSize( px ) ) {
			this._blcManager.__blcs.forEach( blc => blc._dragline.redraw() );
		}
	}
	currentTime( t ) {
		this._blcManager.currentTime( t );
	}
	loop( a, b ) {
		this._blcManager.loop( a, b );
	}
	scrollToMiddle() {
		const rows = this._blcManager.__rowsContainer;

		rows.scrollTop = ( rows.scrollHeight - rows.clientHeight ) / 2;
	}
	scrollToKeys() {
		const rows = this._blcManager.__rowsContainer,
			smp = rows.querySelector( ".gsuiBlocksManager-block" );

		if ( smp ) {
			rows.scrollTop += smp.getBoundingClientRect().top -
				rows.getBoundingClientRect().top - 3.5 * this._blcManager.__fontSize;
		}
	}
	timeSignature( a, b ) {
		this._blcManager.timeSignature( a, b );
		this._uiSliderGroup.timeSignature( a, b );
	}
	getDuration() {
		return this._blcManager.getDuration();
	}
	octaves( from, nb ) {
		this.reset();
		Object.keys( this._rowsByMidi ).forEach( k => delete this._rowsByMidi[ k ] );

		const rows = this.uiKeys.octaves( from, nb );

		rows.forEach( el => {
			const midi = +el.dataset.midi;

			el.onmousedown = this._rowMousedown.bind( this, midi );
			el.firstElementChild.style.fontSize = `${ this._blcManager.__pxPerBeat }px`;
			this._rowsByMidi[ midi ] = el;
		} );
		this._blcManager.__rowsWrapinContainer.style.height = `${ rows.length }em`;
		this._blcManager.__rowsWrapinContainer.prepend( ...rows );
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

	// Mouse and keyboard events
	// ........................................................................
	_onscrollRows() {
		this._onscrollSliderGroup( this._blcManager.__rowsContainer, this._uiSliderGroup.scrollElement );
	}
	_loop( a, b ) { this._uiSliderGroup.loop( a, b ); }
	_currentTime( beat ) { this._uiSliderGroup.currentTime( beat ); }
	_setPxPerBeat( ppb ) { this._uiSliderGroup.setPxPerBeat( ppb ); }

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
	_onscrollSliderGroup( elSrc, elLink ) {
		if ( this._slidersWrapScrollLeft !== elSrc.scrollLeft ) {
			this._slidersWrapScrollLeft =
			elLink.scrollLeft = elSrc.scrollLeft;
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
