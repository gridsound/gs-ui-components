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
					this.$dispatch( "back" );
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
		GSUlistenEvents( this, {
			gsuiWaveEditor: {
				change: d => this.#onchange( { waves: { [ this.#waveSelected ]: { curve: d.args[ 0 ] } } } ),
			},
			gsuiDotline: {
				inputstart: ( { args: [ d ] } ) => this.$elements.$wtGraph.$setMorphingWaveAt( d.$data[ d.$dotId ].y ),
				inputend: () => this.$elements.$wtGraph.$setMorphingWaveAt( -1 ),
				input: ( { args: [ d ] } ) => {
					if ( d.$target === "dot" ) {
						this.$elements.$wtGraph.$setMorphingWaveAt( d.$data[ d.$dotId ].y );
					}
				},
				change: d => this.#onchange( { wtposCurves: { [ this.#wtposCurveSelected ]: { curve: d.args[ 0 ] } } } ),
			},
			gsuiSlider: {
				inputStart: GSUnoop,
				inputEnd: GSUnoop,
				input: d => this.#wtposCurve_setDuration( d.args[ 0 ] ),
				change: d => this.#onchange( { wtposCurves: { [ this.#wtposCurveSelected ]: { duration: d.args[ 0 ] } } } ),
			},
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
		GSUemptyElement( this.$elements.$waves );
		GSUemptyElement( this.$elements.$wtposWavelines );
		this.#data = {};
	}
	$change( obj ) {
		const wavesToUpdate = [];
		const curvesToUpdate = [];
		let toSort = false;
		let toSelect = null;

		if ( !obj ) {
			return obj;
		}
		GSUforEach( obj.waves, ( w, wId ) => {
			if ( !w ) {
				toSort = true;
				this.#wtwaves_removeWave( wId );
			} else if ( !( wId in this.#data.waves ) ) {
				wavesToUpdate.push( wId );
				toSelect = wId;
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
		if ( toSelect ) {
			this.#wtwaves_selectWave( toSelect );
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

		this.$dispatch( "changeWavetable", this.$change( obj2 ) );
		this.#waveNull = false;
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
			case "select": this.#wtwaves_selectWave( wId ); break;
			case "clone":
				this.#onchange( gsuiWavetable.#createCloneObj( this.#data.waves, wId ) );
				break;
			case "remove":
				if ( Object.keys( this.#data.waves ).length > 1 ) {
					this.#onchange( gsuiWavetable.#createRemoveObj( this.#data.waves, wId ) );
				}
				break;
		}
	}
	static #createCloneObj( wavesData, wId ) {
		const wNew = GSUdeepCopy( wavesData[ wId ] );
		const waves = { [ GSUgetNewId( wavesData ) ]: wNew };

		wNew.index += .000000001;
		return { waves: gsuiWavetable.#createReorderingIndex( waves, wavesData ) };
	}
	static #createRemoveObj( wavesData, wId ) {
		return { waves: gsuiWavetable.#createReorderingIndex( { [ wId ]: undefined }, wavesData ) };
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
		if ( wId === this.#waveSelected ) {
			const list = Object.entries( this.#data.waves ).sort( ( a, b ) => a[ 1 ].index - b[ 1 ].index );
			const order = list.findIndex( kv => kv[ 0 ] === wId );
			const wNew = list[ order + 1 ] || list[ order - 1 ];

			if ( wNew ) {
				this.#wtwaves_selectWave( wNew[ 0 ] );
			}
		}
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
		this.$dispatch( "selectWavetableCurve", id );
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

GSUdefineElement( "gsui-wavetable", gsuiWavetable );
