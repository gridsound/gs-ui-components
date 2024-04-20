"use strict";

class gsuiDotline extends gsui0ne {
	#data = {};
	#dataSaved = null;
	#dots = {};
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
				$svg: "svg",
				$path: "path",
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
			} break;
		}
	}
	$onresize( w, h ) {
		this.#svgW = w;
		this.#svgH = h;
		GSUsetAttribute( this.$elements.$svg, "viewBox", `0 0 ${ w } ${ h }` );
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

				if ( dat ) {
					this.#updateDotElement( id, diffDot.x ?? dat.x, diffDot.y ?? dat.y );
				} else {
					this.#createDotElement( id, diffDot.x, diffDot.y );
				}
			}
		} );
		this.#drawPolyline();
	}
	$getPoints( nb ) { // nb > 1
		const p = this.$elements.$path;
		const pLen = p.getTotalLength();
		const arr = GSUnewArray( nb, i => this.#ymin + this.#h * ( 1 - p.getPointAtLength( i / ( nb - 1 ) * pLen ).y / this.#svgH ) );

		return new Float32Array( arr );
	}

	// .........................................................................
	static #sortDots( a, b ) {
		return a.x - b.x;
	}
	static #sortDots2( a, b ) {
		return a[ 1 ].x - b[ 1 ].x;
	}
	static #draw( data, svgW, svgH, w, h, xmin, ymin ) {
		const arr = [];

		Object.values( data ).sort( gsuiDotline.#sortDots )
			.forEach( (d, i) => {
				arr.push(
					!i ? "M" : "L",
					GSUroundNum( ( d.x - xmin ) / w * svgW, 3 ),
					GSUroundNum( svgH - ( d.y - ymin ) / h * svgH, 3 ),
				);
			} );
		return arr.join( " " );
	}
	#drawPolyline() {
		GSUsetAttribute( this.$elements.$path, "d",
			gsuiDotline.#draw( this.#data, this.#svgW, this.#svgH, this.#w, this.#h, this.#xmin, this.#ymin ) );
	}
	#onchange() {
		const diff = GSUdiffObjects( this.#dataSaved, this.#data );

		if ( diff ) {
			this.$dispatch( "change", diff );
		}
	}

	// .........................................................................
	#getNextId() {
		return `${ 1 + Object.keys( this.#data ).reduce( ( max, id ) => Math.max( max, id ), 0 ) }`;
	}
	#getPtrX( e ) {
		const step = GSUgetAttributeNum( this, "xstep" );
		const x = e.offsetX / this.clientWidth * this.#w + this.#xmin;

		return Math.round( x / step ) * step;
	}
	#getPtrY( e ) {
		const step = GSUgetAttributeNum( this, "ystep" );
		const y = this.#h - e.offsetY / this.clientHeight * this.#h + this.#ymin;

		return Math.round( y / step ) * step;
	}

	// .........................................................................
	#createDotElement( id, x, y ) {
		this.#data[ id ] = Object.seal( { x: 0, y: 0 } );
		this.#dots[ id ] = GSUcreateDiv( { class: "gsuiDotline-dot", "data-id": id } );
		this.#updateDotElement( id, x, y );
		this.append( this.#dots[ id ] );
	}
	#updateDotElement( id, x, y ) {
		const dat = this.#data[ id ];
		const dot = this.#dots[ id ];

		dat.x = +x.toFixed( 7 );
		dat.y = +y.toFixed( 7 );
		dot.style.left = `${ ( x - this.#xmin ) / this.#w * 100 }%`;
		dot.style.top = `${ 100 - ( ( y - this.#ymin ) / this.#h * 100 ) }%`;
	}
	#deleteDotElement( id ) {
		this.#dots[ id ].remove();
		delete this.#dots[ id ];
		delete this.#data[ id ];
	}
	#selectDotElement( id, b ) {
		const dot = this.#dots[ id ];

		this.#activeDot = b ? dot : null;
		dot.classList.toggle( "gsuiDotline-dotSelected", b );
	}

	// .........................................................................
	#onpointerdown( e ) {
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
			if ( id ) {
				this.#deleteDotElement( id );
				this.#drawPolyline();
			}
		} else if ( e.button === 0 ) {
			const xstep = GSUgetAttributeNum( this, "xstep" );

			if ( !id ) {
				const x = this.#getPtrX( e );
				const closest = Object.entries( this.#data )
					.find( d => Math.abs( d[ 1 ].x - x ) < xstep );

				if ( closest ) {
					id = closest[ 0 ];
				} else {
					id = this.#getNextId();
					this.#createDotElement( id, x, this.#getPtrY( e ) );
					this.#drawPolyline();
				}
			}
			this.#selectDotElement( id, true );
			if ( !GSUhasAttribute( this, "movelinked" ) ) {
				const dat = this.#data[ id ];

				this.#dotsMoving = [ { id, x: dat.x, y: dat.y } ];
				Object.entries( this.#data )
					.sort( gsuiDotline.#sortDots2 )
					.find( ( [ dId, d ], i, arr ) => {
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
				this.#dotsMoving = Object.entries( this.#data )
					.sort( gsuiDotline.#sortDots2 )
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
		if ( this.#mousebtn === 2 ) {
			const x = e.offsetX / this.clientWidth * this.#w + this.#xmin;
			const y = this.#h - ( e.offsetY / this.clientHeight * this.#h + this.#ymin );
			const dat = Object.entries( this.#data ).find( d => Math.abs( x - d[ 1 ].x ) < 3 );

			if ( dat ) {
				this.#deleteDotElement( dat[ 0 ] );
				this.#drawPolyline();
			}
		} else if ( this.#mousebtn === 0 ) {
			const xstep = GSUgetAttributeNum( this, "xstep" );
			const ystep = GSUgetAttributeNum( this, "ystep" );
			let incX = this.#w / this.clientWidth * ( e.pageX - this.#pageX );
			let incY = this.#h / this.clientHeight * -( e.pageY - this.#pageY );

			incX = Math.max( this.#dotMinX, Math.min( incX, this.#dotMaxX ) );
			incY = Math.max( this.#dotMinY, Math.min( incY, this.#dotMaxY ) );
			incX = Math.round( incX / xstep ) * xstep;
			incY = Math.round( incY / ystep ) * ystep;
			this.#dotsMoving.forEach( d => {
				this.#updateDotElement( d.id, d.x + incX, d.y + incY );
			} );
			this.#drawPolyline();
		}
	}
}

Object.freeze( gsuiDotline );
customElements.define( "gsui-dotline", gsuiDotline );
