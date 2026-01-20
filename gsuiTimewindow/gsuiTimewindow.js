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
	#scrolling = false;
	#onscrollStopDebounce = GSUdebounce( this.#onscrollStop.bind( this ), .5 );

	constructor() {
		super( {
			$cmpName: "gsuiTimewindow",
			$tagName: "gsui-timewindow",
			$jqueryfy: true,
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
					const lhNewf = this.#getLHmin() + val2 * ( this.#getLHmax() - this.#getLHmin() );
					const lhNew = GSUmathRound( lhNewf );
					const scrollBack = this.#calcScrollBack( this.#scrollY, this.#lineHeight, lhNew, 0 );

					this.#setScrollY( scrollBack );
					this.$this.$attr( "lineheight", lhNew );
					GSUdomDispatch( this, GSEV_TIMEWINDOW_LINEHEIGHT, lhNew );
					this.#lineHeightFloat = lhNewf;
				}
			},
			[ GSEV_STEPSELECT_ONCHANGE ]: ( _, val ) => this.$this.$attr( "step", val ),
			[ GSEV_STEPSELECT_AUTO ]: ( _, b ) => {
				if ( b ) {
					this.$this.$attr( "step", this.$elements.$stepBtn.$get( 0 ).$getStepFromPxPerBeat( this.#pxPerBeat ) );
				}
			},
			[ GSEV_TIMELINE_INPUTCURRENTTIME ]: GSUnoop,
			[ GSEV_TIMELINE_CHANGECURRENTTIME ]: ( _, val ) => {
				this.$this.$attr( "currenttime", val );
				return true;
			},
			[ GSEV_TIMELINE_INPUTLOOP ]: ( _, a, b ) => {
				this.$this.$attr( "loop", Number.isFinite( a ) && `${ a }-${ b }` );
				return true;
			},
			[ GSEV_TIMELINE_INPUTLOOPEND ]: () => this.style.overflowY = "",
			[ GSEV_TIMELINE_INPUTLOOPSTART ]: () => this.style.overflowY = "hidden",
			[ GSEV_TIMELINE_INPUTCURRENTTIMEEND ]: () => this.style.overflowY = "",
			[ GSEV_TIMELINE_INPUTCURRENTTIMESTART ]: () => this.style.overflowY = "hidden",
		} );
		this.ondragstart = GSUnoopFalse;
		this.$elements.$main.$on( "wheel", this.#onwheel.bind( this ) );
		this.$elements.$mainCnt.$on( "contextmenu", e => e.preventDefault() );
		this.$elements.$panelCnt.$on( "wheel", this.#onwheelPanel.bind( this ) );
		this.$elements.$panel.$find( ".gsuiTimewindow-panelExtendY" ).$on( "pointerdown", this.#onptrdownExtend.bind( this, "side" ) );
		this.$elements.$minimapTrack.$on( "pointerdown", this.#onptrdownMinimap.bind( this ) );
		this.$elements.$scroll.$on( "scroll", this.#onscroll.bind( this ) );
	}

	// .........................................................................
	$firstTimeConnected() {
		const w = this.$this.$attr( "panelsize" ) || 100;
		const panDowns = GSUjq( [
			this.$elements.$panelDown,
			this.$elements.$down,
		] );

		this.$elements.$minimapPanel.$width( w );
		this.$elements.$panel.$css( "minWidth", `${ w }px` );
		if ( this.$this.$hasAttr( "downpanel" ) ) {
			panDowns
				.$height( this.$this.$attr( "downpanelsize" ) || 50 )
				.$child( 0 ).$on( "pointerdown", this.#onptrdownExtend.bind( this, "down" ) );
		} else {
			panDowns.$remove();
		}
		this.#scrollShadow = new gsuiScrollShadow( {
			scrolledElem: this.firstChild,
			leftShadow: this.$elements.$panel.$get( 0 ),
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
				this.$elements.$stepBtn.$attr( "step", val );
				this.$elements.$timeline.$attr( "step", val );
				break;
			case "timedivision":
				this.$elements.$timeline.$attr( "timedivision", val );
				this.$elements.$beatlines.$attr( "timedivision", val );
				break;
			case "autoscroll":
				this.#autoscroll = val === "";
				this.#scrolling = false;
				this.#centerOnCurrentTime();
				break;
			case "pxperbeat":
				this.#pxPerBeatFloat = +val;
				this.#pxPerBeat = GSUmathRound( val );
				this.$elements.$timeline.$attr( "pxperbeat", val );
				this.$elements.$beatlines.$attr( "pxperbeat", val );
				this.$elements.$sliderZoomX.$attr( "value", GSUmathEaseOutCirc( ( val - this.#getPPBmin() ) / ( this.#getPPBmax() - this.#getPPBmin() ) ) );
				this.$this.$css( "--gsuiTimewindow-pxperbeat", `${ val }px` );
				GSUjq( [
					this.$elements.$currentTime,
					this.$elements.$loopA,
					this.$elements.$loopB,
				] ).$css( "fontSize", `${ val }px` );
				this.#minimapUpdate();
				this.#minimapUpdateCurrentTimeLoop();
				break;
			case "lineheight":
				this.#lineHeightFloat = +val;
				this.#lineHeight = GSUmathRound( val );
				this.$elements.$sliderZoomY.$attr( "value", GSUmathEaseOutCirc( ( val - this.#getLHmin() ) / ( this.#getLHmax() - this.#getLHmin() ) ) );
				this.$this.$css( "--gsuiTimewindow-lineH", `${ val }px` );
				break;
			case "currenttime": {
				const step = +this.$this.$attr( "currenttimestep" );

				this.#currentTime = +val;
				this.$elements.$timeline.$attr( "currenttime", val );
				this.$elements.$currentTime.$left( step
					? ( val / step | 0 ) * step
					: val, "em" );
				this.#minimapUpdate();
				this.#minimapUpdateCurrentTimeLoop();
				this.#centerOnCurrentTime();
			} break;
			case "loop":
				if ( val ) {
					const [ a, b ] = val.split( "-" );

					GSUdomAddClass( this, "gsuiTimewindow-looping" );
					this.$elements.$timeline.$attr( "loop", val );
					this.$elements.$loopA.$width( a, "em" );
					this.$elements.$loopB.$left( b, "em" );
					this.#minimapUpdateCurrentTimeLoop();
				} else {
					GSUdomRmClass( this, "gsuiTimewindow-looping" );
					this.$elements.$timeline.$attr( "loop", false );
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
		return this.$elements.$timeline.$get( 0 );
	}
	#minimapUpdate() {
		const mapPx = this.$elements.$minimapTrack.$width();
		const durPx = this.#minimapGetMaxView();

		this.$elements.$minimapThumb
			.$left( this.#scrollX / durPx * 100, "%" )
			.$width( mapPx / durPx * 100, "%" );
	}
	#minimapUpdateCurrentTimeLoop() {
		const loopStr = this.$this.$attr( "loop" );
		const durBeat = this.#minimapGetMaxView() / this.#pxPerBeat;

		this.$elements.$minimapCurrentTime.$left( this.#currentTime / durBeat * 100, "%" );
		if ( loopStr ) {
			const [ a, b ] = GSUsplitNums( loopStr, "-" );

			this.$elements.$minimapLoop
				.$left( a / durBeat * 100, "%" )
				.$width( ( b - a ) / durBeat * 100, "%" );
		}
	}
	#minimapGetMaxView() {
		const mapPx = this.$elements.$minimapTrack.$width();
		const dur = this.#minimapGetDuration();
		const viewSize = Math.max( dur * this.#pxPerBeat, this.#scrollX + mapPx );

		return viewSize;
		// this.#minimapViewMax = Math.max( this.#minimapViewMax, viewSize );
		// return this.#minimapAction === "thumb" ? this.#minimapViewMax : viewSize;
	}
	#minimapGetDuration() {
		const dur = +this.$this.$attr( "duration" );
		const time = +this.$this.$attr( "currenttime" );
		const loopStr = this.$this.$attr( "loop" );
		const loop = loopStr ? GSUsplitNums( loopStr, "-" )[ 1 ] : 0;

		return Math.max( time, loop, dur, 0 );
	}
	#onptrdownMinimap( e ) {
		const act = e.target.dataset.action;

		this.#minimapAction = act;
		// this.#minimapViewMax = 0;
		this.#minimapPtrPageX = e.pageX;
		this.#minimapPPBSaved = this.#pxPerBeat;
		this.#minimapThumbSaved = this.$elements.$minimapThumb.$width();
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
				const side = e.pageX > GSUdomBCRxy( this.$elements.$minimapThumb.$get( 0 ) )[ 0 ] ? 1 : -1;

				this.onpointerup = this.#onptrupMinimap.bind( this );
				this.#minimapIntervalId = GSUsetInterval( () => {
					this.#setScrollX( this.#scrollX + 10 * side );
				}, .01 );
			} break;
		}
	}
	#onptrmoveMinimap( e ) {
		const act = this.#minimapAction;
		const bcr = GSUdomBCR( this.$elements.$minimapTrack.$get( 0 ) );

		switch ( act ) {
			case "thumb": {
				const durPx = this.#minimapGetMaxView();
				const mapPx = this.$elements.$minimapTrack.$width();
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
	$appendMain( ...el ) { this.$elements.$mainCnt.$append( ...el ); }
	$appendDown( ...el ) { this.$elements.$down.$append( ...el ); }
	$appendPanel( ...el ) { this.$elements.$panelCnt.$append( ...el ); }
	$appendPanelDown( ...el ) { this.$elements.$panelDown.$append( ...el ); }

	// .........................................................................
	#getPPBmin() { return +this.$this.$attr( "pxperbeatmin" ) || 8; }
	#getPPBmax() { return +this.$this.$attr( "pxperbeatmax" ) || 512; }
	#getLHmin() { return +this.$this.$attr( "lineheightmin" ) || 24; }
	#getLHmax() { return +this.$this.$attr( "lineheightmax" ) || 256; }
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
		this.$elements.$scroll.$scrollX( this.#scrollX, "instant" );
	}
	#setScrollY( px ) {
		this.#scrollY = Math.max( 0, px );
		this.#scrollYint = parseInt( this.#scrollY );
		this.$elements.$scroll.$scrollY( this.#scrollY, "instant" );
	}
	#centerOnCurrentTime() {
		if ( this.#autoscroll && this.#playing && !this.#scrolling ) {
			const winSize = this.$elements.$minimapTrack.$width();
			const currPx = this.#currentTime * this.#pxPerBeat;

			if ( !GSUmathInRange( currPx, this.#scrollX, this.#scrollX + winSize ) ) {
				this.#scrollX = currPx;
				this.#scrollXint = parseInt( currPx );
				this.$elements.$scroll.$scrollX( currPx );
			}
		}
	}

	// .........................................................................
	#onscroll( e ) {
		const scrollX = e.currentTarget.scrollLeft;
		const scrollY = e.currentTarget.scrollTop;

		this.#scrolling = true;
		if ( this.#scrollXint !== scrollX ) {
			this.#scrollX =
			this.#scrollXint = scrollX;
		}
		if ( this.#scrollYint !== scrollY ) {
			this.#scrollY =
			this.#scrollYint = scrollY;
		}
		this.#minimapUpdate();
		this.#minimapUpdateCurrentTimeLoop();
		this.#onscrollStopDebounce();
	}
	#onscrollStop() {
		this.#scrolling = false;
		this.#centerOnCurrentTime();
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
			this.#onwheel2( this.#pxPerBeatFloat * this.#getWheelDelta( e.deltaY ), e.pageX );
		}
	}
	#onwheel2( ppb, pageX ) {
		const ppbNewf = this.#rangePPB( ppb );
		const ppbNew = GSUmathRound( ppbNewf );

		if ( ppbNew !== this.#pxPerBeat ) {
			this.#setNewPPB( ppbNew, pageX - GSUdomBCRxy( this )[ 0 ] - this.$elements.$panel.$width() );
		}
		this.#pxPerBeatFloat = ppbNewf;
	}
	#setNewPPB( ppb, ptrPx ) {
		this.#setScrollX( this.#calcScrollBack( this.#scrollX, this.#pxPerBeat, ppb, ptrPx ) );
		this.$this.$attr( {
			step: this.$elements.$stepBtn.$get( 0 ).$getStepFromPxPerBeat( ppb ),
			pxperbeat: ppb,
		} );
		GSUdomDispatch( this, GSEV_TIMEWINDOW_PXPERBEAT, ppb );
	}
	#onwheelPanel( e ) {
		if ( e.ctrlKey ) {
			const mul = this.#getWheelDelta( e.deltaY );
			const lhNewf = GSUmathClamp( this.#lineHeightFloat * mul, this.#getLHmin(), this.#getLHmax() );
			const lhNew = GSUmathRound( lhNewf );

			e.preventDefault();
			if ( lhNew !== this.#lineHeight ) {
				const px = e.pageY - GSUdomBCRxy( this )[ 1 ] - this.$elements.$timeline.$height();

				this.#setScrollY( this.#calcScrollBack( this.#scrollY, this.#lineHeight, lhNew, px ) );
				this.$this.$attr( "lineheight", lhNew );
				GSUdomDispatch( this, GSEV_TIMEWINDOW_LINEHEIGHT, lhNew );
			}
			this.#lineHeightFloat = lhNewf;
		}
	}
	#onptrdownExtend( panel, e ) {
		GSUdomUnselect();
		e.target.setPointerCapture( e.pointerId );
		if ( panel === "side" ) {
			this.#panelSize = this.$elements.$panel.$width();
			this.$elements.$minimapPanel.$width( this.#panelSize );
			this.#ptrdownPageX = e.pageX;
			document.addEventListener( "pointermove", this.#onptrmoveExtendPanelBind );
		} else {
			this.#panelSize = this.$elements.$down.$height();
			this.#ptrdownPageY = e.pageY;
			document.addEventListener( "pointermove", this.#onptrmoveExtendDownPanelBind );
		}
		document.addEventListener( "pointerup", this.#onptrupExtendBind );
	}
	#onptrmoveExtendPanel( e ) {
		const w = this.#panelSize + ( e.pageX - this.#ptrdownPageX );
		const min = +this.$this.$attr( "panelsizemin" ) || 50;
		const max = +this.$this.$attr( "panelsizemax" ) || 260;
		const w2 = GSUmathClamp( w, min, max );

		this.$elements.$minimapPanel.$width( w2 );
		this.$elements.$panel.$css( "minWidth", `${ w2 }px` );
		this.#minimapUpdate();
	}
	#onptrmoveExtendDownPanel( e ) {
		const h = this.#panelSize + ( this.#ptrdownPageY - e.pageY );
		const min = +this.$this.$attr( "downpanelsizemin" ) || 50;
		const max = +this.$this.$attr( "downpanelsizemax" ) || 260;
		const h2 = GSUmathClamp( h, min, max );

		this.$elements.$panelDown.$height( h2 );
		this.$elements.$down.$height( h2 );
	}
	#onptrupExtend( e ) {
		e.target.releasePointerCapture( e.pointerId );
		document.removeEventListener( "pointermove", this.#onptrmoveExtendDownPanelBind );
		document.removeEventListener( "pointermove", this.#onptrmoveExtendPanelBind );
		document.removeEventListener( "pointerup", this.#onptrupExtendBind );
	}
}

GSUdomDefine( "gsui-timewindow", gsuiTimewindow );
