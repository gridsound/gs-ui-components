"use strict";

class gsuiDotline extends gsui0ne {
	#data = {};
	#dataSorted = [];
	#dataSaved = null;
	#dots = {};
	#cdots = {};
	#dotsOpt = {};
	#dotsMoving = [];
	#w = 1;
	#h = 1;
	#xmin = 0;
	#ymin = 0;
	#xmax = 0;
	#ymax = 0;
	#pageX = 0;
	#pageY = 0;
	#dotMaxX = 0;
	#dotMinX = 0;
	#dotMaxY = 0;
	#dotMinY = 0;
	#mousebtn = 0;
	#activeDotId = null;
	#beatlines = null;
	#menu = new gsuiActionMenu();
	#menuDotId = null;

	constructor() {
		super( {
			$cmpName: "gsuiDotline",
			$tagName: "gsui-dotline",
			$elements: {
				$svg: "gsui-dotlinesvg",
				$slider: "gsui-slider",
			},
			$attributes: {
				viewbox: "0 0 100 100",
				xstep: 1,
				ystep: 1,
			},
		} );
		Object.seal( this );
		this.#menu.$setMinSize( "130px", "192px" );
		this.#menu.$setMaxSize( "130px", "192px" );
		this.#menu.$closeAfterClick( false );
		this.#menu.$setDirection( "B" );
		this.#menu.$setCallback( this.#onclickActions.bind( this ) );
		this.#menu.$setActions( [
			{ id: "delete",       icon: "close",     name: "delete" },
			{ id: "hold",         icon: "radio-btn", name: "hold" },
			{ id: "curve",        icon: "radio-btn", name: "curve" },
			{ id: "doubleCurve",  icon: "radio-btn", name: "double-curve" },
			{ id: "stair",        icon: "radio-btn", name: "stair" },
			{ id: "sineWave",     icon: "radio-btn", name: "sine-wave" },
			{ id: "triangleWave", icon: "radio-btn", name: "triangle-wave" },
			{ id: "squareWave",   icon: "radio-btn", name: "square-wave" },
		] );
		GSUdomListen( this, {
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUT ]: ( _, val ) => {
				this.#data[ this.#activeDotId ].val = val;
				this.#drawPolyline();
				this.#oninput( "curve" );
			},
			[ GSEV_SLIDER_CHANGE ]: ( _, val ) => {
				this.#data[ this.#activeDotId ].val = val;
				this.#drawPolyline();
				this.#onchange( { [ this.#activeDotId ]: { val } } );
			},
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "viewbox", "beatlines" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "viewbox": {
				const v = val.split( " " );

				this.#xmin = +v[ 0 ];
				this.#ymin = +v[ 1 ];
				this.#xmax = +v[ 2 ];
				this.#ymax = +v[ 3 ];
				this.#w = this.#xmax - this.#xmin;
				this.#h = this.#ymax - this.#ymin;
				this.$elements.$svg.$get( 0 ).$setDataBox( val );
				GSUforEach( this.#data, ( d, id ) => this.#updateDotElement( { id, ...d } ) );
				this.#drawPolyline();
			} break;
			case "beatlines":
				if ( val === "" && !this.#beatlines ) {
					this.#beatlines = [
						$( "<gsui-beatlines>" ).$setAttr( { timedivision: "5/10" } ),
						$( "<gsui-beatlines>" ).$setAttr( { timedivision: "5/10", vertical: true } ),
					];
					this.$element.$prepend( ...this.#beatlines );
				}
				break;
		}
	}
	$onresize( w, h ) {
		this.$elements.$svg.$get( 0 ).$setSVGSize( w, h );
		this.#drawPolyline();
		if ( this.#beatlines ) {
			this.#beatlines[ 0 ].$setAttr( "pxperbeat", this.$elements.$svg.$child( 0 ).$width() / 10 );
			this.#beatlines[ 1 ].$setAttr( "pxperbeat", this.$elements.$svg.$child( 0 ).$height() / 10 );
		}
	}

	// .........................................................................
	$clear() {
		GSUforEach( this.#dots, ( _, id ) => this.#deleteDotElement2( id ) );
		this.#dataSorted = [];
		this.#drawPolyline();
	}
	$change( diff ) {
		GSUforEach( diff, ( diffDot, id ) => {
			if ( !diffDot ) {
				if ( id in this.#data ) {
					this.#deleteDotElement( id );
				}
			} else {
				const dat = this.#data[ id ];

				!dat
					? this.#createDotElement( { id, ...diffDot } )
					: this.#updateDotElement( {
						id,
						x: diffDot.x ?? dat.x,
						y: diffDot.y ?? dat.y,
						type: diffDot.type ?? dat.type,
						val: diffDot.val ?? dat.val,
					} );
			}
		} );
		this.#drawPolyline();
	}
	$setDotOptions( id, opts ) {
		this.#dotsOpt[ id ] ||= { ...opts };
	}
	$getData() {
		return this.#data;
	}

	// .........................................................................
	#onclickActions( act ) {
		if ( act === "delete" ) {
			this.#menu.$close();
			if ( this.#deleteDotElement( this.#menuDotId ) ) {
				this.#drawPolyline();
				this.#onchange( { [ this.#menuDotId ]: undefined } );
			}
		} else {
			const dot = this.#data[ this.#menuDotId ];

			if ( dot.type !== act && this.#menuDotId !== this.#dataSorted[ 0 ][ 0 ] ) {
				const dotDiff = { type: act };

				this.#updateMenu( act );
				dot.type = act;
				if ( act === "hold" && dot.val !== null ) {
					dot.val =
					dotDiff.val = null;
				} else if ( !GSUisNum( dot.val ) ) {
					dot.val =
					dotDiff.val = 2;
				}
				this.#drawPolyline();
				this.#onchange( { [ this.#menuDotId ]: dotDiff } );
			}
			this.#menu.$close();
		}
	}

	// .........................................................................
	#drawPolyline() {
		const cdots = { ...this.#cdots };

		this.$elements.$svg.$get( 0 ).$setCurve( this.#data );
		this.#dataSorted.reduce( ( prev, [ id, dot ] ) => {
			if ( prev ) {
				const prevXp = this.#getPercX( prev.x );
				const prevYp = this.#getPercY( prev.y );
				const cdotY = dot.type !== "curve"
					? .5
					: GSUmathDotLineGetYFromDot( "curve", dot.val, .5 );
				let cdot = this.#cdots[ id ];

				if ( !cdot ) {
					cdot =
					this.#cdots[ id ] = $( "<div>" ).$setAttr( { class: "gsuiDotline-cdot", "data-id": id } );
					this.$element.$append( cdot );
				}
				cdot.$setAttr( "data-type", dot.type )
					.$left( ( this.#getPercX( dot.x ) - prevXp ) * .5 + prevXp, "%" )
					.$top(  ( this.#getPercY( dot.y ) - prevYp ) * cdotY + prevYp, "%" );
				delete cdots[ id ];
			}
			return dot;
		}, null );
		GSUforEach( cdots, ( d, id ) => {
			d.$remove();
			delete this.#cdots[ id ];
		} );
	}

	// .........................................................................
	#oninput( tar ) {
		this.$this.$dispatch( GSEV_DOTLINE_INPUT, {
			$target: tar,
			$dotId: this.#activeDotId,
			$data: GSUdeepCopy( this.#data ),
		} );
	}
	#oninputstart() {
		this.$this.$dispatch( GSEV_DOTLINE_INPUTSTART, {
			$dotId: this.#activeDotId,
			$data: GSUdeepCopy( this.#data ),
		} );
	}
	#oninputend() {
		this.$this.$dispatch( GSEV_DOTLINE_INPUTEND );
	}
	#onchange( obj ) {
		if ( obj ) {
			this.$this.$dispatch( GSEV_DOTLINE_CHANGE, obj );
		} else {
			const diff = GSUdiffObjects( this.#dataSaved, this.#data );

			if ( diff ) {
				this.$this.$dispatch( GSEV_DOTLINE_CHANGE, diff );
			}
		}
	}

	// .........................................................................
	#getW() { return this.$element.$width(); }
	#getH() { return this.$element.$height(); }
	#getPtrX( e ) { return GSUmathRound(           e.offsetX / this.#getW() * this.#w + this.#xmin, +this.$this.$getAttr( "xstep" ) ); }
	#getPtrY( e ) { return GSUmathRound( this.#h - e.offsetY / this.#getH() * this.#h + this.#ymin, +this.$this.$getAttr( "ystep" ) ); }
	#getPercX( x ) { return         ( x - this.#xmin ) / this.#w * 100; }
	#getPercY( y ) { return 100 - ( ( y - this.#ymin ) / this.#h * 100 ); }

	// .........................................................................
	#createDotElement( args ) {
		const { id, x, y, byMouse } = args;

		if ( !byMouse || (
			this.#xmin <= x && x <= this.#xmax &&
			this.#ymin <= y && y <= this.#ymax
		) ) {
			this.#data[ id ] = Object.seal( { x: 0, y: 0, type: null, val: null } );
			this.#dots[ id ] = $( "<div>" ).$setAttr( { class: "gsuiDotline-dot", "data-id": id } );
			this.#updateDotElement( args );
			this.$element.$append( this.#dots[ id ] );
			this.#sortDots();
			return id;
		}
	}
	#updateDotElement( args ) {
		const { id, x, y, type, val, byMouse } = args;
		const opt = this.#dotsOpt[ id ];

		this.#data[ id ].type = type;
		this.#data[ id ].val = val;
		if ( !byMouse || !opt?.freezeX ) {
			this.#data[ id ].x = +x.toFixed( 7 );
			this.#dots[ id ].$left( this.#getPercX( x ), "%" );
		}
		if ( !byMouse || !opt?.freezeY ) {
			this.#data[ id ].y = +y.toFixed( 7 );
			this.#dots[ id ].$top( this.#getPercY( y ), "%" );
		}
	}
	#deleteDotElement( id ) {
		const opt = this.#dotsOpt[ id ];

		if ( opt?.deletable !== false ) {
			this.#deleteDotElement2( id );
			this.#sortDots();
			return true;
		}
		return false;
	}
	#deleteDotElement2( id ) {
		this.#dots[ id ].$remove();
		delete this.#data[ id ];
		delete this.#dots[ id ];
		delete this.#dotsOpt[ id ];
	}
	#sortDots() {
		this.#dataSorted = Object.entries( this.#data ).sort( ( a, b ) => a[ 1 ].x - b[ 1 ].x );
	}
	#selectDotElement( id, b ) {
		const dot = this.#dots[ id ];

		this.#activeDotId = b ? id : null;
		dot.$togClass( "gsuiDotline-dotSelected", b );
	}
	#updateMenu( type ) {
		this.#menu.$changeAction( "hold",         "icon", type === "hold"         ? "radio-btn-checked" : "radio-btn" );
		this.#menu.$changeAction( "curve",        "icon", type === "curve"        ? "radio-btn-checked" : "radio-btn" );
		this.#menu.$changeAction( "stair",        "icon", type === "stair"        ? "radio-btn-checked" : "radio-btn" );
		this.#menu.$changeAction( "sineWave",     "icon", type === "sineWave"     ? "radio-btn-checked" : "radio-btn" );
		this.#menu.$changeAction( "squareWave",   "icon", type === "squareWave"   ? "radio-btn-checked" : "radio-btn" );
		this.#menu.$changeAction( "doubleCurve",  "icon", type === "doubleCurve"  ? "radio-btn-checked" : "radio-btn" );
		this.#menu.$changeAction( "triangleWave", "icon", type === "triangleWave" ? "radio-btn-checked" : "radio-btn" );
	}

	// .........................................................................
	$onptrdown( e ) {
		const tar = $( e.target );
		const isSVG = tar.$hasClass( "gsuiDotline-padding" );
		let isDot = tar.$hasClass( "gsuiDotline-dot" );
		let id = tar.$getAttr( "data-id" );

		GSUdomUnselect();
		this.#onrightclickSlider( e );
		this.#onrightclickDot( e );
		this.#onptrdownCurveDot( e );
		if ( e.button === 2 || ( !isSVG && !isDot ) ) {
			return false;
		}
		this.#dataSaved = GSUjsonCopy( this.#data );
		this.#mousebtn = e.button;
		this.#pageX = e.pageX;
		this.#pageY = e.pageY;
		if ( e.button === 0 ) {
			const xstep = +this.$this.$getAttr( "xstep" );
			let isNewDot = false;

			if ( !id ) {
				const x = this.#getPtrX( e );

				isDot = true;
				id = this.#dataSorted.find( d => Math.abs( d[ 1 ].x - x ) < xstep )?.[ 0 ];
				if ( !id ) {
					id = this.#createDotElement( {
						id: GSUgetNewId( this.#data ),
						x,
						y: this.#getPtrY( e ),
						type: "curve",
						val: 0,
						byMouse: true,
					} );
					if ( id ) {
						isNewDot = true;
						this.#drawPolyline();
					}
				}
			}
			if ( id && isDot ) {
				this.#onptrdownDot( id, xstep );
				this.#oninputstart();
				if ( isNewDot ) {
					this.#oninput( "dot" );
				}
				return true;
			}
		}
		return false;
	}
	#onrightclickSlider( e ) {
		const tar = $( e.target );

		if ( e.button === 2 && tar.$hasClass( "gsuiDotline-cdot" ) ) {
			const id = tar.$getAttr( "data-id" );
			const dot = this.#data[ id ];

			dot.val = 0;
			this.$elements.$slider.$setAttr( "value", dot.val );
			this.#drawPolyline();
			this.#onchange( { [ id ]: { val: dot.val } } );
		}
	}
	#onrightclickDot( e ) {
		const tar = $( e.target );

		if ( e.button === 2 && tar.$hasClass( "gsuiDotline-dot" ) ) {
			this.#menuDotId = tar.$getAttr( "data-id" );
			this.#updateMenu( this.#data[ this.#menuDotId ].type );
			this.#menu.$setTarget( tar.$get( 0 ) );
			this.#menu.$open();
		}
	}
	#onptrdownDot( id, xstep ) {
		this.#selectDotElement( id, true );
		if ( !this.$this.$hasAttr( "movelinked" ) ) {
			const dat = this.#data[ id ];

			this.#dotsMoving = [ { id, ...dat } ];
			this.#dataSorted.find( ( [ dId ], i, arr ) => {
				if ( dId === id ) {
					const dotA = arr[ i - 1 ]?.[ 1 ];
					const dotB = arr[ i + 1 ]?.[ 1 ];

					this.#dotMinY = this.#ymin - dat.y;
					this.#dotMaxY = this.#ymax - dat.y;
					this.#dotMinX = ( dotA ? dotA.x + xstep : this.#xmin ) - dat.x;
					this.#dotMaxX = ( dotB ? dotB.x - xstep : this.#xmax ) - dat.x;
					return true;
				}
			} );
		} else {
			let isAfter = false;
			let prevDot;

			this.#dotMinX =
			this.#dotMinY = Infinity;
			this.#dotMaxX =
			this.#dotMaxY = -Infinity;
			this.#dotsMoving = this.#dataSorted
				.filter( ( [ dId, d ], i, arr ) => {
					isAfter ||= dId === id;
					if ( isAfter ) {
						this.#dotMinX = Math.min( d.x, this.#dotMinX );
						this.#dotMinY = Math.min( d.y, this.#dotMinY );
						this.#dotMaxX = Math.max( d.x, this.#dotMaxX );
						this.#dotMaxY = Math.max( d.y, this.#dotMaxY );
					}
					if ( arr[ i + 1 ]?.[ 0 ] === id ) {
						prevDot = d;
					}
					return isAfter;
				} )
				.map( ( [ dId, d ] ) => ( { id: dId, x: d.x, y: d.y } ) );
			this.#dotMinX = ( prevDot?.x ?? this.#xmin ) - this.#dotMinX + xstep;
			this.#dotMinY = this.#ymin - this.#dotMinY;
			this.#dotMaxX = this.#xmax - this.#dotMaxX;
			this.#dotMaxY = this.#ymax - this.#dotMaxY;
		}
	}
	#onptrdownCurveDot( e ) {
		const tar = $( e.target );

		if ( tar.$hasClass( "gsuiDotline-cdot" ) ) {
			const id = tar.$getAttr( "data-id" );
			const ind = this.#dataSorted.findIndex( dot => dot[ 0 ] === id );
			const dotAY = this.#dataSorted[ ind - 1 ][ 1 ].y;
			const dotBY = this.#dataSorted[ ind     ][ 1 ].y;

			this.#activeDotId = id;
			this.$elements.$slider.$setAttr( {
				revert: dotAY > dotBY,
				value: this.#data[ id ].val,
			} ).$get( 0 ).$ptrDown( e );
		}
	}
	$onptrup() {
		if ( this.#activeDotId ) {
			this.#selectDotElement( this.#activeDotId, false );
		}
		this.#dotsMoving.length = 0;
		this.#oninputend();
		this.#onchange();
	}
	$onptrmove( e ) {
		if ( this.#mousebtn === 0 ) {
			const [ xstep, ystep ] = this.$this.$getAttr( "xstep", "ystep" );
			let incX = this.#w / this.#getW() *  ( e.pageX - this.#pageX );
			let incY = this.#h / this.#getH() * -( e.pageY - this.#pageY );

			incX = GSUmathRound( GSUmathClamp( incX, this.#dotMinX, this.#dotMaxX ), +xstep );
			incY = GSUmathRound( GSUmathClamp( incY, this.#dotMinY, this.#dotMaxY ), +ystep );
			this.#dotsMoving.forEach( d => {
				this.#updateDotElement( {
					...d,
					x: d.x + incX,
					y: d.y + incY,
					byMouse: true,
				} );
			} );
			this.#drawPolyline();
			this.#oninput( "dot" );
		}
	}
}

GSUdomDefine( "gsui-dotline", gsuiDotline );
