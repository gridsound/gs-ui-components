"use strict";

class gsuiTimewindow extends HTMLElement {
	constructor() {
		const children = GSUI.getTemplate( "gsui-timewindow" ),
			elPanel = children[ 0 ],
			elMain = children[ 1 ];

		super();
		this._children = children;
		this._elPanel = elPanel;
		this._elStepBtn = elPanel.querySelector( ".gsuiTimewindow-step" );
		this._elPanelDown = elPanel.querySelector( ".gsuiTimewindow-panelContentDown" );
		this._elTimeline = elMain.querySelector( "gsui-timeline" );
		this._elBeatlines = elMain.querySelector( "gsui-beatlines" );
		this._elCurrentTime = elMain.querySelector( ".gsuiTimewindow-currentTime" );
		this._elLoopA = elMain.querySelector( ".gsuiTimewindow-loopA" );
		this._elLoopB = elMain.querySelector( ".gsuiTimewindow-loopB" );
		this._elDown = elMain.querySelector( ".gsuiTimewindow-contentDown" );
		this._pxPerBeat =
		this._panelSize =
		this._lineHeight =
		this._mousedownPageX =
		this._mousedownPageY = 0;
		this._onmousemoveExtendPanel = this._onmousemoveExtendPanel.bind( this );
		this._onmousemoveExtendDownPanel = this._onmousemoveExtendDownPanel.bind( this );
		this._onmouseupExtend = this._onmouseupExtend.bind( this );
		Object.seal( this );

		this.addEventListener( "gsuiEvents", this._ongsuiEvents.bind( this ) );
		this.ondragstart = () => false;
		elMain.onwheel = this._onwheel.bind( this );
		this._elStepBtn.onclick = this._onclickStep.bind( this );
		elMain.querySelector( ".gsuiTimewindow-mainContent" ).oncontextmenu = e => e.preventDefault();
		elPanel.querySelector( ".gsuiTimewindow-panelContent" ).onwheel = this._onwheelPanel.bind( this );
		elPanel.querySelector( ".gsuiTimewindow-panelExtendY" ).onmousedown = this._onmousedownExtend.bind( this, "side" );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.classList.add( "gsuiTimewindow" );
			this._elPanel.style.minWidth = `${ this.getAttribute( "panelsize" ) || 100 }px`;
			this.append( ...this._children );
			if ( this.hasAttribute( "downpanel" ) ) {
				this._elPanelDown.firstChild.onmousedown =
				this._elDown.firstChild.onmousedown = this._onmousedownExtend.bind( this, "down" );
				this._elPanelDown.style.height =
				this._elDown.style.height = `${ this.getAttribute( "downpanelsize" ) || 50 }px`;
			} else {
				this._elPanelDown.remove();
				this._elDown.remove();
			}
			this._children = null;
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
		return [ "step", "timesignature", "pxperbeat", "lineheight", "currenttime", "loop" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "step":
					this._elTimeline.setAttribute( "step", val );
					this._elStepBtn.firstChild.textContent = this._convertStepToFrac( +val );
					break;
				case "timesignature":
					this._elTimeline.setAttribute( "timesignature", val );
					this._elBeatlines.setAttribute( "timesignature", val );
					break;
				case "pxperbeat":
					this._pxPerBeat = +val;
					this._elTimeline.setAttribute( "pxperbeat", val );
					this._elBeatlines.setAttribute( "pxperbeat", val );
					this.style.setProperty( "--gsuiTimewindow-pxperbeat", `${ val }px` );
					this._elCurrentTime.style.fontSize =
					this._elLoopA.style.fontSize =
					this._elLoopB.style.fontSize = `${ val }px`;
					break;
				case "lineheight":
					this._lineHeight = +val;
					this.style.setProperty( "--gsuiTimewindow-lineH", `${ val }px` );
					break;
				case "currenttime": {
					const step = +this.getAttribute( "currenttimestep" );

					this._elTimeline.setAttribute( "currenttime", val );
					if ( step ) {
						this._elCurrentTime.style.left = `${ ( val / step | 0 ) * step }em`;
					} else {
						this._elCurrentTime.style.left = `${ val }em`;
					}
				} break;
				case "loop":
					if ( val ) {
						const [ a, b ] = val.split( "-" );

						this.classList.add( "gsuiTimewindow-looping" );
						this._elTimeline.setAttribute( "loop", val );
						this._elLoopA.style.width = `${ a }em`;
						this._elLoopB.style.left = `${ b }em`;
					} else {
						this.classList.remove( "gsuiTimewindow-looping" );
						this._elTimeline.removeAttribute( "loop" );
					}
					break;
			}
		}
	}

	// .........................................................................
	_convertStepToFrac( step ) {
		return (
			step >= 1 ? "1" :
			step >= .5 ? "1 / 2" :
			step >= .25 ? "1 / 4" : "1 / 8"
		);
	}

	// .........................................................................
	_ongsuiEvents( e ) {
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
	_onclickStep() {
		const v = +this.getAttribute( "step" ),
			frac =
				v >= 1 ? 2 :
				v >= .5 ? 4 :
				v >= .25 ? 8 : 1;

		this.setAttribute( "step", 1 / frac );
	}
	_onwheel( e ) {
		if ( e.ctrlKey ) {
			const ppb = this._pxPerBeat,
				min = +this.getAttribute( "pxperbeatmin" ) || 8,
				max = +this.getAttribute( "pxperbeatmax" ) || 512,
				offpx = parseInt( this._elPanel.style.minWidth ),
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
	_onwheelPanel( e ) {
		if ( e.ctrlKey ) {
			const lh = this._lineHeight,
				min = +this.getAttribute( "lineheightmin" ) || 24,
				max = +this.getAttribute( "lineheightmax" ) || 256,
				offpx = parseInt( this._elTimeline.clientHeight ),
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
	_onmousedownExtend( panel, e ) {
		GSUI.unselectText();
		if ( panel === "side" ) {
			this._panelSize = this._elPanel.clientWidth;
			this._mousedownPageX = e.pageX;
			GSUI.dragshield.show( "ew-resize" );
			document.addEventListener( "mousemove", this._onmousemoveExtendPanel );
		} else {
			this._panelSize = this._elDown.clientHeight;
			this._mousedownPageY = e.pageY;
			GSUI.dragshield.show( "ns-resize" );
			document.addEventListener( "mousemove", this._onmousemoveExtendDownPanel );
		}
		document.addEventListener( "mouseup", this._onmouseupExtend );
	}
	_onmousemoveExtendPanel( e ) {
		const w = this._panelSize + ( e.pageX - this._mousedownPageX ),
			min = +this.getAttribute( "panelsizemin" ) || 50,
			max = +this.getAttribute( "panelsizemax" ) || 260,
			w2 = Math.max( min, Math.min( w, max ) );

		this._elPanel.style.minWidth = `${ w2 }px`;
	}
	_onmousemoveExtendDownPanel( e ) {
		const h = this._panelSize + ( this._mousedownPageY - e.pageY ),
			min = +this.getAttribute( "downpanelsizemin" ) || 50,
			max = +this.getAttribute( "downpanelsizemax" ) || 260,
			h2 = Math.max( min, Math.min( h, max ) );

		this._elPanelDown.style.height =
		this._elDown.style.height = `${ h2 }px`;
	}
	_onmouseupExtend() {
		document.removeEventListener( "mousemove", this._onmousemoveExtendDownPanel );
		document.removeEventListener( "mousemove", this._onmousemoveExtendPanel );
		document.removeEventListener( "mouseup", this._onmouseupExtend );
		GSUI.dragshield.hide();
	}
}

customElements.define( "gsui-timewindow", gsuiTimewindow );
