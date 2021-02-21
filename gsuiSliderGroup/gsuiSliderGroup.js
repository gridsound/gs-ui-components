"use strict";

class gsuiSliderGroup extends HTMLElement {
	constructor() {
		const root = GSUI.getTemplate( "gsui-slidergroup" );

		super();
		this.scrollElement = root;
		this._slidersParent = root.querySelector( ".gsuiSliderGroup-sliders" );
		this._uiBeatlines = root.querySelector( "gsui-beatlines" );
		this._currentTime = root.querySelector( ".gsuiSliderGroup-currentTime" );
		this._defValue = root.querySelector( ".gsuiSliderGroup-defaultValue" );
		this._loopA = root.querySelector( ".gsuiSliderGroup-loopA" );
		this._loopB = root.querySelector( ".gsuiSliderGroup-loopB" );
		this._min =
		this._max =
		this._def =
		this._exp =
		this._step =
		this._button = 0;
		this._sliders = new Map();
		this._selected = new Map();
		this._valueSaved = new Map();
		this._bcr =
		this._evMouseup =
		this._evMousemove = null;
		this._uiFn = Object.freeze( {
			when: this._sliderWhen.bind( this ),
			value: this._sliderValue.bind( this ),
			duration: this._sliderDuration.bind( this ),
			selected: this._sliderSelected.bind( this ),
		} );
		Object.seal( this );

		root.oncontextmenu = () => false;
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			const beatlines = this.hasAttribute( "beatlines" );

			this.classList.add( "gsuiSliderGroup" );
			if ( !beatlines ) {
				this._uiBeatlines.remove();
				this._currentTime.remove();
				this._loopA.remove();
				this._loopB.remove();
				this._uiBeatlines =
				this._currentTime =
				this._loopA =
				this._loopB = null;
			}
			this.append( this.scrollElement );
			this._updatePxPerBeat();
			this._slidersParent.onmousedown = this._mousedown.bind( this );
			GSUI.recallAttributes( this, { pxperbeat: 64 } );
			if ( beatlines ) {
				GSUI.recallAttributes( this, { currenttime: 0, timedivision: "4/4" } );
			}
		}
	}
	static get observedAttributes() {
		return [ "timedivision", "pxperbeat", "currenttime", "loopa", "loopb" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "timedivision":
					this._uiBeatlines.setAttribute( "timedivision", val );
					break;
				case "pxperbeat":
					this._updatePxPerBeat();
					break;
				case "currenttime":
					this._currentTime.style.left = `${ val }em`;
					break;
				case "loopa":
					this._loopA.classList.toggle( "gsuiSliderGroup-loopOn", val );
					if ( val ) {
						this._loopA.style.width = `${ val }em`;
					}
					break;
				case "loopb":
					this._loopB.classList.toggle( "gsuiSliderGroup-loopOn", val );
					if ( val ) {
						this._loopB.style.left = `${ val }em`;
					}
					break;
			}
		}
	}

	// .........................................................................
	empty() {
		this._sliders.forEach( s => s.element.remove() );
		this._sliders.clear();
		this._selected.clear();
		this._valueSaved.clear();
	}
	options( { min, max, step, exp, def } ) {
		this._min = min;
		this._max = max;
		this._step = step;
		this._exp = exp ?? 0;
		this._def = def ?? max;
		this._defValue.style.top = `${ 100 - ( this._def - min ) / ( max - min ) * 100 }%`;
	}

	// .........................................................................
	delete( id ) {
		this._sliders.get( id ).element.remove();
		this._sliders.delete( id );
		this._selected.delete( id );
		delete this._slidersObj;
		this._sliderSelectedClass();
	}
	set( id, when, duration, value ) {
		const element = GSUI.getTemplate( "gsui-slidergroup-slider" ),
			sli = Object.seal( { element, when, duration, value, selected: false } );

		element._slider =
		element.firstElementChild._slider = sli;
		element.dataset.id = id;
		this._sliders.set( id, sli );
		this._sliderWhen( sli, when );
		this._sliderValue( sli, value );
		this._sliderDuration( sli, duration );
		this._slidersParent.append( element );
	}
	setProp( id, prop, value ) {
		const sli = this._sliders.get( id );

		if ( sli ) {
			sli[ prop ] = value;
			this._uiFn[ prop ]( sli, value );
		}
	}

	// .........................................................................
	_roundVal( val ) {
		return +( Math.round( val / this._step ) * this._step ).toFixed( 8 );
	}
	_updatePxPerBeat() {
		const ppb = this.getAttribute( "pxperbeat" );

		this._slidersParent.style.fontSize = `${ ppb }px`;
		if ( this._uiBeatlines ) {
			this._uiBeatlines.setAttribute( "pxperbeat", ppb );
		}
	}
	_sliderWhen( sli, when ) {
		sli.element.style.left = `${ when }em`;
		sli.element.style.zIndex = Math.floor( when * 100 );
	}
	_sliderDuration( sli, dur ) {
		sli.element.style.width = `${ dur }em`;
	}
	_sliderSelected( sli, b ) {
		b
			? this._selected.set( sli.element.dataset.id, sli )
			: this._selected.delete( sli.element.dataset.id );
		sli.element.classList.toggle( "gsuiSliderGroup-sliderSelected", !!b );
		this._sliderSelectedClass();
	}
	_sliderSelectedClass() {
		this._slidersParent.classList.toggle(
			"gsuiSliderGroup-slidersSelected", this._selected.size > 0 );
	}
	_sliderValue( sli, val ) {
		const el = sli.element.firstElementChild,
			st = el.style,
			max = this._max,
			min = this._min,
			valNum = Number.isFinite( val ) ? val : this._def,
			sameDir = min >= 0 === max >= 0,
			percX = Math.abs( ( valNum - ( sameDir ? min : 0 ) ) ) / ( max - min ) * 100,
			perc0 = sameDir ? 0 : Math.abs( min ) / ( max - min ) * 100;

		st.height = `${ percX }%`;
		if ( el.classList.toggle( "gsuiSliderGroup-sliderInnerDown", valNum < 0 ) ) {
			st.top = `${ 100 - perc0 }%`;
			st.bottom = "auto";
		} else {
			st.top = "auto";
			st.bottom = `${ perc0 }%`;
		}
	}

	// .........................................................................
	_mousedown( e ) {
		if ( !this._evMouseup && ( e.button === 0 || e.button === 2 ) ) {
			this._bcr = this._slidersParent.getBoundingClientRect();
			this._button = e.button;
			this._valueSaved.clear();
			this._sliders.forEach( ( sli, id ) => this._valueSaved.set( id, sli.value ) );
			this._evMouseup = this._mouseup.bind( this );
			this._evMousemove = this._mousemove.bind( this );
			document.addEventListener( "mouseup", this._evMouseup );
			document.addEventListener( "mousemove", this._evMousemove );
			GSUI.unselectText();
			GSUI.dragshield.show( "pointer" );
			this._mousemove( e );
		}
	}
	_mousemove( e ) {
		const sliders = this._selected.size > 0
				? this._selected
				: this._sliders,
			x = e.pageX - this._bcr.left,
			y = e.pageY - this._bcr.top,
			min = this._min,
			max = this._max,
			xval = x / this.getAttribute( "pxperbeat" ),
			rval = this._button === 2
				? this._def
				: this._roundVal( min + ( max - min ) *
					( 1 - Math.min( Math.max( 0, y / this._bcr.height ), 1 ) ) );
		let firstWhen = 0;

		sliders.forEach( sli => {
			if ( sli.when <= xval && firstWhen <= xval ) {
				firstWhen = sli.when;
			}
		} );
		sliders.forEach( sli => {
			if ( firstWhen <= sli.when && sli.when <= xval && xval <= sli.when + sli.duration ) {
				sli.value = rval;
				this._sliderValue( sli, rval );
				GSUI.dispatchEvent( this, "gsuiSliderGroup", "input", sli.element.dataset.id, rval );
			}
		} );
	}
	_mouseup() {
		const arr = [];

		GSUI.dragshield.hide();
		document.removeEventListener( "mouseup", this._evMouseup );
		document.removeEventListener( "mousemove", this._evMousemove );
		this._evMouseup =
		this._evMousemove = null;
		this._sliders.forEach( ( sli, id ) => {
			if ( sli.value !== this._valueSaved.get( id ) ) {
				arr.push( [ id, sli.value ] );
			}
		} );
		if ( arr.length ) {
			GSUI.dispatchEvent( this, "gsuiSliderGroup", "change", arr );
		}
		GSUI.dispatchEvent( this, "gsuiSliderGroup", "inputEnd" );
	}
}

customElements.define( "gsui-slidergroup", gsuiSliderGroup );
