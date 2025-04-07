"use strict";

class gsuiWaveEdit extends gsui0ne {
	#waveNull = true;
	#waveSelected = null;
	#elWaves = this.getElementsByClassName( "gsuiWaveEdit-wavestep" );
	#elWavesSorted = [];
	#data = {};
	static #waveDefault = GSUdeepFreeze( {
		0: { x: 0, y: 0, type: null,    val: null },
		1: { x: 1, y: 0, type: "curve", val: 0 },
	} );

	constructor() {
		super( {
			$cmpName: "gsuiWaveEdit",
			$tagName: "gsui-wave-edit",
			$elements: {
				$head: ".gsuiWaveEdit-head",
				$dotline: "gsui-dotline",
				$waves: ".gsuiWaveEdit-waves",
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
		this.$init();
		GSUlistenEvents( this, {
			gsuiDotline: {
				input: GSUnoop,
				change: d => {
					const obj = this.#waveNull
						? GSUdeepAssign( GSUdeepCopy( gsuiWaveEdit.#waveDefault ), d.args[ 0 ] )
						: d.args[ 0 ];

					d.args[ 0 ] = { [ this.#waveSelected ]: { curve: obj } };
					d.component = "gsuiWaveEdit";
					this.#waveNull = false;
					this.$change( d.args[ 0 ] );
					return true;
				},
			},
		} );
	}

	// .........................................................................
	$init() {
		if ( this.#waveNull ) {
			this.$elements.$dotline.$change( gsuiWaveEdit.#waveDefault );
			this.$elements.$dotline.$setDotOptions( 0, { freezeX: true, deletable: false } );
			this.$elements.$dotline.$setDotOptions( 1, { freezeX: true, deletable: false } );
		}
	}
	$change( obj ) {
		const wavesToUpdate = [];
		let toSelect = null;

		this.#waveNull = false;
		GSUforEach( obj, ( w, wId ) => {
			if ( !w ) {
				this.#removeWave( wId );
			} else if ( !( wId in this.#data ) ) {
				wavesToUpdate.push( wId );
				toSelect = wId;
				this.#addWave( wId, w );
			} else {
				if ( w.curve ) {
					wavesToUpdate.push( wId );
					if ( wId === this.#waveSelected ) {
						this.$elements.$dotline.$change( w.curve );
					}
				}
			}
		} );
		GSUdiffAssign( this.#data, obj );
		if ( toSelect ) {
			this.#selectWave( toSelect );
		}
		wavesToUpdate.forEach( wId => {
			this.#getWaveElement( wId ).querySelector( "gsui-dotlinesvg" ).$setCurve( this.#data[ wId ].curve );
		} );
		return obj;
	}
	$clear() {
		this.#waveNull = true;
		this.$elements.$dotline.$clear();
	}

	// .........................................................................
	#updateSortWaves() {
		this.#elWavesSorted = Array.from( this.#elWaves ).sort( ( a, b ) => a.dataset.index - b.dataset.index );
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
				this.$dispatch( "change", this.$change( this.#createCloneObj( wId ) ) );
				break;
			case "remove":
				if ( this.#elWavesSorted.length > 1 ) {
					this.$dispatch( "change", this.$change( this.#createRemoveObj( wId ) ) );
				}
				break;
		}
	}
	#createCloneObj( wId ) {
		const w = this.#data[ wId ];
		const wOrder = this.#getWaveOrder( wId );
		const wNext = this.#elWavesSorted[ wOrder + 1 ];
		const wId2 = GSUgetNewId( this.#data );
		const wInd2 = !wNext ? 1 : GSUavg( w.index, wNext.dataset.index );
		const obj = { [ wId2 ]: {
			index: wInd2,
			curve: GSUdeepCopy( w.curve ),
		} };

		if ( !wNext && wOrder > 0 ) {
			obj[ wId ] = { index: GSUavg( this.#elWavesSorted[ wOrder - 1 ].dataset.index, w.index ) };
		}
		return obj;
	}
	#createRemoveObj( wId ) {
		const waves = this.#elWavesSorted;
		const order = this.#getWaveOrder( wId );
		const obj = { [ wId ]: undefined };

		if ( order === 0 ) {
			obj[ waves[ 1 ].dataset.id ] = { index: 0 };
		} else if ( order === waves.length - 1 && waves.length > 2 ) {
			obj[ waves.at( -2 ).dataset.id ] = { index: 1 };
		}
		return obj;
	}

	// .........................................................................
	#addWave( wId, w ) {
		const elW = GSUgetTemplate( "gsui-wave-edit-wavestep", wId, w.index );

		this.$elements.$waves.append( elW );
		this.#updateSortWaves();
		elW.querySelector( "gsui-dotlinesvg" ).$setSVGSize( 100, 50 );
		elW.querySelector( "gsui-dotlinesvg" ).$setDataBox( "0 -1 1 1" );
		this.#elWavesSorted.forEach( ( w, i ) => {
			w.style.order = i;
			w.querySelector( ".gsuiWaveEdit-wavestep-num" ).textContent = i + 1;
		} );
	}
	#removeWave( wId ) {
		const w = this.#getWaveElement( wId );

		w?.remove();
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
		const wsel = this.#getWaveElement( this.#waveSelected );

		if ( wsel ) {
			delete wsel.dataset.selected;
		}
		this.#waveSelected = wId;
		this.#getWaveElement( wId ).dataset.selected = "";
		this.$elements.$dotline.$clear();
		this.$elements.$dotline.$change( this.#data[ wId ].curve );
	}
}

GSUdefineElement( "gsui-wave-edit", gsuiWaveEdit );
