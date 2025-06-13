"use strict";

class gsuiDotline extends gsui0ne {
	#data = {};
	#dataSorted = [];
	#dataSaved = null;
	#dots = {};
	#cdots = {};
	#dotsOpt = {};
	#dotsMoving = [];
	#svgW = 0;
	#svgH = 0;
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
				$root: ".gsuiDotline-padding",
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
		this.#menu.$setDirection( "bottom" );
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
		GSUlistenEvents( this, {
			gsuiSlider: {
				inputEnd: GSUnoop,
				inputStart: GSUnoop,
				input: d => {
					this.#data[ this.#activeDotId ].val = d.args[ 0 ];
					this.#drawPolyline();
					this.#oninput( "curve" );
				},
				change: d => {
					this.#data[ this.#activeDotId ].val = d.args[ 0 ];
					this.#drawPolyline();
					this.#onchange( { [ this.#activeDotId ]: { val: d.args[ 0 ] } } );
				},
			}
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
				this.$elements.$svg.$setDataBox( val );
				GSUforEach( this.#data, ( d, id ) => this.#updateDotElement( { id, ...d } ) );
				this.#drawPolyline();
			} break;
			case "beatlines":
				if ( val === "" && !this.#beatlines ) {
					this.#beatlines = [
						GSUcreateElement( "gsui-beatlines", { timedivision: "5/10" } ),
						GSUcreateElement( "gsui-beatlines", { timedivision: "5/10" } ),
					];
					this.$elements.$root.prepend( ...this.#beatlines );
				}
				break;
		}
	}
	$onresize( w, h ) {
		this.$elements.$svg.$setSVGSize( w, h );
		this.#drawPolyline();
		if ( this.#beatlines ) {
			GSUsetAttribute( this.#beatlines[ 0 ], "pxperbeat", this.$elements.$svg.firstChild.clientWidth / 10 );
			GSUsetAttribute( this.#beatlines[ 1 ], "pxperbeat", this.$elements.$svg.firstChild.clientHeight / 10 );
		}
	}

	// .........................................................................
	$clear() {
		GSUforEach( this.#dots, ( d, id ) => this.#deleteDotElement2( id ) );
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

		this.$elements.$svg.$setCurve( this.#data );
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
					this.#cdots[ id ] = GSUcreateDiv( { class: "gsuiDotline-cdot", "data-id": id } );
					this.$elements.$root.append( cdot );
				}
				GSUsetAttribute( cdot, "data-type", dot.type );
				cdot.style.left = `${ ( this.#getPercX( dot.x ) - prevXp ) * .5 + prevXp }%`;
				cdot.style.top  = `${ ( this.#getPercY( dot.y ) - prevYp ) * cdotY + prevYp }%`;
				delete cdots[ id ];
			}
			return dot;
		}, null );
		GSUforEach( cdots, ( d, id ) => {
			d.remove();
			delete this.#cdots[ id ];
		} );
	}

