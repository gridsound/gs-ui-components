"use strict";

class gsuiTimewindow extends gsui0ne {
	#pxPerBeat = 0;
	#panelSize = 0;
	#lineHeight = 0;
	#mousedownPageX = 0;
	#mousedownPageY = 0;
	#onmouseupExtendBind = this.#onmouseupExtend.bind( this );
	#onmousemoveExtendPanelBind = this.#onmousemoveExtendPanel.bind( this );
	#onmousemoveExtendDownPanelBind = this.#onmousemoveExtendDownPanel.bind( this );

	constructor() {
		super( {
			$cmpName: "gsuiTimewindow",
			$tagName: "gsui-timewindow",
			$elements: {
				main: ".gsuiTimewindow-main",
				down: ".gsuiTimewindow-contentDown",
				panel: ".gsuiTimewindow-panel",
				panelDown: ".gsuiTimewindow-panelContentDown",
				stepBtn: ".gsuiTimewindow-step",
				sliderZoomX: "gsui-slider[data-zoom=x]",
				sliderZoomY: "gsui-slider[data-zoom=y]",
				timeline: "gsui-timeline",
				beatlines: "gsui-beatlines",
				loopA: ".gsuiTimewindow-loopA",
				loopB: ".gsuiTimewindow-loopB",
				currentTime: ".gsuiTimewindow-currentTime",
			},
			$attributes: {
				step: 1,
				pxperbeat: 100,
				lineheight: 48,
				currenttime: 0,
			},
		} );
		this.timeline = this.$elements.timeline;
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
		this.$elements.main.onwheel = this.#onwheel.bind( this );
		this.$elements.stepBtn.onclick = this.#onclickStep.bind( this );
		this.$elements.main.querySelector( ".gsuiTimewindow-mainContent" ).oncontextmenu = e => e.preventDefault();
		this.$elements.panel.querySelector( ".gsuiTimewindow-panelContent" ).onwheel = this.#onwheelPanel.bind( this );
		this.$elements.panel.querySelector( ".gsuiTimewindow-panelExtendY" ).onmousedown = this.#onmousedownExtend.bind( this, "side" );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.$elements.panel.style.minWidth = `${ GSUgetAttributeNum( this, "panelsize" ) || 100 }px`;
		if ( this.hasAttribute( "downpanel" ) ) {
			this.$elements.panelDown.firstChild.onmousedown =
			this.$elements.down.firstChild.onmousedown = this.#onmousedownExtend.bind( this, "down" );
			this.$elements.panelDown.style.height =
			this.$elements.down.style.height = `${ GSUgetAttributeNum( this, "downpanelsize" ) || 50 }px`;
		} else {
			this.$elements.panelDown.remove();
			this.$elements.down.remove();
		}
		new gsuiScrollShadow( {
			scrolledElem: this,
			leftShadow: this.$elements.panel,
			topShadow: [
				this.querySelector( ".gsuiTimewindow-panelUp" ),
				this.querySelector( ".gsuiTimewindow-time" ),
			],
		} );
	}
	static get observedAttributes() {
		return [ "step", "timedivision", "pxperbeat", "lineheight", "currenttime", "loop" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "step":
				GSUsetAttribute( this.$elements.timeline, "step", val );
				this.$elements.stepBtn.firstChild.textContent = this.#convertStepToFrac( +val );
				break;
			case "timedivision":
				GSUsetAttribute( this.$elements.timeline, "timedivision", val );
				GSUsetAttribute( this.$elements.beatlines, "timedivision", val );
				break;
			case "pxperbeat":
				this.#pxPerBeat = +val;
				GSUsetAttribute( this.$elements.timeline, "pxperbeat", val );
				GSUsetAttribute( this.$elements.beatlines, "pxperbeat", val );
				GSUsetAttribute( this.$elements.sliderZoomX, "value", GSUeaseOutCirc( ( val - this.#getPPBmin() ) / ( this.#getPPBmax() - this.#getPPBmin() ) ) );
				this.style.setProperty( "--gsuiTimewindow-pxperbeat", `${ val }px` );
				this.$elements.currentTime.style.fontSize =
				this.$elements.loopA.style.fontSize =
				this.$elements.loopB.style.fontSize = `${ val }px`;
				break;
			case "lineheight":
				this.#lineHeight = +val;
				GSUsetAttribute( this.$elements.sliderZoomY, "value", GSUeaseOutCirc( ( val - this.#getLHmin() ) / ( this.#getLHmax() - this.#getLHmin() ) ) );
				this.style.setProperty( "--gsuiTimewindow-lineH", `${ val }px` );
				break;
			case "currenttime": {
				const step = GSUgetAttributeNum( this, "currenttimestep" );

				GSUsetAttribute( this.$elements.timeline, "currenttime", val );
				if ( step ) {
					this.$elements.currentTime.style.left = `${ ( val / step | 0 ) * step }em`;
				} else {
					this.$elements.currentTime.style.left = `${ val }em`;
				}
			} break;
			case "loop":
				if ( val ) {
					const [ a, b ] = val.split( "-" );

					this.classList.add( "gsuiTimewindow-looping" );
					GSUsetAttribute( this.$elements.timeline, "loop", val );
					this.$elements.loopA.style.width = `${ a }em`;
					this.$elements.loopB.style.left = `${ b }em`;
				} else {
					this.classList.remove( "gsuiTimewindow-looping" );
					this.$elements.timeline.removeAttribute( "loop" );
				}
				break;
		}
	}

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
	#calcScrollBack( scroll, currValue, newValue, mousepx ) {
		const scrollVal = scroll / currValue;
		const scrollIncr = mousepx / currValue * ( newValue - currValue );

		return scrollVal * newValue + scrollIncr;
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
				const px = e.pageX - this.getBoundingClientRect().left - parseInt( this.$elements.panel.style.minWidth );

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
				const px = e.pageY - this.getBoundingClientRect().top - parseInt( this.$elements.timeline.clientHeight );

				this.scrollTop = this.#calcScrollBack( this.scrollTop, this.#lineHeight, lhNew, px );
				GSUsetAttribute( this, "lineheight", lhNew );
				GSUdispatchEvent( this, "gsuiTimewindow", "lineheight", lhNew );
			}
		}
	}
	#onmousedownExtend( panel, e ) {
		GSUunselectText();
		if ( panel === "side" ) {
			this.#panelSize = this.$elements.panel.clientWidth;
			this.#mousedownPageX = e.pageX;
			GSUdragshield.show( "ew-resize" );
			document.addEventListener( "mousemove", this.#onmousemoveExtendPanelBind );
		} else {
			this.#panelSize = this.$elements.down.clientHeight;
			this.#mousedownPageY = e.pageY;
			GSUdragshield.show( "ns-resize" );
			document.addEventListener( "mousemove", this.#onmousemoveExtendDownPanelBind );
		}
		document.addEventListener( "mouseup", this.#onmouseupExtendBind );
	}
	#onmousemoveExtendPanel( e ) {
		const w = this.#panelSize + ( e.pageX - this.#mousedownPageX );
		const min = GSUgetAttributeNum( this, "panelsizemin" ) || 50;
		const max = GSUgetAttributeNum( this, "panelsizemax" ) || 260;
		const w2 = Math.max( min, Math.min( w, max ) );

		this.$elements.panel.style.minWidth = `${ w2 }px`;
	}
	#onmousemoveExtendDownPanel( e ) {
		const h = this.#panelSize + ( this.#mousedownPageY - e.pageY );
		const min = GSUgetAttributeNum( this, "downpanelsizemin" ) || 50;
		const max = GSUgetAttributeNum( this, "downpanelsizemax" ) || 260;
		const h2 = Math.max( min, Math.min( h, max ) );

		this.$elements.panelDown.style.height =
		this.$elements.down.style.height = `${ h2 }px`;
	}
	#onmouseupExtend() {
		document.removeEventListener( "mousemove", this.#onmousemoveExtendDownPanelBind );
		document.removeEventListener( "mousemove", this.#onmousemoveExtendPanelBind );
		document.removeEventListener( "mouseup", this.#onmouseupExtendBind );
		GSUdragshield.hide();
	}
}

Object.freeze( gsuiTimewindow );
customElements.define( "gsui-timewindow", gsuiTimewindow );
