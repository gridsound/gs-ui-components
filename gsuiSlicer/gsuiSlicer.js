"use strict";

class gsuiSlicer extends HTMLElement {
	static #resW = 1000
	static #resH = 64

	#dur = 4
	#slices = new Map()
	#buffer = null
	#cropSide = "A"
	#cropSave = null
	#slicesWidth = 100
	#slicesHeight = 100
	#onresizeBind = this.#onresize.bind( this )
	#onmouseupCropBind = this.#onmouseupCrop.bind( this )
	#onmousemoveCropBind = this.#onmousemoveCrop.bind( this )
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
		arrowA: ".gsuiSlicer-cropArrows-arrowA",
		arrowB: ".gsuiSlicer-cropArrows-arrowB",
		arrowZ: ".gsuiSlicer-cropArrows-arrowZ",
		diagonalLine: ".gsuiSlicer-slices-line",
		preview: ".gsuiSlicer-preview",
		slices: ".gsuiSlicer-slices-wrap",
		inputDuration: ".gsuiSlicer-duration-input",
	} )

	constructor() {
		const defs = document.querySelector( "#gsuiSlicer-waveDefs defs" );

		super();
		Object.seal( this );

		this.#elements.inputDuration.onchange = this.#onchangeDuration.bind( this );
		this.#elements.srcSample.onmousedown = this.#onmousedownCrop.bind( this );
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
	}

	// .........................................................................
	connectedCallback() {
		if ( this.#children ) {
			this.append( ...this.#children );
			this.#children = null;
			GSUI.recallAttributes( this, {
				cropa: 0,
				cropb: 1,
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
		return [ "duration", "timedivision", "cropa", "cropb" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( !this.#children && prev !== val ) {
			switch ( prop ) {
				case "timedivision":
					this.#elements.beatlines[ 0 ].setAttribute( "timedivision", val );
					this.#elements.beatlines[ 1 ].setAttribute( "timedivision", val );
					break;
				case "cropa":
 					this.#elements.cropA.style.left = `${ val * 100 }%`;
 					this.#elements.arrowA.style.width = `${ val * 100 }%`;
 					this.#elements.arrowZ.style.left = `${ val * 100 }%`;
 					this.#elements.arrowZ.style.width = `${ ( 1 - ( 1 - this.getAttribute( "cropb" ) ) - val ) * 100 }%`;
 					this.#updateCroppedWaveform();
					break;
				case "cropb":
 					this.#elements.cropB.style.left = `${ val * 100 }%`;
 					this.#elements.arrowB.style.width = `${ ( 1 - val ) * 100 }%`;
 					this.#elements.arrowZ.style.width = `${ ( val - this.getAttribute( "cropa" ) ) * 100 }%`;
 					this.#updateCroppedWaveform();
					break;
				case "duration":
					this.#elements.inputDuration.value =
					this.#dur = +val;
					this.#updatePxPerBeat();
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

		svg.firstChild.setAttributeNS( "http://www.w3.org/1999/xlink", "href", `#${ this.#waveDef.id }` );
		this.#slices.set( id, [ svg, sli ] );
		this.changeSlice( id, obj );
		this.#elements.preview.append( svg );
		this.#elements.slices.append( sli );
	}
	changeSlice( id, obj ) {
		const [ svg, sli ] = this.#slices.get( id ),
			x = obj.x ?? +sli.dataset.x,
			y = obj.y ?? +sli.dataset.y,
			w = obj.w ?? +sli.dataset.w;

		if ( "x" in obj || "w" in obj ) {
			svg.style.left =
			sli.style.left = `${ x * 100 }%`;
			svg.style.width =
			sli.style.width = `${ w * 100 }%`;
		}
		if ( "y" in obj ) {
			sli.style.height = `${ ( 1 - y ) * 100 }%`;
		}
		svg.setAttribute( "viewBox", `${ ( x - ( x - y ) ) * gsuiSlicer.#resW } 0 ${ w * gsuiSlicer.#resW } ${ gsuiSlicer.#resH }` );
	}
	deleteSlice( id ) {
		const arr = this.#slices.get( id );

		if ( arr ) {
			this.#slices.delete( id );
			arr[ 0 ].remove();
			arr[ 1 ].remove();
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
		this.#elements.beatlines[ 0 ].setAttribute( "pxperbeat", this.#slicesWidth / ( dur || this.#dur ) );
		this.#elements.beatlines[ 1 ].setAttribute( "pxperbeat", this.#slicesHeight / ( dur || this.#dur ) );
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
	#onmousedownCrop( e ) {
		GSUI.unselectText();
		GSUI.dragshield.show( "pointer" );
		document.addEventListener( "mousemove", this.#onmousemoveCropBind );
		document.addEventListener( "mouseup", this.#onmouseupCropBind );
		this.#cropSide = this.#updateCropSide( e.pageX );
		this.#cropSave = this.getAttribute( this.#cropSide );
		this.#onmousemoveCrop( e );
	}
	#onmousemoveCrop( e ) {
		GSUI.setAttribute( this, this.#cropSide, this.#getPercMouseX( e.pageX ) );
	}
	#onmouseupCrop( e ) {
		const val = this.getAttribute( this.#cropSide );

		document.removeEventListener( "mousemove", this.#onmousemoveCropBind );
		document.removeEventListener( "mouseup", this.#onmouseupCropBind );
		GSUI.dragshield.hide();
		if ( this.#cropSave !== val ) {
			this.#dispatch( this.#cropSide === "cropa" ? "cropA" : "cropB", +val );
		}
	}
}

customElements.define( "gsui-slicer", gsuiSlicer );

Object.freeze( gsuiSlicer );
