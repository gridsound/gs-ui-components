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
				$dotline: ".gsuiWavetable-wave-editor gsui-dotline",
				$wtGraph: "gsui-wavetable-graph",
				$waves: ".gsuiWavetable-waves-list",
				$wtDotline: ".gsuiWavetable-posCurves gsui-dotline",
				$wtposWavelines: ".gsuiWavetable-posCurves-graph-waves",
				$wtposBeatlines: ".gsuiWavetable-posCurves gsui-beatlines",
				$wtposCurves: ".gsuiWavetable-posCurves-list",
				$wtposCurveDur: ".gsuiWavetable-posCurve-dur > b",
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
		this.$elements.$dotline.onwheel = e => {
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
				this.$dispatch( "selectWavetableCurve", dt.id );
			}
		};
		new gsuiReorder( {
			$root: this.$elements.$waves,
			$parentSelector: ".gsuiWavetable-waves-list",
			$itemSelector: ".gsuiWavetable-wave",
			$itemGripSelector: ".gsuiWavetable-wave gsui-dotlinesvg",
			$onchange: this.#onreorderWaves.bind( this ),
		} );
		GSUlistenEvents( this.$elements.$dotline, {
			gsuiDotline: {
				input: GSUnoop,
				inputend: GSUnoop,
				inputstart: GSUnoop,
				change: d => this.#onchange( { waves: { [ this.#waveSelected ]: { curve: d.args[ 0 ] } } } ),
			},
		} );
		GSUlistenEvents( this.$elements.$wtDotline, {
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
		} );
		GSUlistenEvents( this.$elements.$wtposCurveDurSli, {
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
		this.#wtwaves_getSVG( "0" ).$setCurve( this.#data.waves[ 0 ].curve );
		this.#wtwaves_selectWave( "0" );
		this.#wtposCurve_selectCurve( "0" );
		GSUforEach( this.#data.wtposCurves, ( c, id ) => this.#wtposCurve_updatePreview( id ) );
		this.$elements.$dotline.$change( this.#data.waves[ 0 ].curve );
		this.$elements.$wtGraph.$setWavetable( this.#data.waves );
		this.$elements.$wtGraph.$draw();
		this.$elements.$wtDotline.$change( this.#data.wtCurve );
	}

	// .........................................................................
	$clear() {
		this.#waveNull = true;
		this.#waveSelected = "0";
		this.$elements.$dotline.$clear();
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
						this.$elements.$dotline.$change( w.curve );
					}
				}
				if ( "index" in w ) {
					toSort = true;
					this.#wtwaves_getElem( wId ).dataset.index = w.index;
					this.querySelector( `.gsuiWavetable-posCurve-wave[data-id='${ wId }']` ).style.top = `${ ( 1 - w.index ) * 100 }%`;
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
				w.querySelector( ".gsuiWavetable-wave-num" ).textContent = i + 1;
			} );
	}
	#wtwaves_getElem( id ) {
		return this.querySelector( `.gsuiWavetable-wave[data-id='${ id }']` );
	}
	#wtwaves_getSVG( id ) {
		return this.querySelector( `.gsuiWavetable-wave[data-id='${ id }'] gsui-dotlinesvg` );
	}
	#wtwaves_updatePreview( id ) {
		this.#wtwaves_getSVG( id ).$setCurve( this.#data.waves[ id ].curve );
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
		elW.querySelector( "gsui-dotlinesvg" ).$setSVGSize( 60, 40 );
		elW.querySelector( "gsui-dotlinesvg" ).$setDataBox( "0 -1 1 1" );
	}
	#wtwaves_removeWave( wId ) {
		const w = this.#wtwaves_getElem( wId );
		const elWLine = this.querySelector( `.gsuiWavetable-posCurve-wave[data-id='${ wId }']` );

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
			const elLsel = this.querySelector( ".gsuiWavetable-posCurve-wave[data-selected]" );

			if ( elWsel ) {
				delete elWsel.dataset.selected;
			}
			if ( elLsel ) {
				delete elLsel.dataset.selected;
			}
			this.#waveSelected = wId;
			this.$elements.$wtGraph.$selectCurrentWave( wId );
			this.$elements.$wtGraph.$draw();
			this.$elements.$dotline.$clear();
			this.$elements.$dotline.$setDotOptions( 0, { freezeX: true, deletable: false } );
			this.$elements.$dotline.$setDotOptions( 1, { freezeX: true, deletable: false } );
			this.$elements.$dotline.$change( this.#data.waves[ wId ].curve );
			elW.dataset.selected = "";
			this.querySelector( `.gsuiWavetable-posCurve-wave[data-id='${ wId }']` ).dataset.selected = "";
			GSUscrollIntoViewX( elW, this.$elements.$waves );
		}
	}

	// .........................................................................
	#wtposCurve_updatePreview( id ) {
		const wtposCurve = this.#data.wtposCurves[ id ];
		const elPreview = this.querySelector( `.gsuiWavetable-posCurve[data-id='${ id }']` );
		const dlSVG = elPreview.querySelector( "gsui-dotlinesvg" );

		dlSVG.$setSVGSize( 60, 30 );
		dlSVG.$setDataBox( "0 0 1 1" );
		dlSVG.$setCurve( wtposCurve.curve );
	}
	#wtposCurve_selectCurve( id ) {
		const wtposCurve = this.#data.wtposCurves[ id ];

		if ( this.#wtposCurveSelected ) {
			delete this.querySelector( `.gsuiWavetable-posCurve[data-id='${ this.#wtposCurveSelected }']` ).dataset.selected;
		}
		this.#wtposCurveSelected = id;
		this.querySelector( `.gsuiWavetable-posCurve[data-id='${ id }']` ).dataset.selected = "";
		this.#wtposCurve_setDuration( wtposCurve.duration );
		this.$elements.$wtDotline.$clear();
		this.$elements.$wtDotline.$setDotOptions( 0, { freezeX: true, deletable: false } );
		this.$elements.$wtDotline.$setDotOptions( 1, { freezeX: true, deletable: false } );
		this.$elements.$wtDotline.$change( wtposCurve.curve );
		this.#keyPreviews.forEach( p => p.$elemA.style.display = p.$wtposCurveId === id ? "block" : "none" );
	}
	#wtposCurve_setDuration( dur ) {
		this.#wtposCurveDuration = dur;
		this.$elements.$wtposCurveDur.textContent = `${ dur }`.padStart( 2, "0" );
		GSUsetAttribute( this.$elements.$wtposCurveDurSli, "value", dur );
		this.#wtposCurve_updateBeatline();
	}
	#wtposCurve_updateBeatline() {
		const bl = this.$elements.$wtposBeatlines;

		GSUsetAttribute( bl, "pxperbeat", bl.clientWidth / this.#wtposCurveDuration );
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
		this.$elements.$wtposCurves.children[ +wtposCurveId ].querySelector( ".gsuiWavetable-keyPreviews" ).append( elB );
		this.#lastKeyPreview = id;
		if ( !this.#keyAnimId ) {
			this.#keyAnimId = setInterval( this.#keyAnimFrame.bind( this ), 1000 / 60 );
		}
	}
	$stopKey( id ) {
		this.#keyPreviews.forEach( p => {
			if ( p.$id === id ) {
				p.$dur = ( Date.now() / 1000 - p.$when ) * p.$bps;
			}
		} );
	}
	#keyAnimFrame() {
		const toRm = [];

		this.#keyPreviews.forEach( this.#keyAnimFramePreview.bind( this, toRm, Date.now() / 1000 ) );
		if ( toRm.length > 0 ) {
			this.#keyPreviews = this.#keyPreviews.filter( p => !toRm.includes( p ) );
			if ( !this.#keyPreviews.length ) {
				clearInterval( this.#keyAnimId );
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
