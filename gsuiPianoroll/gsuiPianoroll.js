"use strict";

class gsuiPianoroll extends gsuiBlocksManager {
	constructor() {
		const root = gsuiPianoroll.template.cloneNode( true ),
			sideTop = root.querySelector( ".gsuiPianoroll-sidePanelTop" ),
			gridTop = root.querySelector( ".gsuiPianoroll-gridPanelTop" ),
			sliders = root.querySelector( ".gsuiPianoroll-sliders" ),
			sideBottom = root.querySelector( ".gsuiPianoroll-sidePanelBottom" ),
			gridBottom = root.querySelector( ".gsuiPianoroll-gridPanelBottom" ),
			slidersWrap = root.querySelector( ".gsuiPianoroll-slidersWrap" ),
			slidersSelect = root.querySelector( ".gsuiPianoroll-slidersSelect" );
		super( root );
		const uiBlc = this.uiBlc,
			uiBlcWhen = uiBlc.when,
			uiBlcDuration = uiBlc.duration,
			uiBlcSelected = uiBlc.selected,
			sliderFnUpdate = ( nodeName, el, val ) => {
				if ( slidersSelect.value === nodeName ) {
					this._updateSlider( nodeName, el._slider, val );
					this._currKeyValue[ nodeName ] = val;
				}
			};

		uiBlc.gain = sliderFnUpdate.bind( null, "gain" );
		uiBlc.pan = sliderFnUpdate.bind( null, "pan" );
		uiBlc.when = ( el, when ) => {
			uiBlcWhen( el, when );
			el._slider.style.left = when + "em";
			el._slider.style.zIndex = Math.floor( when * 100 );
		};
		uiBlc.duration = ( el, dur ) => {
			uiBlcDuration( el, dur );
			el._slider.style.width = dur + "em";
			this._currKeyValue.duration = dur;
		};
		uiBlc.selected = ( el, b ) => {
			const id = +el.dataset.id;

			uiBlcSelected( el, b );
			el._slider.classList.toggle( "gsuiPianoroll-sliderSelected", !!b );
		};
		uiBlc.row = ( el, rowIncr ) => {
			uiBlc.key( el, this.data[ +el.dataset.id ].key - rowIncr );
		};
		uiBlc.key = ( el, midi ) => {
			const row = this._getRowByMidi( midi );

			el.dataset.key = gsuiPianoroll.noteNames.en[ row.dataset.key ];
			row.firstChild.append( el );
		};

		this._sliders = sliders;
		this._slidersWrap = slidersWrap;
		this._slidersSelect = slidersSelect;
		this._slidersScale = root.querySelector( ".gsuiPianoroll-slidersScale" );
		sliders.onmousedown = this._onmousedownSliders.bind( this );
		slidersWrap.onscroll = this._onscrollSlidersWrap.bind( this, slidersWrap, this.__rowsContainer );
		slidersSelect.onchange = this._onchangeSlidersSelect.bind( this );
		sideBottom.onresizing =
		gridBottom.onresizing = panel => {
			const topH = panel.previousSibling.style.height,
				bottomH = panel.style.height;

			if ( panel === gridBottom ) {
				sideTop.style.height = topH;
				sideBottom.style.height = bottomH;
			} else {
				gridTop.style.height = topH;
				gridBottom.style.height = bottomH;
			}
		};

		this.data = this._proxyCreate();
		this.uiKeys = new gsuiKeys();
		this._idMax = 0;
		this._rowsByMidi = {};
		this._currKeyValue = {
			duration: 1,
			gain: .8,
			pan: 0,
		};
		this.__sideContent.append( this.uiKeys.rootElement );
		this.__onclickMagnet();
		this._onchangeSlidersSelect();
		this.setPxPerBeat( 64 );
	}

