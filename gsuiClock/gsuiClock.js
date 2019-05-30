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
		this._display =
		this._displaySave = "";
		this._firstValueLen = -1;
		this._values = [ -1, -1, -1 ];
		this._nodes = [
			root.querySelector( ".gsuiClock-a" ),
			root.querySelector( ".gsuiClock-b" ),
			root.querySelector( ".gsuiClock-c" ),
		];
		this._bps = 1;
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
		this._bps = bpm / 60;
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
	setTime( display, t ) {
		this._displaySave = display;
		this._timeSave = t;
		this._display === "second"
			? this._setSeconds( display === "second" ? t : t / this._bps )
			: this._setBeats( display !== "second" ? t : t * this._bps );
	}

	// events:
	_onclickModes() {
		const dpl = this._display === "second" ? "beat" : "second";

		this.setDisplay( dpl );
		this.onchangeDisplay( dpl );
	}

	// private:
	_resetTime() {
		this.setTime( this._displaySave, this._timeSave );
	}
	_updateWidth() {
		const bcr = this._wrapAbs.getBoundingClientRect(),
			st = this._wrapRel.style;

		st.width =
		st.minWidth = `${ bcr.width }px`;
		st.minHeight = `${ bcr.height }px`;
	}
	_setSeconds( sec ) {
		this._setValue0( sec / 60 );
		this._setValue( 1, this._padZero( sec % 60 ) );
		this._setValue( 2, this._getMil( sec ) );
	}
	_setBeats( bts ) {
		this._setValue0( bts + 1 );
		this._setValue( 1, this._padZero( bts % 1 * this._sPB + 1 ) );
		this._setValue( 2, this._getMil( bts % 1 * this._sPB ) );
	}
	_setValue( key, val ) {
		if ( val !== this._values[ key ] ) {
			this._nodes[ key ].textContent =
			this._values[ key ] = val;
		}
	}
	_setValue0( val ) {
		const str = `${ ~~val }`;

		this._setValue( 0, str );
		if ( this._attached && str.length !== this._firstValueLen ) {
			this._firstValueLen = str.length;
			this._updateWidth();
		}
	}
	_padZero( val ) {
		return `${ ~~val }`.padStart( 2, "0" );
	}
	_getMil( val ) {
		return `${ ~~( val * 1000 % 1000 ) }`.padStart( 3, "0" );
	}
}

gsuiClock.template = document.querySelector( "#gsuiClock-template" );
gsuiClock.template.remove();
gsuiClock.template.removeAttribute( "id" );
