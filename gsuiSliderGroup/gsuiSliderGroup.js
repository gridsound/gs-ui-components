"use strict";

class gsuiSliderGroup extends gsui0ne {
	#min = 0;
	#max = 0;
	#def = 0;
	#step = 0;
	#button = 0;
	#sliders = new Map();
	#selected = new Map();
	#valueSaved = new Map();
	#bcr = null;
	#uiFn = Object.freeze( {
		when: this.#sliderWhen.bind( this ),
		value: this.#sliderValue.bind( this ),
		duration: this.#sliderDuration.bind( this ),
		selected: this.#sliderSelected.bind( this ),
	} );

	constructor() {
		super( {
			$cmpName: "gsuiSliderGroup",
			$tagName: "gsui-slidergroup",
			$jqueryfy: true,
			$elements: {
				$slidersParent: ".gsuiSliderGroup-sliders",
				$defValue: ".gsuiSliderGroup-defaultValue",
				$beatlines: "gsui-beatlines",
				$currentTime: ".gsuiSliderGroup-currentTime",
				$loopA: ".gsuiSliderGroup-loopA",
				$loopB: ".gsuiSliderGroup-loopB",
			},
			$attributes: {
				pxperbeat: 64,
			},
		} );
		Object.seal( this );
	}

	// .........................................................................
	$firstTimeConnected() {
		const beatlines = this.hasAttribute( "beatlines" );

		if ( !beatlines ) {
			this.$elements.$beatlines.$remove();
			this.$elements.$currentTime.$remove();
			this.$elements.$loopA.$remove();
			this.$elements.$loopB.$remove();
			this.$elements.$beatlines =
			this.$elements.$currentTime =
			this.$elements.$loopA =
			this.$elements.$loopB = null;
		}
		this.#updatePxPerBeat();
		if ( beatlines ) {
			GSUdomRecallAttributes( this, {
				currenttime: 0,
				timedivision: "4/4",
			} );
		}
	}
	static get observedAttributes() {
		return [ "timedivision", "pxperbeat", "currenttime", "loopa", "loopb" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "timedivision":
				this.$elements.$beatlines.$setAttr( "timedivision", val );
				break;
			case "pxperbeat":
				this.#updatePxPerBeat();
				break;
			case "currenttime":
				this.$elements.$currentTime.$left( val, "em" );
				break;
			case "loopa":
				this.$elements.$loopA.$togClass( "gsuiSliderGroup-loopOn", val );
				if ( val ) {
					this.$elements.$loopA.$width( val, "em" );
				}
				break;
			case "loopb":
				this.$elements.$loopB.$togClass( "gsuiSliderGroup-loopOn", val );
				if ( val ) {
					this.$elements.$loopB.$left( val, "em" );
				}
				break;
		}
	}

	// .........................................................................
	$empty() {
		this.#sliders.forEach( s => s.element.$remove() );
		this.#sliders.clear();
		this.#selected.clear();
		this.#valueSaved.clear();
	}
	$options( { min, max, step, def } ) {
		this.#min = min;
		this.#max = max;
		this.#step = step;
		this.#def = def ?? max;
		this.$elements.$defValue.$top( 100 - ( this.#def - min ) / ( max - min ) * 100, "%" );
	}

	// .........................................................................
	$delete( id ) {
		this.#sliders.get( id ).element.$remove();
		this.#sliders.delete( id );
		this.#selected.delete( id );
	}
	$set( id, when, duration, value ) {
		const element = $( GSUgetTemplate( "gsui-slidergroup-slider" ) ).$setAttr( "data-id", id );
		const sli = Object.seal( { element, when, duration, value, selected: false } );

		this.#sliders.set( id, sli );
		this.#sliderWhen( sli, when );
		this.#sliderValue( sli, value );
		this.#sliderDuration( sli, duration );
		this.$elements.$slidersParent.$append( element );
	}
	$setProp( id, prop, value ) {
		const sli = this.#sliders.get( id );

		if ( sli ) {
			sli[ prop ] = value;
			this.#uiFn[ prop ]( sli, value );
		}
	}

	// .........................................................................
	#roundVal( val ) {
		return GSUmathFix( GSUmathRound( val, this.#step ), 8 );
	}
	#updatePxPerBeat() {
		const ppb = +this.$this.$getAttr( "pxperbeat" );

		this.$elements.$slidersParent.$css( "fontSize", `${ ppb }px` );
		if ( this.$elements.$beatlines ) {
			this.$elements.$beatlines.$setAttr( "pxperbeat", ppb );
		}
	}
	#sliderWhen( sli, when ) {
		sli.element.$left( when, "em" ).$css( "zIndex", Math.floor( when * 100 ) );
	}
	#sliderDuration( sli, dur ) {
		sli.element.$width( dur, "em" );
	}
	#sliderSelected( sli, b ) {
		const id = sli.element.$getAttr( "data-id" );

		if ( b !== this.#selected.has( id ) ) {
			const zind = +sli.element.$css( "zIndex" );

			b
				? this.#selected.set( id, sli )
				: this.#selected.delete( id );
			sli.element.$togClass( "gsuiSliderGroup-sliderSelected", !!b )
				.$css( "zIndex", zind + ( b ? 1000 : -1000 ) );
		}
	}
	#sliderValue( sli, val ) {
		const max = this.#max;
		const min = this.#min;
		const valNum = Number.isFinite( val ) ? val : this.#def;
		const sameDir = min >= 0 === max >= 0;
		const percX = Math.abs( valNum - ( sameDir ? min : 0 ) ) / ( max - min ) * 100;
		const perc0 = sameDir ? 0 : Math.abs( min ) / ( max - min ) * 100;

		sli.element.$child( 0 )
			.$togClass( "gsuiSliderGroup-sliderInnerDown", valNum < 0 )
			.$css( {
				height: `${ percX }%`,
				top: valNum < 0 ? `${ 100 - perc0 }%` : "auto",
				bottom: valNum < 0 ? "auto" : `${ perc0 }%`,
			} );
	}

	// .........................................................................
	$onptrdown( e ) {
		if ( e.button === 0 || e.button === 2 ) {
			this.#bcr = GSUdomBCR( this.$elements.$slidersParent.$get( 0 ) );
			this.#button = e.button;
			this.#valueSaved.clear();
			this.#sliders.forEach( ( sli, id ) => this.#valueSaved.set( id, sli.value ) );
			GSUdomUnselect();
			this.$onptrmove( e );
			return;
		}
		return false;
	}
	$onptrmove( e ) {
		const sliders = this.#selected.size > 0
			? this.#selected
			: this.#sliders;
		const x = e.pageX - this.#bcr.x;
		const y = e.pageY - this.#bcr.y;
		const min = this.#min;
		const max = this.#max;
		const xval = x / +this.$this.$getAttr( "pxperbeat" );
		const rval = this.#button === 2
			? this.#def
			: this.#roundVal( min + ( max - min ) * ( 1 - GSUmathClamp( y / this.#bcr.h, 0, 1 ) ) );
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
				this.$this.$dispatch( GSEV_SLIDERGROUP_INPUT, sli.element.$getAttr( "data-id" ), rval );
			}
		} );
	}
	$onptrup() {
		const arr = [];

		this.#sliders.forEach( ( sli, id ) => {
			if ( sli.value !== this.#valueSaved.get( id ) ) {
				arr.push( [ id, sli.value ] );
			}
		} );
		if ( arr.length ) {
			this.$this.$dispatch( GSEV_SLIDERGROUP_CHANGE, arr );
		}
		this.$this.$dispatch( GSEV_SLIDERGROUP_INPUTEND );
	}
}

GSUdomDefine( "gsui-slidergroup", gsuiSliderGroup );
