"use strict";

class gsuiPanel extends HTMLElement {
	#pageN = 0;
	#panSz = 0;
	#elPan = null;
	#elExtend = null;
	#countFromLeft = true;

	constructor() {
		super();

		Object.seal( this );
	}

	// .........................................................................
	connectedCallback() {
		this.init();
	}

	// .........................................................................
	init() {
		if ( this.children.length === 2 ) {
			this.#elExtend = GSUI.$createElement( "div", { class: "gsuiPanel-extend" } );

			this.#elExtend.onpointerdown = this.#onpointerdownExtend.bind( this );
			this.firstElementChild.after( this.#elExtend );
		}
		this.#initPanel();
		this.#elExtend.dataset.axis = this.#isAxisX() ? "x" : "y";
		if ( this.children.length > 0 ) {
			this.#elPan.style.width = "";
			this.#elPan.style.height = "";
		}
	}

	// .........................................................................
	#isAxisX() {
		return this.#elExtend.clientWidth < this.#elExtend.clientHeight;
	}
	#initPanel() {
		this.#elPan = getComputedStyle( this.lastElementChild ).flexBasis === "auto"
			? this.lastElementChild
			: this.firstElementChild;
		this.#countFromLeft = this.#elPan === this.firstElementChild;
	}
	#onpointerdownExtend( e ) {
		const dirX = this.#isAxisX();
		const pan = this.#elPan;

		GSUI.$unselectText();
		this.#pageN = dirX ? e.pageX : e.pageY;
		this.#panSz = dirX ? pan.clientWidth : pan.clientHeight;
		this.setPointerCapture( e.pointerId );
		this.onpointerup = this.#onpointerup.bind( this );
		this.onpointermove = this.#onpointermove.bind( this );
		document.body.style.cursor = dirX ? "ew-resize" : "ns-resize";
	}
	#onpointermove( e ) {
		const dirX = this.#isAxisX();
		const px = ( dirX ? e.pageX : e.pageY ) - this.#pageN;
		const panSt = this.#elPan.style;
		const newSz = `${ this.#panSz + px * ( this.#countFromLeft ? 1 : -1 ) }px`;

		if ( dirX ) {
			panSt.width = newSz;
		} else {
			panSt.height = newSz;
		}
	}
	#onpointerup( e ) {
		const dirX = this.#isAxisX();
		const pan = this.#elPan;
		const panSz = dirX ? pan.clientWidth : pan.clientHeight;
		const parSz = dirX ? this.clientWidth : this.clientHeight;
		const newSz = `${ panSz / parSz * 100 }%`;

		this.releasePointerCapture( e.pointerId );
		this.onpointermove =
		this.onpointerup = null;
		if ( dirX ) {
			pan.style.width = newSz;
		} else {
			pan.style.height = newSz;
		}
		document.body.style.cursor = "";
	}
}

Object.freeze( gsuiPanel );
customElements.define( "gsui-panel", gsuiPanel );
