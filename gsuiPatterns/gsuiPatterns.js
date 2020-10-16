"use strict";

class gsuiPatterns {
	constructor( opt ) {
		const root = GSUI.getTemplate( "gsui-patterns" ),
			elNewDrums = root.querySelector( "[data-action='newDrums']" ),
			elNewSynth = root.querySelector( "[data-action='newSynth']" ),
			elBufferList = root.querySelector( ".gsuiPatterns-panelBuffers .gsuiPatterns-panel-list" ),
			elDrumsList = root.querySelector( ".gsuiPatterns-panelDrums .gsuiPatterns-panel-list" ),
			elSynthList = root.querySelector( ".gsuiPatterns-panelKeys .gsuiPatterns-panel-list" ),
			nlKeysLists = root.getElementsByClassName( "gsuiPatterns-synth-patterns" ),
			fnsPattern = Object.freeze( {
				clone: id => this.onchange( "clonePattern", id ),
				remove: id => this.onchange( "removePattern", id ),
				undefined: id => this.onchange( "openPattern", id ),
				redirect: ( id, e ) => this._openChannelsPopup( "redirectPatternBuffer", id, e ),
			} ),
			fnsSynth = Object.freeze( {
				expand: id => this.expandSynth( id ),
				undefined: id => this.onchange( "openSynth", id ),
				redirect: ( id, e ) => this._openChannelsPopup( "redirectSynth", id, e ),
				newPattern: id => {
					this.onchange( "addPatternKeys", id );
					this.expandSynth( id, true );
				},
				delete: id => {
					elSynthList.children.length > 1
						? this.onchange( "removeSynth", id )
						: gsuiPopup.alert( "Error", "You have to keep at least one synthesizer" );
				},
			} );

		this.rootElement = root;
		this.onchange = opt.onchange;
		this._elBufferList = elBufferList;
		this._elDrumsList = elDrumsList;
		this._elSynthList = elSynthList;
		this._nlKeysLists = nlKeysLists;
		this._fnsSynth = fnsSynth;
		this._fnsPattern = fnsPattern;
		Object.freeze( this );

		new gsuiReorder( {
			rootElement: elBufferList,
			direction: "column",
			dataTransfer: opt.patternDataTransfer,
			dataTransferType: "pattern-buffer",
			itemSelector: ".gsuiPatterns-pattern",
			handleSelector: ".gsuiPatterns-pattern-grip",
			parentSelector: ".gsuiPatterns-panel-list",
			onchange: this._onreorderPatterns.bind( this, elBufferList ),
		} );
		new gsuiReorder( {
			rootElement: elDrumsList,
			direction: "column",
			dataTransfer: opt.patternDataTransfer,
			dataTransferType: "pattern-drums",
			itemSelector: ".gsuiPatterns-pattern",
			handleSelector: ".gsuiPatterns-pattern-grip",
			parentSelector: ".gsuiPatterns-panel-list",
			onchange: this._onreorderPatterns.bind( this, elDrumsList ),
		} );
		new gsuiReorder( {
			rootElement: elSynthList,
			direction: "column",
			dataTransfer: opt.patternDataTransfer,
			dataTransferType: "pattern-keys",
			itemSelector: ".gsuiPatterns-pattern",
			handleSelector: ".gsuiPatterns-pattern-grip",
			parentSelector: ".gsuiPatterns-synth-patterns",
			onchange: this._onreorderPatternsKeys.bind( this ),
		} );
		elSynthList.ondragover = e => {
			const syn = e.target.closest( ".gsuiPatterns-synth" );

			if ( syn ) {
				this.expandSynth( syn.dataset.id, true );
			}
		};
		elSynthList.ondblclick = e => {
			if ( e.target.classList.contains( "gsuiPatterns-synth-info" ) ) {
				this.expandSynth( e.target.closest( ".gsuiPatterns-synth" ).dataset.id );
			}
		};
		elBufferList.onclick =
		elDrumsList.onclick = this._onclickListPatterns.bind( this );
		elSynthList.onclick = this._onclickSynths.bind( this );
		elNewDrums.onclick = () => this.onchange( "addPatternDrums" );
		elNewSynth.onclick = () => this.onchange( "addSynth" );
	}

