"use strict";

class gsuiSlicer extends gsui0ne {
	static #resW = 1000;
	static #resH = 64;
	#dur = 4;
	#tool = "";
	#slices = {};
	#buffer = null;
	#ptrmoveFn = null;
	#stepsPerBeat = 4;
	#slicesSaved = null;
	#slicesSplitted = null;
	#sliceIdBefore = null;
	#sliceCurrentTime = null;
	#waveDef = $( "<polyline>" );

	constructor() {
		const defs = GSUdomQS( "#gsuiSlicer-waveDefs defs" );
		let defId = 1;

		super( {
			$cmpName: "gsuiSlicer",
			$tagName: "gsui-slicer",
			$jqueryfy: true,
			$elements: {
				$sourceCurrentTime: ".gsuiSlicer-source-currentTime",
				$slicesCurrentTime: ".gsuiSlicer-slices-currentTime",
				$previewCurrentTime: ".gsuiSlicer-preview-currentTime",
				$beatlines: "gsui-beatlines",
				$srcName: ".gsuiSlicer-source-name",
				$srcWave: ".gsuiSlicer-source-wave",
				$diagonalLine: ".gsuiSlicer-slices-line",
				$timeline: "gsui-timeline",
				$preview: ".gsuiSlicer-preview",
				$slices: ".gsuiSlicer-slices-wrap",
				$step: "gsui-step-select",
				$tools: ".gsuiSlicer-btn[data-action]",
			},
			$attributes: {
				tabindex: -1,
				currenttime: 0,
				step: 1,
				duration: 4,
				timedivision: "4/4",
				hidetimes: true,
			},
		} );
		Object.seal( this );
		if ( !defs ) {
			GSUdomBody.prepend( GSUcreateElement( "svg", { id: "gsuiSlicer-waveDefs" },
				GSUcreateElement( "defs" ),
			) );
		} else {
			defId += Array.prototype.reduce.call( defs.children, ( max, p ) => Math.max( max, p.dataset.id ), 0 );
		}
		this.#waveDef.$setAttr( {
			"data-id": defId,
			id: `gsuiSlicer-waveDef-${ defId }`,
		} );
		this.$elements.$tools.$on( "click", this.#onclickTools.bind( this ) );
		this.$elements.$slices.$on( {
			contextmenu: e => e.preventDefault(),
			pointerdown: this.#onpointerdownSlices.bind( this ),
		} );
		GSUdomListen( this, {
			[ GSEV_TIMELINE_CHANGECURRENTTIME ]: ( _, time ) => {
				this.$this.$setAttr( "currenttime", time );
				return true;
			},
			[ GSEV_STEPSELECT_ONCHANGE ]: ( _, step ) => this.$this.$setAttr( "step", step ),
		} );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.#selectTool( "moveY" );
		$( "#gsuiSlicer-waveDefs defs" ).$append( this.#waveDef );
	}
	$disconnected() {
		this.#waveDef.$remove();
	}
	static get observedAttributes() {
		return [ "currenttime", "duration", "step", "timedivision" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "timedivision":
				this.#stepsPerBeat = +val.split( "/" )[ 1 ];
				this.$elements.$timeline.$setAttr( "timedivision", val );
				this.$elements.$beatlines.$setAttr( "timedivision", val );
				break;
			case "currenttime":
				this.#setCurrentTime( +val );
				break;
			case "duration":
				this.#dur = +val;
				this.$elements.$timeline.$setAttr( "maxduration", val );
				this.#updatePxPerBeat();
				break;
			case "step":
				this.$elements.$step.$setAttr( "step", val );
				break;
		}
	}
	$onresize() {
		const svg = this.$elements.$diagonalLine;
		const w = svg.$width();
		const h = svg.$height();

		svg.$viewbox( w, h ).$child( 0 ).$setAttr( { x2: w, y2: h } );
		this.#updatePxPerBeat();
	}

	// .........................................................................
	$getSlicesData() {
		return this.#copySlicesData();
	}
	$setBufferName( name ) {
		this.$elements.$srcName.$text( name ).$setAttr( "title", name );
	}
	$setBuffer( buf ) {
		this.#buffer = buf || null;
		this.$this.$setAttr( {
			loaded: this.#buffer,
			"missing-data": !this.#buffer,
		} );
		this.#setWaveform( buf );
	}
	$removeBuffer() {
		this.#buffer = null;
		this.$this.$rmAttr( "loaded" );
		this.$setBufferName( "" );
		this.#setWaveform( null );
	}
	$addSlice( id, obj ) {
		if ( !( id in this.#slices ) ) {
			const use = $( "<use>" );
			const svg = $( "<svg>" )
				.$addClass( "gsuiSlicer-preview-wave" )
				.$setAttr( { "data-id": id, preserveAspectRatio: "none" } )
				.$append( use );
			const sli = $( "<div>" )
				.$addClass( "gsuiSlicer-slices-slice" )
				.$setAttr( "data-id", id );

			use.$get( 0 ).setAttributeNS( "http://www.w3.org/1999/xlink", "href", `#${ this.#waveDef.$getAttr( id ) }` );
			this.#slices[ id ] = Object.seal( { id, svg, sli, x: 0, y: 0, w: 0 } );
			this.$changeSlice( id, obj );
			this.$elements.$preview.$append( svg );
			this.$elements.$slices.$append( sli );
		}
	}
	$changeSlice( id, obj ) {
		const t = this.#getTimeNorm();
		const sli = this.#slices[ id ];
		const x = +( obj.x ?? sli.x ).toFixed( 10 );
		const y = +( obj.y ?? sli.y ).toFixed( 10 );
		const w = +( obj.w ?? sli.w ).toFixed( 10 );

		if ( "x" in obj || "w" in obj ) {
			sli.x = x;
			sli.w = w;
			$( [
				sli.svg,
				sli.sli,
			] ).$left( x * 100, "%" ).$width( w * 100, "%" );
		}
		if ( "y" in obj ) {
			sli.y = y;
			sli.sli.$height( ( 1 - y ) * 100, "%" );
		}
		sli.svg.$viewbox( ( x - ( x - y ) ) * gsuiSlicer.#resW, 0, w * gsuiSlicer.#resW, gsuiSlicer.#resH );
		if ( sli.x <= t && t < sli.x + sli.w ) {
			this.#highlightSlice( sli );
		}
	}
	$removeSlice( id ) {
		const sli = this.#slices[ id ];

		if ( sli ) {
			delete this.#slices[ id ];
			sli.svg.$remove();
			sli.sli.$remove();
			if ( sli === this.#sliceCurrentTime ) {
				this.#highlightSlice( null );
			}
		}
	}

	// .........................................................................
	#getTimeNorm() {
		return +this.$this.$getAttr( "currenttime" ) / +this.$this.$getAttr( "duration" );
	}
	#setWaveform( buf ) {
		if ( buf ) {
			gsuiWaveform.drawBuffer( this.#waveDef.$get( 0 ), gsuiSlicer.#resW, gsuiSlicer.#resH, buf );
			gsuiWaveform.drawBuffer( this.$elements.$srcWave.$get( 0 ).firstChild, gsuiSlicer.#resW, gsuiSlicer.#resH, buf );
		} else {
			this.#waveDef.$rmAttr( "points" );
			this.$elements.$srcWave.$child( 0 ).$rmAttr( "points" );
		}
	}
	#setCurrentTime( beat ) {
		const t = this.#getTimeNorm();

		this.$elements.$timeline.$setAttr( "currenttime", beat );
		this.$elements.$slicesCurrentTime.$left( t * 100, "%" );
		this.$elements.$previewCurrentTime.$left( t * 100, "%" );
		this.$this.$setAttr( "hidetimes", t <= 0 || t >= .995 );
		this.#updateCurrentTime( t );
	}
	#updateCurrentTime( t ) {
		const sli = Object.values( this.#slices ).find( s => s.x <= t && t < s.x + s.w );
		const srcT = sli ? Math.min( sli.y + ( t - sli.x ), 1 ) : t;

		this.$elements.$sourceCurrentTime.$left( srcT * 100, "%" );
		this.#highlightSlice( sli );
	}
	#highlightSlice( sli ) {
		if ( sli !== this.#sliceCurrentTime ) {
			if ( this.#sliceCurrentTime ) {
				this.#sliceCurrentTime.sli.$rmAttr( "data-hl" );
				this.#sliceCurrentTime.svg.$rmAttr( "data-hl" );
			}
			if ( sli ) {
				sli.sli.$addAttr( "data-hl" );
				sli.svg.$addAttr( "data-hl" );
			}
			this.#sliceCurrentTime = sli;
		}
	}
	#selectTool( t, change ) {
		if ( change !== false ) {
			this.#tool = t;
		}
		this.$elements.$tools.$setAttr( "data-toggle", el => t === el.dataset.action );
	}
	#updatePxPerBeat( dur ) {
		this.$elements.$timeline.$setAttr( "pxperbeat", this.$elements.$slices.$width() / ( dur || this.#dur ) );
		this.$elements.$beatlines.$at( 0 ).$setAttr( "pxperbeat", this.$elements.$slices.$width() / ( dur || this.#dur ) );
		this.$elements.$beatlines.$at( 1 ).$setAttr( "pxperbeat", this.$elements.$slices.$height() / ( dur || this.#dur ) );
	}
	#getSliceByPageX( offsetX ) {
		const x = GSUmathClamp( offsetX / this.$elements.$slices.$width(), 0, .9999 );

		return Object.values( this.#slices ).find( s => s.x <= x && x < s.x + s.w );
	}
	#copySlicesData() {
		return Object.values( this.#slices ).reduce( ( obj, s ) => {
			obj[ s.id ] = { x: s.x, y: s.y, w: s.w };
			return obj;
		}, {} );
	}

	// .........................................................................
	#onclickTools( e ) {
		this.#selectTool( e.target.dataset.action );
	}
	#onpointerdownSlices( e ) {
		if ( e.button === 0 || e.button === 2 ) {
			this.#ptrmoveFn =
				this.#tool === "reset" || e.button === 2 ? this.#onpointermoveSlicesReset.bind( this ) :
				this.#tool === "moveY" && e.button === 0 ? this.#onpointermoveSlicesY.bind( this ) :
				this.#tool === "split" && e.button === 0 ? this.#onpointermoveSlicesSplit.bind( this ) :
				this.#tool === "merge" && e.button === 0 ? this.#onpointermoveSlicesMerge.bind( this ) : null;
			if ( this.#ptrmoveFn ) {
				const sli = this.#getSliceByPageX( e.offsetX );

				GSUdomUnselect();
				this.#slicesSaved = this.#copySlicesData();
				this.$elements.$slices.$on( {
					pointerup: this.#onpointerupSlices.bind( this ),
					pointermove: this.#onpointermoveSlices.bind( this ),
				} ).$get( 0 ).setPointerCapture( e.pointerId );
				this.#slicesSplitted = {};
				this.#sliceIdBefore = sli.id;
				this.#onpointermoveSlices( e );
				if ( e.button === 2 ) {
					this.#selectTool( "reset", false );
				}
			}
		}
	}
	#onpointerupSlices( e ) {
		const diff = GSUdiffObjects( this.#slicesSaved, this.#copySlicesData() );

		this.$elements.$slices.$off( "pointermove", "pointerup" )
			.$get( 0 ).releasePointerCapture( e.pointerId );
		this.#slicesSplitted =
		this.#sliceIdBefore =
		this.#slicesSaved = null;
		this.#selectTool( this.#tool );
		if ( diff ) {
			this.$this.$dispatch( GSEV_SLICER_CHANGEPROP, "slices", diff );
		}
	}
	#onpointermoveSlices( e ) {
		const sli = this.#getSliceByPageX( e.offsetX );
		const bef = this.#slices[ this.#sliceIdBefore ];
		const xa = Math.min( bef.x, sli.x );
		const xb = Math.max( bef.x, sli.x );
		const list = Object.values( this.#slices ).filter( s => xa <= s.x && s.x <= xb );
		const sliId = this.#ptrmoveFn( list, sli, e );

		this.#sliceIdBefore = sliId ?? sli.id;
	}
	#onpointermoveSlicesY( list, _sli, e ) {
		const dur = +this.$this.$getAttr( "duration" );
		const step = this.$elements.$step.$get( 0 ).$getStep();
		const yyy = GSUmathClamp( e.offsetY / this.$elements.$slices.$height(), 0, 1 );
		const yy = GSUmathFloor( yyy * dur * this.#stepsPerBeat, step );
		const y = yy / dur / this.#stepsPerBeat;

		list.forEach( sli => {
			if ( sli.y !== y ) {
				this.$changeSlice( sli.id, { y } );
			}
		} );
	}
	#onpointermoveSlicesReset( list ) {
		list.forEach( sli => {
			if ( sli.y !== sli.x ) {
				this.$changeSlice( sli.id, { y: sli.x } );
			}
		} );
	}
	#onpointermoveSlicesSplit( list ) {
		list.forEach( sli => {
			if ( !( sli.id in this.#slicesSplitted ) && sli.w > 1 / 128 ) {
				const w2 = sli.w / 2;
				const newId = GSUgetNewId( this.#slices );
				const newSli = {
					x: sli.x + w2,
					y: sli.y,
					w: w2,
				};

				this.#slicesSplitted[ newId ] =
				this.#slicesSplitted[ sli.id ] = true;
				this.$changeSlice( sli.id, { w: w2 } );
				this.$addSlice( newId, newSli );
			}
		} );
	}
	#onpointermoveSlicesMerge( list, sli ) {
		if ( sli.id !== this.#sliceIdBefore ) {
			const first = list.reduce( ( min, s ) => min.x < s.x ? min : s );

			this.$changeSlice( first.id, { w: list.reduce( ( w, s ) => w + s.w, 0 ) } );
			list.forEach( sli => {
				if ( sli.id !== first.id ) {
					this.$removeSlice( sli.id );
				}
			} );
			return first.id;
		}
	}
}

GSUdomDefine( "gsui-slicer", gsuiSlicer );
