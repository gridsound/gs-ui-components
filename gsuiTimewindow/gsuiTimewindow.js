"use strict";

class gsuiTimewindow extends gsui0ne {
	#playing = false;
	#autoscroll = false;
	#currentTime = 0;
	#pxPerBeat = 0;
	#pxPerBeatFloat = 0;
	#panelSize = 0;
	#lineHeight = 0;
	#lineHeightFloat = 0;
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
	// #minimapViewMax = 0;
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
				$stepBtn: "gsui-step-select",
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
		Object.seal( this );
		GSUdomListen( this, {
			[ GSEV_SLIDER_INPUTSTART ]: GSUnoop,
			[ GSEV_SLIDER_INPUTEND ]: GSUnoop,
			[ GSEV_SLIDER_CHANGE ]: GSUnoop,
			[ GSEV_SLIDER_INPUT ]: ( d, val ) => {
				if ( d.$target.dataset.zoom === "x" ) {
					const ppb = GSUmathEaseInCirc( val );
					const ppbNew = GSUmathRound( this.#getPPBmin() + ppb * ( this.#getPPBmax() - this.#getPPBmin() ) );

					this.#setNewPPB( ppbNew, 0 );
				} else if ( d.$target.dataset.zoom === "y" ) {
					const val2 = GSUmathEaseInCirc( val );
					const newVal = this.#getLHmin() + val2 * ( this.#getLHmax() - this.#getLHmin() );
					const scrollBack = this.#calcScrollBack( this.#scrollY, this.#lineHeight, newVal, 0 );

					this.#setScrollY( scrollBack );
					GSUdomSetAttr( this, "lineheight", newVal );
					GSUdomDispatch( this, GSEV_TIMEWINDOW_LINEHEIGHT, newVal );
				}
			},
			[ GSEV_STEPSELECT_ONCHANGE ]: ( _, val ) => GSUdomSetAttr( this, "step", val ),
			[ GSEV_STEPSELECT_AUTO ]: ( _, b ) => {
				if ( b ) {
					GSUdomSetAttr( this, "step", this.$elements.$stepBtn.$getStepFromPxPerBeat( this.#pxPerBeat ) );
				}
			},
			[ GSEV_TIMELINE_INPUTCURRENTTIME ]: GSUnoop,
			[ GSEV_TIMELINE_CHANGECURRENTTIME ]: ( _, val ) => {
				GSUdomSetAttr( this, "currenttime", val );
				return true;
			},
			[ GSEV_TIMELINE_INPUTLOOP ]: ( _, a, b ) => {
				GSUdomSetAttr( this, "loop", Number.isFinite( a ) && `${ a }-${ b }` );
				return true;
			},
			[ GSEV_TIMELINE_INPUTLOOPEND ]: () => this.style.overflowY = "",
			[ GSEV_TIMELINE_INPUTLOOPSTART ]: () => this.style.overflowY = "hidden",
			[ GSEV_TIMELINE_INPUTCURRENTTIMEEND ]: () => this.style.overflowY = "",
			[ GSEV_TIMELINE_INPUTCURRENTTIMESTART ]: () => this.style.overflowY = "hidden",
		} );
		this.ondragstart = GSUnoopFalse;
		this.$elements.$main.onwheel = this.#onwheel.bind( this );
		this.$elements.$mainCnt.oncontextmenu = e => e.preventDefault();
		this.$elements.$panelCnt.onwheel = this.#onwheelPanel.bind( this );
		GSUdomQS( this.$elements.$panel, ".gsuiTimewindow-panelExtendY" ).onpointerdown = this.#onptrdownExtend.bind( this, "side" );
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
		this.$elements.$panel.style.minWidth = `${ GSUdomGetAttrNum( this, "panelsize" ) || 100 }px`;
		if ( this.hasAttribute( "downpanel" ) ) {
			this.$elements.$panelDown.firstChild.onpointerdown =
			this.$elements.$down.firstChild.onpointerdown = this.#onptrdownExtend.bind( this, "down" );
			this.$elements.$panelDown.style.height =
			this.$elements.$down.style.height = `${ GSUdomGetAttrNum( this, "downpanelsize" ) || 50 }px`;
		} else {
			this.$elements.$panelDown.remove();
			this.$elements.$down.remove();
		}
		this.#scrollShadow = new gsuiScrollShadow( {
			scrolledElem: this.firstChild,
			leftShadow: this.$elements.$panel,
			topShadow: [
				GSUdomQS( this, ".gsuiTimewindow-panelUp" ),
				GSUdomQS( this, ".gsuiTimewindow-time" ),
			],
		} );
		this.#minimapUpdate();
	}
	$disconnected() {
		this.#scrollShadow.$disconnected();
	}
	static get observedAttributes() {
		return [ "step", "timedivision", "pxperbeat", "lineheight", "currenttime", "loop", "duration", "autoscroll", "playing" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "playing":
				this.#playing = val === "";
				break;
			case "duration":
				this.#minimapUpdate();
				break;
			case "step":
				GSUdomSetAttr( this.$elements.$stepBtn, "step", val );
				GSUdomSetAttr( this.$elements.$timeline, "step", val );
				break;
			case "timedivision":
				GSUdomSetAttr( this.$elements.$timeline, "timedivision", val );
				GSUdomSetAttr( this.$elements.$beatlines, "timedivision", val );
				break;
			case "autoscroll":
				this.#autoscroll = val === "";
				this.#centerOnCurrentTime();
				break;
			case "pxperbeat":
				this.#pxPerBeatFloat = +val;
				this.#pxPerBeat = GSUmathRound( val );
				GSUdomSetAttr( this.$elements.$timeline, "pxperbeat", val );
				GSUdomSetAttr( this.$elements.$beatlines, "pxperbeat", val );
				GSUdomSetAttr( this.$elements.$sliderZoomX, "value", GSUmathEaseOutCirc( ( val - this.#getPPBmin() ) / ( this.#getPPBmax() - this.#getPPBmin() ) ) );
				GSUdomStyle( this, "--gsuiTimewindow-pxperbeat", `${ val }px` );
				this.$elements.$currentTime.style.fontSize =
				this.$elements.$loopA.style.fontSize =
				this.$elements.$loopB.style.fontSize = `${ val }px`;
				this.#minimapUpdate();
				this.#minimapUpdateCurrentTimeLoop();
				break;
			case "lineheight":
				this.#lineHeightFloat = +val;
				this.#lineHeight = GSUmathRound( val );
				GSUdomSetAttr( this.$elements.$sliderZoomY, "value", GSUmathEaseOutCirc( ( val - this.#getLHmin() ) / ( this.#getLHmax() - this.#getLHmin() ) ) );
				GSUdomStyle( this, "--gsuiTimewindow-lineH", `${ val }px` );
				break;
			case "currenttime": {
				const step = GSUdomGetAttrNum( this, "currenttimestep" );

				this.#currentTime = +val;
				GSUdomSetAttr( this.$elements.$timeline, "currenttime", val );
				if ( step ) {
					this.$elements.$currentTime.style.left = `${ ( val / step | 0 ) * step }em`;
				} else {
					this.$elements.$currentTime.style.left = `${ val }em`;
				}
				this.#minimapUpdate();
				this.#minimapUpdateCurrentTimeLoop();
				this.#centerOnCurrentTime();
			} break;
			case "loop":
				if ( val ) {
					const [ a, b ] = val.split( "-" );

					GSUdomAddClass( this, "gsuiTimewindow-looping" );
					GSUdomSetAttr( this.$elements.$timeline, "loop", val );
					this.$elements.$loopA.style.width = `${ a }em`;
					this.$elements.$loopB.style.left = `${ b }em`;
					this.#minimapUpdateCurrentTimeLoop();
				} else {
					GSUdomRmClass( this, "gsuiTimewindow-looping" );
					GSUdomRmAttr( this.$elements.$timeline, "loop" );
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
	$getTimeline() {
		return this.$elements.$timeline;
	}
	#minimapUpdate() {
		const mapPx = this.$elements.$minimapTrack.clientWidth;
		const durPx = this.#minimapGetMaxView();

		this.$elements.$minimapThumb.style.left = `${ this.#scrollX / durPx * 100 }%`;
		this.$elements.$minimapThumb.style.width = `${ mapPx / durPx * 100 }%`;
	}
	#minimapUpdateCurrentTimeLoop() {
		const loopStr = GSUdomGetAttr( this, "loop" );
		const durBeat = this.#minimapGetMaxView() / this.#pxPerBeat;

		this.$elements.$minimapCurrentTime.style.left = `${ this.#currentTime / durBeat * 100 }%`;
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
		const dur = GSUdomGetAttrNum( this, "duration" );
		const time = GSUdomGetAttrNum( this, "currenttime" );
		const loopStr = GSUdomGetAttr( this, "loop" );
		const loop = loopStr ? GSUsplitNums( loopStr, "-" )[ 1 ] : 0;

		return Math.max( time, loop, dur, 0 );
	}
	#onptrdownMinimap( e ) {
		const act = e.target.dataset.action;

		this.#minimapAction = act;
		// this.#minimapViewMax = 0;
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
				const side = e.pageX > GSUdomBCRxy( this.$elements.$minimapThumb )[ 0 ] ? 1 : -1;

				this.onpointerup = this.#onptrupMinimap.bind( this );
				this.#minimapIntervalId = GSUsetInterval( () => {
					this.#setScrollX( this.#scrollX + 10 * side );
				}, .01 );
			} break;
		}
	}
	#onptrmoveMinimap( e ) {
		const act = this.#minimapAction;
		const bcr = GSUdomBCR( this.$elements.$minimapTrack );

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
				const pageX = GSUmathClamp( e.pageX, bcr.x, bcr.right );
				const relPx = pageX - this.#minimapPtrPageX;
				const rel = 1 - relPx / this.#minimapThumbSaved;
				const ppbNew = this.#rangePPB( act === "cropA"
					? this.#minimapPPBSaved / rel
					: this.#minimapPPBSaved * rel );

				this.#onwheel2( ppbNew, act === "cropA" ? bcr.right : bcr.x );
			} break;
		}
	}
	#onptrupMinimap( e ) {
		GSUclearInterval( this.#minimapIntervalId );
		this.#minimapAction = null;
		this.onpointermove = null;
		this.onpointerup = null;
		// this.#minimapViewMax = 0;
		e.target.releasePointerCapture( e.pointerId );
		this.#minimapUpdate();
	}

	// .........................................................................
	$appendMain( ...el ) { this.$elements.$mainCnt.append( ...el ); }
	$appendDown( ...el ) { this.$elements.$down.append( ...el ); }
	$appendPanel( ...el ) { this.$elements.$panelCnt.append( ...el ); }
	$appendPanelDown( ...el ) { this.$elements.$panelDown.append( ...el ); }

	// .........................................................................
	#getPPBmin() { return GSUdomGetAttrNum( this, "pxperbeatmin" ) || 8; }
	#getPPBmax() { return GSUdomGetAttrNum( this, "pxperbeatmax" ) || 512; }
	#getLHmin() { return GSUdomGetAttrNum( this, "lineheightmin" ) || 24; }
	#getLHmax() { return GSUdomGetAttrNum( this, "lineheightmax" ) || 256; }
	#calcScrollBack( scroll, ppb, ppbNew, ptrPx ) {
		const scrollVal = scroll / ppb;
		const scrollIncr = ptrPx / ppb * ( ppbNew - ppb );

		return scrollVal * ppbNew + scrollIncr;
	}
	#rangePPB( ppb ) {
		return GSUmathClamp( ppb, this.#getPPBmin(), this.#getPPBmax() );
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
	#centerOnCurrentTime() {
		if ( this.#autoscroll && this.#playing ) {
			const winSize = this.$elements.$minimapTrack.clientWidth * .75;
			const currPx = this.#currentTime * this.#pxPerBeat;

			this.$elements.$scroll.scrollLeft =
			this.#scrollX = Math.max( 0, currPx - winSize );
			this.#scrollXint = parseInt( this.#scrollX );
		}
	}

	// .........................................................................
	#getWheelDelta( d ) {
		let inc = 1.1;

		if ( -50 < d && d < 50 ) {
			inc = 1 + Math.abs( d ) / 100;
		}
		return d > 0 ? 1 / inc : inc;
	}
	#onwheel( e ) {
		if ( e.ctrlKey || ( this.#autoscroll && this.#playing && !e.deltaY ) ) {
			e.preventDefault();
		}
		if ( e.ctrlKey ) {
			this.#onwheel2( this.#pxPerBeatFloat * this.#getWheelDelta( e.deltaY ), e.pageX );
		}
	}
	#onwheel2( ppb, pageX ) {
		const ppbNewf = this.#rangePPB( ppb );
		const ppbNew = GSUmathRound( ppbNewf );

		if ( ppbNew !== this.#pxPerBeat ) {
			this.#setNewPPB( ppbNew, pageX - GSUdomBCRxy( this )[ 0 ] - this.$elements.$panel.clientWidth );
		}
		this.#pxPerBeatFloat = ppbNewf;
	}
	#setNewPPB( ppb, ptrPx ) {
		this.#setScrollX( this.#calcScrollBack( this.#scrollX, this.#pxPerBeat, ppb, ptrPx ) );
		GSUdomSetAttr( this, "step", this.$elements.$stepBtn.$getStepFromPxPerBeat( ppb ) );
		GSUdomSetAttr( this, "pxperbeat", ppb );
		GSUdomDispatch( this, GSEV_TIMEWINDOW_PXPERBEAT, ppb );
	}
	#onwheelPanel( e ) {
		if ( e.ctrlKey ) {
			const mul = this.#getWheelDelta( e.deltaY );
			const lhNewf = GSUmathClamp( this.#lineHeightFloat * mul, this.#getLHmin(), this.#getLHmax() );
			const lhNew = GSUmathRound( lhNewf );

			e.preventDefault();
			if ( lhNew !== this.#lineHeight ) {
				const px = e.pageY - GSUdomBCRxy( this )[ 1 ] - this.$elements.$timeline.clientHeight;

				this.#setScrollY( this.#calcScrollBack( this.#scrollY, this.#lineHeight, lhNew, px ) );
				GSUdomSetAttr( this, "lineheight", lhNew );
				GSUdomDispatch( this, GSEV_TIMEWINDOW_LINEHEIGHT, lhNew );
			}
			this.#lineHeightFloat = lhNewf;
		}
	}
	#onptrdownExtend( panel, e ) {
		GSUdomUnselect();
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
		const min = GSUdomGetAttrNum( this, "panelsizemin" ) || 50;
		const max = GSUdomGetAttrNum( this, "panelsizemax" ) || 260;

		this.$elements.$minimapPanel.style.width =
		this.$elements.$panel.style.minWidth = `${ GSUmathClamp( w, min, max ) }px`;
		this.#minimapUpdate();
	}
	#onptrmoveExtendDownPanel( e ) {
		const h = this.#panelSize + ( this.#ptrdownPageY - e.pageY );
		const min = GSUdomGetAttrNum( this, "downpanelsizemin" ) || 50;
		const max = GSUdomGetAttrNum( this, "downpanelsizemax" ) || 260;

		this.$elements.$panelDown.style.height =
		this.$elements.$down.style.height = `${ GSUmathClamp( h, min, max ) }px`;
	}
	#onptrupExtend( e ) {
		e.target.releasePointerCapture( e.pointerId );
		document.removeEventListener( "pointermove", this.#onptrmoveExtendDownPanelBind );
		document.removeEventListener( "pointermove", this.#onptrmoveExtendPanelBind );
		document.removeEventListener( "pointerup", this.#onptrupExtendBind );
	}
}

GSUdomDefine( "gsui-timewindow", gsuiTimewindow );
