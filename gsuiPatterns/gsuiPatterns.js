"use strict";

class gsuiPatterns extends HTMLElement {
	#children = GSUI.getTemplate( "gsui-patterns" )
	#elements = GSUI.findElements( this.#children, {
		bufferList: ".gsuiPatterns-panelBuffers .gsuiPatterns-panel-list",
		drumsList: ".gsuiPatterns-panelDrums .gsuiPatterns-panel-list",
		synthList: ".gsuiPatterns-panelKeys .gsuiPatterns-panel-list",
		newDrums: "[data-action='newDrums']",
		newSynth: "[data-action='newSynth']",
	} )
	#nlKeysLists = this.#elements.synthList.getElementsByClassName( "gsuiPatterns-synth-patterns" )
	#fnsPattern = Object.freeze( {
		clone: id => this.onchange( "clonePattern", id ),
		remove: id => this.onchange( "removePattern", id ),
		undefined: id => this.onchange( "openPattern", id ),
		redirect: ( id, e ) => this.#openChannelsPopup( "redirectPatternBuffer", id, e ),
	} )
	#fnsSynth = Object.freeze( {
		expand: id => this.expandSynth( id ),
		undefined: id => this.onchange( "openSynth", id ),
		redirect: ( id, e ) => this.#openChannelsPopup( "redirectSynth", id, e ),
		newPattern: id => {
			this.onchange( "addPatternKeys", id );
			this.expandSynth( id, true );
		},
		delete: id => {
			elements.synthList.children.length > 1
				? this.onchange( "removeSynth", id )
				: GSUI.popup.alert( "Error", "You have to keep at least one synthesizer" );
		},
	} )

	constructor() {
		super();
		this.onchange =
		this.onpatternDataTransfer = null;
		Object.seal( this );

		new gsuiReorder( {
			rootElement: this.#elements.bufferList,
			direction: "column",
			dataTransfer: ( ...args ) => this.onpatternDataTransfer( ...args ),
			dataTransferType: "pattern-buffer",
			itemSelector: ".gsuiPatterns-pattern",
			handleSelector: ".gsuiPatterns-pattern-grip",
			parentSelector: ".gsuiPatterns-panel-list",
			onchange: this.#onreorderPatterns.bind( this, this.#elements.bufferList ),
		} );
		new gsuiReorder( {
			rootElement: this.#elements.drumsList,
			direction: "column",
			dataTransfer: ( ...args ) => this.onpatternDataTransfer( ...args ),
			dataTransferType: "pattern-drums",
			itemSelector: ".gsuiPatterns-pattern",
			handleSelector: ".gsuiPatterns-pattern-grip",
			parentSelector: ".gsuiPatterns-panel-list",
			onchange: this.#onreorderPatterns.bind( this, this.#elements.drumsList ),
		} );
		new gsuiReorder( {
			rootElement: this.#elements.synthList,
			direction: "column",
			dataTransfer: ( ...args ) => this.onpatternDataTransfer( ...args ),
			dataTransferType: "pattern-keys",
			itemSelector: ".gsuiPatterns-pattern",
			handleSelector: ".gsuiPatterns-pattern-grip",
			parentSelector: ".gsuiPatterns-synth-patterns",
			onchange: this.#onreorderPatternsKeys.bind( this ),
		} );
		this.#elements.synthList.ondragover = e => {
			const syn = e.target.closest( ".gsuiPatterns-synth" );

			if ( syn ) {
				this.expandSynth( syn.dataset.id, true );
			}
		};
		this.#elements.synthList.ondblclick = e => {
			if ( e.target.classList.contains( "gsuiPatterns-synth-info" ) ) {
				this.expandSynth( e.target.closest( ".gsuiPatterns-synth" ).dataset.id );
			}
		};
		this.#elements.bufferList.onclick =
		this.#elements.drumsList.onclick = this.#onclickListPatterns.bind( this );
		this.#elements.synthList.onclick = this.#onclickSynths.bind( this );
		this.#elements.newDrums.onclick = () => this.onchange( "addPatternDrums" );
		this.#elements.newSynth.onclick = () => this.onchange( "addSynth" );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( this.#children );
			this.#children = null;
		}
	}

	// .........................................................................
	expandSynth( id, b ) {
		const elSyn = this.#getSynth( id ),
			show = elSyn.classList.toggle( "gsuiPatterns-synth-expanded", b );

		elSyn.querySelector( ".gsuiPatterns-synth-expand" ).dataset.icon = `caret-${ show ? "down" : "right" }`;
	}
	reorderPatterns( patterns ) {
		gsuiReorder.listReorder( this.#elements.bufferList, patterns );
		gsuiReorder.listReorder( this.#elements.drumsList, patterns );
		Array.prototype.forEach.call( this.#nlKeysLists, list => {
			gsuiReorder.listReorder( list, patterns );
		} );
	}
	#openChannelsPopup( action, objId, e ) {
		const currChanId = e.target.dataset.id;

		gsuiPatterns.selectChanPopupSelect.value = currChanId;
		GSUI.popup.custom( {
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
		this.querySelectorAll( `.gsuiPatterns-btnSolid[data-id="${ id }"] .gsuiPatterns-btnText` )
			.forEach( el => el.textContent = name );
	}
	deleteChannel( id ) {
		gsuiPatterns.selectChanPopupSelect.querySelector( `option[value="${ id }"]` ).remove();
	}

	// .........................................................................
	addSynth( id ) {
		const elSyn = GSUI.getTemplate( "gsui-patterns-synth" );

		elSyn.dataset.id = id;
		this.#elements.synthList.prepend( elSyn );
	}
	changeSynth( id, prop, val ) {
		const elSyn = this.#getSynth( id );

		switch ( prop ) {
			case "name": elSyn.querySelector( ".gsuiPatterns-synth-name" ).textContent = val; break;
			case "dest": elSyn.querySelector( ".gsuiPatterns-synth-dest" ).dataset.id = val; break;
			case "destName": elSyn.querySelector( ".gsuiPatterns-synth-dest .gsuiPatterns-btnText" ).textContent = val; break;
		}
	}
	deleteSynth( id ) {
		this.#getSynth( id ).remove();
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
		this.#getPatternParent( type, synth ).append( elPat );
	}
	changePattern( id, prop, val ) {
		const elPat = this.getPattern( id );

		switch ( prop ) {
			case "order": elPat.dataset.order = val; break;
			case "name": elPat.querySelector( ".gsuiPatterns-pattern-name" ).textContent = val; break;
			case "dest": elPat.querySelector( ".gsuiPatterns-pattern-dest" ).dataset.id = val; break;
			case "destName": elPat.querySelector( ".gsuiPatterns-pattern-dest .gsuiPatterns-btnText" ).textContent = val; break;
			case "synth": this.#getPatternParent( "keys", val ).append( elPat ); break;
		}
	}
	appendPatternSVG( id, svg ) {
		svg.classList.add( "gsuiPatterns-pattern-svg" );
		this.getPattern( id ).querySelector( ".gsuiPatterns-pattern-content" ).append( svg );
	}
	deletePattern( id ) {
		const elPat = this.getPattern( id );

		if ( elPat ) { // 2.
			elPat.remove();
		}
	}

	// .........................................................................
	selectPattern( type, id ) {
		const elList = type === "drums"
				? this.#elements.drumsList
				: this.#elements.synthList;

		elList.querySelector( ".gsuiPatterns-pattern-selected" )?.classList?.remove( "gsuiPatterns-pattern-selected" );
		this.getPattern( id )?.classList?.add( "gsuiPatterns-pattern-selected" );
	}
	selectSynth( id ) {
		this.#elements.synthList.querySelector( ".gsuiPatterns-synth-selected" )?.classList?.remove( "gsuiPatterns-synth-selected" );
		this.#getSynth( id ).classList.add( "gsuiPatterns-synth-selected" );
	}

	// .........................................................................
	getPattern( id ) {
		return this.querySelector( `.gsuiPatterns-pattern[data-id="${ id }"]` );
	}
	#getSynth( id ) {
		return this.#elements.synthList.querySelector( `.gsuiPatterns-synth[data-id="${ id }"]` );
	}
	#getPatternParent( type, synthId ) {
		switch ( type ) {
			case "buffer": return this.#elements.bufferList;
			case "drums": return this.#elements.drumsList;
			case "keys": return this.#elements.synthList.querySelector( `.gsuiPatterns-synth[data-id="${ synthId }"] .gsuiPatterns-synth-patterns` );
		}
	}

	// .........................................................................
	#onreorderPatterns( list, elPat ) {
		this.onchange( "reorderPattern", elPat.dataset.id,
			gsuiReorder.listComputeOrderChange( list, {} ) );
	}
	#onreorderPatternsKeys( elPat, indA, indB, parA, parB ) {
		if ( parA === parB ) {
			this.#onreorderPatterns( parA, elPat );
		} else {
			const patId = elPat.dataset.id,
				synth = parB.parentNode.dataset.id,
				patterns = { [ patId ]: { synth } };

			gsuiReorder.listComputeOrderChange( parA, patterns );
			gsuiReorder.listComputeOrderChange( parB, patterns );
			this.onchange( "redirectPatternKeys", patId, synth, patterns );
		}
	}
	#onclickListPatterns( e ) {
		const pat = e.target.closest( ".gsuiPatterns-pattern" );

		if ( pat ) {
			this.#fnsPattern[ e.target.dataset.action ]( pat.dataset.id, e );
			return false;
		}
	}
	#onclickSynths( e ) {
		if ( this.#onclickListPatterns( e ) !== false ) {
			const syn = e.target.closest( ".gsuiPatterns-synth" );

			if ( syn ) {
				this.#fnsSynth[ e.target.dataset.action ]( syn.dataset.id, e );
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
customElements.define( "gsui-patterns", gsuiPatterns );

/*
1. The cloning feature for the patterns of type buffer is removed because it's for the moment useless.
2. We are checking if the pattern exists because the entire synth could have been removed before.
*/
