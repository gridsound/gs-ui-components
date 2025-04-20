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
				$wtGraphWrap: ".gsuiWaveEdit-wt-graph",
				$wtGraph: "gsui-wavetable-graph",
				$scroll: ".gsuiWaveEdit-scroll",
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
					const obj2 = this.#waveNull
						? { curve: obj, index: 0 }
						: { curve: obj }

					d.args[ 0 ] = { [ this.#waveSelected ]: obj2 };
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
	$onresize( w ) {
		const dl = this.$elements.$dotline;
		const h2 = this.$elements.$scroll.clientHeight;
		const h3 = Math.min( h2, w / 3 );

		this.$elements.$scroll.style.left = `${ h3 }px`;
		this.$elements.$wtGraphWrap.style.width = `${ h3 }px`;

		const ratio = dl.clientWidth / dl.clientHeight;
		const wavesH = this.$elements.$waves.clientHeight - 4;

		this.$elements.$waves.style.fontSize = `${ ratio * wavesH }px`;
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
				} else if ( "index" in w ) {
					this.#getWaveElement( wId ).dataset.index = w.index;
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
		this.$elements.$wtGraph.$setWavetable( this.#data );
		this.$elements.$wtGraph.$draw();
		return obj;
	}
	$clear() {
		this.#waveNull = true;
		this.#waveSelected = "0";
		this.$elements.$dotline.$clear();
		this.#elWavesSorted.forEach( w => w.remove() );
		this.#data = {};
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
		const elWaves = this.#elWavesSorted;
		const w = this.#data[ wId ];
		const wNew = {
			index: 1,
			curve: GSUdeepCopy( w.curve ),
		};
		const obj = { [ GSUgetNewId( this.#data ) ]: wNew };

		if ( elWaves.length > 1 ) {
			const wOrder = this.#getWaveOrder( wId );

			if ( wOrder < elWaves.length - 1 ) {
				wNew.index = GSUavg( w.index, elWaves[ wOrder + 1 ].dataset.index );
			} else {
				obj[ wId ] = { index: GSUavg( elWaves[ wOrder - 1 ].dataset.index, w.index ) };
			}
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
		if ( this.#waveSelected !== wId ) {
			const elW = this.#getWaveElement( wId );
			const elWsel = this.#getWaveElement( this.#waveSelected );

			if ( elWsel ) {
				delete elWsel.dataset.selected;
			}
			this.#waveSelected = wId;
			this.$elements.$wtGraph.$selectCurrentWave( wId );
			this.$elements.$wtGraph.$draw();
			this.$elements.$dotline.$clear();
			this.$elements.$dotline.$change( this.#data[ wId ].curve );
			elW.dataset.selected = "";
			GSUscrollIntoViewX( elW, this.$elements.$scroll );
		}
	}
}

GSUdefineElement( "gsui-wave-edit", gsuiWaveEdit );
