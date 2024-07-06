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
	#minimapAction = null;
	#minimapPPBSaved = 0;
	#minimapPtrPageX = 0;
	#minimapThumbSaved = 0;
	#minimapScrollSaved = 0;
	#minimapIntervalId = null;
	#minimapViewMax = 0;
	#scrollX = 0;
	#scrollY = 0;
	#scrollXint = 0;
	#scrollYint = 0;

	constructor() {
		super( {
			$cmpName: "gsuiTimewindow",
			$tagName: "gsui-timewindow",
			$elements: {
				$scroll: ".gsuiTimewindow-scrollArea",
				$main: ".gsuiTimewindow-main",
				$mainCnt: ".gsuiTimewindow-mainContent",
				$rows: ".gsuiTimewindow-rows",
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
				$minimapPanel: ".gsuiTimewindow-minimapPanel",
				$minimapTrack: ".gsuiTimewindow-minimapTrack",
				$minimapThumb: ".gsuiTimewindow-minimapThumb",
				$minimapLoop: ".gsuiTimewindow-minimapLoop",
				$minimapCurrentTime: ".gsuiTimewindow-minimapCurrentTime",
			},
			$attributes: {
				step: 1,
				duration: 0,
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
						const scrollBack = this.#calcScrollBack( this.#scrollX, this.#pxPerBeat, newVal, 0 );

						this.#setScrollX( scrollBack );
						GSUsetAttribute( this, "pxperbeat", newVal );
						this.$dispatch( "pxperbeat", newVal );
					} else if ( sli.dataset.zoom === "y" ) {
						const val = GSUeaseInCirc( d.args[ 0 ] );
						const newVal = this.#getLHmin() + val * ( this.#getLHmax() - this.#getLHmin() );
						const scrollBack = this.#calcScrollBack( this.#scrollY, this.#lineHeight, newVal, 0 );

						this.#setScrollY( scrollBack );
						GSUsetAttribute( this, "lineheight", newVal );
						this.$dispatch( "lineheight", newVal );
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
		this.timeline.$setScrollingParent( this.$elements.$scroll );
		this.ondragstart = GSUnoopFalse;
		this.$elements.$main.onwheel = this.#onwheel.bind( this );
		this.$elements.$stepBtn.onclick = this.#onclickStep.bind( this );
		this.$elements.$mainCnt.oncontextmenu = e => e.preventDefault();
		this.$elements.$panelCnt.onwheel = this.#onwheelPanel.bind( this );
		this.$elements.$panel.querySelector( ".gsuiTimewindow-panelExtendY" ).onpointerdown = this.#onptrdownExtend.bind( this, "side" );
		this.$elements.$minimapTrack.onpointerdown = this.#onptrdownMinimap.bind( this );
		this.$elements.$scroll.addEventListener( "scroll", e => {
			if ( this.#scrollXint !== e.currentTarget.scrollLeft ) {
				this.#scrollX =
				this.#scrollXint = e.currentTarget.scrollLeft;
			}
			if ( this.#scrollYint !== e.currentTarget.scrollTop ) {
				this.#scrollY =
				this.#scrollYint = e.currentTarget.scrollTop;
			}
			this.#minimapUpdate();
			this.#minimapUpdateCurrentTimeLoop();
		} );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.$elements.$minimapPanel.style.width =
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
			scrolledElem: this.firstChild,
			leftShadow: this.$elements.$panel,
			topShadow: [
				this.querySelector( ".gsuiTimewindow-panelUp" ),
				this.querySelector( ".gsuiTimewindow-time" ),
			],
		} );
		this.#minimapUpdate();
	}
	$disconnected() {
		this.#scrollShadow.$disconnected();
	}
	static get observedAttributes() {
		return [ "step", "timedivision", "pxperbeat", "lineheight", "currenttime", "loop", "duration" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "duration":
				this.#minimapUpdate();
				break;
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
				GSUsetStyle( this, "--gsuiTimewindow-pxperbeat", `${ val }px` );
				this.$elements.$currentTime.style.fontSize =
				this.$elements.$loopA.style.fontSize =
				this.$elements.$loopB.style.fontSize = `${ val }px`;
				this.#minimapUpdate();
				this.#minimapUpdateCurrentTimeLoop();
				break;
			case "lineheight":
				this.#lineHeight = +val;
				GSUsetAttribute( this.$elements.$sliderZoomY, "value", GSUeaseOutCirc( ( val - this.#getLHmin() ) / ( this.#getLHmax() - this.#getLHmin() ) ) );
				GSUsetStyle( this, "--gsuiTimewindow-lineH", `${ val }px` );
				break;
			case "currenttime": {
				const step = GSUgetAttributeNum( this, "currenttimestep" );

				GSUsetAttribute( this.$elements.$timeline, "currenttime", val );
				if ( step ) {
					this.$elements.$currentTime.style.left = `${ ( val / step | 0 ) * step }em`;
				} else {
					this.$elements.$currentTime.style.left = `${ val }em`;
				}
				this.#minimapUpdate();
				this.#minimapUpdateCurrentTimeLoop();
			} break;
			case "loop":
				if ( val ) {
					const [ a, b ] = val.split( "-" );

					this.classList.add( "gsuiTimewindow-looping" );
					GSUsetAttribute( this.$elements.$timeline, "loop", val );
					this.$elements.$loopA.style.width = `${ a }em`;
					this.$elements.$loopB.style.left = `${ b }em`;
					this.#minimapUpdateCurrentTimeLoop();
				} else {
					this.classList.remove( "gsuiTimewindow-looping" );
					this.$elements.$timeline.removeAttribute( "loop" );
				}
				this.#minimapUpdate();
				break;
		}
	}
	$onresize() {
		this.#minimapUpdate();
		this.#minimapUpdateCurrentTimeLoop();
	}

	// .........................................................................
	#minimapUpdate() {
		const mapPx = this.$elements.$minimapTrack.clientWidth;
		const durPx = this.#minimapGetMaxView();

		this.$elements.$minimapThumb.style.left = `${ this.#scrollX / durPx * 100 }%`;
		this.$elements.$minimapThumb.style.width = `${ mapPx / durPx * 100 }%`;
	}
	#minimapUpdateCurrentTimeLoop() {
		const time = GSUgetAttributeNum( this, "currenttime" );
		const loopStr = GSUgetAttribute( this, "loop" );
		const durBeat = this.#minimapGetMaxView() / this.#pxPerBeat;

		this.$elements.$minimapCurrentTime.style.left = `${ time / durBeat * 100 }%`;
		if ( loopStr ) {
			const [ a, b ] = GSUsplitNums( loopStr, "-" );

			this.$elements.$minimapLoop.style.left = `${ a / durBeat * 100 }%`;
			this.$elements.$minimapLoop.style.width = `${ ( b - a ) / durBeat * 100 }%`;
		}
	}
	#minimapGetMaxView() {
		const mapPx = this.$elements.$minimapTrack.clientWidth;
		const dur = this.#minimapGetDuration();
		const viewSize = Math.max( dur * this.#pxPerBeat, this.#scrollX + mapPx );

		return viewSize;
		// this.#minimapViewMax = Math.max( this.#minimapViewMax, viewSize );
		// return this.#minimapAction === "thumb" ? this.#minimapViewMax : viewSize;
	}
	#minimapGetDuration() {
		const dur = GSUgetAttributeNum( this, "duration" );
		const time = GSUgetAttributeNum( this, "currenttime" );
		const loopStr = GSUgetAttribute( this, "loop" );
		const loop = loopStr ? GSUsplitNums( loopStr, "-" )[ 1 ] : 0;

		return Math.max( time, loop, dur, 0 );
	}
	#onptrdownMinimap( e ) {
		const act = e.target.dataset.action;

		this.#minimapAction = act;
		this.#minimapViewMax = 0;
		this.#minimapPtrPageX = e.pageX;
		this.#minimapPPBSaved = this.#pxPerBeat;
		this.#minimapThumbSaved = this.$elements.$minimapThumb.clientWidth;
		this.#minimapScrollSaved = this.#scrollX;
		e.target.setPointerCapture( e.pointerId );
		switch ( act ) {
			case "thumb":
			case "cropA":
			case "cropB":
				this.onpointermove = this.#onptrmoveMinimap.bind( this );
				this.onpointerup = this.#onptrupMinimap.bind( this );
				break;
			case "track": {
				const side = e.pageX > this.$elements.$minimapThumb.getBoundingClientRect().left ? 1 : -1;

				this.onpointerup = this.#onptrupMinimap.bind( this );
				this.#minimapIntervalId = setInterval( () => {
					this.#setScrollX( this.#scrollX + 10 * side );
				}, 10 );
			} break;
		}
	}
	#onptrmoveMinimap( e ) {
		const act = this.#minimapAction;
		const bcr = this.$elements.$minimapTrack.getBoundingClientRect();

		switch ( act ) {
			case "thumb": {
				const durPx = this.#minimapGetMaxView();
				const mapPx = this.$elements.$minimapTrack.clientWidth;
				const relPx = e.pageX - this.#minimapPtrPageX;
				const relPxView = relPx / mapPx * durPx;

				this.#setScrollX( this.#minimapScrollSaved + relPxView );
			} break;
			case "cropA":
			case "cropB": {
				const pageX = Math.max( bcr.left, Math.min( e.pageX, bcr.right ) );
				const relPx = pageX - this.#minimapPtrPageX;
				const rel = 1 - relPx / this.#minimapThumbSaved;
				const ppbNew = this.#rangePPB( act === "cropA"
					? this.#minimapPPBSaved / rel
					: this.#minimapPPBSaved * rel );

				this.#onwheel2( ppbNew, act === "cropA" ? bcr.right : bcr.left );
			} break;
		}
	}
	#onptrupMinimap( e ) {
		clearInterval( this.#minimapIntervalId );
		this.#minimapAction = null;
		this.onpointermove = null;
		this.onpointerup = null;
		this.#minimapViewMax = 0;
		e.target.releasePointerCapture( e.pointerId );
		this.#minimapUpdate();
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
	#rangePPB( ppb ) {
		return Math.min( Math.max( this.#getPPBmin(), ppb ), this.#getPPBmax() );
	}
	#setScrollX( px ) {
		this.#scrollX = Math.max( 0, px );
		this.#scrollXint = parseInt( this.#scrollX );
		this.$elements.$scroll.scrollLeft = this.#scrollX;
	}
	#setScrollY( px ) {
		this.#scrollY = Math.max( 0, px );
		this.#scrollYint = parseInt( this.#scrollY );
		this.$elements.$scroll.scrollTop = this.#scrollY;
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
	#getWheelDelta( d ) {
		let inc = 1.1;

		if ( -50 < d && d < 50 ) {
			inc = 1 + Math.abs( d ) / 100;
		}
		return d > 0 ? 1 / inc : inc;
	}
	#onwheel( e ) {
		if ( e.ctrlKey ) {
			e.preventDefault();
			this.#onwheel2( this.#pxPerBeat * this.#getWheelDelta( e.deltaY ), e.pageX );
		}
	}
	#onwheel2( ppb, pageX ) {
		const ppbNew = this.#rangePPB( ppb );

		if ( ppbNew !== this.#pxPerBeat ) {
			const px = pageX - this.getBoundingClientRect().left - this.$elements.$panel.clientWidth;

			this.#setScrollX( this.#calcScrollBack( this.#scrollX, this.#pxPerBeat, ppbNew, px ) );
			GSUsetAttribute( this, "pxperbeat", ppbNew );
			this.$dispatch( "pxperbeat", ppbNew );
		}
	}
	#onwheelPanel( e ) {
		if ( e.ctrlKey ) {
			const mul = this.#getWheelDelta( e.deltaY );
			const lhNew = Math.round( Math.min( Math.max( this.#getLHmin(), this.#lineHeight * mul ), this.#getLHmax() ) );

			e.preventDefault();
			if ( lhNew !== this.#lineHeight ) {
				const px = e.pageY - this.getBoundingClientRect().top - parseInt( this.$elements.$timeline.clientHeight );

				this.#setScrollY( this.#calcScrollBack( this.#scrollY, this.#lineHeight, lhNew, px ) );
				GSUsetAttribute( this, "lineheight", lhNew );
				this.$dispatch( "lineheight", lhNew );
			}
		}
	}
	#onptrdownExtend( panel, e ) {
		GSUunselectText();
		e.target.setPointerCapture( e.pointerId );
		if ( panel === "side" ) {
			this.#panelSize = this.$elements.$panel.clientWidth;
			this.$elements.$minimapPanel.style.width = `${ this.#panelSize }px`;
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

		this.$elements.$minimapPanel.style.width =
		this.$elements.$panel.style.minWidth = `${ w2 }px`;
		this.#minimapUpdate();
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
		e.target.releasePointerCapture( e.pointerId );
		document.removeEventListener( "pointermove", this.#onptrmoveExtendDownPanelBind );
		document.removeEventListener( "pointermove", this.#onptrmoveExtendPanelBind );
		document.removeEventListener( "pointerup", this.#onptrupExtendBind );
	}
}

GSUdefineElement( "gsui-timewindow", gsuiTimewindow );
