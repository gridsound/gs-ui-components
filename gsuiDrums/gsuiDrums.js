"use strict";

class gsuiDrums extends HTMLElement {
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
	#elDrumHover = GSUcreateDiv( { class: "gsuiDrums-drumHover" }, GSUcreateDiv( { class: "gsuiDrums-drumHoverIn" } ) );
	#elDrumcutHover = GSUcreateDiv( { class: "gsuiDrums-drumcutHover" }, GSUcreateDiv( { class: "gsuiDrums-drumcutHoverIn" } ) );
	#elHover = this.#elDrumHover;
	#onmouseupNewBind = this.#onmouseupNew.bind( this );
	#onmousemoveLinesBind = this.#onmousemoveLines.bind( this );
	#dispatch = GSUdispatchEvent.bind( null, this, "gsuiDrums" );
	#drumrows = GSUcreateElement( "gsui-drumrows" );
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
		GSUlistenEvents( this, {
			gsuiTimewindow: {
				pxperbeat: d => this.#setPxPerBeat( d.args[ 0 ] ),
			},
			gsuiDrumrows: {
				propFilter: d => this.#setPropFilter( ...d.args ),
				propFilters: d => this.#setPropFilterAll( ...d.args ),
				expand: d => void this.#linesMap.get( d.args[ 0 ] ).classList.toggle( "gsuiDrums-lineOpen" ),
				toggle: d => {
					this.#linesMap.get( d.args[ 0 ] ).classList.toggle( "gsuiDrumrow-mute" );
					return true;
				},
			},
			gsuiSliderGroup: {
				change: ( d, t ) => {
					d.args.unshift( t.dataset.currentProp );
					return true;
				},
				input: ( d, t ) => {
					GSUsetAttribute( this.#drumsMap.get( d.args[ 0 ] )[ 2 ], t.dataset.currentProp, d.args[ 1 ] );
					this.#drumrows.$setDrumPropValue( t.dataset.id, t.dataset.currentProp, d.args[ 1 ] );
				},
				inputEnd: ( d, t ) => {
					this.#drumrows.$removeDrumPropValue( t.dataset.id, t.dataset.currentProp );
				},
			},
		} );
		GSUsetAttribute( this.#win, "step", 1 );
		this.#win.onscroll = this.#onmousemoveLines2.bind( this );
		this.#elDrumHover.remove();
		this.#elDrumcutHover.remove();
		this.#elDrumHover.ondblclick = this.#ondblclickSplit.bind( this, "Drums" );
		this.#elDrumcutHover.ondblclick = this.#ondblclickSplit.bind( this, "Drumcuts" );
		this.#elDrumHover.onmousedown = this.#onmousedownNew.bind( this, "Drums" );
		this.#elDrumcutHover.onmousedown = this.#onmousedownNew.bind( this, "Drumcuts" );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			GSUsetAttribute( this, "tabindex", -1 );
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
				case "disabled": return GSUsetAttribute( this.#win, "disabled", val );
				case "currenttime": return GSUsetAttribute( this.#win, "currenttime", val );
				case "timedivision": return this.#timedivision( val );
				case "loop": return GSUsetAttribute( this.#win, "loop", val );
			}
		}
	}

	// .........................................................................
	#timedivision( timediv ) {
		const sPB = timediv.split( "/" )[ 1 ];

		this.#stepsPerBeat = sPB;
		GSUsetAttribute( this.#win, "timedivision", timediv );
		GSUsetAttribute( this.#win, "currenttimestep", 1 / sPB );
		this.#setPxPerBeat( this.#pxPerBeat );
		this.style.setProperty( "--gsuiDrums-pxperstep", `${ 1 / sPB }em` );
	}
	#setPxPerBeat( ppb ) {
		this.#pxPerBeat = ppb;
		this.#pxPerStep = ppb / this.#stepsPerBeat;
		GSUsetAttribute( this.#win, "pxperbeat", ppb );
		this.#sliderGroups.forEach( grp => GSUsetAttribute( grp, "pxperbeat", ppb ) );
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
		switch ( prop ) {
			case "order":
				this.querySelector( `gsui-drumrow[data-id="${ rowId }"]` ).dataset.order = val;
				this.#linesMap.get( rowId ).dataset.order = val;
				break;
			case "toggle":
				this.#linesMap.get( rowId ).classList.toggle( "gsuiDrumrow-mute", !val );
			default:
				this.#drumrows.change( rowId, prop, val );
				break;
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

		grp.set( id, drum.when, GSUgetAttributeNum( elItem, "duration" ), 0 );
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
		const elLine = GSUgetTemplate( "gsui-drums-line" );
		const grp = elLine.querySelector( "gsui-slidergroup" );

		GSUsetAttribute( grp, "pxperbeat", this.#pxPerBeat );
		grp.dataset.id = id;
		this.#sliderGroups.set( id, grp );
		return elLine;
	}
	changeDrum( id, prop, val ) {
		const rowId = this.#drumsMap.get( id )[ 0 ];
		const grp = this.#sliderGroups.get( rowId );

		GSUsetAttribute( this.#drumsMap.get( id )[ 2 ], prop, val );
		if ( prop === grp.dataset.currentProp ) {
			grp.setProp( id, "value", val );
		}
	}
	#addItem( id, itemType, item ) {
		const elTag = `gsui-${ itemType }`;
		const { when, row: rowId } = item;
		const elItem = GSUcreateElement( elTag, {
			"data-id": id,
			when,
			duration: this.#calcItemWidth( itemType, rowId, when ),
		} );
		const [ closest, closestW ] = this.#getPrevItem( rowId, itemType, when );

		if ( closest ) {
			const closestD = GSUgetAttributeNum( closest, "duration" );

			if ( closestW + closestD > when ) {
				for ( let d = 1; d < 16; d *= 2 ) {
					if ( closestW + closestD / d <= when ) {
						GSUsetAttribute( closest, "duration", closestD / d );
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
		const when = GSUgetAttributeNum( elItem, "when" );
		const [ closest, closestW ] = this.#getPrevItem( rowId, itemType, when );

		elItem.remove();
		this.#drumsMap.delete( id );
		if ( closest ) {
			const closestD = GSUgetAttributeNum( closest, "duration" );
			const dur = this.#calcItemWidth( itemType, rowId, closestW );

			if ( dur !== closestD ) {
				GSUsetAttribute( closest, "duration", dur );
				this.#sliderGroups.get( rowId ).setProp( closest.dataset.id, "duration", dur );
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
			const dw = GSUgetAttributeNum( d, "when" );
			const dd = GSUgetAttributeNum( d, "duration" );

			return dw <= when && when < dw + dd;
		} );
	}
	static #getClosestItem( items, when, cmpFn, dir ) {
		return items.reduce( gsuiDrums.#getClosestItem2.bind( null, when, cmpFn ), [ null, dir ] );
	}
	static #getClosestItem2( when, cmpFn, found, d ) {
		const dw = GSUgetAttributeNum( d, "when" );

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
		this.#getItems( rowId, "drum" ).forEach( d => {
			grp.setProp( d.dataset.id, "value", GSUgetAttributeNum( d, prop ) );
		} );
		this.#drumrows.setPropFilter( rowId, prop );
	}

	// .........................................................................
	#qS( c ) {
		return ( this.firstChild ? this : this.#win ).querySelector( `.gsuiDrums-${ c }` );
	}
	#createPreview( itemType, rowId, when ) {
		const elTag = `gsui-${ itemType }`;
		const el = GSUcreateElement( elTag, {
			when,
			duration: this.#hoverDurSaved,
		} );

		el.classList.add( "gsuiDrums-preview" );
		this.#qS( `line[data-id='${ rowId }'] .gsuiDrums-lineIn` ).append( el );
		return el;
	}
	#createPreviews( whenFrom, whenTo ) {
		const rowId = this.#draggingRowId;
		const stepDur = this.#hoverDurSaved;
		const when1A = Math.min( whenFrom, whenTo );
		const when1B = Math.max( whenFrom, whenTo );
		const whenA = Math.round( Math.min( whenFrom, whenTo ) / stepDur );
		const whenB = Math.round( Math.max( whenFrom, whenTo ) / stepDur );
		const added = new Map();
		const newPreviewMap = new Map();
		const adding = this.#currAction.startsWith( "add" );
		const itemType = this.#currAction.endsWith( "Drums" ) ? "drum" : "drumcut";
		const drumsArr = this.#getItems( rowId, itemType );

		this.#previewsMap.forEach( el => {
			adding
				? el.remove()
				: el.classList.remove( "gsuiDrums-previewDeleted" );
		} );
		if ( !adding ) {
			drumsArr.forEach( d => {
				const dw = GSUgetAttributeNum( d, "when" );

				if ( when1A <= dw && dw <= when1B ) {
					d.classList.add( "gsuiDrums-previewDeleted" );
					newPreviewMap.set( d.dataset.id, d );
				}
			} );
		} else {
			for ( let w = when1A; w <= when1B; w += stepDur ) {
				const ww = GSUroundNum( w, 5 );
				const found = drumsArr.find( d => {
					const dw = GSUgetAttributeNum( d, "when" );
					const dd = GSUgetAttributeNum( d, "duration" );

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

					this.#draggingRowId = rowId;
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
			const when = ( this.#hoverPageX - left ) / this.#pxPerStep / this.#stepsPerBeat;
			const [ prevItem, prevW ] = this.#getPrevItem( this.#draggingRowId, this.#hoverItemType, when );
			const prevD = prevItem && GSUgetAttributeNum( prevItem, "duration" );

			if ( prevItem && prevW < when && when < prevW + prevD ) {
				this.#hoverBeat = prevW;
				this.#hoverDur = prevD;
			} else {
				if ( this.#currAction ) {
					this.#hoverBeat = Math.floor( when / this.#hoverDurSaved ) * this.#hoverDurSaved;
					this.#hoverDur = this.#hoverDurSaved;
				} else {
					const whenCut = Math.floor( ( this.#hoverPageX - left ) / this.#pxPerStep ) / this.#stepsPerBeat;

					this.#hoverBeat = prevItem && prevW + prevD > whenCut
						? prevW + prevD
						: whenCut;
					this.#hoverDur = this.#calcItemWidth( this.#hoverItemType, this.#draggingRowId, this.#hoverBeat );
				}
			}
			this.#elHover.style.left = `${ this.#hoverBeat }em`;
			this.#elHover.style.width = `${ this.#hoverDur }em`;
			if ( this.#currAction ) {
				this.#createPreviews( this.#draggingWhenStart, this.#hoverBeat );
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
			this.#hoverDurSaved = this.#hoverDur;
			this.#createPreviews( this.#hoverBeat, this.#hoverBeat );
			GSUunselectText();
			this.#elLines.onmousemove = null;
			document.addEventListener( "mousemove", this.#onmousemoveLinesBind );
			document.addEventListener( "mouseup", this.#onmouseupNewBind );
		}
	}
	#onmouseupNew() {
		const adding = this.#currAction.startsWith( "add" );
		const arr = [];

		this.#previewsMap.forEach( adding
			? ( p, w ) => arr.push( { when: w } )
			: p => arr.push( p.dataset.id ) );
		this.#removePreviews( adding );
		document.removeEventListener( "mousemove", this.#onmousemoveLinesBind );
		document.removeEventListener( "mouseup", this.#onmouseupNewBind );
		this.#elLines.onmousemove = this.#onmousemoveLinesBind;
		if ( arr.length > 0 ) {
			this.#dispatch( "change", this.#currAction, this.#draggingRowId, arr );
		}
		this.#currAction = "";
	}
	#ondblclickSplit( itemType, e ) {
		const d = this.#getItemWhen( this.#draggingRowId, this.#hoverItemType, this.#hoverBeat );
		const dd = d && GSUgetAttributeNum( d, "duration" ) / 2;

		if ( d && dd > 1 / this.#stepsPerBeat / ( 8 + 1 ) ) {
			const left = this.#elLines.getBoundingClientRect().left;
			const when = ( e.pageX - left ) / this.#pxPerStep / this.#stepsPerBeat;
			const dw = GSUgetAttributeNum( d, "when" );
			const dd = GSUgetAttributeNum( d, "duration" ) / 2;
			const obj = { when: dw + dd }

			this.#hoverBeat = when < dw + dd ? dw : dw + dd;
			this.#hoverDur = dd;
			this.#elHover.style.left = `${ this.#hoverBeat }em`;
			this.#elHover.style.width = `${ this.#hoverDur }em`;
			if ( itemType === "Drums" ) {
				obj.pan = GSUgetAttributeNum( d, "pan" );
				obj.gain = GSUgetAttributeNum( d, "gain" );
				obj.detune = GSUgetAttributeNum( d, "detune" );
			}
			this.#dispatch( "change", `add${ itemType }`, this.#draggingRowId, [ obj ] );
		}
	}
}

Object.freeze( gsuiDrums );
customElements.define( "gsui-drums", gsuiDrums );
