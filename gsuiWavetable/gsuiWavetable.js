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
				$waves: ".gsuiWavetable-waves-list > *",
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
		gsuiTexture.$set( this.$elements.$waves, "damier" );
		this.$elements.$head.$on( "click", e => {
			switch ( e.target.dataset.action ) {
				case "back":
					this.$this.$dispatch( GSEV_WAVETABLE_BACK );
					break;
			}
		} );
		this.$elements.$waves.$on( "click", e => {
			const act = e.target.dataset.action;

			if ( act ) {
				this.#execWaveAction( e.target.closest( ".gsuiWavetable-wave" ).dataset.id, act );
			}
		} );
		this.$elements.$editor.$on( "wheel", e => {
			const delta = e.shiftKey ? e.deltaY : e.deltaX;

			if ( delta ) {
				e.preventDefault();
				this.$elements.$waves.$scrollX( el => el.scrollLeft + delta );
			}
		} );
		this.$elements.$wtposCurves.$on( "click", e => {
			const dt = e.target.dataset;

			if ( dt.id && dt.id !== this.#wtposCurveSelected ) {
				this.#wtposCurve_selectCurve( dt.id );
			}
		} );
		new gsuiReorder( {
			$root: this.$elements.$waves.$get( 0 ),
			$parentSelector: ".gsuiWavetable-waves-list > div",
			$itemSelector: ".gsuiWavetable-wave",
			$itemGripSelector: "gsui-periodicwave",
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
			[ GSEV_DOTLINE_INPUTSTART ]: ( _, a ) => this.$elements.$wtGraph.$setAttr( "morphing", a.$data[ a.$dotId ].y ),
			[ GSEV_DOTLINE_INPUTEND ]: () => this.$elements.$wtGraph.$setAttr( "morphing", -1 ),
			[ GSEV_DOTLINE_INPUT ]: ( _, a ) => {
				if ( a.$target === "dot" ) {
					this.$elements.$wtGraph.$setAttr( "morphing", a.$data[ a.$dotId ].y );
				}
			},
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_INPUT ]: ( _, dur ) => this.#wtposCurve_setDuration( dur ),
			[ GSEV_SLIDER_CHANGE ]: ( _, dur ) => this.#onchange( { wtposCurves: { [ this.#wtposCurveSelected ]: { duration: dur } } } ),
		} );
	}

	// .........................................................................
	$onresize() {
		this.#wtposCurve_updateBeatline();
	}
	$firstTimeConnected() {
		this.#wtwaves_addWave( "0", this.#data.waves[ 0 ] );
		this.#wtwaves_updatePreview( "0" );
		this.#wtwaves_selectWave( "0" );
		this.#wtposCurve_selectCurve( "0" );
		GSUforEach( this.#data.wtposCurves, ( c, id ) => this.#wtposCurve_updatePreview( id ) );
		this.$elements.$editor.$get( 0 ).$setWaveArray( this.#data.waves[ 0 ].curve );
		this.$elements.$wtGraph
			.$message( GSEV_WAVETABLEGRAPH_DATA, this.#data.waves )
			.$message( GSEV_WAVETABLEGRAPH_DRAW );
		this.$elements.$wtDotline.$get( 0 ).$change( this.#data.wtCurve );
	}

	// .........................................................................
	$clear() {
		this.#waveNull = true;
		this.#waveSelected = "0";
		this.$elements.$editor.$get( 0 ).$reset( "silence" );
		this.$elements.$waves.$empty();
		this.$elements.$wtposWavelines.$empty();
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
		if ( obj.div ) { this.$elements.$editor.$setAttr( "div", obj.div ); }
		if ( obj.tool ) { this.$elements.$editor.$setAttr( "tool", obj.tool ); }
		if ( obj.symmetry ) { this.$elements.$editor.$setAttr( "symmetry", obj.symmetry ); }
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
						this.$elements.$editor.$get( 0 ).$setWaveArray( w.curve );
					}
				}
				if ( "index" in w ) {
					toSort = true;
					this.#wtwaves_getElem( wId ).$setAttr( "data-index", w.index );
					this.#wtposCurve_getWave( wId ).$top( ( 1 - w.index ) * 100, "%" );
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
					this.$elements.$wtDotline.$get( 0 ).$change( c.curve );
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
		this.$elements.$wtGraph
			.$message( GSEV_WAVETABLEGRAPH_DATA, this.#data.waves )
			.$message( GSEV_WAVETABLEGRAPH_DRAW );
		return obj;
	}

	// .........................................................................
	#onchange( obj ) {
		const obj2 = !this.#waveNull ? obj : GSUdeepAssign( GSUdeepCopy( this.#data ), obj );

		if ( this.#waveNull ) {
			const editor = this.$elements.$editor;

			obj2.div = editor.$getAttr( "div" );
			obj2.tool = editor.$getAttr( "tool" );
			obj2.symmetry = editor.$hasAttr( "symmetry" );
		}
		this.$this.$dispatch( GSEV_WAVETABLE_CHANGE, this.$change( obj2 ) );
		this.#waveNull = false;
		if ( obj2.wave ) {
			this.#wtwaves_selectWave( obj2.wave );
		}
	}
	#onreorderWaves() {
		const elWavesSorted = this.$elements.$waves.$children().$sort( ( a, b ) => a.style.order - b.style.order );
		const nbWaves = elWavesSorted.$size();
		const wavesObj = {};

		elWavesSorted.$each( ( el, i ) => {
			const wId = el.dataset.id;
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
		this.$elements.$waves
			.$children()
			.$sort( ( a, b ) => a.dataset.index - b.dataset.index )
			.$css( "order", ( _, i ) => i )
			.$query( "span" )
			.$text( ( _, i ) => i + 1 );
	}
	#wtwaves_getElem( id ) {
		return this.$this.$query( `.gsuiWavetable-wave[data-id='${ id }']` );
	}
	#wtwaves_updatePreview( id ) {
		this.#wtwaves_getElem( id ).$query( "gsui-periodicwave" )
			.$message( GSEV_PERIODICWAVE_DATA, this.#data.waves[ id ].curve )
			.$message( GSEV_PERIODICWAVE_OPTS, {} );
	}
	#wtwaves_addWave( wId, w ) {
		const elW = $( GSUgetTemplate( "gsui-wavetable-wave", wId, w.index ) );
		const elWLine = $( "<div>" ).$setAttr( {
			class: "gsuiWavetable-posCurve-wave",
			"data-id": wId,
			style: { top: `${ ( 1 - w.index ) * 100 }%` },
		} );

		this.$elements.$waves.$append( elW );
		this.$elements.$wtposWavelines.$append( elWLine );
		this.#wtwaves_updateWavesOrder();
	}
	#wtwaves_removeWave( wId ) {
		this.#wtwaves_getElem( wId ).$remove();
		this.#wtposCurve_getWave( wId ).$remove();
		this.#wtwaves_updateWavesOrder();
	}
	#wtwaves_selectWave( wId ) {
		if ( this.#waveSelected !== wId ) {
			this.#wtposCurve_getWave( this.#waveSelected ).$rmAttr( "data-selected" );
			this.#wtwaves_getElem( this.#waveSelected ).$rmAttr( "data-selected" );
			this.#waveSelected = wId;
			this.$elements.$wtGraph
				.$setAttr( "waveselected", wId )
				.$message( GSEV_WAVETABLEGRAPH_DRAW );
			this.$elements.$editor.$get( 0 ).$setWaveArray( this.#data.waves[ wId ].curve );
			this.#wtposCurve_getWave( wId ).$addAttr( "data-selected" );
			this.#wtwaves_getElem( wId ).$addAttr( "data-selected" );
			GSUdomScrollIntoViewX( this.#wtwaves_getElem( wId ).$get( 0 ), this.$elements.$waves.$get( 0 ) );
			if ( !this.#waveNull ) {
				this.$this.$dispatch( GSEV_WAVETABLE_PARAM, { wave: wId } );
			}
		}
	}

	// .........................................................................
	#wtposCurve_get( id ) {
		return this.$this.$query( `.gsuiWavetable-posCurve[data-id='${ id }']` );
	}
	#wtposCurve_getWave( id ) {
		return this.$this.$query( `.gsuiWavetable-posCurve-wave[data-id='${ id }']` );
	}
	#wtposCurve_updatePreview( id ) {
		const dlSVG = this.#wtposCurve_get( id ).$query( "gsui-dotlinesvg" ).$get( 0 );

		dlSVG.$setSVGSize( 60, 30 );
		dlSVG.$setDataBox( "0 0 1 1" );
		dlSVG.$setCurve( this.#data.wtposCurves[ id ].curve );
	}
	#wtposCurve_selectCurve( id ) {
		const wtposCurve = this.#data.wtposCurves[ id ];
		const wtDotline = this.$elements.$wtDotline.$get( 0 );

		this.#wtposCurve_get( this.#wtposCurveSelected ).$rmAttr( "data-selected" );
		this.#wtposCurveSelected = id;
		this.#wtposCurve_get( id ).$addAttr( "data-selected" );
		this.#wtposCurve_setDuration( wtposCurve.duration );
		wtDotline.$clear();
		wtDotline.$setDotOptions( 0, { freezeX: true, deletable: false } );
		wtDotline.$setDotOptions( 1, { freezeX: true, deletable: false } );
		wtDotline.$change( wtposCurve.curve );
		this.#keyPreviews.forEach( p => p.$elemA.$css( "display", p.$wtposCurveId === id ? "block" : "none" ) );
		this.$this.$dispatch( GSEV_WAVETABLE_SELECTCURVE, id );
	}
	#wtposCurve_setDuration( dur ) {
		this.#wtposCurveDuration = dur;
		this.$elements.$wtposCurveDur.$text( `${ dur }`.padStart( 2, "0" ) );
		this.$elements.$wtposCurveDurSli.$setAttr( "value", dur );
		this.#wtposCurve_updateBeatline();
	}
	#wtposCurve_updateBeatline() {
		const bl = this.$elements.$wtposBeatlines;

		bl.$setAttr( "pxperbeat", bl.$width() / this.#wtposCurveDuration );
	}

	// .........................................................................
	$startKey( id, wtposCurveId, bpm, dur = null ) {
		const elB = $( "<div>" ).$addClass( "gsuiWavetable-keyPreview" );
		const elA = $( "<div>" ).$addClass( "gsuiWavetable-keyPreview" )
			.$css( "display", wtposCurveId === this.#wtposCurveSelected ? "block" : "none" );

		this.#keyPreviews.push( {
			$id: id,
			$wtposCurveId: wtposCurveId,
			$bps: bpm / 60,
			$dur: dur ?? Infinity,
			$elemA: elA,
			$elemB: elB,
			$when: Date.now() / 1000,
		} );
		this.$elements.$keyPreviews.$append( elA );
		this.$elements.$wtposCurves.$child( +wtposCurveId ).$query( ".gsuiWavetable-keyPreviews" ).$append( elB );
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
			p.$elemA.$remove();
			p.$elemB.$remove();
			toRm.push( p );
			if ( p.$id === this.#lastKeyPreview ) {
				this.$elements.$wtGraph.$setAttr( "morphing", -1 );
			}
		} else {
			const wtposCurve = this.#data.wtposCurves[ p.$wtposCurveId ];
			const x = Math.min( since / wtposCurve.duration, 1 );
			const y = GSUmathDotLineGetYFromX( wtposCurve.curve, x );

			p.$elemB.$left( x * 100, "%" );
			p.$elemA.$left( x * 100, "%" ).$top( ( 1 - y ) * 100, "%" );
			if ( p.$id === this.#lastKeyPreview ) {
				this.$elements.$wtGraph.$setAttr( "morphing", y );
			}
		}
	}
}

GSUdomDefine( "gsui-wavetable", gsuiWavetable );