	empty() {
		Object.keys( this.data ).forEach( k => delete this.data[ k ] );
		this._idMax = 0;
	}
	resized() {
		this.__resized();
		this.__gridPanelResized();
	}
	attached() {
		this.__attached();
		this.scrollToMiddle();
		this._slidersWrap.style.bottom = this.__rowsContainer.style.bottom;
	}
	scrollToMiddle() {
		const rows = this.__rowsContainer;

		rows.scrollTop = ( rows.scrollHeight - rows.clientHeight ) / 2;
	}
	scrollToKeys() {
		const rows = this.__rowsContainer,
			smp = rows.querySelector( ".gsuiBlocksManager-block" );

		if ( smp ) {
			rows.scrollTop += smp.getBoundingClientRect().top -
				rows.getBoundingClientRect().top - 3.5 * this.__fontSize;
		}
	}
	octaves( from, nb ) {
		const rows = this.uiKeys.rootElement.getElementsByClassName( "gsui-row" );

		this.empty();
		Object.keys( this._rowsByMidi ).forEach( k => delete this._rowsByMidi[ k ] );
		this.uiKeys.octaves( from, nb );
		Object.values( rows ).forEach( el => {
			const midi = +el.dataset.midi;

			el.onmousedown = this._rowMousedown.bind( this, midi );
			el.firstChild.style.fontSize = this.__pxPerBeat + "px";
			this._rowsByMidi[ midi ] = el;
		} );
		Element.prototype.prepend.apply( this.__rowsWrapinContainer, rows );
	}

	// Blocks manager callback
	// ........................................................................
	blcsManagerCallback( status, blcsMap, valA, valB ) {
		const obj = {},
			data = this.data;

		switch ( status ) {
			case "duplicating":
				blcsMap.forEach( ( blc, id ) => {
					const d = data[ id ],
						nId = ++this._idMax,
						copy = Object.assign( {}, d );

					copy.when += valA;
					obj[ id ] = { selected: false };
					obj[ nId ] =
					data[ nId ] = copy;
					d.selected = false;
				} );
				break;
			case "selecting":
				blcsMap.forEach( ( _, id ) => {
					const d = data[ id ],
						selected = !d.selected;

					obj[ id ] = { selected };
					d.selected = selected;
				} );
				break;
			case "moving":
				valA = Math.abs( valA ) > .000001 ? valA : 0;
				blcsMap.forEach( ( _, id ) => {
					const d = data[ id ],
						o = {};

					obj[ id ] = o;
					if ( valA ) {
						o.when =
						d.when += valA;
					}
					if ( valB ) {
						o.key =
						d.key -= valB;
					}
				} );
				break;
			case "cropping-b":
				blcsMap.forEach( ( _, id ) => {
					const d = data[ id ],
						duration = d.duration + valA;

					obj[ id ] = { duration };
					d.duration = duration;
				} );
				break;
			case "deleting":
				blcsMap.forEach( ( _, id ) => {
					obj[ id ] = null;
					delete data[ id ];
				} );
				this.__unselectBlocks( obj );
				break;
		}
		this.onchange( obj );
	}

	// Private small getters
	// ........................................................................
	_getData() { return this.data; }
	_getRowByMidi( midi ) { return this._rowsByMidi[ midi ]; }

	// Mouse and keyboard events
	// ........................................................................
	_keyup( e ) { this.__keyup( e ); }
	_keydown( e ) { this.__keydown( e ); }
	_mousemove( e ) { this.__mousemove( e ); }
	_mouseup( e ) {
		this.__mouseup( e );
		this._onmouseupSliders();
	}
	_onscrollleftAfter() {
		this._onscrollSlidersWrap( this.__rowsContainer, this._slidersWrap );
	}
	_onsetPxPerBeat( ppb ) {
		this._sliders.style.fontSize = ppb + "px";
	}