	// .........................................................................
	attached() {
		const panels = new gsuiPanels( this.rootElement );

		panels.attached();
	}
	expandSynth( id, b ) {
		const root = this._getSynth( id ),
			show = root.classList.toggle( "gsuiPatterns-synth-expanded", b );

		root.querySelector( ".gsuiPatterns-synth-expand" ).dataset.icon = `caret-${ show ? "down" : "right" }`;
	}
	reorderPatterns( patterns ) {
		gsuiReorder.listReorder( this._elBufferList, patterns );
		gsuiReorder.listReorder( this._elDrumsList, patterns );
		Array.prototype.forEach.call( this._nlKeysLists, list => {
			gsuiReorder.listReorder( list, patterns );
		} );
	}
	_openChannelsPopup( action, objId, e ) {
		const currChanId = e.target.dataset.id;

		gsuiPatterns.selectChanPopupSelect.value = currChanId;
		gsuiPopup.custom( {
			title: "Channels",
			element: gsuiPatterns.selectChanPopupContent,
			submit: data => {
				if ( data.channel !== currChanId ) {
					this.onchange( action, objId, data.channel );
				}
			}
		} );
	}

	// .........................................................................
	addChannel( id, name ) {
		const elOpt = document.createElement( "option" );

		elOpt.value = id;
		elOpt.textContent = name;
		gsuiPatterns.selectChanPopupSelect.append( elOpt );
	}
	updateChannel( id, name ) {
		gsuiPatterns.selectChanPopupSelect.querySelector( `option[value="${ id }"]` ).textContent = name;
		this.rootElement.querySelectorAll( `.gsuiPatterns-btnSolid[data-id="${ id }"] .gsuiPatterns-btnText` )
			.forEach( el => el.textContent = name );
	}
	deleteChannel( id ) {
		gsuiPatterns.selectChanPopupSelect.querySelector( `option[value="${ id }"]` ).remove();
	}

	// .........................................................................
	addSynth( id ) {
		const elSyn = GSUI.getTemplate( "gsui-patterns-synth" );

		elSyn.dataset.id = id;
		this._elSynthList.prepend( elSyn );
	}
	changeSynth( id, prop, val ) {
		const elSyn = this._getSynth( id );

		switch ( prop ) {
			case "name": elSyn.querySelector( ".gsuiPatterns-synth-name" ).textContent = val; break;
			case "dest": elSyn.querySelector( ".gsuiPatterns-synth-dest" ).dataset.id = val; break;
			case "destName": elSyn.querySelector( ".gsuiPatterns-synth-dest .gsuiPatterns-btnText" ).textContent = val; break;
		}
	}
	deleteSynth( id ) {
		this._getSynth( id ).remove();
	}

	// .........................................................................
	addPattern( id, { type, synth } ) {
		const elPat = GSUI.getTemplate( "gsui-patterns-pattern" );

		elPat.dataset.id = id;
		if ( type !== "buffer" ) {
			elPat.querySelector( ".gsuiPatterns-destArrow" ).remove();
			elPat.querySelector( ".gsuiPatterns-pattern-dest" ).remove();
		} else {
			elPat.querySelector( "[data-action='clone']" ).remove(); // 1.
		}
		this._getPatternParent( type, synth ).append( elPat );
	}
	changePattern( id, prop, val ) {
		const elPat = this._getPattern( id );

		switch ( prop ) {
			case "order": elPat.dataset.order = val; break;
			case "name": elPat.querySelector( ".gsuiPatterns-pattern-name" ).textContent = val; break;
			case "dest": elPat.querySelector( ".gsuiPatterns-pattern-dest" ).dataset.id = val; break;
			case "destName": elPat.querySelector( ".gsuiPatterns-pattern-dest .gsuiPatterns-btnText" ).textContent = val; break;
			case "synth": this._getPatternParent( "keys", val ).append( elPat ); break;
		}
	}
	appendPatternSVG( id, svg ) {
		svg.classList.add( "gsuiPatterns-pattern-svg" );
		this._getPattern( id ).querySelector( ".gsuiPatterns-pattern-content" ).append( svg );
	}
	deletePattern( id ) {
		const elPat = this._getPattern( id );

		if ( elPat ) { // 2.
			elPat.remove();
		}
	}

