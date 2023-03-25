"use strict";

class gsuiDotline extends HTMLElement {
	#dispatch = GSUI.$dispatchEvent.bind( null, this, "gsuiDotline" );
	#data = {};
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
	#rootBCR = null;
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
		this.#onresize();
	}
	disconnectedCallback() {
		GSUI.$unobserveSizeOf( this, this.#onresizeBind );
	}
	// static get observedAttributes() {
	// 	return [ "movelinked" ];
	// }
	// attributeChangedCallback( prop, prev, val ) {
	// 	if ( !this.#children && prev !== val ) {
	// 		switch ( prop ) {
	// 			case "movelinked":
	// 				this.#elements.name.textContent = val;
	// 				break;
	// 		}
	// 	}
	// }

	// .........................................................................
	options( obj ) {
		const opt = this.#opt;

		Object.assign( opt, obj );
		if ( this.#optionsRedrawNeeded( obj ) ) {
			opt.width = opt.maxX - opt.minX;
			opt.height = opt.maxY - opt.minY;
			this.#drawPolyline();
			Object.values( this.#dots ).forEach( d => {
				this.#updateDotElement( d.id, d.x, d.y );
			} );
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
				const dot = this.#data[ id ];
				const xs = opt.x;
				const ys = opt.y;
				const x = xs in diffDot ? this.#epureNb( diffDot[ xs ], opt.minX, opt.maxX ) : dot ? dot.x : 0;
				const y = ys in diffDot ? this.#epureNb( diffDot[ ys ], opt.minY, opt.maxY ) : dot ? dot.y : 0;

				if ( dot ) {
					this.#updateDotElement( id, x, y );
				} else {
					this.#data[ id ] = { x, y };
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
	#updateBCR() {
		return this.#rootBCR = this.getBoundingClientRect();
	}
	#sortDots( a, b ) {
		return a.x - b.x;
	}
	#drawPolyline() {
		const arr = [];
		const dots = Object.values( this.#dots ).sort( this.#sortDots );
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
		dots.forEach( dot => {
			arr.push(
				( dot.x - minX ) / width * svgW,
				svgH - ( dot.y - minY ) / height * svgH
			);
		} );
		if ( lastDotLinked !== null ) {
			arr.push( svgW, svgH - ( lastDotLinked - minY ) / height * svgH );
		}
		GSUI.$setAttribute( this.#elements.polyline, "points", arr.join( " " ) );
	}
	#onchange() {
		const obj = {};
		const data = this.#data;
		let diff;

		Object.entries( data ).forEach( ( [ id, { x, y } ] ) => {
			const newDot = this.#dots[ id ];

			if ( !newDot ) {
				diff = true;
				obj[ id ] = undefined;
				delete data[ id ];
			} else {
				const { x: nx, y: ny } = newDot;

				if ( nx !== x || ny !== y ) {
					const objDot = {};

					diff = true;
					obj[ id ] = objDot;
					if ( nx !== x ) { data[ id ].x = objDot[ this.#opt.x ] = nx; }
					if ( ny !== y ) { data[ id ].y = objDot[ this.#opt.y ] = ny; }
				}
			}
		} );
		Object.values( this.#dots ).forEach( ( { id, x, y } ) => {
			const oldDot = data[ id ];

			if ( !oldDot ) {
				diff = true;
				data[ id ] = { x, y };
				obj[ id ] = {
					[ this.#opt.x ]: x,
					[ this.#opt.y ]: y,
				};
			}
		} );
		if ( diff ) {
			this.#dispatch( "change", obj );
		}
	}

	// .........................................................................
	#epurePageX( px ) {
		const o = this.#opt;
		const r = this.#rootBCR;

		return ( px - r.left - window.scrollX ) / r.width * o.width + o.minX;
	}
	#epurePageY( py ) {
		const o = this.#opt;
		const r = this.#rootBCR;

		return o.height - ( py - r.top - window.scrollY ) / r.height * o.height + o.minY;
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
		this.append( el );
		return this.#dots[ id ] = { id, element: el, x: 0, y: 0 };
	}
	#updateDotElement( id, x, y ) {
		const opt = this.#opt;
		const dot = this.#dots[ id ];

		dot.x = x;
		dot.y = y;
		dot.element.style.left = `${ ( x - opt.minX ) / opt.width * 100 }%`;
		dot.element.style.top = `${ 100 - ( ( y - opt.minY ) / opt.height * 100 ) }%`;
	}
	#deleteDotElement( id ) {
		this.#dots[ id ].element.remove();
		delete this.#dots[ id ];
	}
	#selectDotElement( id, b ) {
		const dot = this.#dots[ id ];

		this.#activeDot = b ? dot : null;
		dot.element.classList.toggle( "gsuiDotline-dotSelected", b );
	}

	// .........................................................................
	#onresize() {
		const { width: w, height: h } = this.#updateBCR();

		this.#svgW = w;
		this.#svgH = h;
		GSUI.$setAttribute( this.#elements.svg, "viewBox", `0 0 ${ w } ${ h }` );
		this.#drawPolyline();
	}
	#onpointerdown( e ) {
		let id = e.target.dataset.id;

		GSUI.$unselectText();
		this.setPointerCapture( e.pointerId );
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
			let dot;
			let prevDot;

			this.#updateBCR();
			if ( id ) {
				dot = this.#dots[ id ];
			} else {
				const x = this.#epurePageX( e.pageX );
				const y = this.#epurePageY( e.pageY );

				id = this.#dotsId + 1;
				dot = this.#createDotElement( id );
				this.#updateDotElement( id, x, y );
				this.#drawPolyline();
			}
			this.#selectDotElement( id, true );
			this.#pageX = e.pageX;
			this.#pageY = e.pageY;
			if ( !GSUI.$hasAttribute( this, "movelinked" ) ) {
				this.#dotsMoving = [ dot ];
				this.#dotMaxX = dot.x;
				this.#dotMaxY = dot.y;
				this.#dotMinX = dot.x;
				this.#dotMinY = dot.y;
			} else {
				this.#dotMaxX =
				this.#dotMaxY = -Infinity;
				this.#dotMinX =
				this.#dotMinY = Infinity;
				this.#dotsMoving = Object.values( this.#dots )
					.sort( this.#sortDots )
					.filter( ( d, i, arr ) => {
						isAfter = isAfter || d === dot;
						if ( isAfter ) {
							this.#dotMaxX = Math.max( d.x, this.#dotMaxX );
							this.#dotMaxY = Math.max( d.y, this.#dotMaxY );
							this.#dotMinX = Math.min( d.x, this.#dotMinX );
							this.#dotMinY = Math.min( d.y, this.#dotMinY );
						}
						if ( arr[ i + 1 ] === dot ) {
							prevDot = d;
						}
						return isAfter;
					} );
				if ( prevDot ) {
					this.#dotMinX -= prevDot.x;
				}
			}
			this.#dotsMoving.forEach( dot => {
				dot._saveX = dot.x;
				dot._saveY = dot.y;
			} );
		}
	}
	#onpointerupDot( e ) {
		if ( this.#activeDot ) {
			this.#selectDotElement( this.#activeDot.id, false );
		}
		this.releasePointerCapture( e.pointerId );
		this.onpointermove = null;
		this.onpointerup = null;
		this.#dotsMoving.forEach( dot => {
			delete dot._saveX;
			delete dot._saveY;
		} );
		this.#dotsMoving.length = 0;
		this.#onchange();
	}
	#onpointermoveDot( e ) {
		if ( this.#mousebtn === 0 ) {
			const opt = this.#opt;
			let incX = opt.width / this.#rootBCR.width * ( e.pageX - this.#pageX );
			let incY = opt.height / this.#rootBCR.height * -( e.pageY - this.#pageY );

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
			this.#dotsMoving.forEach( dot => {
				const id = dot.id;
				const x = this.#epureNb( dot._saveX + incX, opt.minX, opt.maxX );
				const y = this.#epureNb( dot._saveY + incY, opt.minY, opt.maxY );

				this.#updateDotElement( id, x, y );
			} );
			this.#drawPolyline();
		}
	}
}

Object.freeze( gsuiDotline );
customElements.define( "gsui-dotline", gsuiDotline );