	// ........................................................................
	_blcMousedown( id, e ) {
		e.stopPropagation();
		this.__mousedown( e );
	}
	_rowMousedown( key, e ) {
		this.__mousedown( e );
		if ( e.button === 0 && !e.shiftKey ) {
			const id = this._idMax + 1,
				{ pan, gain, duration } = this._currKeyValue,
				keyObj = { key, pan, gain, duration,
					selected: false,
					when: this.__getWhenByPageX( e.pageX ),
				};

			this.data[ id ] = keyObj;
			this.onchange( this.__unselectBlocks( { [ id ]: keyObj } ) );
		}
	}
	_onscrollSlidersWrap( elSrc, elLink ) {
		if ( this._slidersWrapScrollLeft !== elSrc.scrollLeft ) {
			this._slidersWrapScrollLeft =
			elLink.scrollLeft = elSrc.scrollLeft;
		}
	}

	// SlidersWrap's functions
	// ........................................................................
	_updateSlidersSelected() {
		this._sliders.classList.toggle(
			"gsuiPianoroll-slidersSelected",
			!!this.__blcsSelected.size );
	}
	_onchangeSlidersSelect() {
		const data = this.data,
			nodeName = this._slidersSelect.value;

		this._slidersScale.classList.remove( "gsuiPianoroll-scale01", "gsuiPianoroll-scale11" );
		this._sliders.classList.remove( "gsuiPianoroll-scale01", "gsuiPianoroll-scale11" );
		this._slidersScale.classList.add( nodeName === "gain"
			? "gsuiPianoroll-scale01"
			: "gsuiPianoroll-scale11" );
		this.__blcs.forEach( ( blc, id ) => (
			this._updateSlider( nodeName, blc._slider, data[ id ][ nodeName ] )
		) );
	}
	_onmousedownSliders( e ) {
		const bcr = this._sliders.getBoundingClientRect(),
			sli = e.target._slider;

		this._slidersObj = {};
		this._slidersTop = bcr.top;
		this._slidersHeight = bcr.height;
		this._slidersNodeName = this._slidersSelect.value;
		gsuiBlocksManager._focused = this;
		if ( sli ) {
			this._onmousemoveSlider( +sli.dataset.id, sli, e );
		}
	}
	_onmouseupSliders() {
		if ( this._slidersObj ) {
			const arr = Object.entries( this._slidersObj );

			if ( arr.length ) {
				const nodeName = this._slidersNodeName,
					obj = {};

				arr.forEach( ( [ id, val ] ) => obj[ id ] = { [ nodeName ]: val } );
				this.onchange( obj );
			}
			delete this._slidersObj;
		}
	}
	_onmousemoveSlider( id, sli, e ) {
		if ( this._slidersObj ) {
			const key = this.data[ id ];

			if ( !this.__blcsSelected.size || key.selected ) {
				const nodeName = this._slidersNodeName,
					mouseVal = 1 - ( e.pageY - this._slidersTop ) / this._slidersHeight,
					val = +( nodeName === "gain"
						? mouseVal
						: mouseVal * 2 - 1 ).toFixed( 2 );

				if ( val !== key[ nodeName ] ) {
					this._slidersObj[ id ] = val;
				} else {
					delete this._slidersObj[ id ];
				}
				this._updateSlider( nodeName, sli, val );
			}
		}
	}

	// Slider's functions
	// ........................................................................
	_createSlider( id, obj, blc ) {
		const sli = gsuiPianoroll.sliderTemplate.cloneNode( true );

		blc._slider =
		sli._slider =
		sli.firstChild._slider = sli;
		sli.dataset.id = id;
		sli.onmousemove = this._onmousemoveSlider.bind( this, id, sli );
		this._sliders.append( sli );
	}
	_updateSlider( nodeName, sli, val ) {
		const st = sli.firstChild.style;
		let innerDown = false;

		if ( nodeName === "gain" ) {
			st.top = "auto";
			st.bottom = "0%";
			st.height = val * 100 + "%";
		} else {
			if ( val > 0 ) {
				st.top = "auto";
				st.bottom = "50%";
				st.height = val * 50 + "%";
			} else {
				st.top = "50%";
				st.bottom = "auto";
				st.height = -val * 50 + "%";
				innerDown = true;
			}
		}
		sli.firstChild.classList.toggle( "gsuiPianoroll-sliderInnerDown", innerDown );
	}

