"use strict";

class gsuiDrums extends HTMLElement {
	#win = GSUI.$createElement( "gsui-timewindow", {
		panelsize: 140,
		panelsizemin: 70,
		panelsizemax: 240,
		lineheight: 48,
		lineheightmin: 48,
		lineheightmax: 48,
		pxperbeatmin: 50,
		pxperbeatmax: 160,
	} );
	#hoverBeat = 0;
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
	#elDrumHover = GSUI.$createElement( "div", { class: "gsuiDrums-drumHover" }, GSUI.$createElement( "div", { class: "gsuiDrums-drumHoverIn" } ) );
	#elDrumcutHover = GSUI.$createElement( "div", { class: "gsuiDrums-drumcutHover" }, GSUI.$createElement( "div", { class: "gsuiDrums-drumcutHoverIn" } ) );
	#elHover = this.#elDrumHover;
	#onmouseupNewBind = this.#onmouseupNew.bind( this );
	#onmousemoveLinesBind = this.#onmousemoveLines.bind( this );
	#dispatch = GSUI.$dispatchEvent.bind( null, this, "gsuiDrums" );
	#drumrows = GSUI.$createElement( "gsui-drumrows" );
	#reorder = new gsuiReorder( {
		rootElement: this.#drumrows,
		direction: "column",
		dataTransferType: "drumrow",
		itemSelector: "gsui-drumrow",
		handleSelector: ".gsuiDrumrow-grip",
		parentSelector: "gsui-drumrows",
		onchange: ( elRow ) => {
			const rows = gsuiReorder.listComputeOrderChange( this.#drumrows, {} );

			this.#dispatch( "reorderDrumrow", elRow.dataset.id, rows );
		},
	} );
	timeline = this.#win.timeline;

	constructor() {
		super();
		Object.seal( this );
		GSUI.$listenEvents( this, {
			gsuiTimewindow: {
				pxperbeat: d => this.#setPxPerBeat( d.args[ 0 ] ),
			},
			gsuiDrumrows: {
				toggle: d => void this.#linesMap.get( d.args[ 0 ] ).classList.toggle( "gsuiDrumrow-mute" ),
				expand: d => void this.#linesMap.get( d.args[ 0 ] ).classList.toggle( "gsuiDrums-lineOpen" ),
				propFilter: d => this.#setPropFilter( ...d.args ),
				propFilters: d => this.#setPropFilterAll( ...d.args ),
			},
			gsuiSliderGroup: {
				change: ( d, t ) => {
					d.args.unshift( t.dataset.currentProp );
					return true;
				},
				input: ( d, t ) => {
					GSUI.$setAttribute( this.#drumsMap.get( d.args[ 0 ] )[ 2 ], t.dataset.currentProp, d.args[ 1 ] );
					this.#drumrows.$setDrumPropValue( t.dataset.id, t.dataset.currentProp, d.args[ 1 ] );
				},
				inputEnd: ( d, t ) => {
					this.#drumrows.$removeDrumPropValue( t.dataset.id, t.dataset.currentProp );
				},
			},
		} );
		GSUI.$setAttribute( this.#win, "step", 1 );
		this.#win.onscroll = this.#onmousemoveLines2.bind( this );
		this.#elDrumHover.remove();
		this.#elDrumcutHover.remove();
		this.#elDrumHover.onmousedown = this.#onmousedownNew.bind( this, "Drums" );
		this.#elDrumcutHover.onmousedown = this.#onmousedownNew.bind( this, "Drumcuts" );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			GSUI.$setAttribute( this, "tabindex", -1 );
			this.append( this.#win );
			this.#win.querySelector( ".gsuiTimewindow-panelContent" ).append( this.#drumrows );
			this.#elLines = this.#win.querySelector( ".gsuiTimewindow-rows" );
			this.#elLines.onmousemove = this.#onmousemoveLinesBind;
			this.#elLines.onmouseleave = this.#onmouseleaveLines.bind( this );
			this.#reorder.setShadowElement( this.#elLines );
			this.#reorder.setShadowChildClass( "gsuiDrums-line" );
		}
	}
	static get observedAttributes() {
		return [ "disabled", "currenttime", "timedivision", "loop" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "disabled": return GSUI.$setAttribute( this.#win, "disabled", val );
				case "currenttime": return GSUI.$setAttribute( this.#win, "currenttime", val );
				case "timedivision": return this.#timedivision( val );
				case "loop": return GSUI.$setAttribute( this.#win, "loop", val );
			}
		}
	}

	// .........................................................................
	#timedivision( timediv ) {
		const sPB = timediv.split( "/" )[ 1 ];

		this.#stepsPerBeat = sPB;
		GSUI.$setAttribute( this.#win, "timedivision", timediv );
		GSUI.$setAttribute( this.#win, "currenttimestep", 1 / sPB );
		this.#setPxPerBeat( this.#pxPerBeat );
		this.style.setProperty( "--gsuiDrums-pxperstep", `${ 1 / sPB }em` );
		this.#elDrumHover.style.width =
		this.#elDrumcutHover.style.width = `${ 1 / sPB }em`;
	}
	#setPxPerBeat( ppb ) {
		this.#pxPerBeat = ppb;
		this.#pxPerStep = ppb / this.#stepsPerBeat;
		GSUI.$setAttribute( this.#win, "pxperbeat", ppb );
		this.#sliderGroups.forEach( grp => GSUI.$setAttribute( grp, "pxperbeat", ppb ) );
	}

	// .........................................................................
	$reorderDrumrows( obj ) {
		gsuiReorder.listReorder( this.#drumrows, obj );
		gsuiReorder.listReorder( this.#elLines, obj );
	}
	$addDrumrow( rowId ) {
		const elLine = this.#createDrumrow( rowId );

		elLine.dataset.id = rowId;
		this.#drumrows.add( rowId );
		this.#linesMap.set( rowId, elLine );
		this.#elLines.append( elLine );
		this.#setPropFilter( rowId, "gain" );
	}
	$removeDrumrow( rowId ) {
		this.#drumrows.remove( rowId );
		this.#linesMap.get( rowId ).remove();
		this.#linesMap.delete( rowId );
	}
	$changeDrumrow( rowId, prop, val ) {
		if ( prop === "order" ) {
			this.querySelector( `gsui-drumrow[data-id="${ rowId }"]` ).dataset.order = val;
			this.#linesMap.get( rowId ).dataset.order = val;
		} else {
			this.#drumrows.change( rowId, prop, val );
		}
	}
	$startDrumrow( rowId ) {
		this.#drumrows.playRow( rowId );
	}
	$stopDrumrow( rowId ) {
		this.#drumrows.stopRow( rowId );
	}

	// .........................................................................
	addDrum( id, drum ) {
		const grp = this.#sliderGroups.get( drum.row );
		const elItem = this.#addItem( id, "drum", drum );

		grp.set( id, drum.when, GSUI.$getAttributeNum( elItem, "duration" ), 0 );
	}
	removeDrum( id ) {
		const rowId = this.#drumsMap.get( id )[ 0 ];

		this.#sliderGroups.get( rowId ).delete( id );
		this.#removeItem( id );
	}
	addDrumcut( id, drumcut ) {
		this.#addItem( id, "drumcut", drumcut );
	}
	removeDrumcut( id ) {
		this.#removeItem( id );
	}
	#createDrumrow( id ) {
		const elLine = GSUI.$getTemplate( "gsui-drums-line" );
		const grp = elLine.querySelector( "gsui-slidergroup" );

		GSUI.$setAttribute( grp, "pxperbeat", this.#pxPerBeat );
		grp.dataset.id = id;
		this.#sliderGroups.set( id, grp );
		return elLine;
	}
	changeDrum( id, prop, val ) {
		const rowId = this.#drumsMap.get( id )[ 0 ];
		const grp = this.#sliderGroups.get( rowId );

		GSUI.$setAttribute( this.#drumsMap.get( id )[ 2 ], prop, val );
		if ( prop === grp.dataset.currentProp ) {
			grp.setProp( id, "value", val );
		}
	}
	#addItem( id, itemType, item ) {
		const elTag = `gsui-${ itemType }`;
		const { when, row: rowId } = item;
		const elItem = GSUI.$createElement( elTag, {
			"data-id": id,
			when,
			duration: this.#calcItemWidth( itemType, rowId, when ),
		} );
		const [ closest, closestW ] = this.#getPrevItem( rowId, itemType, when );

		if ( closest ) {
			const closestD = GSUI.$getAttributeNum( closest, "duration" );

			if ( closestW + closestD > when ) {
				for ( let d = 1; d < 8; d *= 2 ) {
					if ( closestW + closestD / d <= when ) {
						GSUI.$setAttribute( closest, "duration", closestD / d );
						this.#sliderGroups.get( rowId ).setProp( closest.dataset.id, "duration", closestD / d );
						break;
					}
				}
			}
		}
		this.#qS( `line[data-id='${ rowId }'] .gsuiDrums-lineIn` ).append( elItem );
		this.#drumsMap.set( id, [ rowId, itemType, elItem ] );
		return elItem;
	}
	#removeItem( id ) {
		const [ rowId, itemType, elItem ] = this.#drumsMap.get( id );
		const when = GSUI.$getAttributeNum( elItem, "when" );
		const [ closest, closestW ] = this.#getPrevItem( rowId, itemType, when );

		elItem.remove();
		this.#drumsMap.delete( id );
		if ( closest ) {
			const closestD = GSUI.$getAttributeNum( closest, "duration" );
			const dur = this.#calcItemWidth( itemType, rowId, closestW );

			if ( dur !== closestD ) {
				GSUI.$setAttribute( closest, "duration", dur );
				this.#sliderGroups.get( rowId ).setProp( closest.dataset.id, "duration", dur );
			}
		}
	}
	#calcItemWidth( itemType, rowId, when ) {
		const wmax = this.#calcItemWidthMax( when );
		const [ , closestW ] = this.#getNextItem( rowId, itemType, when );

		if ( Number.isFinite( closestW ) ) {
			for ( let d = 1; d < 8; d *= 2 ) {
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

		for ( ; d < 8; d *= 2 ) {
			if ( Math.abs( stepPerc % ( 100 / d ) ) < 5 ) {
				break;
			}
		}
		return stepDur / d;
	}

	// .........................................................................
	#getItems( rowId, itemType ) {
		return this.#linesMap.get( rowId ).getElementsByTagName( `gsui-${ itemType }` );
	}
	#getPrevItem( rowId, itemType, when ) {
		return gsuiDrums.#getClosestItem( this.#getItems( rowId, itemType ), when, gsuiDrums.#closestBefore, -Infinity );
	}
	#getNextItem( rowId, itemType, when ) {
		return gsuiDrums.#getClosestItem( this.#getItems( rowId, itemType ), when, gsuiDrums.#closestAfter, Infinity );
	}
	static #getClosestItem( items, when, cmpFn, dir ) {
		return Array.from( items ).reduce( gsuiDrums.#getClosestItem2.bind( null, when, cmpFn ), [ null, dir ] );
	}
	static #getClosestItem2( when, cmpFn, found, d ) {
		const dw = GSUI.$getAttributeNum( d, "when" );

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
			case "pan": grp.options( { min: -1, max: 1, step: .05, def: 0 } ); break;
			case "gain": grp.options( { min: 0, max: 1, step: .025, def: .8 } ); break;
			case "detune": grp.options( { min: -12, max: 12, step: 1, def: 0 } ); break;
		}
		Array.from( this.#getItems( rowId, "drum" ) ).forEach( d => {
			grp.setProp( d.dataset.id, "value", GSUI.$getAttributeNum( d, prop ) );
		} );
		this.#drumrows.setPropFilter( rowId, prop );
	}

	// .........................................................................
	#qS( c ) {
		return ( this.firstChild ? this : this.#win ).querySelector( `.gsuiDrums-${ c }` );
	}
	#createPreview( itemType, rowId, when ) {
		const elTag = `gsui-${ itemType }`;
		const el = GSUI.$createElement( elTag, {
			when,
			duration: 1 / this.#stepsPerBeat,
		} );

		el.classList.add( "gsuiDrums-preview" );
		this.#qS( `line[data-id='${ rowId }'] .gsuiDrums-lineIn` ).append( el );
		return el;
	}
	#createPreviews( whenFrom, whenTo ) {
		const rowId = this.#draggingRowId;
		const stepDur = 1 / this.#stepsPerBeat;
		const whenA = Math.round( Math.min( whenFrom, whenTo ) / stepDur );
		const whenB = Math.round( Math.max( whenFrom, whenTo ) / stepDur );
		const added = new Map();
		const map = this.#previewsMap;
		const adding = this.#currAction.startsWith( "add" );
		const itemType = this.#currAction.endsWith( "Drums" ) ? "drum" : "drumcut";
		const drumsArr = [];

		this.#drumsMap.forEach( arr => {
			if ( arr[ 0 ] === rowId && arr[ 1 ] === itemType ) {
				drumsArr.push( arr );
			}
		} );
		for ( let w = whenA; w <= whenB; ++w ) {
			added.set( w );
			if ( !map.has( w ) ) {
				if ( adding ) {
					map.set( w, this.#createPreview( itemType, rowId, w * stepDur ) );
				} else {
					drumsArr.find( arr => {
						const el = arr[ 2 ];

						if ( GSUI.$getAttributeNum( el, "when" ) / stepDur === w ) {
							el.classList.add( "gsuiDrums-previewDeleted" );
							map.set( w, el );
							return true;
						}
					} );
				}
			}
		}
		map.forEach( ( el, w ) => {
			if ( !added.has( w ) ) {
				adding
					? el.remove()
					: el.classList.remove( "gsuiDrums-previewDeleted" );
				map.delete( w );
			}
		} );
	}
	#removePreviews( adding ) {
		this.#previewsMap.forEach( adding
			? el => el.remove()
			: el => el.classList.remove( "gsuiDrums-previewDeleted" ) );
		this.#previewsMap.clear();
	}

	// .........................................................................
	#onmousemoveLines( e ) {
		if ( e.target !== this.#elHover ) {
			if ( this.#currAction ) {
				this.#hoverPageX = e.pageX;
				this.#onmousemoveLines2();
			} else {
				const tar = e.target;
				const elLine = tar.classList.contains( "gsuiDrums-lineIn" )
					? tar
					: tar.tagName === "GSUI-DRUM" || tar.tagName === "GSUI-DRUMCUT"
						? tar.parentNode
						: null;

				if ( elLine ) {
					const rowId = elLine.parentNode.parentNode.dataset.id;
					const bcr = elLine.getBoundingClientRect();
					const y = ( e.pageY - bcr.top ) / bcr.height;
					const elHover =  y > .66 ? this.#elDrumcutHover : this.#elDrumHover;

					this.#hoverPageX = e.pageX;
					this.#hoverItemType = elHover === this.#elDrumHover ? "drum" : "drumcut";
					if ( elHover !== this.#elHover ) {
						if ( this.#elHover ) {
							this.#elHover.remove();
						}
						this.#elHover = elHover;
					}
					this.#onmousemoveLines2();
					if ( this.#elHover.parentNode !== elLine ) {
						elLine.append( this.#elHover );
					}
				} else if ( this.#elHover ) {
					this.#elHover.remove();
				}
			}
		}
	}
	#onmousemoveLines2() {
		if ( this.#hoverItemType ) {
			const left = this.#elLines.getBoundingClientRect().left;
			const beat = ( ( this.#hoverPageX - left ) / this.#pxPerStep | 0 ) / this.#stepsPerBeat;

			this.#hoverBeat = beat;
			this.#elHover.style.left = `${ beat }em`;
			if ( this.#currAction ) {
				this.#createPreviews( this.#draggingWhenStart, beat );
			}
		}
	}
	#onmouseleaveLines() {
		if ( !this.#currAction ) {
			this.#hoverItemType = "";
			this.#elHover.remove();
		}
	}
	#onmousedownNew( itemType, e ) {
		if ( !this.#currAction ) {
			this.#currAction = e.button === 0
				? `add${ itemType }`
				: `remove${ itemType }`;
			this.#draggingRowId = this.#elHover.closest( ".gsuiDrums-line" ).dataset.id;
			this.#draggingWhenStart = this.#hoverBeat;
			this.#createPreviews( this.#hoverBeat, this.#hoverBeat );
			GSUI.$unselectText();
			this.#elLines.onmousemove = null;
			document.addEventListener( "mousemove", this.#onmousemoveLinesBind );
			document.addEventListener( "mouseup", this.#onmouseupNewBind );
		}
	}
	#onmouseupNew() {
		this.#removePreviews( this.#currAction.startsWith( "add" ) );
		document.removeEventListener( "mousemove", this.#onmousemoveLinesBind );
		document.removeEventListener( "mouseup", this.#onmouseupNewBind );
		this.#elLines.onmousemove = this.#onmousemoveLinesBind;
		this.#dispatch( "change", this.#currAction, this.#draggingRowId,
			this.#draggingWhenStart, this.#hoverBeat );
		this.#currAction = "";
	}
}

Object.freeze( gsuiDrums );
customElements.define( "gsui-drums", gsuiDrums );
