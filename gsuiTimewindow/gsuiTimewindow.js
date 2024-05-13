"use strict";

class gsuiTimewindow extends gsui0ne {
	#pxPerBeat = 0;
	#panelSize = 0;
	#lineHeight = 0;
	#scrollShadow = null;
	#ptrdownPageX = 0;
	#ptrdownPageY = 0;
	#onptrupExtendBind = this.#onptrupExtend.bind( this );
	#onptrmoveExtendPanelBind = this.#onptrmoveExtendPanel.bind( this );
	#onptrmoveExtendDownPanelBind = this.#onptrmoveExtendDownPanel.bind( this );

	constructor() {
		super( {
			$cmpName: "gsuiTimewindow",
			$tagName: "gsui-timewindow",
			$elements: {
				$main: ".gsuiTimewindow-main",
				$mainCnt: ".gsuiTimewindow-mainContent",
				$down: ".gsuiTimewindow-contentDown",
				$panel: ".gsuiTimewindow-panel",
				$panelCnt: ".gsuiTimewindow-panelContent",
				$panelDown: ".gsuiTimewindow-panelContentDown",
				$stepBtn: ".gsuiTimewindow-step",
				$sliderZoomX: "gsui-slider[data-zoom=x]",
				$sliderZoomY: "gsui-slider[data-zoom=y]",
				$timeline: "gsui-timeline",
				$beatlines: "gsui-beatlines",
				$loopA: ".gsuiTimewindow-loopA",
				$loopB: ".gsuiTimewindow-loopB",
				$currentTime: ".gsuiTimewindow-currentTime",
			},
			$attributes: {
				step: 1,
				pxperbeat: 100,
				lineheight: 48,
				currenttime: 0,
			},
		} );
		this.timeline = this.$elements.$timeline;
		Object.seal( this );

		GSUlistenEvents( this, {
			gsuiSlider: {
				input: ( d, sli ) => {
					if ( sli.dataset.zoom === "x" ) {
						const val = GSUeaseInCirc( d.args[ 0 ] );
						const newVal = this.#getPPBmin() + val * ( this.#getPPBmax() - this.#getPPBmin() );
						const scrollBack = this.#calcScrollBack( this.scrollLeft, this.#pxPerBeat, newVal, 0 );

						this.scrollLeft = scrollBack;
						GSUsetAttribute( this, "pxperbeat", newVal );
						GSUdispatchEvent( this, "gsuiTimewindow", "pxperbeat", newVal );
					} else if ( sli.dataset.zoom === "y" ) {
						const val = GSUeaseInCirc( d.args[ 0 ] );
						const newVal = this.#getLHmin() + val * ( this.#getLHmax() - this.#getLHmin() );
						const scrollBack = this.#calcScrollBack( this.scrollTop, this.#lineHeight, newVal, 0 );

						this.scrollTop = scrollBack;
						GSUsetAttribute( this, "lineheight", newVal );
						GSUdispatchEvent( this, "gsuiTimewindow", "lineheight", newVal );
					}
				},
			},
			gsuiTimeline: {
				inputCurrentTime: GSUnoop,
				changeCurrentTime: d => {
					GSUsetAttribute( this, "currenttime", d.args[ 0 ] );
					return true;
				},
				inputLoop: d => {
					GSUsetAttribute( this, "loop", Number.isFinite( d.args[ 0 ] ) && `${ d.args[ 0 ] }-${ d.args[ 1 ] }` );
					return true;
				},
				inputLoopEnd: () => this.style.overflowY = "",
				inputLoopStart: () => this.style.overflowY = "hidden",
				inputCurrentTimeEnd: () => this.style.overflowY = "",
				inputCurrentTimeStart: () => this.style.overflowY = "hidden",
			},
		} );
		this.timeline.$setScrollingParent( this );
		this.ondragstart = GSUnoopFalse;
		this.$elements.$main.onwheel = this.#onwheel.bind( this );
		this.$elements.$stepBtn.onclick = this.#onclickStep.bind( this );
		this.$elements.$mainCnt.oncontextmenu = e => e.preventDefault();
		this.$elements.$panelCnt.onwheel = this.#onwheelPanel.bind( this );
		this.$elements.$panel.querySelector( ".gsuiTimewindow-panelExtendY" ).onpointerdown = this.#onptrdownExtend.bind( this, "side" );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.$elements.$panel.style.minWidth = `${ GSUgetAttributeNum( this, "panelsize" ) || 100 }px`;
		if ( this.hasAttribute( "downpanel" ) ) {
			this.$elements.$panelDown.firstChild.onpointerdown =
			this.$elements.$down.firstChild.onpointerdown = this.#onptrdownExtend.bind( this, "down" );
			this.$elements.$panelDown.style.height =
			this.$elements.$down.style.height = `${ GSUgetAttributeNum( this, "downpanelsize" ) || 50 }px`;
		} else {
			this.$elements.$panelDown.remove();
			this.$elements.$down.remove();
		}
		this.#scrollShadow = new gsuiScrollShadow( {
			scrolledElem: this,
			leftShadow: this.$elements.$panel,
			topShadow: [
				this.querySelector( ".gsuiTimewindow-panelUp" ),
				this.querySelector( ".gsuiTimewindow-time" ),
			],
		} );
	}
	$disconnected() {
		this.#scrollShadow.$disconnected();
	}
	static get observedAttributes() {
		return [ "step", "timedivision", "pxperbeat", "lineheight", "currenttime", "loop" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "step":
				GSUsetAttribute( this.$elements.$timeline, "step", val );
				this.$elements.$stepBtn.firstChild.textContent = this.#convertStepToFrac( +val );
				break;
			case "timedivision":
				GSUsetAttribute( this.$elements.$timeline, "timedivision", val );
				GSUsetAttribute( this.$elements.$beatlines, "timedivision", val );
				break;
			case "pxperbeat":
				this.#pxPerBeat = +val;
				GSUsetAttribute( this.$elements.$timeline, "pxperbeat", val );
				GSUsetAttribute( this.$elements.$beatlines, "pxperbeat", val );
				GSUsetAttribute( this.$elements.$sliderZoomX, "value", GSUeaseOutCirc( ( val - this.#getPPBmin() ) / ( this.#getPPBmax() - this.#getPPBmin() ) ) );
				this.style.setProperty( "--gsuiTimewindow-pxperbeat", `${ val }px` );
				this.$elements.$currentTime.style.fontSize =
				this.$elements.$loopA.style.fontSize =
				this.$elements.$loopB.style.fontSize = `${ val }px`;
				break;
			case "lineheight":
				this.#lineHeight = +val;
				GSUsetAttribute( this.$elements.$sliderZoomY, "value", GSUeaseOutCirc( ( val - this.#getLHmin() ) / ( this.#getLHmax() - this.#getLHmin() ) ) );
				this.style.setProperty( "--gsuiTimewindow-lineH", `${ val }px` );
				break;
			case "currenttime": {
				const step = GSUgetAttributeNum( this, "currenttimestep" );

				GSUsetAttribute( this.$elements.$timeline, "currenttime", val );
				if ( step ) {
					this.$elements.$currentTime.style.left = `${ ( val / step | 0 ) * step }em`;
				} else {
					this.$elements.$currentTime.style.left = `${ val }em`;
				}
			} break;
			case "loop":
				if ( val ) {
					const [ a, b ] = val.split( "-" );

					this.classList.add( "gsuiTimewindow-looping" );
					GSUsetAttribute( this.$elements.$timeline, "loop", val );
					this.$elements.$loopA.style.width = `${ a }em`;
					this.$elements.$loopB.style.left = `${ b }em`;
				} else {
					this.classList.remove( "gsuiTimewindow-looping" );
					this.$elements.$timeline.removeAttribute( "loop" );
				}
				break;
		}
	}

	// .........................................................................
	$appendMain( ...el ) { this.$elements.$mainCnt.append( ...el ); }
	$appendDown( ...el ) { this.$elements.$down.append( ...el ); }
	$appendPanel( ...el ) { this.$elements.$panelCnt.append( ...el ); }
	$appendPanelDown( ...el ) { this.$elements.$panelDown.append( ...el ); }

	// .........................................................................
	#convertStepToFrac( step ) {
		return (
			step >= 1 ? "1" :
			step >= .5 ? "1/2" :
			step >= .25 ? "1/4" : "1/8"
		);
	}
	#getPPBmin() { return GSUgetAttributeNum( this, "pxperbeatmin" ) || 8; }
	#getPPBmax() { return GSUgetAttributeNum( this, "pxperbeatmax" ) || 512; }
	#getLHmin() { return GSUgetAttributeNum( this, "lineheightmin" ) || 24; }
	#getLHmax() { return GSUgetAttributeNum( this, "lineheightmax" ) || 256; }
	#calcScrollBack( scroll, ppb, ppbNew, ptrPx ) {
		const scrollVal = scroll / ppb;
		const scrollIncr = ptrPx / ppb * ( ppbNew - ppb );

		return scrollVal * ppbNew + scrollIncr;
	}

	// .........................................................................
	#onclickStep() {
		const v = GSUgetAttributeNum( this, "step" );
		const frac =
			v >= 1 ? .5 :
			v >= .5 ? .25 :
			v >= .25 ? .125 : 1;

		GSUsetAttribute( this, "step", frac );
	}
	#onwheel( e ) {
		if ( e.ctrlKey ) {
			const mul = e.deltaY > 0 ? .9 : 1.1;
			const ppbNew = Math.round( Math.min( Math.max( this.#getPPBmin(), this.#pxPerBeat * mul ), this.#getPPBmax() ) );

			e.preventDefault();
			if ( ppbNew !== this.#pxPerBeat ) {
				const px = e.pageX - this.getBoundingClientRect().left - parseInt( this.$elements.$panel.style.minWidth );

				this.scrollLeft = this.#calcScrollBack( this.scrollLeft, this.#pxPerBeat, ppbNew, px );
				GSUsetAttribute( this, "pxperbeat", ppbNew );
				GSUdispatchEvent( this, "gsuiTimewindow", "pxperbeat", ppbNew );
			}
		}
	}
	#onwheelPanel( e ) {
		if ( e.ctrlKey ) {
			const mul = e.deltaY > 0 ? .9 : 1.1;
			const lhNew = Math.round( Math.min( Math.max( this.#getLHmin(), this.#lineHeight * mul ), this.#getLHmax() ) );

			e.preventDefault();
			if ( lhNew !== this.#lineHeight ) {
				const px = e.pageY - this.getBoundingClientRect().top - parseInt( this.$elements.$timeline.clientHeight );

				this.scrollTop = this.#calcScrollBack( this.scrollTop, this.#lineHeight, lhNew, px );
				GSUsetAttribute( this, "lineheight", lhNew );
				GSUdispatchEvent( this, "gsuiTimewindow", "lineheight", lhNew );
			}
		}
	}
	#onptrdownExtend( panel, e ) {
		GSUunselectText();
		this.setPointerCapture( e.pointerId );
		if ( panel === "side" ) {
			this.#panelSize = this.$elements.$panel.clientWidth;
			this.#ptrdownPageX = e.pageX;
			document.addEventListener( "pointermove", this.#onptrmoveExtendPanelBind );
		} else {
			this.#panelSize = this.$elements.$down.clientHeight;
			this.#ptrdownPageY = e.pageY;
			document.addEventListener( "pointermove", this.#onptrmoveExtendDownPanelBind );
		}
		document.addEventListener( "pointerup", this.#onptrupExtendBind );
	}
	#onptrmoveExtendPanel( e ) {
		const w = this.#panelSize + ( e.pageX - this.#ptrdownPageX );
		const min = GSUgetAttributeNum( this, "panelsizemin" ) || 50;
		const max = GSUgetAttributeNum( this, "panelsizemax" ) || 260;
		const w2 = Math.max( min, Math.min( w, max ) );

		this.$elements.$panel.style.minWidth = `${ w2 }px`;
	}
	#onptrmoveExtendDownPanel( e ) {
		const h = this.#panelSize + ( this.#ptrdownPageY - e.pageY );
		const min = GSUgetAttributeNum( this, "downpanelsizemin" ) || 50;
		const max = GSUgetAttributeNum( this, "downpanelsizemax" ) || 260;
		const h2 = Math.max( min, Math.min( h, max ) );

		this.$elements.$panelDown.style.height =
		this.$elements.$down.style.height = `${ h2 }px`;
	}
	#onptrupExtend( e ) {
		this.releasePointerCapture( e.pointerId );
		document.removeEventListener( "pointermove", this.#onptrmoveExtendDownPanelBind );
		document.removeEventListener( "pointermove", this.#onptrmoveExtendPanelBind );
		document.removeEventListener( "pointerup", this.#onptrupExtendBind );
	}
}

Object.freeze( gsuiTimewindow );
customElements.define( "gsui-timewindow", gsuiTimewindow );
