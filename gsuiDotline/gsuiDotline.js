"use strict";

class gsuiDotline extends HTMLElement {
	#dispatch = GSUI.$dispatchEvent.bind( null, this, "gsuiDotline" );
	#data = {};
	#dataSaved = null;
	#opt = {};
	#dots = {};
	#dotsMoving = [];
	#dotsId = 0;
	#svgW = 0;
	#svgH = 0;
	#pageX = 0;
	#pageY = 0;
	#dotMaxX = 0;
	#dotMinX = 0;
	#dotMaxY = 0;
	#dotMinY = 0;
	#mousebtn = 0;
	#activeDot = null;
	#onresizeBind = this.#onresize.bind( this );
	#children = GSUI.$getTemplate( "gsui-dotline" );
	#elements = GSUI.$findElements( this.#children, {
		svg: "svg",
		polyline: "polyline",
	} );

	constructor() {
		super();
		Object.seal( this );
		this.oncontextmenu = () => false;
		this.onpointerdown = this.#onpointerdown.bind( this );
		this.options( {
			x: "x",
			y: "y",
			step: 1,
			minX: 0,
			minY: 0,
			maxX: 150,
			maxY: 100,
			firstDotLinked: null,
			lastDotLinked: null,
		} );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( ...this.#children );
			this.#children = null;
			GSUI.$recallAttributes( this, {
			} );
		}
		GSUI.$observeSizeOf( this, this.#onresizeBind );
	}
	disconnectedCallback() {
		GSUI.$unobserveSizeOf( this, this.#onresizeBind );
	}

	// .........................................................................
	options( obj ) {
		const opt = this.#opt;

		Object.assign( opt, obj );
		if ( this.#optionsRedrawNeeded( obj ) ) {
			opt.width = opt.maxX - opt.minX;
			opt.height = opt.maxY - opt.minY;
			this.#drawPolyline();
			Object.entries( this.#data ).forEach( d => this.#updateDotElement( d[ 0 ], ...d[ 1 ] ) );
		}
		return opt;
	}
	change( diff ) {
		Object.entries( diff ).forEach( ( [ id, diffDot ] ) => {
			if ( !diffDot ) {
				if ( id in this.#data ) {
					delete this.#data[ id ];
					this.#deleteDotElement( id );
				}
			} else {
				const opt = this.#opt;
				const dat = this.#data[ id ];
				const xs = opt.x;
				const ys = opt.y;
				const x = xs in diffDot ? this.#epureNb( diffDot[ xs ], opt.minX, opt.maxX ) : dat ? dat.x : 0;
				const y = ys in diffDot ? this.#epureNb( diffDot[ ys ], opt.minY, opt.maxY ) : dat ? dat.y : 0;

				if ( dat ) {
					this.#updateDotElement( id, x, y );
				} else {
					this.#data[ id ] = Object.seal( { x, y } );
					this.#createDotElement( id );
					this.#updateDotElement( id, x, y );
				}
			}
		} );
		this.#drawPolyline();
	}

	// .........................................................................
	#optionsRedrawNeeded( o ) {
		return (
			"step" in o ||
			"minX" in o ||
			"minY" in o ||
			"maxX" in o ||
			"maxY" in o ||
			"firstDotLinked" in o ||
			"lastDotLinked" in o
		);
	}
	#sortDots( a, b ) {
		return a.x - b.x;
	}
	#drawPolyline() {
		const arr = [];
		const data = Object.values( this.#data ).sort( this.#sortDots );
		const svgW = this.#svgW;
		const svgH = this.#svgH;
		const {
			minX, minY,
			width, height,
			firstDotLinked,
			lastDotLinked,
		} = this.#opt;

		if ( firstDotLinked !== null ) {
			arr.push( 0, svgH - ( firstDotLinked - minY ) / height * svgH );
		}
		data.forEach( d => {
			arr.push(
				( d.x - minX ) / width * svgW,
				svgH - ( d.y - minY ) / height * svgH
			);
		} );
		if ( lastDotLinked !== null ) {
			arr.push( svgW, svgH - ( lastDotLinked - minY ) / height * svgH );
		}
		GSUI.$setAttribute( this.#elements.polyline, "points", arr.join( " " ) );
	}
	#onchange() {
		const diff = GSUI.$diffObjects( this.#dataSaved, this.#data );

		if ( diff ) {
			this.#dispatch( "change", diff );
		}
	}

	// .........................................................................
	#getPtrX( e ) {
		return e.offsetX / this.clientWidth * this.#opt.width + this.#opt.minX;
	}
	#getPtrY( e ) {
		return this.#opt.height - e.offsetY / this.clientHeight * this.#opt.height + this.#opt.minY;
	}
	#epureNb( n, min, max ) {
		const step = this.#opt.step;
		const cut = Math.max( min, Math.min( n, max ) );

		return +( Math.round( cut / step ) * step ).toFixed( 5 );
	}

	// .........................................................................
	#createDotElement( id ) {
		const el = GSUI.$createElement( "div", { class: "gsuiDotline-dot", "data-id": id } );

		this.#dotsId = Math.max( this.#dotsId, id );
		this.#data[ id ] = Object.seal( { x: 0, y: 0 } );
		this.#dots[ id ] = el;
		this.append( el );
	}
	#updateDotElement( id, x, y ) {
		const opt = this.#opt;
		const dat = this.#data[ id ];
		const dot = this.#dots[ id ];

		dat.x = x;
		dat.y = y;
		dot.style.left = `${ ( x - opt.minX ) / opt.width * 100 }%`;
		dot.style.top = `${ 100 - ( ( y - opt.minY ) / opt.height * 100 ) }%`;
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
	#onresize( w, h ) {
		this.#svgW = w;
		this.#svgH = h;
		GSUI.$setAttribute( this.#elements.svg, "viewBox", `0 0 ${ w } ${ h }` );
		this.#drawPolyline();
	}
	#onpointerdown( e ) {
		let id = e.target.dataset.id;

		GSUI.$unselectText();
		this.setPointerCapture( e.pointerId );
		this.#dataSaved = GSUI.$jsonCopy( this.#data );
		this.#mousebtn = e.button;
		this.onpointerup = this.#onpointerupDot.bind( this );
		this.onpointermove = this.#onpointermoveDot.bind( this );
		if ( e.button === 2 ) {
			if ( id ) {
				this.#deleteDotElement( id );
				this.#drawPolyline();
			}
		} else if ( e.button === 0 ) {
			let isAfter = false;
			let prevDot;

			if ( !id ) {
				id = `${ this.#dotsId + 1 }`;
				this.#createDotElement( id );
				this.#updateDotElement( id, this.#getPtrX( e ), this.#getPtrY( e ) );
				this.#drawPolyline();
			}
			this.#selectDotElement( id, true );
			this.#pageX = e.pageX;
			this.#pageY = e.pageY;
			if ( !GSUI.$hasAttribute( this, "movelinked" ) ) {
				const dat = this.#data[ id ];

				this.#dotsMoving = [ { id, x: dat.x, y: dat.y } ];
				this.#dotMaxX = dat.x;
				this.#dotMaxY = dat.y;
				this.#dotMinX = dat.x;
				this.#dotMinY = dat.y;
			} else {
				this.#dotMaxX =
				this.#dotMaxY = -Infinity;
				this.#dotMinX =
				this.#dotMinY = Infinity;
				this.#dotsMoving = Object.entries( this.#data )
					.sort( ( a, b ) => this.#sortDots( a[ 1 ], b[ 1 ] ) )
					.filter( ( [ dId, d ], i, arr ) => {
						isAfter = isAfter || dId === id;
						if ( isAfter ) {
							this.#dotMaxX = Math.max( d.x, this.#dotMaxX );
							this.#dotMaxY = Math.max( d.y, this.#dotMaxY );
							this.#dotMinX = Math.min( d.x, this.#dotMinX );
							this.#dotMinY = Math.min( d.y, this.#dotMinY );
						}
						if ( arr[ i + 1 ]?.[ 0 ] === id ) {
							prevDot = d;
						}
						return isAfter;
					} ).map( ( [ dId, d ] ) => ( { id: dId, x: d.x, y: d.y } ) );
				if ( prevDot ) {
					this.#dotMinX -= prevDot.x;
				}
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
		if ( this.#mousebtn === 0 ) {
			const opt = this.#opt;
			let incX = opt.width / this.clientWidth * ( e.pageX - this.#pageX );
			let incY = opt.height / this.clientHeight * -( e.pageY - this.#pageY );

			if ( incX ) {
				incX = incX < 0
					? Math.max( incX, opt.minX - this.#dotMinX )
					: Math.min( incX, opt.maxX - this.#dotMaxX );
			}
			if ( incY ) {
				incY = incY < 0
					? Math.max( incY, opt.minY - this.#dotMinY )
					: Math.min( incY, opt.maxY - this.#dotMaxY );
			}
			this.#dotsMoving.forEach( d => {
				this.#updateDotElement( d.id,
					this.#epureNb( d.x + incX, opt.minX, opt.maxX ),
					this.#epureNb( d.y + incY, opt.minY, opt.maxY ) );
			} );
			this.#drawPolyline();
		}
	}
}

Object.freeze( gsuiDotline );
customElements.define( "gsui-dotline", gsuiDotline );
