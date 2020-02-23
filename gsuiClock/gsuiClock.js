"use strict";

class gsuiClock {
	constructor() {
		const root = gsuiClock.template.cloneNode( true ),
			elModes = root.querySelector( ".gsuiClock-modes" );

		this.rootElement = root;
		this.onchangeDisplay = () => {};
		this._attached = false;
		this._wrapRel = root.querySelector( ".gsuiClock-relative" );
		this._wrapAbs = root.querySelector( ".gsuiClock-absolute" );
		this._timeSave = 0;
		this._display = "";
		this._firstValueLen = -1;
		this._values = [ -1, -1, -1 ];
		this._nodes = [
			root.querySelector( ".gsuiClock-a" ),
			root.querySelector( ".gsuiClock-b" ),
			root.querySelector( ".gsuiClock-c" ),
		];
		this._bpm = 60;
		this._sPB = 4;
		Object.seal( this );

		this.setTime( "second", 0 );
		this.setDisplay( "second" );
		elModes.onclick = this._onclickModes.bind( this );
	}

	attached() {
		this._attached = true;
		this._updateWidth();
	}
	setBPM( bpm ) {
		this._bpm = bpm;
		this._resetTime();
	}
	setStepsPerBeat( sPB ) {
		this._sPB = sPB;
		this._resetTime();
	}
	setDisplay( display ) {
		this._display =
		this.rootElement.dataset.mode = display;
		this._resetTime();
	}
	setTime( beats ) {
		const [ a, b, c ] = this._display === "second"
				? GSUtils.parseBeatsToSeconds( beats, this._bpm )
				: GSUtils.parseBeatsToBeats( beats, this._sPB );

		this._timeSave = beats;
		this._setValue( 0, a );
		this._setValue( 1, b );
		this._setValue( 2, c );
		if ( this._attached && a.length !== this._firstValueLen ) {
			this._firstValueLen = a.length;
			this._updateWidth();
		}
	}

	// events:
	_onclickModes() {
		const dpl = this._display === "second" ? "beat" : "second";

		this.setDisplay( dpl );
		this.onchangeDisplay( dpl );
	}

	// private:
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
}

gsuiClock.template = document.querySelector( "#gsuiClock-template" );
gsuiClock.template.remove();
gsuiClock.template.removeAttribute( "id" );
