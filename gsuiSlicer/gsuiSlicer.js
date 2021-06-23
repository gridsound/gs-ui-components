"use strict";

class gsuiSlicer extends HTMLElement {
	#dur = 4
	#cropSide = "A"
	#cropSave = null
	#slicesWidth = 100
	#onresizeBind = this.#onresize.bind( this )
	#onmouseupCropBind = this.#onmouseupCrop.bind( this )
	#onmousemoveCropBind = this.#onmousemoveCrop.bind( this )
	#dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiSlicer" )
	#children = GSUI.getTemplate( "gsui-slicer" )
	#elements = GSUI.findElements( this.#children, {
		beatlines: [
			".gsuiSlicer-slices-beatlines",
			".gsuiSlicer-slices-beatlines + .gsuiSlicer-slices-beatlines",
		],
		srcSample: ".gsuiSlicer-source-sample",
		cropA: ".gsuiSlicer-source-cropA",
		cropB: ".gsuiSlicer-source-cropB",
		arrowA: ".gsuiSlicer-cropArrows-arrowA",
		arrowB: ".gsuiSlicer-cropArrows-arrowB",
		arrowZ: ".gsuiSlicer-cropArrows-arrowZ",
		diagonalLine: ".gsuiSlicer-slices-line",
		inputDuration: ".gsuiSlicer-duration-input",
	} )

	constructor() {
		super();
		Object.seal( this );

		this.#elements.inputDuration.onchange = this.#onchangeDuration.bind( this );
		this.#elements.srcSample.onmousedown = this.#onmousedownCrop.bind( this );
	}

	// .........................................................................
	connectedCallback() {
		if ( this.#children ) {
			this.classList.add( "gsuiSlicer" );
			this.append( ...this.#children );
			this.#children = null;
			GSUI.recallAttributes( this, {
				cropa: 0,
				cropb: 1,
				duration: 4,
				timedivision: "4/4",
			} );
		}
		GSUI.observeSizeOf( this, this.#onresizeBind );
	}
	disconnectedCallback() {
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
					break;
				case "cropb":
 					this.#elements.cropB.style.left = `${ val * 100 }%`;
 					this.#elements.arrowB.style.width = `${ ( 1 - val ) * 100 }%`;
 					this.#elements.arrowZ.style.width = `${ ( val - this.getAttribute( "cropa" ) ) * 100 }%`;
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
	#updatePxPerBeat( dur ) {
		this.#elements.beatlines[ 0 ].setAttribute( "pxperbeat", this.#slicesWidth / ( dur || this.#dur ) );
		this.#elements.beatlines[ 1 ].setAttribute( "pxperbeat", this.#slicesWidth / ( dur || this.#dur ) );
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
		GSUI.setAttribute( svg, "viewBox", `0 0 ${ w } ${ h }` );
		GSUI.setAttribute( svg.firstChild, "x2", w );
		GSUI.setAttribute( svg.firstChild, "y2", h );
		this.#updatePxPerBeat();
		this.#elements.beatlines[ 1 ].style.width = `${ h }px`;
		this.#elements.beatlines[ 1 ].style.height = `${ w }px`;
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
