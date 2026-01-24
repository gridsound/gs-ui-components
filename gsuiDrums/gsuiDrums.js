"use strict";

class gsuiDrums extends gsui0ne {
	#win = GSUcreateElement( "gsui-timewindow", {
		panelsize: 140,
		panelsizemin: 70,
		panelsizemax: 240,
		lineheight: 48,
		lineheightmin: 48,
		lineheightmax: 48,
		pxperbeatmin: 50,
		pxperbeatmax: 300,
	} );
	#hoverBeat = 0;
	#hoverDur = 0;
	#hoverDurSaved = 0;
	#hoverPageX = 0;
	#stepsPerBeat = 4;
	#pxPerBeat = 70;
	#pxPerStep = this.#pxPerBeat / this.#stepsPerBeat;
	#currAction = "";
	#draggingRowId = null;
	#draggingWhenStart = 0;
	#hoverItemType = "";
	#drumsMap = new Map();
	#previewsMap = new Map();
	#sliderGroups = new Map();
	#linesMap = new Map();
	#elLines = null;
	#elDrumHover = $( "<div>" ).$addClass( "gsuiDrums-drumHover" ).$append( $( "<div>" ).$addClass( "gsuiDrums-drumHoverIn" ) );
	#elDrumcutHover = $( "<div>" ).$addClass( "gsuiDrums-drumcutHover" ).$append( $( "<div>" ).$addClass( "gsuiDrums-drumcutHoverIn" ) );
	#elHover = this.#elDrumHover;
	#onptrupNewBind = this.#onptrupNew.bind( this );
	#onptrmoveLinesBind = this.#onptrmoveLines.bind( this );
	#drumrows = GSUcreateElement( "gsui-drumrows" );

	constructor() {
		super( {
			$cmpName: "gsuiDrums",
			$tagName: "gsui-drums",
			$jqueryfy: true,
			$attributes: { tabindex: -1 },
		} );
		Object.seal( this );
		GSUdomListen( this, {
			[ GSEV_TIMELINE_INPUTLOOP ]: GSUnoop,
			[ GSEV_TIMEWINDOW_PXPERBEAT ]: ( _, ppb ) => this.#setPxPerBeat( ppb ),
			[ GSEV_DRUMROWS_PROPFILTER ]: d => this.#setPropFilter( ...d.$args ),
			[ GSEV_DRUMROWS_PROPFILTERS ]: d => this.#setPropFilterAll( ...d.$args ),
			[ GSEV_DRUMROWS_EXPAND ]: ( _, id ) => GSUdomTogAttr( this.#linesMap.get( id ), "data-open" ),
			[ GSEV_SLIDERGROUP_CHANGE ]: d => ( d.$args.unshift( d.$target.dataset.currentProp ), true ),
			[ GSEV_SLIDERGROUP_INPUT ]: ( d, k, v ) => {
				GSUdomSetAttr( this.#drumsMap.get( k )[ 2 ], d.$target.dataset.currentProp, v );
				this.#drumrows.$setDrumPropValue( d.$targetId, d.$target.dataset.currentProp, v );
			},
			[ GSEV_SLIDERGROUP_INPUTEND ]: d => {
				this.#drumrows.$removeDrumPropValue( d.$targetId, d.$target.dataset.currentProp );
			},
		} );
		GSUdomSetAttr( this.#win, "step", 1 );
		this.#win.onscroll = this.#onptrmoveLines2.bind( this );
		this.#elDrumHover.$remove();
		this.#elDrumcutHover.$remove();
		this.#elDrumHover.$on( {
			dblclick: this.#ondblclickSplit.bind( this, "Drums" ),
			pointerdown: this.#onptrdownNew.bind( this, "Drums" ),
		} );
		this.#elDrumcutHover.$on( {
			dblclick: this.#ondblclickSplit.bind( this, "Drumcuts" ),
			pointerdown: this.#onptrdownNew.bind( this, "Drumcuts" ),
		} );
		new gsuiReorder( {
			$root: this.#drumrows,
			$parentSelector: "gsui-drumrows",
			$itemSelector: "gsui-drumrow",
			$itemGripSelector: ".gsuiDrumrow-grip",
			$onchange: ( obj, rowId ) => this.$this.$dispatch( GSEV_DRUMS_REORDERDRUMROW, rowId, obj ),
		} );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.append( this.#win );
		this.#win.$appendPanel( this.#drumrows );
		this.#elLines = GSUdomQS( this.#win, ".gsuiTimewindow-rows" );
		this.#elLines.onpointermove = this.#onptrmoveLinesBind;
		this.#elLines.onmouseleave = this.#onmouseleaveLines.bind( this );
	}
	static get observedAttributes() {
		return [ "disabled", "currenttime", "timedivision", "loop" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "disabled": return GSUdomSetAttr( this.#win, "disabled", val );
			case "currenttime": return GSUdomSetAttr( this.#win, "currenttime", val );
			case "timedivision": return this.#timedivision( val );
			case "loop": return GSUdomSetAttr( this.#win, "loop", val );
		}
	}

	// .........................................................................
	#timedivision( timediv ) {
		const sPB = +timediv.split( "/" )[ 1 ];

		this.#stepsPerBeat = sPB;
		GSUdomSetAttr( this.#win, {
			timedivision: timediv,
			currenttimestep: 1 / sPB,
		} );
		this.#setPxPerBeat( this.#pxPerBeat );
		GSUdomStyle( this, "--gsuiDrums-pxperstep", `${ 1 / sPB }em` );
	}
	#setPxPerBeat( ppb ) {
		this.#pxPerBeat = ppb;
		this.#pxPerStep = ppb / this.#stepsPerBeat;
		GSUdomSetAttr( this.#win, "pxperbeat", ppb );
		this.#sliderGroups.forEach( grp => GSUdomSetAttr( grp, "pxperbeat", ppb ) );
	}

	// .........................................................................
	$changeDuration( dur ) {
		GSUdomSetAttr( this.#win, "duration", dur );
	}
	$addDrumrow( rowId ) {
		const elLine = this.#drumrows.$add( rowId );
		const elDrumLine = this.#createDrumrowLine( rowId );

		elLine.$get( 0 ).$associateDrumLine( elDrumLine );
		this.#linesMap.set( rowId, elDrumLine );
		this.#elLines.append( elDrumLine );
		this.#setPropFilter( rowId, "gain" );
	}
	$removeDrumrow( rowId ) {
		this.#drumrows.$remove( rowId );
		this.#linesMap.get( rowId ).remove();
		this.#linesMap.delete( rowId );
	}
	$changeDrumrow( rowId, prop, val ) {
		this.#drumrows.$change( rowId, prop, val );
	}
	$startDrumrow( rowId ) {
		this.#drumrows.$playRow( rowId );
	}
	$stopDrumrow( rowId ) {
		this.#drumrows.$stopRow( rowId );
	}

	// .........................................................................
	$addDrum( id, drum ) {
		const grp = this.#sliderGroups.get( drum.row );
		const elItem = this.#addItem( id, "drum", drum );

		grp.$set( id, drum.when, GSUdomGetAttrNum( elItem, "duration" ), 0 );
	}
	$removeDrum( id ) {
		const rowId = this.#drumsMap.get( id )[ 0 ];

		this.#sliderGroups.get( rowId ).$delete( id );
		this.#removeItem( id );
	}
	$addDrumcut( id, drumcut ) {
		this.#addItem( id, "drumcut", drumcut );
	}
	$removeDrumcut( id ) {
		this.#removeItem( id );
	}
	#createDrumrowLine( id ) {
		const elLine = GSUgetTemplate( "gsui-drums-line" );
		const grp = GSUdomQS( elLine, "gsui-slidergroup" );

		GSUdomSetAttr( grp, "pxperbeat", this.#pxPerBeat );
		elLine.dataset.id = id;
		grp.dataset.id = id;
		this.#sliderGroups.set( id, grp );
		return elLine;
	}
	$changeDrum( id, prop, val ) {
		const rowId = this.#drumsMap.get( id )[ 0 ];
		const grp = this.#sliderGroups.get( rowId );

		GSUdomSetAttr( this.#drumsMap.get( id )[ 2 ], prop, val );
		if ( prop === grp.dataset.currentProp ) {
			grp.$setProp( id, "value", val );
		}
	}
	#addItem( id, itemType, item ) {
		const { when, row: rowId } = item;
		const elItem = GSUcreateElement( `gsui-${ itemType }`, {
			"data-id": id,
			when,
			duration: this.#calcItemWidth( itemType, rowId, when ),
		} );
		const [ closest, closestW ] = this.#getPrevItem( rowId, itemType, when );

		if ( closest ) {
			const closestD = GSUdomGetAttrNum( closest, "duration" );

			if ( closestW + closestD > when ) {
				for ( let d = 1; d < 16; d *= 2 ) {
					if ( closestW + closestD / d <= when ) {
						GSUdomSetAttr( closest, "duration", closestD / d );
						this.#sliderGroups.get( rowId ).$setProp( closest.dataset.id, "duration", closestD / d );
						break;
					}
				}
			}
		}
		this.#qS( `.gsuiDrums-line[data-id='${ rowId }'] .gsuiDrums-lineIn` ).append( elItem );
		this.#drumsMap.set( id, [ rowId, itemType, elItem ] );
		return elItem;
	}
	#removeItem( id ) {
		const [ rowId, itemType, elItem ] = this.#drumsMap.get( id );
		const when = GSUdomGetAttrNum( elItem, "when" );
		const [ closest, closestW ] = this.#getPrevItem( rowId, itemType, when );

		elItem.remove();
		this.#drumsMap.delete( id );
		if ( closest ) {
			const closestD = GSUdomGetAttrNum( closest, "duration" );
			const dur = this.#calcItemWidth( itemType, rowId, closestW );

			if ( dur !== closestD ) {
				GSUdomSetAttr( closest, "duration", dur );
				this.#sliderGroups.get( rowId ).$setProp( closest.dataset.id, "duration", dur );
			}
		}
	}
	#calcItemWidth( itemType, rowId, when ) {
		const wmax = this.#calcItemWidthMax( when );
		const [ , closestW ] = this.#getNextItem( rowId, itemType, when );

		if ( Number.isFinite( closestW ) ) {
			for ( let d = 1; d < 16; d *= 2 ) {
				if ( when + wmax / d <= closestW ) {
					return wmax / d;
				}
			}
		}
		return wmax;
	}
	#calcItemWidthMax( when ) {
		const stepDur = 1 / this.#stepsPerBeat;
		const stepPerc = ( when % stepDur ) / stepDur * 100;
		let d = 1;

		for ( ; d < 16; d *= 2 ) {
			if ( Math.abs( stepPerc % ( 100 / d ) ) < 5 ) {
				break;
			}
		}
		return stepDur / d;
	}

	// .........................................................................
	#getItems( rowId, itemType ) {
		const arr = [];

		this.#drumsMap.forEach( d => {
			if ( d[ 0 ] === rowId && d[ 1 ] === itemType ) {
				arr.push( d[ 2 ] );
			}
		} );
		return arr;
	}
	#getPrevItem( rowId, itemType, when ) {
		return gsuiDrums.#getClosestItem( this.#getItems( rowId, itemType ), when, gsuiDrums.#closestBefore, -Infinity );
	}
	#getNextItem( rowId, itemType, when ) {
		return gsuiDrums.#getClosestItem( this.#getItems( rowId, itemType ), when, gsuiDrums.#closestAfter, Infinity );
	}
	#getItemWhen( rowId, itemType, when ) {
		return this.#getItems( rowId, itemType ).find( d => {
			const dw = GSUdomGetAttrNum( d, "when" );
			const dd = GSUdomGetAttrNum( d, "duration" );

			return dw <= when && when < dw + dd;
		} );
	}
	static #getClosestItem( items, when, cmpFn, dir ) {
		return items.reduce( gsuiDrums.#getClosestItem2.bind( null, when, cmpFn ), [ null, dir ] );
	}
	static #getClosestItem2( when, cmpFn, found, d ) {
		const dw = GSUdomGetAttrNum( d, "when" );

		if ( cmpFn( found, when, dw ) ) {
			found[ 0 ] = d;
			found[ 1 ] = dw;
		}
		return found;
	}
	static #closestBefore( found, when, dw ) {
		return found[ 1 ] < dw && dw < when;
	}
	static #closestAfter( found, when, dw ) {
		return when < dw && dw < found[ 1 ];
	}
	#setPropFilterAll( prop ) {
		Array.from( this.getElementsByClassName( "gsuiDrums-line" ) )
			.forEach( el => this.#setPropFilter( el.dataset.id, prop ) );
	}
	#setPropFilter( rowId, prop ) {
		const grp = this.#sliderGroups.get( rowId );
		const line = this.#linesMap.get( rowId );

		line.dataset.prop =
		grp.dataset.currentProp = prop;
		switch ( prop ) {
			case "pan": grp.$options( { min: -1, max: 1, step: .05, def: 0 } ); break;
			case "gain": grp.$options( { min: 0, max: 1, step: .025, def: .8 } ); break;
			case "detune": grp.$options( { min: -12, max: 12, step: 1, def: 0 } ); break;
		}
		this.#getItems( rowId, "drum" ).forEach( d => {
			grp.$setProp( d.dataset.id, "value", GSUdomGetAttrNum( d, prop ) );
		} );
		this.#drumrows.$setPropFilter( rowId, prop );
	}

	// .........................................................................
	#qS( sel ) {
		return GSUdomQS( this.firstChild ? this : this.#win, sel );
	}
	#createPreview( itemType, rowId, when ) {
		const el = GSUcreateElement( `gsui-${ itemType }`, {
			when,
			class: "gsuiDrums-preview",
			duration: this.#hoverDurSaved,
		} );

		this.#qS( `.gsuiDrums-line[data-id='${ rowId }'] .gsuiDrums-lineIn` ).append( el );
		return el;
	}
	#createPreviews( whenFrom, whenTo ) {
		const rowId = this.#draggingRowId;
		const stepDur = this.#hoverDurSaved;
		const when1A = Math.min( whenFrom, whenTo );
		const when1B = Math.max( whenFrom, whenTo );
		const newPreviewMap = new Map();
		const adding = this.#currAction.startsWith( "add" );
		const itemType = this.#currAction.endsWith( "Drums" ) ? "drum" : "drumcut";
		const drumsArr = this.#getItems( rowId, itemType );

		this.#previewsMap.forEach( el => {
			adding
				? el.remove()
				: GSUdomRmClass( el, "gsuiDrums-previewDeleted" );
		} );
		if ( !adding ) {
			drumsArr.forEach( d => {
				const dw = GSUdomGetAttrNum( d, "when" );

				if ( when1A <= dw && dw <= when1B ) {
					GSUdomAddClass( d, "gsuiDrums-previewDeleted" );
					newPreviewMap.set( d.dataset.id, d );
				}
			} );
		} else {
			for ( let w = when1A; w <= when1B; w += stepDur ) {
				const ww = GSUmathFix( w, 5 );
				const found = drumsArr.find( d => {
					const dw = GSUdomGetAttrNum( d, "when" );
					const dd = GSUdomGetAttrNum( d, "duration" );

					return dw <= ww && ww < dw + dd;
				} );

				if ( !found ) {
					newPreviewMap.set( ww, this.#createPreview( itemType, rowId, ww ) );
				}
			}
		}
		this.#previewsMap = newPreviewMap;
	}
	#removePreviews( adding ) {
		this.#previewsMap.forEach( adding
			? el => el.remove()
			: el => GSUdomRmClass( el, "gsuiDrums-previewDeleted" ) );
		this.#previewsMap.clear();
	}

	// .........................................................................
	#onptrmoveLines( e ) {
		const tar = $( e.target );

		if ( !tar.$is( this.#elHover ) ) {
			if ( this.#currAction ) {
				this.#hoverPageX = e.pageX;
				this.#onptrmoveLines2();
			} else {
				const elLine = tar.$hasClass( "gsuiDrums-lineIn" )
					? tar
					: tar.$tag() === "gsui-drum" || tar.$tag() === "gsui-drumcut"
						? tar.$parent()
						: $noop;

				if ( !elLine.$size() ) {
					this.#elHover.$remove();
				} else {
					const rowId = elLine.$parent().$parent().$getAttr( "data-id" );
					const bcr = GSUdomBCR( elLine.$get( 0 ) );
					const y = ( e.pageY - bcr.y ) / bcr.h;
					const elHover =  y > .66 ? this.#elDrumcutHover : this.#elDrumHover;

					this.#draggingRowId = rowId;
					this.#hoverPageX = e.pageX;
					this.#hoverItemType = elHover === this.#elDrumHover ? "drum" : "drumcut";
					if ( !elHover.$is( this.#elHover ) ) {
						this.#elHover.$remove();
						this.#elHover = elHover;
					}
					this.#onptrmoveLines2();
					if ( !this.#elHover.$parent().$is( elLine ) ) {
						elLine.$append( this.#elHover );
					}
				}
			}
		}
	}
	#onptrmoveLines2() {
		if ( this.#hoverItemType ) {
			const left = GSUdomBCRxy( this.#elLines )[ 0 ];
			const when = ( this.#hoverPageX - left ) / this.#pxPerStep / this.#stepsPerBeat;
			const [ prevItem, prevW ] = this.#getPrevItem( this.#draggingRowId, this.#hoverItemType, when );
			const prevD = prevItem && GSUdomGetAttrNum( prevItem, "duration" );

			if ( prevItem && prevW < when && when < prevW + prevD ) {
				this.#hoverBeat = prevW;
				this.#hoverDur = prevD;
			} else if ( this.#currAction ) {
				this.#hoverBeat = GSUmathFloor( when, this.#hoverDurSaved );
				this.#hoverDur = this.#hoverDurSaved;
			} else {
				const whenCut = Math.floor( ( this.#hoverPageX - left ) / this.#pxPerStep ) / this.#stepsPerBeat;

				this.#hoverBeat = prevItem && prevW + prevD > whenCut
					? prevW + prevD
					: whenCut;
				this.#hoverDur = this.#calcItemWidth( this.#hoverItemType, this.#draggingRowId, this.#hoverBeat );
			}
			this.#elHover
				.$left( this.#hoverBeat, "em" )
				.$width( this.#hoverDur, "em" );
			if ( this.#currAction ) {
				this.#createPreviews( this.#draggingWhenStart, this.#hoverBeat );
			}
		}
	}
	#onmouseleaveLines() {
		if ( !this.#currAction ) {
			this.#hoverItemType = "";
			this.#elHover.$remove();
		}
	}
	#onptrdownNew( itemType, e ) {
		if ( !this.#currAction ) {
			this.#currAction = e.button === 0
				? `add${ itemType }`
				: `remove${ itemType }`;
			this.#draggingRowId = this.#elHover.$get( 0 ).closest( ".gsuiDrums-line" ).dataset.id;
			this.#draggingWhenStart = this.#hoverBeat;
			this.#hoverDurSaved = this.#hoverDur;
			this.#createPreviews( this.#hoverBeat, this.#hoverBeat );
			GSUdomUnselect();
			this.#elLines.onpointermove = null;
			document.addEventListener( "pointermove", this.#onptrmoveLinesBind );
			document.addEventListener( "pointerup", this.#onptrupNewBind );
		}
	}
	#onptrupNew() {
		const adding = this.#currAction.startsWith( "add" );
		const arr = [];

		this.#previewsMap.forEach( adding
			? ( p, w ) => arr.push( { when: w } )
			: p => arr.push( p.dataset.id ) );
		this.#removePreviews( adding );
		document.removeEventListener( "pointermove", this.#onptrmoveLinesBind );
		document.removeEventListener( "pointerup", this.#onptrupNewBind );
		this.#elLines.onpointermove = this.#onptrmoveLinesBind;
		if ( arr.length > 0 ) {
			this.$this.$dispatch( GSEV_DRUMS_CHANGE, this.#currAction, this.#draggingRowId, arr );
		}
		this.#currAction = "";
	}
	#ondblclickSplit( itemType, e ) {
		const d = this.#getItemWhen( this.#draggingRowId, this.#hoverItemType, this.#hoverBeat );
		const dd = d && GSUdomGetAttrNum( d, "duration" ) / 2;

		if ( d && dd > 1 / this.#stepsPerBeat / ( 8 + 1 ) ) {
			const left = GSUdomBCRxy( this.#elLines )[ 0 ];
			const when = ( e.pageX - left ) / this.#pxPerStep / this.#stepsPerBeat;
			const dw = GSUdomGetAttrNum( d, "when" );
			const dd = GSUdomGetAttrNum( d, "duration" ) / 2;
			const obj = { when: dw + dd };

			this.#hoverBeat = when < dw + dd ? dw : dw + dd;
			this.#hoverDur = dd;
			this.#elHover
				.$left( this.#hoverBeat, "em" )
				.$width( this.#hoverDur, "em" );
			if ( itemType === "Drums" ) {
				obj.pan = GSUdomGetAttrNum( d, "pan" );
				obj.gain = GSUdomGetAttrNum( d, "gain" );
				obj.detune = GSUdomGetAttrNum( d, "detune" );
			}
			this.$this.$dispatch( GSEV_DRUMS_CHANGE, `add${ itemType }`, this.#draggingRowId, [ obj ] );
		}
	}
}

GSUdomDefine( "gsui-drums", gsuiDrums );
