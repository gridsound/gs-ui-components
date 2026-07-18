"use strict";

class gsuiWavetable extends gsui0ne {
	#waveNull = true;
	#waveSelected = null;
	#data = GSUgetModel( "wavetable" );

	constructor() {
		super( {
			$tagName: "gsui-wavetable",
			$elements: {
				$head: ".gsuiWavetable-head",
				$editor: ".gsuiWavetable-waves gsui-wave-editor",
				$wtGraph: "gsui-wavetable-graph",
				$waves: ".gsuiWavetable-waves-list > *",
			},
		} );
		gsuiTexture.$set( this.$elements.$waves, "damier" );
		this.$elements.$head.$onclick( e => {
			switch ( e.target.dataset.action ) {
				case "back":
					this.$this.$dispatch( GSEV_WAVETABLE_BACK );
					break;
			}
		} );
		this.$elements.$waves.$onclick( e => {
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
		new gsuiReorder( {
			$root: this.$elements.$waves,
			$parentSelector: ".gsuiWavetable-waves-list > div",
			$itemSelector: ".gsuiWavetable-wave",
			$itemGripSelector: "gsui-periodicwave",
			$onchange: this.#onreorderWaves.bind( this ),
		} );
		this.$this.$listen( {
			[ GSEV_WAVEEDITOR_CHANGE ]: ( _, curve ) => this.#onchange( { waves: { [ this.#waveSelected ]: { curve } } } ),
			[ GSEV_WAVEEDITOR_PARAM ]: d => {
				if ( !this.#waveNull ) {
					d.target = this;
					d.event = "gsuiWavetable-param";
					return true;
				}
			},
		} );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.#wtwaves_addWave( "0", this.#data.waves[ 0 ] );
		this.#wtwaves_updatePreview( "0" );
		this.#wtwaves_selectWave( "0" );
		this.$elements.$editor.$get( 0 ).$setWaveArray( this.#data.waves[ 0 ].curve );
		this.$elements.$wtGraph
			.$message( GSEV_WAVETABLEGRAPH_DATA, this.#data.waves )
			.$message( GSEV_WAVETABLEGRAPH_DRAW );
	}

	// .........................................................................
	$clear() {
		this.#waveNull = true;
		this.#waveSelected = "0";
		this.$elements.$editor.$get( 0 ).$reset( "silence" );
		this.$elements.$waves.$empty();
		this.#data = {};
	}
	$isRealData( b ) {
		this.#waveNull = !b;
	}
	$change( obj ) {
		const wavesToUpdate = [];
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
			.$message( GSEV_PERIODICWAVE_DRAW );
	}
	#wtwaves_addWave( wId, w ) {
		const elW = $.$getTemplate( "gsui-wavetable-wave", wId, w.index );

		this.$elements.$waves.$append( elW );
		this.#wtwaves_updateWavesOrder();
	}
	#wtwaves_removeWave( wId ) {
		this.#wtwaves_getElem( wId ).$remove();
		this.#wtwaves_updateWavesOrder();
	}
	#wtwaves_selectWave( wId ) {
		if ( this.#waveSelected !== wId ) {
			this.#wtwaves_getElem( this.#waveSelected ).$rmAttr( "data-selected" );
			this.#waveSelected = wId;
			this.$elements.$wtGraph
				.$setAttr( "waveselected", wId )
				.$message( GSEV_WAVETABLEGRAPH_DRAW );
			this.$elements.$editor.$get( 0 ).$setWaveArray( this.#data.waves[ wId ].curve );
			this.#wtwaves_getElem( wId ).$addAttr( "data-selected" )
				.$scrollIntoViewX( this.$elements.$waves );
			if ( !this.#waveNull ) {
				this.$this.$dispatch( GSEV_WAVETABLE_PARAM, { wave: wId } );
			}
		}
	}
}

$.$define( "gsui-wavetable", gsuiWavetable );