	// Key's functions
	// ........................................................................
	_deleteKey( id ) {
		const blc = this.__blcs.get( id );

		blc.remove();
		blc._slider.remove();
		this.__blcs.delete( id );
		this.__blcsSelected.delete( id );
		this._updateSlidersSelected();
	}
	_setKey( id, obj ) {
		const blc = gsuiPianoroll.blockTemplate.cloneNode( true );

		blc.dataset.id = id;
		blc.onmousedown = this._blcMousedown.bind( this, id );
		this.__blcs.set( id, blc );
		obj.selected
			? this.__blcsSelected.set( id, blc )
			: this.__blcsSelected.delete( id );
		this._createSlider( id, obj, blc );
		this.uiBlc.key( blc, obj.key );
		this.uiBlc.when( blc, obj.when );
		this.uiBlc.duration( blc, obj.duration );
		this.uiBlc.selected( blc, obj.selected );
		this.uiBlc.gain( blc, obj.gain );
		this.uiBlc.pan( blc, obj.pan );
		this._updateSlidersSelected();
	}

	// Data proxy
	// ........................................................................
	_proxyCreate() {
		return new Proxy( {}, {
			set: this._proxySetKey.bind( this ),
			deleteProperty: this._proxyDeleteKey.bind( this )
		} );
	}
	_proxyDeleteKey( tar, id ) {
		id = +id;
		if ( id in tar ) {
			this._deleteKey( id );
			delete tar[ id ];
		} else {
			console.warn( `gsuiPianoroll: proxy useless deletion of [${ id }]` );
		}
		return true;
	}
	_proxySetKey( tar, id, obj ) {
		id = +id;
		if ( id in tar || !obj ) {
			this._proxyDeleteKey( tar, id );
			if ( obj ) {
				console.warn( `gsuiPianoroll: reassignation of [${ id }]` );
			}
		}
		if ( obj ) {
			const prox = new Proxy( Object.seal( Object.assign( {
					key: 60,
					when: 0,
					duration: 1,
					selected: false
				}, obj ) ), {
					set: this._proxySetKeyProp.bind( this, id )
				} );

			tar[ id ] = prox;
			this._idMax = Math.max( this._idMax, id );
			this._setKey( id, prox );
		}
		return true;
	}
	_proxySetKeyProp( id, tar, prop, val ) {
		if ( prop === "offset" ) {
			console.warn( `gsuiPianoroll: proxy set useless 'offset' to key` );
		} else {
			const blc = this.__blcs.get( id ),
				uiFn = this.uiBlc[ prop ];

			tar[ prop ] = val;
			if ( uiFn ) {
				uiFn( blc, val );
			}
			if ( prop === "selected" ) {
				val
					? this.__blcsSelected.set( id, blc )
					: this.__blcsSelected.delete( id );
				this._updateSlidersSelected();
			}
		}
		return true;
	}
}

gsuiPianoroll.noteNames = {
	en: [ "c",  "c#",  "d",  "d#",  "e",  "f",  "f#",  "g",   "g#",   "a",  "a#",  "b" ],
	fr: [ "do", "do#", "ré", "ré#", "mi", "fa", "fa#", "sol", "sol#", "la", "la#", "si" ]
};

gsuiPianoroll.template = document.querySelector( "#gsuiPianoroll-template" );
gsuiPianoroll.template.remove();
gsuiPianoroll.template.removeAttribute( "id" );
gsuiPianoroll.blockTemplate = document.querySelector( "#gsuiPianoroll-block-template" );
gsuiPianoroll.blockTemplate.remove();
gsuiPianoroll.blockTemplate.removeAttribute( "id" );
gsuiPianoroll.sliderTemplate = document.querySelector( "#gsuiPianoroll-slider-template" );
gsuiPianoroll.sliderTemplate.remove();
gsuiPianoroll.sliderTemplate.removeAttribute( "id" );
