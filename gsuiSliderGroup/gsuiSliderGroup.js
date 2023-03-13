"use strict";

class gsuiSliderGroup extends HTMLElement {
	#min = 0;
	#max = 0;
	#def = 0;
	#step = 0;
	#button = 0;
	#sliders = new Map();
	#selected = new Map();
	#valueSaved = new Map();
	#bcr = null;
	#evMouseup = null;
	#evMousemove = null;
	#uiFn = Object.freeze( {
		when: this.#sliderWhen.bind( this ),
		value: this.#sliderValue.bind( this ),
		duration: this.#sliderDuration.bind( this ),
		selected: this.#sliderSelected.bind( this ),
	} );
	#children = GSUI.$getTemplate( "gsui-slidergroup" );
	#elements = GSUI.$findElements( this.#children, {
		slidersParent: ".gsuiSliderGroup-sliders",
		defValue: ".gsuiSliderGroup-defaultValue",
		beatlines: "gsui-beatlines",
		currentTime: ".gsuiSliderGroup-currentTime",
		loopA: ".gsuiSliderGroup-loopA",
		loopB: ".gsuiSliderGroup-loopB",
	} );
	scrollElement = this.#children;

	constructor() {
		super();
		Object.seal( this );

		this.#children.oncontextmenu = () => false;
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			const beatlines = this.hasAttribute( "beatlines" );

			if ( !beatlines ) {
				this.#elements.beatlines.remove();
				this.#elements.currentTime.remove();
				this.#elements.loopA.remove();
				this.#elements.loopB.remove();
				this.#elements.beatlines =
				this.#elements.currentTime =
				this.#elements.loopA =
				this.#elements.loopB = null;
			}
			this.append( this.scrollElement );
			this.#updatePxPerBeat();
			this.#elements.slidersParent.onmousedown = this.#mousedown.bind( this );
			GSUI.$recallAttributes( this, {
				pxperbeat: 64,
			} );
			if ( beatlines ) {
				GSUI.$recallAttributes( this, {
					currenttime: 0,
					timedivision: "4/4",
				} );
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
					GSUI.$setAttribute( this.#elements.beatlines, "timedivision", val );
					break;
				case "pxperbeat":
					this.#updatePxPerBeat();
					break;
				case "currenttime":
					this.#elements.currentTime.style.left = `${ val }em`;
					break;
				case "loopa":
					this.#elements.loopA.classList.toggle( "gsuiSliderGroup-loopOn", val );
					if ( val ) {
						this.#elements.loopA.style.width = `${ val }em`;
					}
					break;
				case "loopb":
					this.#elements.loopB.classList.toggle( "gsuiSliderGroup-loopOn", val );
					if ( val ) {
						this.#elements.loopB.style.left = `${ val }em`;
					}
					break;
			}
		}
	}

	// .........................................................................
	empty() {
		this.#sliders.forEach( s => s.element.remove() );
		this.#sliders.clear();
		this.#selected.clear();
		this.#valueSaved.clear();
	}
	options( { min, max, step, def } ) {
		this.#min = min;
		this.#max = max;
		this.#step = step;
		this.#def = def ?? max;
		this.#elements.defValue.style.top = `${ 100 - ( this.#def - min ) / ( max - min ) * 100 }%`;
	}

	// .........................................................................
	delete( id ) {
		this.#sliders.get( id ).element.remove();
		this.#sliders.delete( id );
		this.#selected.delete( id );
		this.#sliderSelectedClass();
	}
	set( id, when, duration, value ) {
		const element = GSUI.$getTemplate( "gsui-slidergroup-slider" );
		const sli = Object.seal( { element, when, duration, value, selected: false } );

		element.dataset.id = id;
		this.#sliders.set( id, sli );
		this.#sliderWhen( sli, when );
		this.#sliderValue( sli, value );
		this.#sliderDuration( sli, duration );
		this.#elements.slidersParent.append( element );
	}
	setProp( id, prop, value ) {
		const sli = this.#sliders.get( id );

		if ( sli ) {
			sli[ prop ] = value;
			this.#uiFn[ prop ]( sli, value );
		}
	}

	// .........................................................................
	#roundVal( val ) {
		return +( Math.round( val / this.#step ) * this.#step ).toFixed( 8 );
	}
	#updatePxPerBeat() {
		const ppb = GSUI.$getAttributeNum( this, "pxperbeat" );

		this.#elements.slidersParent.style.fontSize = `${ ppb }px`;
		if ( this.#elements.beatlines ) {
			GSUI.$setAttribute( this.#elements.beatlines, "pxperbeat", ppb );
		}
	}
	#sliderWhen( sli, when ) {
		sli.element.style.left = `${ when }em`;
		sli.element.style.zIndex = Math.floor( when * 100 );
	}
	#sliderDuration( sli, dur ) {
		sli.element.style.width = `${ dur }em`;
	}
	#sliderSelected( sli, b ) {
		if ( b !== this.#selected.has( sli.element.dataset.id ) ) {
			const zind = +sli.element.style.zIndex;

			b
				? this.#selected.set( sli.element.dataset.id, sli )
				: this.#selected.delete( sli.element.dataset.id );
			sli.element.classList.toggle( "gsuiSliderGroup-sliderSelected", !!b );
			sli.element.style.zIndex = zind + ( b ? 1000 : -1000 );
			this.#sliderSelectedClass();
		}
	}
	#sliderSelectedClass() {
		this.#elements.slidersParent.classList.toggle(
			"gsuiSliderGroup-slidersSelected", this.#selected.size > 0 );
	}
	#sliderValue( sli, val ) {
		const el = sli.element.firstElementChild;
		const st = el.style;
		const max = this.#max;
		const min = this.#min;
		const valNum = Number.isFinite( val ) ? val : this.#def;
		const sameDir = min >= 0 === max >= 0;
		const percX = Math.abs( valNum - ( sameDir ? min : 0 ) ) / ( max - min ) * 100;
		const perc0 = sameDir ? 0 : Math.abs( min ) / ( max - min ) * 100;

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
	#mousedown( e ) {
		if ( !this.#evMouseup && ( e.button === 0 || e.button === 2 ) ) {
			this.#bcr = this.#elements.slidersParent.getBoundingClientRect();
			this.#button = e.button;
			this.#valueSaved.clear();
			this.#sliders.forEach( ( sli, id ) => this.#valueSaved.set( id, sli.value ) );
			this.#evMouseup = this.#mouseup.bind( this );
			this.#evMousemove = this.#mousemove.bind( this );
			document.addEventListener( "mouseup", this.#evMouseup );
			document.addEventListener( "mousemove", this.#evMousemove );
			GSUI.$unselectText();
			GSUI.$dragshield.show( "pointer" );
			this.#mousemove( e );
		}
	}
	#mousemove( e ) {
		const sliders = this.#selected.size > 0
			? this.#selected
			: this.#sliders;
		const x = e.pageX - this.#bcr.left;
		const y = e.pageY - this.#bcr.top;
		const min = this.#min;
		const max = this.#max;
		const xval = x / GSUI.$getAttributeNum( this, "pxperbeat" );
		const rval = this.#button === 2
			? this.#def
			: this.#roundVal( min + ( max - min ) *
					( 1 - Math.min( Math.max( 0, y / this.#bcr.height ), 1 ) ) );
		let firstWhen = 0;

		sliders.forEach( sli => {
			if ( sli.when <= xval && firstWhen <= xval ) {
				firstWhen = sli.when;
			}
		} );
		sliders.forEach( sli => {
			if ( firstWhen <= sli.when && sli.when <= xval && xval <= sli.when + sli.duration ) {
				sli.value = rval;
				this.#sliderValue( sli, rval );
				GSUI.$dispatchEvent( this, "gsuiSliderGroup", "input", sli.element.dataset.id, rval );
			}
		} );
	}
	#mouseup() {
		const arr = [];

		GSUI.$dragshield.hide();
		document.removeEventListener( "mouseup", this.#evMouseup );
		document.removeEventListener( "mousemove", this.#evMousemove );
		this.#evMouseup =
		this.#evMousemove = null;
		this.#sliders.forEach( ( sli, id ) => {
			if ( sli.value !== this.#valueSaved.get( id ) ) {
				arr.push( [ id, sli.value ] );
			}
		} );
		if ( arr.length ) {
			GSUI.$dispatchEvent( this, "gsuiSliderGroup", "change", arr );
		}
		GSUI.$dispatchEvent( this, "gsuiSliderGroup", "inputEnd" );
	}
}

Object.freeze( gsuiSliderGroup );
customElements.define( "gsui-slidergroup", gsuiSliderGroup );
