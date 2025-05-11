"use strict";

class gsuiWaveEdit extends gsui0ne {
	#waveNull = true;
	#waveSelected = null;
	#wtposCurveSelected = null;
	#wtposCurveDuration = 0;
	#elWaves = this.getElementsByClassName( "gsuiWaveEdit-wavestep" );
	#elWavesSorted = [];
	#data = GSUgetModel( "wavetable" );
	#redrawWavesDeb = GSUthrottle( this.#redrawWaves.bind( this ), 100 );

	constructor() {
		super( {
			$cmpName: "gsuiWaveEdit",
			$tagName: "gsui-wave-edit",
			$elements: {
				$head: ".gsuiWaveEdit-head",
				$dotline: ".gsuiWaveEdit-graph gsui-dotline",
				$wtGraphWrap: ".gsuiWaveEdit-body-graph",
				$wtGraph: "gsui-wavetable-graph",
				$waves: ".gsuiWaveEdit-waves",
				$wtDotline: ".gsuiWaveEdit-wtpos gsui-dotline",
				$wtposWavelines: ".gsuiWaveEdit-wtpos-waves",
				$wtposBeatlines: ".gsuiWaveEdit-wtpos gsui-beatlines",
				$wtposCurves: ".gsuiWaveEdit-wtposCurves",
				$wtposCurveDur: ".gsuiWaveEdit-wtposCurve-dur > b",
				$wtposCurveDurSli: ".gsuiWaveEdit-wtposCurve-dur gsui-slider",
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
				const w = e.target.closest( ".gsuiWaveEdit-wavestep" );

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

			if ( dt.id && dt.selected !== "" ) {
				this.#wtposCurve_selectCurve( dt.id );
			}
		};
		new gsuiReorder( {
			$root: this.$elements.$waves,
			$parentSelector: ".gsuiWaveEdit-waves",
			$itemSelector: ".gsuiWaveEdit-wavestep",
			$onchange: this.#onreorderWaves.bind( this ),
		} );
		GSUlistenEvents( this.$elements.$dotline, {
			gsuiDotline: {
				input: GSUnoop,
				inputend: GSUnoop,
				inputstart: GSUnoop,
				change: d => {
					this.$dispatch( "changeWavetable", this.$change( this.#onchangeDotlines( d.args[ 0 ], "wave" ) ) );
					this.#waveNull = false;
				},
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
				change: d => {
					this.$dispatch( "changeWavetableCurve", this.$change( this.#onchangeDotlines( d.args[ 0 ], "wtpos" ) ) );
					this.#waveNull = false;
				},
			},
		} );
		GSUlistenEvents( this.$elements.$wtposCurveDurSli, {
			gsuiSlider: {
				inputstart: GSUnoop,
				inputend: GSUnoop,
				input: ( { args: [ d ] } ) => this.#wtposCurve_setDuration( d ),
				change: ( { args: [ d ] } ) => {
					this.$dispatch( "changeWavetable", this.$change( { wtposCurves: {
						[ this.#wtposCurveSelected ]: { duration: d },
					} } ) );
				},
			},
		} );
	}

	// .........................................................................
	$onresize( w ) {
		this.#redrawWavesDeb();
		this.#wtposCurve_updateBeatline();
	}
	$firstTimeConnected() {
		this.#addWave( "0", this.#data.waves[ 0 ] );
		this.#getWaveElement( "0" ).querySelector( "gsui-dotlinesvg" ).$setCurve( this.#data.waves[ 0 ].curve );
		this.#selectWave( "0" );
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
		this.#elWavesSorted.forEach( w => w.remove() );
		GSUemptyElement( this.$elements.$wtposWavelines );
		this.#data = {};
	}
	$change( obj ) {
		const wavesToUpdate = [];
		let toSort = false;
		let toSelect = null;

		if ( !obj ) {
			return obj;
		}
		GSUforEach( obj.waves, ( w, wId ) => {
			if ( !w ) {
				toSort = true;
				this.#removeWave( wId );
			} else if ( !( wId in this.#data.waves ) ) {
				wavesToUpdate.push( wId );
				toSelect = wId;
				toSort = true;
				this.#addWave( wId, w );
			} else {
				if ( w.curve ) {
					wavesToUpdate.push( wId );
					if ( wId === this.#waveSelected ) {
						this.$elements.$dotline.$change( w.curve );
					}
				}
				if ( "index" in w ) {
					toSort = true;
					this.#getWaveElement( wId ).dataset.index = w.index;
					this.querySelector( `.gsuiWaveEdit-wtpos-wave[data-id='${ wId }']` ).style.top = `${ ( 1 - w.index ) * 100 }%`;
				}
			}
		} );
		GSUforEach( obj.wtposCurves, ( c, cId ) => {
			if ( "duration" in c ) {
				if ( cId === this.#wtposCurveSelected ) {
					this.#wtposCurve_setDuration( c.duration );
				}
			}
		} );
		if ( toSort ) {
			this.#updateSortWaves();
		}
		// if ( obj.wtCurve ) {
		// 	this.$elements.$wtDotline.$change( obj.wtCurve );
		// }
		GSUdiffAssign( this.#data, obj );
		if ( toSelect ) {
			this.#selectWave( toSelect );
		}
		wavesToUpdate.forEach( wId => {
			this.#getWaveElement( wId ).querySelector( "gsui-dotlinesvg" ).$setCurve( this.#data.waves[ wId ].curve );
		} );
		this.$elements.$wtGraph.$setWavetable( this.#data.waves );
		this.$elements.$wtGraph.$draw();
		return obj;
	}

	// .........................................................................
	#onreorderWaves( obj ) {
		const elWavesSorted = Array.from( this.#elWaves ).sort( ( a, b ) => a.style.order - b.style.order );
		const nbWaves = elWavesSorted.length;
		const wavesObj = {};

		elWavesSorted.forEach( ( elWave, i ) => {
			const wId = elWave.dataset.id;
			const index = GSUMathRound( i / ( nbWaves - 1 ), .001 );

			if ( index !== this.#data.waves[ wId ].index ) {
				wavesObj[ wId ] = { index };
			}
		} );
		this.$dispatch( "changeWavetable", this.$change( { waves: wavesObj } ) );
	}
	#onchangeDotlines( crvObj, src ) {
		const obj = {};

		if ( this.#waveNull ) {
			GSUdeepAssign( obj, this.#data );
			if ( src === "wave" ) {
				GSUdeepAssign( obj.waves[ this.#waveSelected ].curve, crvObj );
			} else if ( src === "wtpos" ) {
				GSUdeepAssign( obj.wtCurve, crvObj );
			}
		} else {
			if ( src === "wave" ) {
				obj.waves = { [ this.#waveSelected ]: { curve: crvObj } };
			} else if ( src === "wtpos" ) {
				obj.wtCurve = crvObj;
			}
		}
		return obj;
	}

	// .........................................................................
	#updateSortWaves() {
		this.#elWavesSorted = Array.from( this.#elWaves ).sort( ( a, b ) => a.dataset.index - b.dataset.index );
		this.#elWavesSorted.forEach( ( w, i ) => {
			w.style.order = i;
			w.querySelector( ".gsuiWaveEdit-wavestep-num" ).textContent = i + 1;
		} );
	}
	#getWaveElement( wId ) {
		return this.#elWavesSorted.find( w => w.dataset.id === wId );
	}
	#getWaveOrder( wId ) {
		return this.#elWavesSorted.findIndex( w => wId === w.dataset.id );
	}

	// .........................................................................
	#execWaveAction( wId, act ) {
		switch ( act ) {
			case "select": this.#selectWave( wId ); break;
			case "clone":
				this.$dispatch( "changeWavetable", this.$change( gsuiWaveEdit.#createCloneObj( this.#data.waves, wId ) ) );
				break;
			case "remove":
				if ( this.#elWavesSorted.length > 1 ) {
					this.$dispatch( "changeWavetable", this.$change( gsuiWaveEdit.#createRemoveObj( this.#data.waves, wId ) ) );
				}
				break;
		}
	}
	static #createCloneObj( wavesData, wId ) {
		const wNew = GSUdeepCopy( wavesData[ wId ] );
		const waves = { [ GSUgetNewId( wavesData ) ]: wNew };

		wNew.index += .000000001;
		return { waves: gsuiWaveEdit.#createReorderingIndex( waves, wavesData ) };
	}
	static #createRemoveObj( wavesData, wId ) {
		return { waves: gsuiWaveEdit.#createReorderingIndex( { [ wId ]: undefined }, wavesData ) };
	}
	static #createReorderingIndex( wavesObj, wavesData ) {
		const wavesCpy = GSUdiffAssign( GSUdeepCopy( wavesData ), wavesObj );
		const nbWaves = Object.keys( wavesCpy ).length;

		Object.entries( wavesCpy )
			.sort( ( a, b ) => a[ 1 ].index - b[ 1 ].index )
			.forEach( ( kv, i ) => {
				const index = GSUMathRound( i / ( nbWaves - 1 ) || 0, .001 );

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
	#redrawWaves() {
		GSUforEach( this.#data.waves, ( w, wId ) => {
			const svg = this.#getWaveElement( wId ).querySelector( "gsui-dotlinesvg" );

			svg.$setSVGSize( svg.clientWidth, svg.clientHeight );
			svg.$setCurve( w.curve );
		} );
	}
	#addWave( wId, w ) {
		const elW = GSUgetTemplate( "gsui-wave-edit-wavestep", wId, w.index );
		const elWLine = GSUcreateDiv( {
			class: "gsuiWaveEdit-wtpos-wave",
			"data-id": wId,
			style: { top: `${ ( 1 - w.index ) * 100 }%` },
		} );

		this.$elements.$waves.append( elW );
		this.$elements.$wtposWavelines.append( elWLine );
		this.#updateSortWaves();
		elW.querySelector( "gsui-dotlinesvg" ).$setSVGSize( 100, 50 );
		elW.querySelector( "gsui-dotlinesvg" ).$setDataBox( "0 -1 1 1" );
	}
	#removeWave( wId ) {
		const w = this.#getWaveElement( wId );
		const elWLine = this.querySelector( `.gsuiWaveEdit-wtpos-wave[data-id='${ wId }']` );

		w?.remove();
		elWLine?.remove();
		if ( wId === this.#waveSelected ) {
			const order = this.#getWaveOrder( wId );
			const wNew = this.#elWavesSorted[ order + 1 ] || this.#elWavesSorted[ order - 1 ];

			if ( wNew ) {
				this.#selectWave( wNew.dataset.id );
			}
		}
		this.#updateSortWaves();
	}
	#selectWave( wId ) {
		if ( this.#waveSelected !== wId ) {
			const elW = this.#getWaveElement( wId );
			const elWsel = this.#getWaveElement( this.#waveSelected );

			if ( elWsel ) {
				delete elWsel.dataset.selected;
				delete this.querySelector( ".gsuiWaveEdit-wtpos-wave[data-selected]" ).dataset.selected;
			}
			this.#waveSelected = wId;
			this.$elements.$wtGraph.$selectCurrentWave( wId );
			this.$elements.$wtGraph.$draw();
			this.$elements.$dotline.$clear();
			this.$elements.$dotline.$setDotOptions( 0, { freezeX: true, deletable: false } );
			this.$elements.$dotline.$setDotOptions( 1, { freezeX: true, deletable: false } );
			this.$elements.$dotline.$change( this.#data.waves[ wId ].curve );
			elW.dataset.selected = "";
			this.querySelector( `.gsuiWaveEdit-wtpos-wave[data-id='${ wId }']` ).dataset.selected = "";
			GSUscrollIntoViewX( elW, this.$elements.$waves );
		}
	}

	// .........................................................................
	#wtposCurve_updatePreview( id ) {
		const wtposCurve = this.#data.wtposCurves[ id ];
		const elPreview = this.querySelector( `.gsuiWaveEdit-wtposCurve[data-id='${ id }']` );
		const dlSVG = elPreview.querySelector( "gsui-dotlinesvg" );

		dlSVG.$setSVGSize( 60, 30 );
		dlSVG.$setDataBox( "0 0 1 1" );
		dlSVG.$setCurve( wtposCurve.curve );
	}
	#wtposCurve_selectCurve( id ) {
		if ( id !== this.#wtposCurveSelected ) {
			const wtposCurve = this.#data.wtposCurves[ id ];

			if ( this.#wtposCurveSelected ) {
				delete this.querySelector( `.gsuiWaveEdit-wtposCurve[data-id='${ this.#wtposCurveSelected }']` ).dataset.selected;
			}
			this.#wtposCurveSelected = id;
			this.querySelector( `.gsuiWaveEdit-wtposCurve[data-id='${ id }']` ).dataset.selected = "";
			this.#wtposCurve_setDuration( wtposCurve.duration );
			this.$elements.$wtDotline.$clear();
			this.$elements.$wtDotline.$setDotOptions( 0, { freezeX: true, deletable: false } );
			this.$elements.$wtDotline.$setDotOptions( 1, { freezeX: true, deletable: false } );
			this.$elements.$wtDotline.$change( wtposCurve.curve );
		}
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
}

GSUdefineElement( "gsui-wave-edit", gsuiWaveEdit );
