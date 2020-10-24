"use strict";

class gsuiClock extends HTMLElement {
	constructor() {
		const children = GSUI.getTemplate( "gsui-clock" ),
			elModes = children[ 1 ];

		super();
		this._children = children;
		this.onchangeDisplay = () => {};
		this._attached = false;
		this._wrapRel = children[ 0 ];
		this._wrapAbs = children[ 0 ].firstChild;
		this._timeSave = 0;
		this._firstValueLen = -1;
		this._values = [ -1, -1, -1 ];
		this._nodes = [
			this._wrapAbs.children[ 0 ],
			this._wrapAbs.children[ 1 ],
			this._wrapAbs.children[ 2 ],
		];
		Object.seal( this );

		elModes.onclick = this._onclickModes.bind( this );
	}

	// .........................................................................
	connectedCallback() {
		this._attached = true;
		if ( !this.firstChild ) {
			this.classList.add( "gsuiClock" );
			this.append( ...this._children );
			this._children = null;
			if ( !this.hasAttribute( "bpm" ) ) {
				this.setAttribute( "bpm", 60 );
			}
			if ( !this.hasAttribute( "stepsPerBeat" ) ) {
				this.setAttribute( "stepsPerBeat", 4 );
			}
		}
		this._updateWidth();
	}
	disconnectedCallback() {
		this._attached = false;
	}
	static get observedAttributes() {
		return [ "mode", "bpm", "stepsPerBeat" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "mode":
				case "bpm":
				case "stepsPerBeat":
					this._resetTime();
					break;
			}
		}
	}

	// .........................................................................
	setTime( beats ) {
		const [ a, b, c ] = this.getAttribute( "mode" ) === "second"
				? GSUtils.parseBeatsToSeconds( beats, +this.getAttribute( "bpm" ) )
				: GSUtils.parseBeatsToBeats( beats, +this.getAttribute( "stepsPerBeat" ) );

		this._timeSave = beats;
		this._setValue( 0, a );
		this._setValue( 1, b );
		this._setValue( 2, c );
		if ( this._attached && a.length !== this._firstValueLen ) {
			this._firstValueLen = a.length;
			this._updateWidth();
		}
	}

	// .........................................................................
	_resetTime() {
		this.setTime( this._timeSave );
	}
	_setValue( ind, val ) {
		if ( val !== this._values[ ind ] ) {
			this._nodes[ ind ].textContent =
			this._values[ ind ] = val;
		}
	}
	_updateWidth() {
		const bcr = this._wrapAbs.getBoundingClientRect(),
			st = this._wrapRel.style;

		st.width =
		st.minWidth = `${ bcr.width }px`;
		st.minHeight = `${ bcr.height }px`;
	}

	// .........................................................................
	_onclickModes() {
		const dpl = this.getAttribute( "mode" ) === "second" ? "beat" : "second";

		GSUI.setAttribute( this, "mode", dpl );
		this.onchangeDisplay( dpl );
	}
}

customElements.define( "gsui-clock", gsuiClock );
