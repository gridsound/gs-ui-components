"use strict";

class gsuiTimewindow extends HTMLElement {
	#pxPerBeat = 0
	#panelSize = 0
	#lineHeight = 0
	#mousedownPageX = 0
	#mousedownPageY = 0
	#onmouseupExtendBind = this.#onmouseupExtend.bind( this )
	#onmousemoveExtendPanelBind = this.#onmousemoveExtendPanel.bind( this )
	#onmousemoveExtendDownPanelBind = this.#onmousemoveExtendDownPanel.bind( this )
	#children = GSUI.getTemplate( "gsui-timewindow" )
	#elements = GSUI.findElements( this.#children, {
		main: ".gsuiTimewindow-main",
		down: ".gsuiTimewindow-contentDown",
		panel: ".gsuiTimewindow-panel",
		panelDown: ".gsuiTimewindow-panelContentDown",
		stepBtn: ".gsuiTimewindow-step",
		timeline: "gsui-timeline",
		beatlines: "gsui-beatlines",
		loopA: ".gsuiTimewindow-loopA",
		loopB: ".gsuiTimewindow-loopB",
		currentTime: ".gsuiTimewindow-currentTime",
	} )

	constructor() {
		super();
		this.timeline = this.#elements.timeline;
		Object.seal( this );

		GSUI.listenEvents( this, {
			gsuiTimeline: {
				inputCurrentTime: GSUI.noop,
				changeCurrentTime: d => {
					GSUI.setAttribute( this, "currenttime", d.args[ 0 ] );
					return true;
				},
				inputLoop: d => {
					GSUI.setAttribute( this, "loop", Number.isFinite( d.args[ 0 ] ) && `${ d.args[ 0 ] }-${ d.args[ 1 ] }` );
					return true;
				},
				inputLoopEnd: () => this.style.overflowY = "",
				inputLoopStart: () => this.style.overflowY = "hidden",
				inputCurrentTimeEnd: () => this.style.overflowY = "",
				inputCurrentTimeStart: () => this.style.overflowY = "hidden",
			},
		} );
		this.ondragstart = () => false;
		this.#elements.main.onwheel = this.#onwheel.bind( this );
		this.#elements.stepBtn.onclick = this.#onclickStep.bind( this );
		this.#elements.main.querySelector( ".gsuiTimewindow-mainContent" ).oncontextmenu = e => e.preventDefault();
		this.#elements.panel.querySelector( ".gsuiTimewindow-panelContent" ).onwheel = this.#onwheelPanel.bind( this );
		this.#elements.panel.querySelector( ".gsuiTimewindow-panelExtendY" ).onmousedown = this.#onmousedownExtend.bind( this, "side" );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.classList.add( "gsuiTimewindow" );
			this.#elements.panel.style.minWidth = `${ this.getAttribute( "panelsize" ) || 100 }px`;
			this.append( ...this.#children );
			if ( this.hasAttribute( "downpanel" ) ) {
				this.#elements.panelDown.firstChild.onmousedown =
				this.#elements.down.firstChild.onmousedown = this.#onmousedownExtend.bind( this, "down" );
				this.#elements.panelDown.style.height =
				this.#elements.down.style.height = `${ this.getAttribute( "downpanelsize" ) || 50 }px`;
			} else {
				this.#elements.panelDown.remove();
				this.#elements.down.remove();
			}
			this.#children = null;
			if ( !this.hasAttribute( "step" ) ) {
				this.setAttribute( "step", 1 );
			}
			if ( !this.hasAttribute( "pxperbeat" ) ) {
				this.setAttribute( "pxperbeat", 100 );
			}
			if ( !this.hasAttribute( "lineheight" ) ) {
				this.setAttribute( "lineheight", 48 );
			}
		}
	}
	static get observedAttributes() {
		return [ "step", "timedivision", "pxperbeat", "lineheight", "currenttime", "loop" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "step":
					this.#elements.timeline.setAttribute( "step", val );
					this.#elements.stepBtn.firstChild.textContent = this.#convertStepToFrac( +val );
					break;
				case "timedivision":
					this.#elements.timeline.setAttribute( "timedivision", val );
					this.#elements.beatlines.setAttribute( "timedivision", val );
					break;
				case "pxperbeat":
					this.#pxPerBeat = +val;
					this.#elements.timeline.setAttribute( "pxperbeat", val );
					this.#elements.beatlines.setAttribute( "pxperbeat", val );
					this.style.setProperty( "--gsuiTimewindow-pxperbeat", `${ val }px` );
					this.#elements.currentTime.style.fontSize =
					this.#elements.loopA.style.fontSize =
					this.#elements.loopB.style.fontSize = `${ val }px`;
					break;
				case "lineheight":
					this.#lineHeight = +val;
					this.style.setProperty( "--gsuiTimewindow-lineH", `${ val }px` );
					break;
				case "currenttime": {
					const step = +this.getAttribute( "currenttimestep" );

					this.#elements.timeline.setAttribute( "currenttime", val );
					if ( step ) {
						this.#elements.currentTime.style.left = `${ ( val / step | 0 ) * step }em`;
					} else {
						this.#elements.currentTime.style.left = `${ val }em`;
					}
				} break;
				case "loop":
					if ( val ) {
						const [ a, b ] = val.split( "-" );

						this.classList.add( "gsuiTimewindow-looping" );
						this.#elements.timeline.setAttribute( "loop", val );
						this.#elements.loopA.style.width = `${ a }em`;
						this.#elements.loopB.style.left = `${ b }em`;
					} else {
						this.classList.remove( "gsuiTimewindow-looping" );
						this.#elements.timeline.removeAttribute( "loop" );
					}
					break;
			}
		}
	}

	// .........................................................................
	#convertStepToFrac( step ) {
		return (
			step >= 1 ? "1" :
			step >= .5 ? "1 / 2" :
			step >= .25 ? "1 / 4" : "1 / 8"
		);
	}

	// .........................................................................
	#onclickStep() {
		const v = +this.getAttribute( "step" ),
			frac =
				v >= 1 ? 2 :
				v >= .5 ? 4 :
				v >= .25 ? 8 : 1;

		this.setAttribute( "step", 1 / frac );
	}
	#onwheel( e ) {
		if ( e.ctrlKey ) {
			const ppb = this.#pxPerBeat,
				min = +this.getAttribute( "pxperbeatmin" ) || 8,
				max = +this.getAttribute( "pxperbeatmax" ) || 512,
				offpx = parseInt( this.#elements.panel.style.minWidth ),
				mousepx = e.pageX - this.getBoundingClientRect().left - offpx,
				scrollPpb = this.scrollLeft / ppb,
				mul = e.deltaY > 0 ? .9 : 1.1,
				ppbNew = Math.round( Math.min( Math.max( min, ppb * mul ), max ) );

			e.preventDefault();
			if ( ppbNew !== ppb ) {
				const scrollIncr = mousepx / ppb * ( ppbNew - ppb );

				this.setAttribute( "pxperbeat", ppbNew );
				this.scrollLeft = scrollPpb * ppbNew + scrollIncr;
				GSUI.dispatchEvent( this, "gsuiTimewindow", "pxperbeat", ppbNew );
			}
		}
	}
	#onwheelPanel( e ) {
		if ( e.ctrlKey ) {
			const lh = this.#lineHeight,
				min = +this.getAttribute( "lineheightmin" ) || 24,
				max = +this.getAttribute( "lineheightmax" ) || 256,
				offpx = parseInt( this.#elements.timeline.clientHeight ),
				mousepx = e.pageY - this.getBoundingClientRect().top - offpx,
				scrollLh = this.scrollTop / lh,
				mul = e.deltaY > 0 ? .9 : 1.1,
				lhNew = Math.round( Math.min( Math.max( min, lh * mul ), max ) );

			e.preventDefault();
			if ( lhNew !== lh ) {
				const scrollIncr = mousepx / lh * ( lhNew - lh );

				this.setAttribute( "lineheight", lhNew );
				this.scrollTop = scrollLh * lhNew + scrollIncr;
				GSUI.dispatchEvent( this, "gsuiTimewindow", "lineheight", lhNew );
			}
		}
	}
	#onmousedownExtend( panel, e ) {
		GSUI.unselectText();
		if ( panel === "side" ) {
			this.#panelSize = this.#elements.panel.clientWidth;
			this.#mousedownPageX = e.pageX;
			GSUI.dragshield.show( "ew-resize" );
			document.addEventListener( "mousemove", this.#onmousemoveExtendPanelBind );
		} else {
			this.#panelSize = this.#elements.down.clientHeight;
			this.#mousedownPageY = e.pageY;
			GSUI.dragshield.show( "ns-resize" );
			document.addEventListener( "mousemove", this.#onmousemoveExtendDownPanelBind );
		}
		document.addEventListener( "mouseup", this.#onmouseupExtendBind );
	}
	#onmousemoveExtendPanel( e ) {
		const w = this.#panelSize + ( e.pageX - this.#mousedownPageX ),
			min = +this.getAttribute( "panelsizemin" ) || 50,
			max = +this.getAttribute( "panelsizemax" ) || 260,
			w2 = Math.max( min, Math.min( w, max ) );

		this.#elements.panel.style.minWidth = `${ w2 }px`;
	}
	#onmousemoveExtendDownPanel( e ) {
		const h = this.#panelSize + ( this.#mousedownPageY - e.pageY ),
			min = +this.getAttribute( "downpanelsizemin" ) || 50,
			max = +this.getAttribute( "downpanelsizemax" ) || 260,
			h2 = Math.max( min, Math.min( h, max ) );

		this.#elements.panelDown.style.height =
		this.#elements.down.style.height = `${ h2 }px`;
	}
	#onmouseupExtend() {
		document.removeEventListener( "mousemove", this.#onmousemoveExtendDownPanelBind );
		document.removeEventListener( "mousemove", this.#onmousemoveExtendPanelBind );
		document.removeEventListener( "mouseup", this.#onmouseupExtendBind );
		GSUI.dragshield.hide();
	}
}

customElements.define( "gsui-timewindow", gsuiTimewindow );
