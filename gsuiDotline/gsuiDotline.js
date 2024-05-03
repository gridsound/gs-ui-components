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
	#activeDot = null;

	constructor() {
		super( {
			$cmpName: "gsuiDotline",
			$tagName: "gsui-dotline",
			$elements: {
				$root: ".gsuiDotline-padding",
				$svg: "gsui-dotlinesvg",
			},
			$attributes: {
				viewbox: "0 0 100 100",
				xstep: 1,
				ystep: 1,
			},
		} );
		Object.seal( this );
		this.oncontextmenu = GSUnoopFalse;
		this.onpointerdown = this.#onpointerdown.bind( this );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "viewbox" ];
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
				Object.entries( this.#data ).forEach( ( [ id, d ] ) => {
					this.#updateDotElement( id, d.x, d.y );
				} );
				this.#drawPolyline();
			} break;
		}
	}
	$onresize( w, h ) {
		this.$elements.$svg.$setSVGSize( w, h );
		this.#drawPolyline();
	}

	// .........................................................................
	$change( diff ) {
		Object.entries( diff ).forEach( ( [ id, diffDot ] ) => {
			if ( !diffDot ) {
				if ( id in this.#data ) {
					this.#deleteDotElement( id );
				}
			} else {
				const dat = this.#data[ id ];

				dat
					? this.#updateDotElement( id, diffDot.x ?? dat.x, diffDot.y ?? dat.y )
					: this.#createDotElement( id, diffDot.x, diffDot.y );
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
	$getCurveFloat32( nb ) {
		return this.$elements.$svg.$getCurveFloat32( nb );
	}

	// .........................................................................
	#drawPolyline() {
		const cdots = { ...this.#cdots };

		this.$elements.$svg.$setCurve( this.#data );
		this.#dataSorted.reduce( ( prev, [ id, dot ] ) => {
			if ( prev ) {
				const prevXp = this.#getPercX( prev.x );
				const prevYp = this.#getPercY( prev.y );
				let cdot = this.#cdots[ id ];

				if ( !cdot ) {
					cdot =
					this.#cdots[ id ] = GSUcreateDiv( { class: "gsuiDotline-cdot", "data-id": id } );
					this.$elements.$root.append( cdot );
				}
				cdot.style.left = `${ ( this.#getPercX( dot.x ) - prevXp ) / 2 + prevXp }%`;
				cdot.style.top  = `${ ( this.#getPercY( dot.y ) - prevYp ) / 2 + prevYp }%`;
				delete cdots[ id ];
			}
			return dot;
		}, null );
		Object.entries( cdots ).forEach( d => {
			d[ 1 ].remove();
			delete this.#cdots[ d[ 0 ] ];
		} );
	}
	#onchange() {
		const diff = GSUdiffObjects( this.#dataSaved, this.#data );

		if ( diff ) {
			this.$dispatch( "change", diff );
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
	#createDotElement( id, x, y, byMouse ) {
		if ( !byMouse || (
			this.#xmin <= x && x <= this.#xmax &&
			this.#ymin <= y && y <= this.#ymax
		) ) {
			this.#data[ id ] = Object.seal( { x: 0, y: 0 } );
			this.#dots[ id ] = GSUcreateDiv( { class: "gsuiDotline-dot", "data-id": id } );
			this.#updateDotElement( id, x, y, byMouse );
			this.$elements.$root.append( this.#dots[ id ] );
			this.#sortDots();
			return id;
		}
	}
	#updateDotElement( id, x, y, byMouse ) {
		const opt = this.#dotsOpt[ id ];

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
			this.#dots[ id ].remove();
			delete this.#data[ id ];
			delete this.#dots[ id ];
			delete this.#dotsOpt[ id ];
			this.#sortDots();
		}
	}
	#sortDots() {
		this.#dataSorted = Object.entries( this.#data ).sort( ( a, b ) => a[ 1 ].x - b[ 1 ].x );
	}
	#selectDotElement( id, b ) {
		const dot = this.#dots[ id ];

		this.#activeDot = b ? dot : null;
		dot.classList.toggle( "gsuiDotline-dotSelected", b );
	}

	// .........................................................................
	#onpointerdown( e ) {
		let isDot = e.target.classList.contains( "gsuiDotline-dot" );
		let id = e.target.dataset.id;

		GSUunselectText();
		this.setPointerCapture( e.pointerId );
		this.#dataSaved = GSUjsonCopy( this.#data );
		this.#mousebtn = e.button;
		this.#pageX = e.pageX;
		this.#pageY = e.pageY;
		this.onpointerup = this.#onpointerupDot.bind( this );
		this.onpointermove = this.#onpointermoveDot.bind( this );
		if ( e.button === 2 ) {
			if ( isDot && id ) {
				e.preventDefault();
				this.#deleteDotElement( id );
				this.#drawPolyline();
				this.$dispatch( "input", this.#data );
			}
		} else if ( e.button === 0 ) {
			const xstep = GSUgetAttributeNum( this, "xstep" );

			if ( !id ) {
				const x = this.#getPtrX( e );

				isDot = true;
				id = this.#dataSorted.find( d => Math.abs( d[ 1 ].x - x ) < xstep )?.[ 0 ];
				if ( !id ) {
					id = this.#createDotElement( GSUgetNewId( this.#data ), x, this.#getPtrY( e ), true );
					if ( id ) {
						this.#drawPolyline();
						this.$dispatch( "input", this.#data );
					}
				}
			}
			if ( id ) {
				isDot
					? this.#onpointerdownDot( id, xstep )
					: this.#onpointerdownCurveDot( id, xstep );
			}
		}
	}
	#onpointerdownDot( id, xstep ) {
		this.#selectDotElement( id, true );
		if ( !GSUhasAttribute( this, "movelinked" ) ) {
			const dat = this.#data[ id ];

			this.#dotsMoving = [ { id, x: dat.x, y: dat.y } ];
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
	#onpointerdownCurveDot( id, xstep ) {
		console.log( "gsuiDotline.#onpointerdownCurveDot", id );
	}
	#onpointerupDot( e ) {
		if ( this.#activeDot ) {
			this.#selectDotElement( this.#activeDot.dataset.id, false );
		}
		this.releasePointerCapture( e.pointerId );
		this.onpointermove = null;
		this.onpointerup = null;
		this.#dotsMoving.length = 0;
		this.#onchange();
	}
	#onpointermoveDot( e ) {
		const xstep = GSUgetAttributeNum( this, "xstep" );
		const ystep = GSUgetAttributeNum( this, "ystep" );

		if ( this.#mousebtn === 2 ) {
			const x = e.offsetX / this.#getW() * this.#w + this.#xmin;
			const y = this.#h - ( e.offsetY / this.#getH() * this.#h + this.#ymin );
			const dat = this.#dataSorted.find( d => Math.abs( x - d[ 1 ].x ) < xstep );

			if ( dat ) {
				this.#deleteDotElement( dat[ 0 ] );
				this.#drawPolyline();
				this.$dispatch( "input", this.#data );
			}
		} else if ( this.#mousebtn === 0 ) {
			let incX = this.#w / this.#getW() * ( e.pageX - this.#pageX );
			let incY = this.#h / this.#getH() * -( e.pageY - this.#pageY );

			incX = Math.max( this.#dotMinX, Math.min( incX, this.#dotMaxX ) );
			incY = Math.max( this.#dotMinY, Math.min( incY, this.#dotMaxY ) );
			incX = Math.round( incX / xstep ) * xstep;
			incY = Math.round( incY / ystep ) * ystep;
			this.#dotsMoving.forEach( d => {
				this.#updateDotElement( d.id, d.x + incX, d.y + incY, true );
			} );
			this.#drawPolyline();
			this.$dispatch( "input", this.#data );
		}
	}
}

Object.freeze( gsuiDotline );
customElements.define( "gsui-dotline", gsuiDotline );
