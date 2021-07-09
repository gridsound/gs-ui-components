"use strict";

class gsuiSlicer extends HTMLElement {
	static #resW = 1000
	static #resH = 64

	#dur = 4
	#slices = {}
	#buffer = null
	#cropSide = "A"
	#cropSave = null
	#slicesTop = 0
	#slicesLeft = 0
	#slicesWidth = 100
	#slicesHeight = 100
	#stepsPerBeat = 4
	#slicesMaxId = 0
	#slicesSaved = null
	#sliceIdBefore = null
	#onresizeBind = this.#onresize.bind( this )
	#dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiSlicer" )
	#children = GSUI.getTemplate( "gsui-slicer" )
	#waveDef = GSUI.createElementNS( "polyline" )
	#elements = GSUI.findElements( this.#children, {
		beatlines: [
			"gsui-beatlines:first-child",
			"gsui-beatlines:last-child",
		],
		srcSample: ".gsuiSlicer-source-sample",
		srcName: ".gsuiSlicer-source-name",
		srcWave: ".gsuiSlicer-source-wave",
		cropA: ".gsuiSlicer-source-cropA",
		cropB: ".gsuiSlicer-source-cropB",
		diagonalLine: ".gsuiSlicer-slices-line",
		preview: ".gsuiSlicer-preview",
		slices: ".gsuiSlicer-slices-wrap",
		inputDuration: ".gsuiSlicer-duration-input",
		stepBtn: ".gsuiSlicer-step",
	} )

	constructor() {
		const defs = document.querySelector( "#gsuiSlicer-waveDefs defs" );

		super();
		Object.seal( this );

		if ( !defs ) {
			document.body.prepend( GSUI.createElementNS( "svg", { id: "gsuiSlicer-waveDefs" },
				GSUI.createElementNS( "defs" ),
			) );
			this.#waveDef.dataset.id = 1;
		} else {
			this.#waveDef.dataset.id = 1 + Array.prototype.reduce.call( defs.children,
				( max, p ) => Math.max( max, p.dataset.id ), 0 );
		}
		this.#waveDef.id = `gsuiSlicer-waveDef-${ this.#waveDef.dataset.id }`;
		this.#elements.srcSample.onpointerdown = this.#onpointerdownCrop.bind( this );
		this.#elements.slices.oncontextmenu = () => false;
		this.#elements.slices.onpointerdown = this.#onpointerdownSlices.bind( this );
		this.#elements.slices.ondblclick = this.#ondblclickSlices.bind( this );
		this.#elements.inputDuration.onchange = this.#onchangeDuration.bind( this );
		this.#elements.stepBtn.onclick = this.#onclickStep.bind( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( this.#children ) {
			this.append( ...this.#children );
			this.#children = null;
			GSUI.recallAttributes( this, {
				cropa: 0,
				cropb: 1,
				step: 1,
				duration: 4,
				timedivision: "4/4",
			} );
		}
		document.querySelector( "#gsuiSlicer-waveDefs defs" ).append( this.#waveDef );
		GSUI.observeSizeOf( this, this.#onresizeBind );
	}
	disconnectedCallback() {
		this.#waveDef.remove();
		GSUI.unobserveSizeOf( this, this.#onresizeBind );
	}
	static get observedAttributes() {
		return [ "duration", "step", "timedivision", "cropa", "cropb" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this.#children && prev !== val ) {
			switch ( prop ) {
				case "timedivision":
					this.#stepsPerBeat = +val.split( "/" )[ 1 ];
					GSUI.setAttribute( this.#elements.beatlines[ 0 ], "timedivision", val );
					GSUI.setAttribute( this.#elements.beatlines[ 1 ], "timedivision", val );
					break;
				case "cropa":
 					this.#elements.cropA.style.left = `${ val * 100 }%`;
 					this.#updateCroppedWaveform();
					break;
				case "cropb":
 					this.#elements.cropB.style.left = `${ val * 100 }%`;
 					this.#updateCroppedWaveform();
					break;
				case "duration":
					this.#elements.inputDuration.value =
					this.#dur = +val;
					this.#updatePxPerBeat();
					break;
				case "step":
					this.#elements.stepBtn.firstChild.textContent = this.#convertStepToFrac( +val );
					break;
			}
		}
	}

	// .........................................................................
	setBufferName( name ) {
		this.#elements.srcName.textContent = name;
	}
	setBuffer( buf ) {
		this.#buffer = buf;
		this.#updateCroppedWaveform();
		gsuiWaveform.drawBuffer( this.#elements.srcWave.firstChild, gsuiSlicer.#resW, gsuiSlicer.#resH, buf );
	}
	addSlice( id, obj ) {
		const svg = GSUI.createElementNS( "svg", { class: "gsuiSlicer-preview-wave", "data-id": id, preserveAspectRatio: "none" },
				GSUI.createElementNS( "use" ),
			),
			sli = GSUI.createElement( "div", { class: "gsuiSlicer-slices-slice", "data-id": id } );

		this.#slicesMaxId = Math.max( this.#slicesMaxId, id );
		svg.firstChild.setAttributeNS( "http://www.w3.org/1999/xlink", "href", `#${ this.#waveDef.id }` );
		this.#slices[ id ] = Object.seal( { id, svg, sli, x: 0, y: 0, w: 0 } );
		this.changeSlice( id, obj );
		this.#elements.preview.append( svg );
		this.#elements.slices.append( sli );
	}
	changeSlice( id, obj ) {
		const sli = this.#slices[ id ],
			x = +( obj.x ?? sli.x ).toFixed( 10 ),
			y = +( obj.y ?? sli.y ).toFixed( 10 ),
			w = +( obj.w ?? sli.w ).toFixed( 10 );

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
		sli.svg.setAttribute( "viewBox", `${ ( x - ( x - y ) ) * gsuiSlicer.#resW } 0 ${ w * gsuiSlicer.#resW } ${ gsuiSlicer.#resH }` );
	}
	deleteSlice( id ) {
		const sli = this.#slices[ id ];

		if ( sli ) {
			delete this.#slices[ id ];
			sli.svg.remove();
			sli.sli.remove();
			if ( id === this.#slicesMaxId ) {
				this.#slicesMaxId = Object.keys( this.#slices )
					.reduce( ( max, k ) => Math.max( max, k ), 0 );
			}
		}
	}

	// .........................................................................
	#updateCroppedWaveform() {
		if ( this.#buffer ) {
			const cropa = this.#buffer.duration * this.getAttribute( "cropa" ),
				cropb = this.#buffer.duration * this.getAttribute( "cropb" );

			gsuiWaveform.drawBuffer( this.#waveDef, gsuiSlicer.#resW, gsuiSlicer.#resH, this.#buffer, cropa, cropb - cropa );
		}
	}
	#updatePxPerBeat( dur ) {
		GSUI.setAttribute( this.#elements.beatlines[ 0 ], "pxperbeat", this.#slicesWidth / ( dur || this.#dur ) );
		GSUI.setAttribute( this.#elements.beatlines[ 1 ], "pxperbeat", this.#slicesHeight / ( dur || this.#dur ) );
	}
	#getPercMouseX( pageX ) {
		const bcr = this.#elements.srcSample.getBoundingClientRect();

		return GSUI.clamp( +( ( pageX - bcr.left ) / bcr.width ).toFixed( 3 ), 0, 1 );
	}
	#updateCropSide( pageX ) {
		const perc = this.#getPercMouseX( pageX ),
			percA = +this.getAttribute( "cropa" ),
			percB = +this.getAttribute( "cropb" ),
			ave = ( percB - percA ) / 2;

		return perc < percA + ave ? "cropa" : "cropb";
	}
	#convertStepToFrac( step ) {
		return (
			step >= 1 ? "1" :
			step >= .5 ? "1 / 2" :
			step >= .25 ? "1 / 4" : "1 / 8"
		);
	}
	#getSliceByPageX( pageX ) {
		const x = GSUI.clamp( ( pageX - this.#slicesLeft ) / this.#slicesWidth, 0, .9999 );

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
		const svg = this.#elements.diagonalLine,
			{ width: w, height: h } = svg.getBoundingClientRect();

		this.#slicesWidth = w;
		this.#slicesHeight = h;
		GSUI.setAttribute( svg, "viewBox", `0 0 ${ w } ${ h }` );
		GSUI.setAttribute( svg.firstChild, "x2", w );
		GSUI.setAttribute( svg.firstChild, "y2", h );
		this.#updatePxPerBeat();
	}
	#onchangeDuration( e ) {
		const dur = +e.target.value;

		GSUI.setAttribute( this, "duration", dur );
		this.#dispatch( "changeDuration", dur );
	}
	#onclickStep() {
		const v = +this.getAttribute( "step" ),
			frac =
				v >= 1 ? 2 :
				v >= .5 ? 4 :
				v >= .25 ? 8 : 1;

		GSUI.setAttribute( this, "step", 1 / frac );
	}
	#onpointerdownCrop( e ) {
		GSUI.unselectText();
		this.#elements.srcSample.setPointerCapture( e.pointerId );
		this.#elements.srcSample.onpointermove = this.#onpointermoveCrop.bind( this );
		this.#elements.srcSample.onpointerup = this.#onpointerupCrop.bind( this );
		this.#cropSide = this.#updateCropSide( e.pageX );
		this.#cropSave = this.getAttribute( this.#cropSide );
		this.#onpointermoveCrop( e );
	}
	#onpointermoveCrop( e ) {
		GSUI.setAttribute( this, this.#cropSide, this.#getPercMouseX( e.pageX ) );
	}
	#onpointerupCrop( e ) {
		const val = this.getAttribute( this.#cropSide );

		this.#elements.srcSample.releasePointerCapture( e.pointerId );
		this.#elements.srcSample.onpointermove =
		this.#elements.srcSample.onpointerup = null;
		if ( this.#cropSave !== val ) {
			this.#dispatch( this.#cropSide === "cropa" ? "cropA" : "cropB", +val );
		}
	}
	#ondblclickSlices( e ) {
		const sli = this.#getSliceByPageX( e.pageX ),
			w2 = sli.w / 2,
			w2obj = { w: w2 },
			newId = this.#slicesMaxId + 1,
			newSli = {
				x: sli.x + w2,
				y: sli.y,
				w: w2,
			};

		this.changeSlice( sli.id, w2obj );
		this.addSlice( newId, newSli );
		this.#dispatch( "changeSlices", {
			[ sli.id ]: w2obj,
			[ newId ]: newSli,
		} );
	}
	#onpointerdownSlices( e ) {
		const bcr = this.#elements.diagonalLine.getBoundingClientRect();

		GSUI.unselectText();
		this.#slicesSaved = this.#copySlicesData();
		this.#slicesTop = bcr.top;
		this.#slicesLeft = bcr.left;
		this.#elements.slices.setPointerCapture( e.pointerId );
		if ( e.button === 0 || e.button === 2 ) {
			this.#elements.slices.onpointerup = this.#onpointerupSlices.bind( this );
			this.#elements.slices.onpointermove = e.button === 0
				? this.#onpointermoveSlicesY.bind( this )
				: this.#onpointermoveSlicesMerge.bind( this );
		}
	}
	#onpointerupSlices( e ) {
		const diff = GSUI.diffObjects( this.#slicesSaved, this.#copySlicesData() );

		this.#elements.slices.releasePointerCapture( e.pointerId );
		this.#elements.slices.onpointermove =
		this.#elements.slices.onpointerup =
		this.#sliceIdBefore =
		this.#slicesSaved = null;
		if ( diff ) {
			this.#dispatch( "changeSlices", diff );
		}
	}
	#onpointermoveSlicesY( e ) {
		const dur = +this.getAttribute( "duration" ),
			step = +this.getAttribute( "step" ),
			yyy = GSUI.clamp( ( e.pageY - this.#slicesTop ) / this.#slicesHeight, 0, 1 ),
			yy = Math.floor( yyy * dur * this.#stepsPerBeat / step ) * step,
			y = yy / dur / this.#stepsPerBeat,
			sli = this.#getSliceByPageX( e.pageX );

		if ( sli.y !== y ) {
			this.changeSlice( sli.id, { y } );
		}
	}
	#onpointermoveSlicesMerge( e ) {
		const sli = this.#getSliceByPageX( e.pageX ),
			idBef = this.#sliceIdBefore;

		if ( idBef === null ) {
			this.#sliceIdBefore = sli.id;
		} else if ( sli.id !== idBef ) {
			const bef = this.#slices[ idBef ],
				xa = Math.min( bef.x, sli.x ),
				xb = Math.max( bef.x, sli.x ),
				list = Object.values( this.#slices ).filter( s => xa <= s.x && s.x <= xb ),
				first = list.reduce( ( min, s ) => min.x < s.x ? min : s );

			this.#sliceIdBefore = first.id;
			this.changeSlice( first.id, { w: list.reduce( ( w, s ) => w + s.w, 0 ) } );
			list.forEach( sli => {
				if ( sli.id !== first.id ) {
					this.deleteSlice( sli.id );
				}
			} );
		}
	}
}

customElements.define( "gsui-slicer", gsuiSlicer );

Object.freeze( gsuiSlicer );
