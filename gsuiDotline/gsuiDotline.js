"use strict";

class gsuiDotline extends HTMLElement {
	#dispatch = GSUI.$dispatchEvent.bind( null, this, "gsuiDotline" );
	#data = {};
	#dataSaved = null;
	#dots = {};
	#dotsMoving = [];
	#dotsId = 0;
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
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( ...this.#children );
			this.#children = null;
			GSUI.$recallAttributes( this, {
				viewbox: "0 0 100 100",
				xstep: 1,
				ystep: 1,
			} );
		}
		GSUI.$observeSizeOf( this, this.#onresizeBind );
	}
	disconnectedCallback() {
		GSUI.$unobserveSizeOf( this, this.#onresizeBind );
	}
	static get observedAttributes() {
		return [ "viewbox" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this.#children && prev !== val ) {
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
					this.#createDotElement( id );
					this.#updateDotElement( id, diffDot.x, diffDot.y );
				}
			}
		} );
		this.#drawPolyline();
	}

	// .........................................................................
	static #sortDots( a, b ) {
		return a.x - b.x;
	}
	static #sortDots2( a, b ) {
		return a[ 1 ].x - b[ 1 ].x;
	}
	static $draw( data, svgW, svgH, w, h, xmin, ymin ) {
		const arr = [];
		const firstDotLinked = null;
		const lastDotLinked = null;

		if ( firstDotLinked !== null ) {
			arr.push( 0, svgH - ( firstDotLinked - ymin ) / h * svgH );
		}
		Object.values( data ).sort( gsuiDotline.#sortDots )
			.forEach( d => {
				arr.push(
					( d.x - xmin ) / w * svgW,
					svgH - ( d.y - ymin ) / h * svgH
				);
			} );
		if ( lastDotLinked !== null ) {
			arr.push( svgW, svgH - ( lastDotLinked - ymin ) / h * svgH );
		}
		return arr.join( " " );
	}
	#drawPolyline() {
		GSUI.$setAttribute( this.#elements.polyline, "points",
			gsuiDotline.$draw( this.#data, this.#svgW, this.#svgH, this.#w, this.#h, this.#xmin, this.#ymin ) );
	}
	#onchange() {
		const diff = GSUI.$diffObjects( this.#dataSaved, this.#data );

		if ( diff ) {
			this.#dispatch( "change", diff );
		}
	}

	// .........................................................................
	#getPtrX( e ) {
		const step = GSUI.$getAttributeNum( this, "xstep" );
		const x = e.offsetX / this.clientWidth * this.#w + this.#xmin;

		return Math.round( x / step ) * step;
	}
	#getPtrY( e ) {
		const step = GSUI.$getAttributeNum( this, "ystep" );
		const y = this.#h - e.offsetY / this.clientHeight * this.#h + this.#ymin;

		return Math.round( y / step ) * step;
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
			const xstep = GSUI.$getAttributeNum( this, "xstep" );

			if ( !id ) {
				const x = this.#getPtrX( e );
				const closest = Object.entries( this.#data )
					.find( d => Math.abs( d[ 1 ].x - x ) < xstep );

				if ( closest ) {
					id = closest[ 0 ];
				} else {
					id = `${ this.#dotsId + 1 }`;
					this.#createDotElement( id );
					this.#updateDotElement( id, x, this.#getPtrY( e ) );
					this.#drawPolyline();
				}
			}
			this.#selectDotElement( id, true );
			if ( !GSUI.$hasAttribute( this, "movelinked" ) ) {
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
		if ( this.#mousebtn === 0 ) {
			const xstep = GSUI.$getAttributeNum( this, "xstep" );
			const ystep = GSUI.$getAttributeNum( this, "ystep" );
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
