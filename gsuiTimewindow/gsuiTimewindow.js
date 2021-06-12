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
	#children = null
	#elPanel = null
	#elStepBtn = null
	#elPanelDown = null
	#elBeatlines = null
	#elCurrentTime = null
	#elLoopA = null
	#elLoopB = null
	#elDown = null

	constructor() {
		const children = GSUI.getTemplate( "gsui-timewindow" ),
			elPanel = children[ 0 ],
			elMain = children[ 1 ];

		super();
		this.timeline = elMain.querySelector( "gsui-timeline" );
		this.#children = children;
		this.#elPanel = elPanel;
		this.#elStepBtn = elPanel.querySelector( ".gsuiTimewindow-step" );
		this.#elPanelDown = elPanel.querySelector( ".gsuiTimewindow-panelContentDown" );
		this.#elBeatlines = elMain.querySelector( "gsui-beatlines" );
		this.#elCurrentTime = elMain.querySelector( ".gsuiTimewindow-currentTime" );
		this.#elLoopA = elMain.querySelector( ".gsuiTimewindow-loopA" );
		this.#elLoopB = elMain.querySelector( ".gsuiTimewindow-loopB" );
		this.#elDown = elMain.querySelector( ".gsuiTimewindow-contentDown" );
		Object.seal( this );

		this.addEventListener( "gsuiEvents", this.#ongsuiEvents.bind( this ) );
		this.ondragstart = () => false;
		elMain.onwheel = this.#onwheel.bind( this );
		this.#elStepBtn.onclick = this.#onclickStep.bind( this );
		elMain.querySelector( ".gsuiTimewindow-mainContent" ).oncontextmenu = e => e.preventDefault();
		elPanel.querySelector( ".gsuiTimewindow-panelContent" ).onwheel = this.#onwheelPanel.bind( this );
		elPanel.querySelector( ".gsuiTimewindow-panelExtendY" ).onmousedown = this.#onmousedownExtend.bind( this, "side" );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.classList.add( "gsuiTimewindow" );
			this.#elPanel.style.minWidth = `${ this.getAttribute( "panelsize" ) || 100 }px`;
			this.append( ...this.#children );
			if ( this.hasAttribute( "downpanel" ) ) {
				this.#elPanelDown.firstChild.onmousedown =
				this.#elDown.firstChild.onmousedown = this.#onmousedownExtend.bind( this, "down" );
				this.#elPanelDown.style.height =
				this.#elDown.style.height = `${ this.getAttribute( "downpanelsize" ) || 50 }px`;
			} else {
				this.#elPanelDown.remove();
				this.#elDown.remove();
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
					this.timeline.setAttribute( "step", val );
					this.#elStepBtn.firstChild.textContent = this.#convertStepToFrac( +val );
					break;
				case "timedivision":
					this.timeline.setAttribute( "timedivision", val );
					this.#elBeatlines.setAttribute( "timedivision", val );
					break;
				case "pxperbeat":
					this.#pxPerBeat = +val;
					this.timeline.setAttribute( "pxperbeat", val );
					this.#elBeatlines.setAttribute( "pxperbeat", val );
					this.style.setProperty( "--gsuiTimewindow-pxperbeat", `${ val }px` );
					this.#elCurrentTime.style.fontSize =
					this.#elLoopA.style.fontSize =
					this.#elLoopB.style.fontSize = `${ val }px`;
					break;
				case "lineheight":
					this.#lineHeight = +val;
					this.style.setProperty( "--gsuiTimewindow-lineH", `${ val }px` );
					break;
				case "currenttime": {
					const step = +this.getAttribute( "currenttimestep" );

					this.timeline.setAttribute( "currenttime", val );
					if ( step ) {
						this.#elCurrentTime.style.left = `${ ( val / step | 0 ) * step }em`;
					} else {
						this.#elCurrentTime.style.left = `${ val }em`;
					}
				} break;
				case "loop":
					if ( val ) {
						const [ a, b ] = val.split( "-" );

						this.classList.add( "gsuiTimewindow-looping" );
						this.timeline.setAttribute( "loop", val );
						this.#elLoopA.style.width = `${ a }em`;
						this.#elLoopB.style.left = `${ b }em`;
					} else {
						this.classList.remove( "gsuiTimewindow-looping" );
						this.timeline.removeAttribute( "loop" );
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
	#ongsuiEvents( e ) {
		const d = e.detail;

		switch ( d.component ) {
			case "gsuiTimeline": {
				const [ a, b ] = d.args;

				switch ( d.eventName ) {
					case "changeCurrentTime":
						this.setAttribute( "currenttime", a );
						break;
					case "inputCurrentTime":
						e.stopPropagation();
						break;
					case "inputLoop":
						GSUI.setAttribute( this, "loop", Number.isFinite( a ) && `${ a }-${ b }` );
						break;
					case "inputLoopStart":
					case "inputCurrentTimeStart":
						this.style.overflowY = "hidden";
						e.stopPropagation();
						break;
					case "inputLoopEnd":
					case "inputCurrentTimeEnd":
						this.style.overflowY = "";
						e.stopPropagation();
						break;
				}
			} break;
		}
	}
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
				offpx = parseInt( this.#elPanel.style.minWidth ),
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
				offpx = parseInt( this.timeline.clientHeight ),
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
			this.#panelSize = this.#elPanel.clientWidth;
			this.#mousedownPageX = e.pageX;
			GSUI.dragshield.show( "ew-resize" );
			document.addEventListener( "mousemove", this.#onmousemoveExtendPanelBind );
		} else {
			this.#panelSize = this.#elDown.clientHeight;
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

		this.#elPanel.style.minWidth = `${ w2 }px`;
	}
	#onmousemoveExtendDownPanel( e ) {
		const h = this.#panelSize + ( this.#mousedownPageY - e.pageY ),
			min = +this.getAttribute( "downpanelsizemin" ) || 50,
			max = +this.getAttribute( "downpanelsizemax" ) || 260,
			h2 = Math.max( min, Math.min( h, max ) );

		this.#elPanelDown.style.height =
		this.#elDown.style.height = `${ h2 }px`;
	}
	#onmouseupExtend() {
		document.removeEventListener( "mousemove", this.#onmousemoveExtendDownPanelBind );
		document.removeEventListener( "mousemove", this.#onmousemoveExtendPanelBind );
		document.removeEventListener( "mouseup", this.#onmouseupExtendBind );
		GSUI.dragshield.hide();
	}
}

customElements.define( "gsui-timewindow", gsuiTimewindow );
