"use strict";

class gsuiSlicer extends HTMLElement {
	static #resW = 1000;
	static #resH = 64;

	#dur = 4;
	#tool = "";
	#slices = {};
	#buffer = null;
	#ptrmoveFn = null;
	#stepsPerBeat = 4;
	#slicesMaxId = 0;
	#slicesSaved = null;
	#slicesSplitted = null;
	#sliceIdBefore = null;
	#sliceCurrentTime = null;
	#onresizeBind = this.#onresize.bind( this );
	#dispatch = GSUI.$dispatchEvent.bind( null, this, "gsuiSlicer" );
	#children = GSUI.$getTemplate( "gsui-slicer" );
	#waveDef = GSUI.$createElementSVG( "polyline" );
	#elements = GSUI.$findElements( this.#children, {
		sourceCurrentTime: ".gsuiSlicer-source-currentTime",
		slicesCurrentTime: ".gsuiSlicer-slices-currentTime",
		previewCurrentTime: ".gsuiSlicer-preview-currentTime",
		beatlines: [
			"gsui-beatlines:first-child",
			"gsui-beatlines:last-child",
		],
		srcName: ".gsuiSlicer-source-name",
		srcWave: ".gsuiSlicer-source-wave",
		diagonalLine: ".gsuiSlicer-slices-line",
		timeline: "gsui-timeline",
		preview: ".gsuiSlicer-preview",
		slices: ".gsuiSlicer-slices-wrap",
		step: ".gsuiSlicer-btn-step",
		tools: {
			moveY: ".gsuiSlicer-btn[data-action='moveY']",
			reset: ".gsuiSlicer-btn[data-action='reset']",
			split: ".gsuiSlicer-btn[data-action='split']",
			merge: ".gsuiSlicer-btn[data-action='merge']",
		},
	} );
	timeline = this.#elements.timeline;

	constructor() {
		const defs = document.querySelector( "#gsuiSlicer-waveDefs defs" );

		super();
		Object.seal( this );

		if ( !defs ) {
			document.body.prepend( GSUI.$createElementSVG( "svg", { id: "gsuiSlicer-waveDefs" },
				GSUI.$createElementSVG( "defs" ),
			) );
			this.#waveDef.dataset.id = 1;
		} else {
			this.#waveDef.dataset.id = 1 + Array.prototype.reduce.call( defs.children,
				( max, p ) => Math.max( max, p.dataset.id ), 0 );
		}
		this.#waveDef.id = `gsuiSlicer-waveDef-${ this.#waveDef.dataset.id }`;
		this.#elements.slices.oncontextmenu = () => false;
		this.#elements.slices.onpointerdown = this.#onpointerdownSlices.bind( this );
		this.#elements.step.onclick = this.#onclickStep.bind( this );
		this.#elements.tools.moveY.onclick =
		this.#elements.tools.reset.onclick =
		this.#elements.tools.split.onclick =
		this.#elements.tools.merge.onclick = this.#onclickTools.bind( this );
		this.ondrop = e => {
			const patId = e.dataTransfer.getData( "pattern-buffer" );

			if ( patId && GSUI.$getAttribute( this, "disabled" ) === null ) {
				this.#dispatch( "dropBuffer", patId );
			}
		};
		GSUI.$listenEvents( this, {
			gsuiTimeline: {
				changeCurrentTime: d => {
					GSUI.$setAttribute( this, "currenttime", d.args[ 0 ] );
					return true;
				},
			},
		} );
	}

	// .........................................................................
	connectedCallback() {
		if ( this.#children ) {
			GSUI.$setAttribute( this, "tabindex", -1 );
			this.append( ...this.#children );
			this.#children = null;
			GSUI.$recallAttributes( this, {
				currenttime: 0,
				step: 1,
				duration: 4,
				timedivision: "4/4",
				hidetimes: true,
			} );
			this.#selectTool( "moveY" );
		}
		document.querySelector( "#gsuiSlicer-waveDefs defs" ).append( this.#waveDef );
		GSUI.$observeSizeOf( this, this.#onresizeBind );
	}
	disconnectedCallback() {
		this.#waveDef.remove();
		GSUI.$unobserveSizeOf( this, this.#onresizeBind );
	}
	static get observedAttributes() {
		return [ "currenttime", "duration", "step", "timedivision" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this.#children && prev !== val ) {
			switch ( prop ) {
				case "timedivision":
					this.#stepsPerBeat = +val.split( "/" )[ 1 ];
					GSUI.$setAttribute( this.#elements.timeline, "timedivision", val );
					GSUI.$setAttribute( this.#elements.beatlines[ 0 ], "timedivision", val );
					GSUI.$setAttribute( this.#elements.beatlines[ 1 ], "timedivision", val );
					break;
				case "currenttime":
					this.#setCurrentTime( +val );
					break;
				case "duration":
					this.#dur = +val;
					this.#updatePxPerBeat();
					break;
				case "step":
					this.#elements.step.firstChild.textContent = this.#convertStepToFrac( +val );
					break;
			}
		}
	}

	// .........................................................................
	getSlicesData() {
		return this.#copySlicesData();
	}
	setBufferName( name ) {
		this.#elements.srcName.textContent = name;
	}
	setBuffer( buf ) {
		this.#buffer = buf || null;
		this.classList.toggle( "gsuiSlicer-loaded", this.#buffer );
		this.classList.toggle( "gsuiSlicer-missingBufferData", !this.#buffer );
		this.#setWaveform( buf );
	}
	removeBuffer() {
		this.#buffer = null;
		this.classList.remove( "gsuiSlicer-loaded" );
		this.setBufferName( "" );
		this.#setWaveform( null );
	}
	addSlice( id, obj ) {
		if ( !( id in this.#slices ) ) {
			const svg = GSUI.$createElementSVG( "svg", { class: "gsuiSlicer-preview-wave", "data-id": id, preserveAspectRatio: "none" },
				GSUI.$createElementSVG( "use" ),
			);
			const sli = GSUI.$createElement( "div", { class: "gsuiSlicer-slices-slice", "data-id": id } );

			this.#slicesMaxId = Math.max( this.#slicesMaxId, id );
			svg.firstChild.setAttributeNS( "http://www.w3.org/1999/xlink", "href", `#${ this.#waveDef.id }` );
			this.#slices[ id ] = Object.seal( { id, svg, sli, x: 0, y: 0, w: 0 } );
			this.changeSlice( id, obj );
			this.#elements.preview.append( svg );
			this.#elements.slices.append( sli );
		}
	}
	changeSlice( id, obj ) {
		const t = this.#getTimeNorm();
		const sli = this.#slices[ id ];
		const x = +( obj.x ?? sli.x ).toFixed( 10 );
		const y = +( obj.y ?? sli.y ).toFixed( 10 );
		const w = +( obj.w ?? sli.w ).toFixed( 10 );

		if ( "x" in obj || "w" in obj ) {
			sli.x = x;
			sli.w = w;
			sli.svg.style.left =
			sli.sli.style.left = `${ x * 100 }%`;
			sli.svg.style.width =
			sli.sli.style.width = `${ w * 100 }%`;
		}
		if ( "y" in obj ) {
			sli.y = y;
			sli.sli.style.height = `${ ( 1 - y ) * 100 }%`;
		}
		GSUI.$setAttribute( sli.svg, "viewBox", `${ ( x - ( x - y ) ) * gsuiSlicer.#resW } 0 ${ w * gsuiSlicer.#resW } ${ gsuiSlicer.#resH }` );
		if ( sli.x <= t && t < sli.x + sli.w ) {
			this.#highlightSlice( sli );
		}
	}
	removeSlice( id ) {
		const sli = this.#slices[ id ];

		if ( sli ) {
			delete this.#slices[ id ];
			sli.svg.remove();
			sli.sli.remove();
			if ( id === this.#slicesMaxId ) {
				this.#slicesMaxId = Object.keys( this.#slices )
					.reduce( ( max, k ) => Math.max( max, k ), 0 );
			}
			if ( sli === this.#sliceCurrentTime ) {
				this.#highlightSlice( null );
			}
		}
	}

	// .........................................................................
	#getTimeNorm() {
		return GSUI.$getAttributeNum( this, "currenttime" ) / GSUI.$getAttributeNum( this, "duration" );
	}
	#setWaveform( buf ) {
		if ( buf ) {
			gsuiWaveform.drawBuffer( this.#waveDef, gsuiSlicer.#resW, gsuiSlicer.#resH, buf );
			gsuiWaveform.drawBuffer( this.#elements.srcWave.firstChild, gsuiSlicer.#resW, gsuiSlicer.#resH, buf );
		} else {
			this.#waveDef.removeAttribute( "points" );
			this.#elements.srcWave.firstChild.removeAttribute( "points" );
		}
	}
	#setCurrentTime( beat ) {
		const t = this.#getTimeNorm();

		GSUI.$setAttribute( this.#elements.timeline, "currenttime", beat );
		this.#elements.slicesCurrentTime.style.left = `${ t * 100 }%`;
		this.#elements.previewCurrentTime.style.left = `${ t * 100 }%`;
		GSUI.$setAttribute( this, "hidetimes", t <= 0 || t >= .995 );
		this.#updateCurrentTime( t );
	}
	#updateCurrentTime( t ) {
		const sli = Object.values( this.#slices ).find( s => s.x <= t && t < s.x + s.w );
		const srcT = sli ? Math.min( sli.y + ( t - sli.x ), 1 ) : t;

		this.#elements.sourceCurrentTime.style.left = `${ srcT * 100 }%`;
		this.#highlightSlice( sli );
	}
	#highlightSlice( sli ) {
		if ( sli !== this.#sliceCurrentTime ) {
			if ( this.#sliceCurrentTime ) {
				this.#sliceCurrentTime.sli.classList.remove( "gsuiSlicer-slices-slice-hl" );
				this.#sliceCurrentTime.svg.classList.remove( "gsuiSlicer-preview-wave-hl" );
			}
			if ( sli ) {
				sli.sli.classList.add( "gsuiSlicer-slices-slice-hl" );
				sli.svg.classList.add( "gsuiSlicer-preview-wave-hl" );
			}
			this.#sliceCurrentTime = sli;
		}
	}
	#selectTool( t, change ) {
		if ( change !== false ) {
			this.#tool = t;
		}
		this.#elements.tools.moveY.classList.toggle( "gsuiSlicer-btn-toggle", t === "moveY" );
		this.#elements.tools.reset.classList.toggle( "gsuiSlicer-btn-toggle", t === "reset" );
		this.#elements.tools.merge.classList.toggle( "gsuiSlicer-btn-toggle", t === "merge" );
		this.#elements.tools.split.classList.toggle( "gsuiSlicer-btn-toggle", t === "split" );
	}
	#updatePxPerBeat( dur ) {
		GSUI.$setAttribute( this.#elements.timeline, "pxperbeat", this.#elements.slices.clientWidth / ( dur || this.#dur ) );
		GSUI.$setAttribute( this.#elements.beatlines[ 0 ], "pxperbeat", this.#elements.slices.clientWidth / ( dur || this.#dur ) );
		GSUI.$setAttribute( this.#elements.beatlines[ 1 ], "pxperbeat", this.#elements.slices.clientHeight / ( dur || this.#dur ) );
	}
	#convertStepToFrac( step ) {
		return (
			step >= 1 ? "1" :
			step >= .5 ? "1 / 2" :
			step >= .25 ? "1 / 4" : "1 / 8"
		);
	}
	#getSliceByPageX( offsetX ) {
		const x = GSUI.$clamp( offsetX / this.#elements.slices.clientWidth, 0, .9999 );

		return Object.values( this.#slices ).find( s => s.x <= x && x < s.x + s.w );
	}
	#copySlicesData() {
		return Object.values( this.#slices ).reduce( ( obj, s ) => {
			obj[ s.id ] = { x: s.x, y: s.y, w: s.w };
			return obj;
		}, {} );
	}

	// .........................................................................
	#onresize() {
		const svg = this.#elements.diagonalLine;
		const w = svg.clientWidth;
		const h = svg.clientHeight;

		GSUI.$setAttribute( svg, "viewBox", `0 0 ${ w } ${ h }` );
		GSUI.$setAttribute( svg.firstChild, "x2", w );
		GSUI.$setAttribute( svg.firstChild, "y2", h );
		this.#updatePxPerBeat();
	}
	#onclickStep() {
		const v = GSUI.$getAttributeNum( this, "step" );
		const frac =
			v >= 1 ? 2 :
			v >= .5 ? 4 :
			v >= .25 ? 8 : 1;

		GSUI.$setAttribute( this, "step", 1 / frac );
	}
	#onclickTools( e ) {
		this.#selectTool( e.target.dataset.action );
	}
	#onpointerdownSlices( e ) {
		if ( e.button === 0 || e.button === 2 ) {
			this.#ptrmoveFn = this.#tool === "reset" || e.button === 2
				? this.#onpointermoveSlicesReset.bind( this )
				: this.#tool === "moveY" && e.button === 0
					? this.#onpointermoveSlicesY.bind( this )
					: this.#tool === "split" && e.button === 0
						? this.#onpointermoveSlicesSplit.bind( this )
						: this.#tool === "merge" && e.button === 0
							? this.#onpointermoveSlicesMerge.bind( this )
							: null;
			if ( this.#ptrmoveFn ) {
				const sli = this.#getSliceByPageX( e.offsetX );

				GSUI.$unselectText();
				this.#slicesSaved = this.#copySlicesData();
				this.#elements.slices.setPointerCapture( e.pointerId );
				this.#elements.slices.onpointerup = this.#onpointerupSlices.bind( this );
				this.#elements.slices.onpointermove = this.#onpointermoveSlices.bind( this );
				this.#slicesSplitted = {};
				this.#sliceIdBefore = sli.id;
				this.#onpointermoveSlices( e );
				if ( e.button === 2 ) {
					this.#selectTool( "reset", false );
				}
			}
		}
	}
	#onpointerupSlices( e ) {
		const diff = GSUI.$diffObjects( this.#slicesSaved, this.#copySlicesData() );

		this.#elements.slices.releasePointerCapture( e.pointerId );
		this.#elements.slices.onpointermove =
		this.#elements.slices.onpointerup =
		this.#slicesSplitted =
		this.#sliceIdBefore =
		this.#slicesSaved = null;
		this.#selectTool( this.#tool );
		if ( diff ) {
			this.#dispatch( "changeProp", "slices", diff );
		}
	}
	#onpointermoveSlices( e ) {
		const sli = this.#getSliceByPageX( e.offsetX );
		const bef = this.#slices[ this.#sliceIdBefore ];
		const xa = Math.min( bef.x, sli.x );
		const xb = Math.max( bef.x, sli.x );
		const list = Object.values( this.#slices ).filter( s => xa <= s.x && s.x <= xb );
		const sliId = this.#ptrmoveFn( list, sli, e );

		this.#sliceIdBefore = sliId ?? sli.id;
	}
	#onpointermoveSlicesY( list, _sli, e ) {
		const dur = GSUI.$getAttributeNum( this, "duration" );
		const step = GSUI.$getAttributeNum( this, "step" );
		const yyy = GSUI.$clamp( e.offsetY / this.#elements.slices.clientHeight, 0, 1 );
		const yy = Math.floor( yyy * dur * this.#stepsPerBeat / step ) * step;
		const y = yy / dur / this.#stepsPerBeat;

		list.forEach( sli => {
			if ( sli.y !== y ) {
				this.changeSlice( sli.id, { y } );
			}
		} );
	}
	#onpointermoveSlicesReset( list ) {
		list.forEach( sli => {
			if ( sli.y !== sli.x ) {
				this.changeSlice( sli.id, { y: sli.x } );
			}
		} );
	}
	#onpointermoveSlicesSplit( list ) {
		list.forEach( sli => {
			if ( !( sli.id in this.#slicesSplitted ) && sli.w > 1 / 128 ) {
				const w2 = sli.w / 2;
				const newId = this.#slicesMaxId + 1;
				const newSli = {
					x: sli.x + w2,
					y: sli.y,
					w: w2,
				};

				this.#slicesSplitted[ newId ] =
				this.#slicesSplitted[ sli.id ] = true;
				this.changeSlice( sli.id, { w: w2 } );
				this.addSlice( newId, newSli );
			}
		} );
	}
	#onpointermoveSlicesMerge( list, sli ) {
		if ( sli.id !== this.#sliceIdBefore ) {
			const first = list.reduce( ( min, s ) => min.x < s.x ? min : s );

			this.changeSlice( first.id, { w: list.reduce( ( w, s ) => w + s.w, 0 ) } );
			list.forEach( sli => {
				if ( sli.id !== first.id ) {
					this.removeSlice( sli.id );
				}
			} );
			return first.id;
		}
	}
}

Object.freeze( gsuiSlicer );
customElements.define( "gsui-slicer", gsuiSlicer );