	// .........................................................................
	selectPattern( type, id ) {
		const elList = type === "drums"
				? this._elDrumsList
				: this._elSynthList;

		elList.querySelector( ".gsuiPatterns-pattern-selected" )?.classList?.remove( "gsuiPatterns-pattern-selected" );
		this._getPattern( id )?.classList?.add( "gsuiPatterns-pattern-selected" );
	}
	selectSynth( id ) {
		this._elSynthList.querySelector( ".gsuiPatterns-synth-selected" )?.classList?.remove( "gsuiPatterns-synth-selected" );
		this._getSynth( id ).classList.add( "gsuiPatterns-synth-selected" );
	}

	// .........................................................................
	_getSynth( id ) {
		return this._elSynthList.querySelector( `.gsuiPatterns-synth[data-id="${ id }"]` );
	}
	_getPattern( id ) {
		return this.rootElement.querySelector( `.gsuiPatterns-pattern[data-id="${ id }"]` );
	}
	_getPatternParent( type, synthId ) {
		switch ( type ) {
			case "buffer": return this._elBufferList;
			case "drums": return this._elDrumsList;
			case "keys": return this._elSynthList.querySelector( `.gsuiPatterns-synth[data-id="${ synthId }"] .gsuiPatterns-synth-patterns` );
		}
	}

	// .........................................................................
	_onreorderPatterns( list, elPat ) {
		this.onchange( "reorderPattern", elPat.dataset.id,
			gsuiReorder.listComputeOrderChange( list, {} ) );
	}
	_onreorderPatternsKeys( elPat, indA, indB, parA, parB ) {
		if ( parA === parB ) {
			this._onreorderPatterns( parA, elPat );
		} else {
			const patId = elPat.dataset.id,
				synth = parB.parentNode.dataset.id,
				patterns = { [ patId ]: { synth } };

			gsuiReorder.listComputeOrderChange( parA, patterns );
			gsuiReorder.listComputeOrderChange( parB, patterns );
			this.onchange( "redirectPatternKeys", patId, synth, patterns );
		}
	}
	_onclickListPatterns( e ) {
		const pat = e.target.closest( ".gsuiPatterns-pattern" );

		if ( pat ) {
			this._fnsPattern[ e.target.dataset.action ]( pat.dataset.id, e );
			return false;
		}
	}
	_onclickSynths( e ) {
		if ( this._onclickListPatterns( e ) !== false ) {
			const syn = e.target.closest( ".gsuiPatterns-synth" );

			if ( syn ) {
				this._fnsSynth[ e.target.dataset.action ]( syn.dataset.id, e );
			}
		}
	}
}

gsuiPatterns.selectChanPopupSelect = GSUI.createElement( "select", { id: "gsuiPatterns-selectChanPopupSelect", size: 8, name: "channel" } );
gsuiPatterns.selectChanPopupContent = (
	GSUI.createElement( "div", { class: "popup", id: "gsuiPatterns-selectChanPopupContent" },
		GSUI.createElement( "fieldset",
			GSUI.createElement( "legend", null, "Select a channel" ),
			gsuiPatterns.selectChanPopupSelect,
		),
	)
);

Object.freeze( gsuiPatterns );

/*
1. The cloning feature for the patterns of type buffer is removed because it's for the moment useless.
2. We are checking if the pattern exists because the entire synth could have been removed before.
*/
