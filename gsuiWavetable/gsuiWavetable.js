"use strict";

class gsuiWavetable extends gsui0ne {
	#waveNull = true;
	#waveSelected = null;
	#wtposCurveSelected = null;
	#wtposCurveDuration = 0;
	#keyPreviews = [];
	#keyAnimId = null;
	#lastKeyPreview = null;
	#data = GSUgetModel( "wavetable" );

	constructor() {
		super( {
			$cmpName: "gsuiWavetable",
			$tagName: "gsui-wavetable",
			$elements: {
				$head: ".gsuiWavetable-head",
				$editor: ".gsuiWavetable-waves gsui-wave-editor",
				$wtGraph: "gsui-wavetable-graph",
				$waves: ".gsuiWavetable-waves-list > div",
				$wtDotline: ".gsuiWavetable-posCurves gsui-dotline",
				$wtposWavelines: ".gsuiWavetable-posCurves-graph-waves",
				$wtposBeatlines: ".gsuiWavetable-posCurves gsui-beatlines",
				$wtposCurves: ".gsuiWavetable-posCurves-list",
				$wtposCurveDur: ".gsuiWavetable-posCurve-dur b",
				$wtposCurveDurSli: ".gsuiWavetable-posCurve-dur gsui-slider",
				$keyPreviews: ".gsuiWavetable-posCurves-graph .gsuiWavetable-keyPreviews",
			},
		} );
		Object.seal( this );
		this.$elements.$head.onclick = e => {
			switch ( e.target.dataset.action ) {
				case "back":
					GSUdomDispatch( this, GSEV_WAVETABLE_BACK );
					break;
			}
		};
		this.$elements.$waves.onclick = e => {
			const act = e.target.dataset.action;

			if ( act ) {
				const w = e.target.closest( ".gsuiWavetable-wave" );

				this.#execWaveAction( w.dataset.id, act );
			}
		};
		this.$elements.$editor.onwheel = e => {
			const delta = e.shiftKey ? e.deltaY : e.deltaX;

			if ( delta ) {
				e.preventDefault();
				this.$elements.$waves.scrollLeft += delta;
			}
		};
		this.$elements.$wtposCurves.onclick = e => {
			const dt = e.target.dataset;

			if ( dt.id && dt.id !== this.#wtposCurveSelected ) {
				this.#wtposCurve_selectCurve( dt.id );
			}
		};
		new gsuiReorder( {
			$root: this.$elements.$waves,
			$parentSelector: ".gsuiWavetable-waves-list > div",
			$itemSelector: ".gsuiWavetable-wave",
			$itemGripSelector: ".gsuiWavetable-wave-svg",
			$onchange: this.#onreorderWaves.bind( this ),
		} );
		GSUdomListen( this, {
			[ GSEV_WAVEEDITOR_CHANGE ]: ( _, curve ) => this.#onchange( { waves: { [ this.#waveSelected ]: { curve } } } ),
			[ GSEV_WAVEEDITOR_PARAM ]: d => {
				if ( !this.#waveNull ) {
					d.target = this;
					d.event = "gsuiWavetable-param";
					return true;
				}
			},
			[ GSEV_DOTLINE_CHANGE ]: ( _, curve ) => this.#onchange( { wtposCurves: { [ this.#wtposCurveSelected ]: { curve } } } ),
			[ GSEV_DOTLINE_INPUTSTART ]: ( _, a ) => this.$elements.$wtGraph.$setMorphingWaveAt( a.$data[ a.$dotId ].y ),
			[ GSEV_DOTLINE_INPUTEND ]: () => this.$elements.$wtGraph.$setMorphingWaveAt( -1 ),
			[ GSEV_DOTLINE_INPUT ]: ( _, a ) => {
				if ( a.$target === "dot" ) {
					this.$elements.$wtGraph.$setMorphingWaveAt( a.$data[ a.$dotId ].y );
				}
			},
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_INPUT ]: ( _, dur ) => this.#wtposCurve_setDuration( dur ),
			[ GSEV_SLIDER_CHANGE ]: ( _, dur ) => this.#onchange( { wtposCurves: { [ this.#wtposCurveSelected ]: { duration: dur } } } ),
		} );
	}

	// .........................................................................
	$onresize( w ) {
		this.#wtposCurve_updateBeatline();
	}
	$firstTimeConnected() {
		this.#wtwaves_addWave( "0", this.#data.waves[ 0 ] );
		this.#wtwaves_updatePreview( "0" );
		this.#wtwaves_selectWave( "0" );
		this.#wtposCurve_selectCurve( "0" );
		GSUforEach( this.#data.wtposCurves, ( c, id ) => this.#wtposCurve_updatePreview( id ) );
		this.$elements.$editor.$setWaveArray( this.#data.waves[ 0 ].curve );
		this.$elements.$wtGraph.$setWavetable( this.#data.waves );
		this.$elements.$wtGraph.$draw();
		this.$elements.$wtDotline.$change( this.#data.wtCurve );
	}

	// .........................................................................
	$clear() {
		this.#waveNull = true;
		this.#waveSelected = "0";
		this.$elements.$editor.$reset( "silence" );
		GSUdomEmpty( this.$elements.$waves );
		GSUdomEmpty( this.$elements.$wtposWavelines );
		this.#data = {};
	}
	$isRealData( b ) {
		this.#waveNull = !b;
	}
	$change( obj ) {
		const wavesToUpdate = [];
		const curvesToUpdate = [];
		let toSort = false;

		if ( !obj ) {
			return obj;
		}
		if ( obj.div ) { GSUdomSetAttr( this.$elements.$editor, "div", obj.div ); }
		if ( obj.tool ) { GSUdomSetAttr( this.$elements.$editor, "tool", obj.tool ); }
		if ( obj.symmetry ) { GSUdomSetAttr( this.$elements.$editor, "symmetry", obj.symmetry ); }
		GSUforEach( obj.waves, ( w, wId ) => {
			if ( !w ) {
				toSort = true;
				this.#wtwaves_removeWave( wId );
			} else if ( !( wId in this.#data.waves ) ) {
				wavesToUpdate.push( wId );
				toSort = true;
				this.#wtwaves_addWave( wId, w );
			} else {
				if ( w.curve ) {
					wavesToUpdate.push( wId );
					if ( wId === this.#waveSelected ) {
						this.$elements.$editor.$setWaveArray( w.curve );
					}
				}
				if ( "index" in w ) {
					toSort = true;
					this.#wtwaves_getElem( wId ).dataset.index = w.index;
					GSUdomQS( this, `.gsuiWavetable-posCurve-wave[data-id='${ wId }']` ).style.top = `${ ( 1 - w.index ) * 100 }%`;
				}
			}
		} );
		GSUforEach( obj.wtposCurves, ( c, cId ) => {
			if ( "duration" in c ) {
				if ( cId === this.#wtposCurveSelected ) {
					this.#wtposCurve_setDuration( c.duration );
				}
			}
			if ( c.curve ) {
				curvesToUpdate.push( cId );
				if ( cId === this.#wtposCurveSelected ) {
					this.$elements.$wtDotline.$change( c.curve );
				}
			}
		} );
		if ( toSort ) {
			this.#wtwaves_updateWavesOrder();
		}
		GSUdiffAssign( this.#data, obj );
		if ( obj.wave ) {
			this.#wtwaves_selectWave( obj.wave );
		}
		wavesToUpdate.forEach( id => this.#wtwaves_updatePreview( id ) );
		curvesToUpdate.forEach( id => this.#wtposCurve_updatePreview( id ) );
		this.$elements.$wtGraph.$setWavetable( this.#data.waves );
		this.$elements.$wtGraph.$draw();
		return obj;
	}

	// .........................................................................
	#onchange( obj ) {
		const obj2 = !this.#waveNull ? obj : GSUdeepAssign( GSUdeepCopy( this.#data ), obj );

		if ( this.#waveNull ) {
			const editor = this.$elements.$editor;

			obj2.div = GSUdomGetAttr( editor, "div" );
			obj2.tool = GSUdomGetAttr( editor, "tool" );
			obj2.symmetry = GSUdomHasAttr( editor, "symmetry" );
		}
		GSUdomDispatch( this, GSEV_WAVETABLE_CHANGE, this.$change( obj2 ) );
		this.#waveNull = false;
		if ( obj2.wave ) {
			this.#wtwaves_selectWave( obj2.wave );
		}
	}
	#onreorderWaves( obj ) {
		const elWavesSorted = Array.from( this.$elements.$waves.children ).sort( ( a, b ) => a.style.order - b.style.order );
		const nbWaves = elWavesSorted.length;
		const wavesObj = {};

		elWavesSorted.forEach( ( elWave, i ) => {
			const wId = elWave.dataset.id;
			const index = GSUmathRound( i / ( nbWaves - 1 ), .001 );

			if ( index !== this.#data.waves[ wId ].index ) {
				wavesObj[ wId ] = { index };
			}
		} );
		this.#onchange( { waves: wavesObj } );
	}

	// .........................................................................
	#execWaveAction( wId, act ) {
		switch ( act ) {
			case "select":
				if ( Object.keys( this.#data.waves ).length > 1 ) {
					this.#waveNull = false;
				}
				this.#wtwaves_selectWave( wId );
				break;
			case "clone":
				this.#onchange( gsuiWavetable.#createCloneObj( this.#data.waves, wId ) );
				break;
			case "remove":
				if ( Object.keys( this.#data.waves ).length > 1 ) {
					this.#onchange( gsuiWavetable.#createRemoveObj( this.#data.waves, this.#waveSelected, wId ) );
				}
				break;
		}
	}
	static #createCloneObj( wavesData, wId ) {
		const wNew = GSUdeepCopy( wavesData[ wId ] );
		const wIdNew = GSUgetNewId( wavesData );
		const waves = { [ wIdNew ]: wNew };

		wNew.index += .000000001;
		return {
			wave: wIdNew,
			waves: gsuiWavetable.#createReorderingIndex( waves, wavesData ),
		};
	}
	static #createRemoveObj( wavesData, waveSelected, wId ) {
		const obj = {};

		if ( wId === waveSelected ) {
			const list = Object.entries( wavesData ).sort( ( a, b ) => a[ 1 ].index - b[ 1 ].index );
			const order = list.findIndex( kv => kv[ 0 ] === wId );
			const wNew = list[ order + 1 ] || list[ order - 1 ];

			if ( wNew ) {
				obj.wave = wNew[ 0 ];
			}
		}
		obj.waves = gsuiWavetable.#createReorderingIndex( { [ wId ]: undefined }, wavesData );
		return obj;
	}
	static #createReorderingIndex( wavesObj, wavesData ) {
		const wavesCpy = GSUdiffAssign( GSUdeepCopy( wavesData ), wavesObj );
		const nbWaves = Object.keys( wavesCpy ).length;

		Object.entries( wavesCpy )
			.sort( ( a, b ) => a[ 1 ].index - b[ 1 ].index )
			.forEach( ( kv, i ) => {
				const index = GSUmathRound( i / ( nbWaves - 1 ) || 0, .001 );

				if ( wavesCpy[ kv[ 0 ] ].index !== index ) {
					if ( kv[ 0 ] in wavesObj ) {
						wavesObj[ kv[ 0 ] ].index = index;
					} else {
						wavesObj[ kv[ 0 ] ] = { index };
					}
				}
			} );
		return wavesObj;
	}

	// .........................................................................
	#wtwaves_updateWavesOrder() {
		Array.from( this.$elements.$waves.children )
			.sort( ( a, b ) => a.dataset.index - b.dataset.index )
			.forEach( ( w, i ) => {
				w.style.order = i;
				GSUdomQS( w, ".gsuiWavetable-wave-num" ).textContent = i + 1;
			} );
	}
	#wtwaves_getElem( id ) {
		return GSUdomQS( this, `.gsuiWavetable-wave[data-id='${ id }']` );
	}
	#wtwaves_getSVG( id ) {
		return GSUdomQS( this, `.gsuiWavetable-wave[data-id='${ id }'] gsui-dotlinesvg` );
	}
	#wtwaves_updatePreview( id ) {
		const polyline = GSUdomQS( this, `.gsuiWavetable-wave[data-id='${ id }'] polyline` );

		gsuiWaveEditor.$drawWave( polyline, this.#data.waves[ id ].curve, 60, 40 );
	}
	#wtwaves_addWave( wId, w ) {
		const elW = GSUgetTemplate( "gsui-wavetable-wave", wId, w.index );
		const elWLine = GSUcreateDiv( {
			class: "gsuiWavetable-posCurve-wave",
			"data-id": wId,
			style: { top: `${ ( 1 - w.index ) * 100 }%` },
		} );

		this.$elements.$waves.append( elW );
		this.$elements.$wtposWavelines.append( elWLine );
		this.#wtwaves_updateWavesOrder();
		GSUsetViewBoxWH( GSUdomQS( elW, "svg" ), 60, 40 );
	}
	#wtwaves_removeWave( wId ) {
		const w = this.#wtwaves_getElem( wId );
		const elWLine = GSUdomQS( this, `.gsuiWavetable-posCurve-wave[data-id='${ wId }']` );

		w?.remove();
		elWLine?.remove();
		this.#wtwaves_updateWavesOrder();
	}
	#wtwaves_selectWave( wId ) {
		if ( this.#waveSelected !== wId ) {
			const elW = this.#wtwaves_getElem( wId );
			const elWsel = this.#wtwaves_getElem( this.#waveSelected );
			const elLsel = GSUdomQS( this, ".gsuiWavetable-posCurve-wave[data-selected]" );

			if ( elWsel ) {
				delete elWsel.dataset.selected;
			}
			if ( elLsel ) {
				delete elLsel.dataset.selected;
			}
			this.#waveSelected = wId;
			this.$elements.$wtGraph.$selectCurrentWave( wId );
			this.$elements.$wtGraph.$draw();
			this.$elements.$editor.$setWaveArray( this.#data.waves[ wId ].curve );
			elW.dataset.selected = "";
			GSUdomQS( this, `.gsuiWavetable-posCurve-wave[data-id='${ wId }']` ).dataset.selected = "";
			GSUscrollIntoViewX( elW, this.$elements.$waves );
			if ( !this.#waveNull ) {
				GSUdomDispatch( this, GSEV_WAVETABLE_PARAM, { wave: wId } );
			}
		}
	}

	// .........................................................................
	#wtposCurve_updatePreview( id ) {
		const wtposCurve = this.#data.wtposCurves[ id ];
		const elPreview = GSUdomQS( this, `.gsuiWavetable-posCurve[data-id='${ id }']` );
		const dlSVG = GSUdomQS( elPreview, "gsui-dotlinesvg" );

		dlSVG.$setSVGSize( 60, 30 );
		dlSVG.$setDataBox( "0 0 1 1" );
		dlSVG.$setCurve( wtposCurve.curve );
	}
	#wtposCurve_selectCurve( id ) {
		const wtposCurve = this.#data.wtposCurves[ id ];

		if ( this.#wtposCurveSelected ) {
			delete GSUdomQS( this, `.gsuiWavetable-posCurve[data-id='${ this.#wtposCurveSelected }']` ).dataset.selected;
		}
		this.#wtposCurveSelected = id;
		GSUdomQS( this, `.gsuiWavetable-posCurve[data-id='${ id }']` ).dataset.selected = "";
		this.#wtposCurve_setDuration( wtposCurve.duration );
		this.$elements.$wtDotline.$clear();
		this.$elements.$wtDotline.$setDotOptions( 0, { freezeX: true, deletable: false } );
		this.$elements.$wtDotline.$setDotOptions( 1, { freezeX: true, deletable: false } );
		this.$elements.$wtDotline.$change( wtposCurve.curve );
		this.#keyPreviews.forEach( p => p.$elemA.style.display = p.$wtposCurveId === id ? "block" : "none" );
		GSUdomDispatch( this, GSEV_WAVETABLE_SELECTCURVE, id );
	}
	#wtposCurve_setDuration( dur ) {
		this.#wtposCurveDuration = dur;
		this.$elements.$wtposCurveDur.textContent = `${ dur }`.padStart( 2, "0" );
		GSUdomSetAttr( this.$elements.$wtposCurveDurSli, "value", dur );
		this.#wtposCurve_updateBeatline();
	}
	#wtposCurve_updateBeatline() {
		const bl = this.$elements.$wtposBeatlines;

		GSUdomSetAttr( bl, "pxperbeat", bl.clientWidth / this.#wtposCurveDuration );
	}

	// .........................................................................
	$startKey( id, wtposCurveId, bpm, dur = null ) {
		const elB = GSUcreateDiv( { class: "gsuiWavetable-keyPreview" } );
		const elA = GSUcreateDiv( { class: "gsuiWavetable-keyPreview", style: {
			display: wtposCurveId === this.#wtposCurveSelected ? "block" : "none",
		} } );

		this.#keyPreviews.push( {
			$id: id,
			$wtposCurveId: wtposCurveId,
			$bps: bpm / 60,
			$dur: dur ?? Infinity,
			$elemA: elA,
			$elemB: elB,
			$when: Date.now() / 1000,
		} );
		this.$elements.$keyPreviews.append( elA );
		GSUdomQS( this.$elements.$wtposCurves.children[ +wtposCurveId ], ".gsuiWavetable-keyPreviews" ).append( elB );
		this.#lastKeyPreview = id;
		if ( !this.#keyAnimId ) {
			this.#keyAnimId = GSUsetInterval( this.#keyAnimFrame.bind( this ), 1 / 60 );
		}
	}
	$stopKey( id ) {
		this.#keyPreviews.forEach( p => {
			if ( p.$id === id ) {
				p.$dur = 0;
			}
		} );
	}
	#keyAnimFrame() {
		const toRm = [];

		this.#keyPreviews.forEach( this.#keyAnimFramePreview.bind( this, toRm, Date.now() / 1000 ) );
		if ( toRm.length > 0 ) {
			this.#keyPreviews = this.#keyPreviews.filter( p => !toRm.includes( p ) );
			if ( !this.#keyPreviews.length ) {
				GSUclearInterval( this.#keyAnimId );
				this.#keyAnimId = null;
			}
		}
	}
	#keyAnimFramePreview( toRm, now, p ) {
		const since = ( now - p.$when ) * p.$bps;

		if ( since >= p.$dur ) {
			p.$elemA.remove();
			p.$elemB.remove();
			toRm.push( p );
			if ( p.$id === this.#lastKeyPreview ) {
				this.$elements.$wtGraph.$setMorphingWaveAt( -1 );
			}
		} else {
			const wtposCurve = this.#data.wtposCurves[ p.$wtposCurveId ];
			const x = Math.min( since / wtposCurve.duration, 1 );
			const y = GSUmathDotLineGetYFromX( wtposCurve.curve, x );

			GSUsetStyle( p.$elemB, "left", `${ x * 100 }%` );
			GSUsetStyle( p.$elemA, {
				top: `${ ( 1 - y ) * 100 }%`,
				left: `${ x * 100 }%`,
			} );
			if ( p.$id === this.#lastKeyPreview ) {
				this.$elements.$wtGraph.$setMorphingWaveAt( y );
			}
		}
	}
}

GSUdomDefine( "gsui-wavetable", gsuiWavetable );