	// .........................................................................
	#oninput( tar ) {
		this.$dispatch( "input", {
			$target: tar,
			$dotId: this.#activeDotId,
			$data: GSUdeepCopy( this.#data ),
		} );
	}
	#oninputstart() {
		this.$dispatch( "inputstart", {
			$dotId: this.#activeDotId,
			$data: GSUdeepCopy( this.#data ),
		} );
	}
	#oninputend() {
		this.$dispatch( "inputend" );
	}
	#onchange( obj ) {
		if ( obj ) {
			this.$dispatch( "change", obj );
		} else {
			const diff = GSUdiffObjects( this.#dataSaved, this.#data );

			if ( diff ) {
				this.$dispatch( "change", diff );
			}
		}
	}

	// .........................................................................
	#getW() { return this.$elements.$root.clientWidth; }
	#getH() { return this.$elements.$root.clientHeight; }
	#getPtrX( e ) {
		const step = GSUgetAttributeNum( this, "xstep" );
		const x = e.offsetX / this.#getW() * this.#w + this.#xmin;

		return Math.round( x / step ) * step;
	}
	#getPtrY( e ) {
		const step = GSUgetAttributeNum( this, "ystep" );
		const y = this.#h - e.offsetY / this.#getH() * this.#h + this.#ymin;

		return Math.round( y / step ) * step;
	}
	#getPercX( x ) { return ( x - this.#xmin ) / this.#w * 100; }
	#getPercY( y ) { return 100 - ( ( y - this.#ymin ) / this.#h * 100 ); }

	// .........................................................................
	#createDotElement( args ) {
		const { id, x, y, byMouse } = args;

		if ( !byMouse || (
			this.#xmin <= x && x <= this.#xmax &&
			this.#ymin <= y && y <= this.#ymax
		) ) {
			this.#data[ id ] = Object.seal( { x: 0, y: 0, type: null, val: null } );
			this.#dots[ id ] = GSUcreateDiv( { class: "gsuiDotline-dot", "data-id": id } );
			this.#updateDotElement( args );
			this.$elements.$root.append( this.#dots[ id ] );
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
			this.#dots[ id ].style.left = `${ this.#getPercX( x ) }%`;
		}
		if ( !byMouse || !opt?.freezeY ) {
			this.#data[ id ].y = +y.toFixed( 7 );
			this.#dots[ id ].style.top = `${ this.#getPercY( y ) }%`;
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
		this.#dots[ id ].remove();
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
		dot.classList.toggle( "gsuiDotline-dotSelected", b );
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
		const isSVG = e.target.classList.contains( "gsuiDotline-padding" );
		let isDot = e.target.classList.contains( "gsuiDotline-dot" );
		let id = e.target.dataset.id;

		GSUunselectText();
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
			const xstep = GSUgetAttributeNum( this, "xstep" );
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
		if ( e.button === 2 && e.target.classList.contains( "gsuiDotline-cdot" ) ) {
			const id = e.target.dataset.id;
			const dot = this.#data[ id ];

			dot.val = 0;
			GSUsetAttribute( this.$elements.$slider, "value", dot.val );
			this.#drawPolyline();
			this.#onchange( { [ id ]: { val: dot.val } } );
		}
	}
	#onrightclickDot( e ) {
		if ( e.button === 2 && e.target.classList.contains( "gsuiDotline-dot" ) ) {
			this.#menuDotId = e.target.dataset.id;
			this.#updateMenu( this.#data[ this.#menuDotId ].type );
			this.#menu.$setTarget( e.target );
			this.#menu.$open();
		}
	}
	#onptrdownDot( id, xstep ) {
		this.#selectDotElement( id, true );
		if ( !GSUdomHasAttr( this, "movelinked" ) ) {
			const dat = this.#data[ id ];

			this.#dotsMoving = [ { id, ...dat } ];
			this.#dataSorted.find( ( [ dId, d ], i, arr ) => {
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
		if ( e.target.classList.contains( "gsuiDotline-cdot" ) ) {
			const id = e.target.dataset.id;
			const ind = this.#dataSorted.findIndex( dot => dot[ 0 ] === id );
			const dotAY = this.#dataSorted[ ind - 1 ][ 1 ].y;
			const dotBY = this.#dataSorted[ ind ][ 1 ].y;

			this.#activeDotId = id;
			GSUsetAttribute( this.$elements.$slider, {
				revert: dotAY > dotBY,
				value: this.#data[ id ].val,
			} );
			this.$elements.$slider.$ptrDown( e );
		}
	}
	$onptrup( e ) {
		if ( this.#activeDotId ) {
			this.#selectDotElement( this.#activeDotId, false );
		}
		this.#dotsMoving.length = 0;
		this.#oninputend();
		this.#onchange();
	}
	$onptrmove( e ) {
		const xstep = GSUgetAttributeNum( this, "xstep" );
		const ystep = GSUgetAttributeNum( this, "ystep" );

		if ( this.#mousebtn === 0 ) {
			let incX = this.#w / this.#getW() * ( e.pageX - this.#pageX );
			let incY = this.#h / this.#getH() * -( e.pageY - this.#pageY );

			incX = Math.max( this.#dotMinX, Math.min( incX, this.#dotMaxX ) );
			incY = Math.max( this.#dotMinY, Math.min( incY, this.#dotMaxY ) );
			incX = Math.round( incX / xstep ) * xstep;
			incY = Math.round( incY / ystep ) * ystep;
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

GSUdefineElement( "gsui-dotline", gsuiDotline );
