"use strict";

class gsuiTimewindow extends HTMLElement {
	constructor() {
		const children = GSUI.getTemplate( "gsui-timewindow" ),
			elPanel = children[ 0 ],
			elMain = children[ 1 ];

		super();
		this._children = children;
		this._elPanel = elPanel;
		this._elPanelDown = elPanel.children[ 2 ];
		this._elPanelExtend = elPanel.lastChild;
		this._elMain = elMain;
		this._elBeatlines = elMain.children[ 0 ];
		this._elCurrentTime = elMain.children[ 1 ];
		this._elLoopA = elMain.children[ 2 ];
		this._elLoopB = elMain.children[ 3 ];
		this._elTimeline = elMain.children[ 4 ].firstChild;
		this._elContent = elMain.children[ 5 ];
		this._elDown = elMain.lastChild;
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
		elMain.onwheel = this._onwheel.bind( this );
		elPanel.children[ 1 ].onwheel = this._onwheelPanel.bind( this );
		elPanel.style.minWidth = `100px`;
		this._elPanelExtend.onmousedown = this._onmousedownExtend.bind( this, "side" );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.classList.add( "gsuiTimewindow" );
			this.setAttribute( "tabindex", -1 );
			this.setAttribute( "lineheight", 48 );
			this.append( ...this._children );
			if ( this.hasAttribute("downpanel") ) {
				this._elPanelDown.firstChild.onmousedown =
				this._elDown.firstChild.onmousedown = this._onmousedownExtend.bind( this, "down" );
			} else {
				this._elPanelDown.remove();
				this._elDown.remove();
			}
			this._children = null;
		}
	}
	static get observedAttributes() {
		return [ "timesignature", "pxperbeat", "lineheight", "currenttime", "loop" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "timesignature":
					this._elTimeline.setAttribute( "timesignature", val );
					this._elBeatlines.setAttribute( "timesignature", val );
					break;
				case "pxperbeat":
					this._pxPerBeat = +val;
					this._elTimeline.setAttribute( "pxperbeat", val );
					this._elBeatlines.setAttribute( "pxperbeat", val );
					this.style.setProperty( "--gsuiTimeline2-pxperbeat", val );
					this._elMain.style.fontSize = `${ val }px`;
					break;
				case "lineheight":
					this._lineHeight = +val;
					this.style.setProperty( "--gsuiTimeline2-lineH", val );
					break;
				case "currenttime":
					this._elTimeline.setAttribute( "currenttime", val );
					this._elCurrentTime.style.left = `${ val }em`;
					break;
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
	_ongsuiEvents( e ) {
		const d = e.detail;

		switch ( d.component ) {
			case "gsuiTimeline": {
				const [ a, b ] = d.args;

				switch ( d.eventName ) {
					case "changeCurrentTime":
						this.setAttribute( "currenttime", a );
						break;
					case "inputLoop":
						a === false
							? this.removeAttribute( "loop" )
							: this.setAttribute( "loop", `${ a }-${ b }` );
						// e.stopPropagation();
						break;
				}
			} break;
		}
	}
	_onwheel( e ) {
		if ( e.ctrlKey ) {
			const ppb = this._pxPerBeat,
				offpx = parseInt( this._elPanel.style.minWidth ),
				mousepx = e.pageX - this.getBoundingClientRect().left - offpx,
				scrollPpb = this.scrollLeft / ppb,
				mul = e.deltaY > 0 ? .9 : 1.1,
				ppbNew = Math.round( Math.min( Math.max( 8, ppb * mul ), 512 ) ),
				scrollIncr = mousepx / ppb * ( ppbNew - ppb );

			e.preventDefault();
			this.setAttribute( "pxperbeat", ppbNew );
			this.scrollLeft = scrollPpb * ppbNew + scrollIncr;
		}
	}
	_onwheelPanel( e ) {
		if ( e.ctrlKey ) {
			const lh = this._lineHeight,
				offpx = parseInt( this._elTimeline.clientHeight ),
				mousepx = e.pageY - this.getBoundingClientRect().top - offpx,
				scrollLh = this.scrollTop / lh,
				mul = e.deltaY > 0 ? .9 : 1.1,
				lhNew = Math.round( Math.min( Math.max( 24, lh * mul ), 256 ) ),
				scrollIncr = mousepx / lh * ( lhNew - lh );

			e.preventDefault();
			this.setAttribute( "lineheight", lhNew );
			this.scrollTop = scrollLh * lhNew + scrollIncr;
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
			w2 = Math.max( 100, Math.min( w, 200 ) );

		this._elPanel.style.minWidth = `${ w2 }px`;
	}
	_onmousemoveExtendDownPanel( e ) {
		const h = this._panelSize + ( this._mousedownPageY - e.pageY ),
			h2 = Math.max( 60, Math.min( h, 200 ) );

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
