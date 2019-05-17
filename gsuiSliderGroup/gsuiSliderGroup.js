"use strict";

class gsuiSliderGroup {
	constructor() {
		const root = gsuiSliderGroup.template.cloneNode( true ),
			slidersWrap = root.querySelector( ".gsuiSliderGroup-slidersWrap" ),
			slidersParent = root.querySelector( ".gsuiSliderGroup-sliders" ),
			uiBeatlines = new gsuiBeatlines( slidersParent );

		this.onchange = () => {};
		this.rootElement = root;
		this.scrollElement = slidersWrap;
		this._uiBeatlines = uiBeatlines;
		this._slidersParent = slidersParent;
		this._currentTime = root.querySelector( ".gsuiSliderGroup-currentTime" );
		this._loopA = root.querySelector( ".gsuiSliderGroup-loopA" );
		this._loopB = root.querySelector( ".gsuiSliderGroup-loopB" );
		this._exp = 0;
		this._sliders = new Map();
		this._selected = new Map();
		this._valueSaved = new Map();
		this._uiFn = {
			when: this._sliderWhen.bind( this ),
			value: this._sliderValue.bind( this ),
			duration: this._sliderDuration.bind( this ),
			selected: this._sliderSelected.bind( this ),
		};
		slidersParent.onmousedown = this._mousedown.bind( this );
	}

	remove() {
		delete this._attached;
		this.rootElement.remove();
	}
	empty() {
		this._sliders.forEach( s => s.element.remove() );
		this._sliders.clear();
		this._selected.clear();
		this._valueSaved.clear();
	}
	attached() {
		const el = this.scrollElement;

		this._attached = true;
		el.style.bottom = `${ el.clientHeight - el.offsetHeight }px`;
	}
	minMaxExp( min, max, exp = 0 ) {
		this._min = min;
		this._max = max;
		this._exp = exp;
	}

	timeSignature( a, b ) {
		this._uiBeatlines.timeSignature( a, b );
	}
	currentTime( beat ) {
		this._currentTime.style.left = `${ beat }em`;
	}
	loop( a, b ) {
		const isLoop = a !== false;

		this._loopA.classList.toggle( "gsuiSliderGroup-loopOn", isLoop );
		this._loopB.classList.toggle( "gsuiSliderGroup-loopOn", isLoop );
		if ( isLoop ) {
			this._loopA.style.width = `${ a }em`;
			this._loopB.style.left = `${ b }em`;
		}
	}
	setPxPerBeat( px ) {
		const ppb = Math.round( Math.min( Math.max( 8, px ) ), 512 );

		if ( ppb !== this._pxPerBeat ) {
			this._pxPerBeat = ppb;
			this._uiBeatlines.pxPerBeat( ppb );
			this._slidersParent.style.fontSize = `${ ppb }px`;
			clearTimeout( this._beatlinesRendering );
			this._beatlinesRendering = setTimeout( () => this._uiBeatlines.render(), 100 );
		}
	}

	// data:
	delete( id ) {
		this._sliders.get( id ).element.remove();
		this._sliders.delete( id );
		this._selected.delete( id );
		delete this._slidersObj;
		this._sliderSelectedClass();
	}
	set( id, when, duration, value ) {
		const element = gsuiSliderGroup.sliderTemplate.cloneNode( true ),
			sli = { element };

		element._slider =
		element.firstElementChild._slider = sli;
		element.dataset.id = id;
		element.onmousemove = this._mousemoveSlider.bind( this, id, sli );
		this._sliders.set( id, sli );
		this._sliderWhen( sli, when );
		this._sliderValue( sli, value );
		this._sliderDuration( sli, duration );
		this._slidersParent.append( element );
	}
	setProp( id, prop, value ) {
		const sli = this._sliders.get( id );

		sli[ prop ] = value;
		this._uiFn[ prop ]( sli, value );
	}

	// private:
	_formatValue( val ) {
		return +val.toFixed( 2 );
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
			valUp = val >= 0,
			perc0 = Math.abs( min ) / ( max - min ) * 100,
			percX = Math.abs( val ) / ( max - min ) * 100;

		sli.roundValue = this._formatValue( val );
		st.height = `${ percX }%`;
		st[ valUp ? "top" : "bottom" ] = "auto";
		st[ valUp ? "bottom" : "top" ] = `${ perc0 }%`;
		el.classList.toggle( "gsuiSliderGroup-sliderInnerDown", !valUp );
	}

	// events:
	_mousedown( e ) {
		if ( !gsuiSliderGroup._focused ) {
			const bcr = this._slidersParent.getBoundingClientRect(),
				sli = e.target._slider;

			this._bcrTop = bcr.top;
			this._bcrHeight = bcr.height;
			this._valueSaved.clear();
			this._sliders.forEach( ( sli, id ) => this._valueSaved.set( id, sli.roundValue ) );
			gsuiSliderGroup._focused = this;
			if ( sli ) {
				this._mousemoveSlider( sli.element.dataset.id, sli, e );
			}
		}
	}
	_mouseup() {
		const arr = [];

		delete gsuiSliderGroup._focused;
		this._sliders.forEach( ( sli, id ) => {
			if ( sli.roundValue !== this._valueSaved.get( id ) ) {
				arr.push( [ id, sli.realValue ] );
				delete sli.realValue;
			}
		} );
		if ( arr.length ) {
			this.onchange( arr );
		}
	}
	_mousemoveSlider( id, sli, e ) {
		if ( gsuiSliderGroup._focused === this &&
			( !this._selected.size || this._selected.has( id ) )
		) {
			const val = 1 - ( e.pageY - this._bcrTop ) / this._bcrHeight,
				realVal = val * ( this._max - this._min ) + this._min;

			sli.realValue = realVal;
			this._sliderValue( sli, realVal );
		}
	}
}

gsuiSliderGroup.template = document.querySelector( "#gsuiSliderGroup-template" );
gsuiSliderGroup.template.remove();
gsuiSliderGroup.template.removeAttribute( "id" );
gsuiSliderGroup.sliderTemplate = document.querySelector( "#gsuiSliderGroup-slider-template" );
gsuiSliderGroup.sliderTemplate.remove();
gsuiSliderGroup.sliderTemplate.removeAttribute( "id" );

document.addEventListener( "mouseup", e => {
	gsuiSliderGroup._focused && gsuiSliderGroup._focused._mouseup( e );
} );
