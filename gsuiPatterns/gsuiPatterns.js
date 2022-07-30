"use strict";

class gsuiPatterns extends HTMLElement {
	#dispatch = GSUI.$dispatchEvent.bind( null, this, "gsuiPatterns" );
	#fnsPattern = Object.freeze( {
		clone: id => this.onchange( "clonePattern", id ),
		remove: id => this.onchange( "removePattern", id ),
		editInfo: ( id, el ) => this.#openInfoPopup( id, el ),
		undefined: id => this.onchange( "openPattern", id ),
		redirect: ( id, el, e ) => this.#openChannelsPopup( "redirectPatternBuffer", id, e.target.dataset.id ),
	} );
	#fnsSynth = Object.freeze( {
		expand: id => this.expandSynth( id ),
		undefined: id => this.onchange( "openSynth", id ),
		redirect: ( id, e ) => this.#openChannelsPopup( "redirectSynth", id, e.target.dataset.id ),
		newPattern: id => {
			this.onchange( "addPatternKeys", id );
			this.expandSynth( id, true );
		},
		delete: id => {
			this.#elements.lists.synth.children.length > 1
				? this.onchange( "removeSynth", id )
				: GSUI.$popup.alert( "Error", "You have to keep at least one synthesizer" );
		},
	} );
	#children = GSUI.$getTemplate( "gsui-patterns" );
	#elements = GSUI.$findElements( this.#children, {
		lists: {
			slices: ".gsuiPatterns-panelSlices .gsuiPatterns-panel-list",
			drums: ".gsuiPatterns-panelDrums .gsuiPatterns-panel-list",
			synth: ".gsuiPatterns-panelKeys .gsuiPatterns-panel-list",
			buffer: ".gsuiPatterns-panelBuffers .gsuiPatterns-panel-list",
		},
		newSlices: "[data-action='newSlices']",
		newDrums: "[data-action='newDrums']",
		newSynth: "[data-action='newSynth']",
	} );
	#nlKeysLists = this.#elements.lists.synth.getElementsByClassName( "gsuiPatterns-synth-patterns" );
	static infoPopupContent = GSUI.$getTemplate( "gsui-patterns-infoPopup" );

	constructor() {
		super();
		this.onchange =
		this.onpatternDataTransfer = null;
		Object.seal( this );

		new gsuiReorder( {
			rootElement: this.#elements.lists.buffer,
			direction: "column",
			dataTransfer: ( ...args ) => this.onpatternDataTransfer( ...args ),
			dataTransferType: "pattern-buffer",
			itemSelector: ".gsuiPatterns-pattern",
			handleSelector: ".gsuiPatterns-pattern-grip",
			parentSelector: ".gsuiPatterns-panel-list",
			onchange: this.#onreorderPatterns.bind( this, this.#elements.lists.buffer ),
		} );
		new gsuiReorder( {
			rootElement: this.#elements.lists.slices,
			direction: "column",
			dataTransfer: ( ...args ) => this.onpatternDataTransfer( ...args ),
			dataTransferType: "pattern-slices",
			itemSelector: ".gsuiPatterns-pattern",
			handleSelector: ".gsuiPatterns-pattern-grip",
			parentSelector: ".gsuiPatterns-panel-list",
			onchange: this.#onreorderPatterns.bind( this, this.#elements.lists.slices ),
		} );
		new gsuiReorder( {
			rootElement: this.#elements.lists.drums,
			direction: "column",
			dataTransfer: ( ...args ) => this.onpatternDataTransfer( ...args ),
			dataTransferType: "pattern-drums",
			itemSelector: ".gsuiPatterns-pattern",
			handleSelector: ".gsuiPatterns-pattern-grip",
			parentSelector: ".gsuiPatterns-panel-list",
			onchange: this.#onreorderPatterns.bind( this, this.#elements.lists.drums ),
		} );
		new gsuiReorder( {
			rootElement: this.#elements.lists.synth,
			direction: "column",
			dataTransfer: ( ...args ) => this.onpatternDataTransfer( ...args ),
			dataTransferType: "pattern-keys",
			itemSelector: ".gsuiPatterns-pattern",
			handleSelector: ".gsuiPatterns-pattern-grip",
			parentSelector: ".gsuiPatterns-synth-patterns",
			onchange: this.#onreorderPatternsKeys.bind( this ),
		} );
		this.#elements.lists.buffer.ondrop = e => {
			const defBufId = e.dataTransfer.getData( "library-buffer:default" );
			const locBufId = e.dataTransfer.getData( "library-buffer:local" );

			if ( defBufId ) {
				this.#dispatch( "libraryBufferDropped", "default", defBufId );
			} else if ( locBufId ) {
				this.#dispatch( "libraryBufferDropped", "local", locBufId );
			}
		};
		this.#elements.lists.synth.ondragover = e => {
			const syn = e.target.closest( ".gsuiPatterns-synth" );

			if ( syn ) {
				this.expandSynth( syn.dataset.id, true );
			}
		};
		this.#elements.lists.synth.ondblclick = e => {
			if ( e.target.classList.contains( "gsuiPatterns-synth-info" ) ) {
				this.expandSynth( e.target.closest( ".gsuiPatterns-synth" ).dataset.id );
			}
		};
		this.#elements.lists.buffer.onclick =
		this.#elements.lists.slices.onclick =
		this.#elements.lists.drums.onclick = this.#onclickListPatterns.bind( this );
		this.#elements.lists.synth.onclick = this.#onclickSynths.bind( this );
		this.#elements.newSlices.onclick = () => this.onchange( "addPatternSlices" );
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
		const elSyn = this.#getSynth( id );
		const show = elSyn.classList.toggle( "gsuiPatterns-synth-expanded", b );

		elSyn.querySelector( ".gsuiPatterns-synth-expand" ).dataset.icon = `caret-${ show ? "down" : "right" }`;
	}
	reorderPatterns( patterns ) {
		gsuiReorder.listReorder( this.#elements.lists.buffer, patterns );
		gsuiReorder.listReorder( this.#elements.lists.slices, patterns );
		gsuiReorder.listReorder( this.#elements.lists.drums, patterns );
		Array.prototype.forEach.call( this.#nlKeysLists, list => {
			gsuiReorder.listReorder( list, patterns );
		} );
	}
	#openChannelsPopup( action, objId, currChanId ) {
		gsuiChannels.openSelectChannelPopup( currChanId )
			.then( chanId => chanId && this.onchange( action, objId, chanId ) );
	}
	#openInfoPopup( id, el ) {
		const radio = gsuiPatterns.infoPopupContent.querySelector( `[value="${ el.dataset.bufferType }"]` );

		if ( radio ) {
			radio.checked = true;
		} else {
			const radio = gsuiPatterns.infoPopupContent.querySelector( "input:checked" );

			if ( radio ) {
				radio.checked = false;
			}
		}
		gsuiPatterns.infoPopupContent.querySelector( "[name='bpm']" ).value = el.dataset.bufferBpm;
		gsuiPatterns.infoPopupContent.querySelector( "[name='name']" ).value = el.dataset.name;
		GSUI.$popup.custom( {
			title: "Buffer's info",
			element: gsuiPatterns.infoPopupContent,
			submit: data => {
				data.bpm = data.bpm || null;
				this.onchange( "changePatternBufferInfo", id, data );
			}
		} );
	}

	// .........................................................................
	updateChannel( id, name ) {
		this.querySelectorAll( `.gsuiPatterns-btnSolid[data-id="${ id }"] .gsuiPatterns-btnText` )
			.forEach( el => el.textContent = name );
	}

	// .........................................................................
	addSynth( id ) {
		const elSyn = GSUI.$getTemplate( "gsui-patterns-synth" );

		elSyn.dataset.id = id;
		this.#elements.lists.synth.prepend( elSyn );
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
		const elPat = GSUI.$getTemplate( "gsui-patterns-pattern" );

		elPat.dataset.id = id;
		if ( type !== "buffer" ) {
			elPat.querySelector( ".gsuiPatterns-pattern-btnInfo" ).remove();
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
			case "data-missing": GSUI.$setAttribute( elPat, "data-missing", val ); break;
			case "order": elPat.dataset.order = val; break;
			case "name":
				elPat.dataset.name = val;
				elPat.querySelector( ".gsuiPatterns-pattern-name" ).textContent = val;
				break;
			case "dest": elPat.querySelector( ".gsuiPatterns-pattern-dest" ).dataset.id = val; break;
			case "destName": elPat.querySelector( ".gsuiPatterns-pattern-dest .gsuiPatterns-btnText" ).textContent = val; break;
			case "synth": this.#getPatternParent( "keys", val ).append( elPat ); break;
			case "bufferType":
				GSUI.$setAttribute( elPat, "data-buffer-type", val );
				elPat.querySelector( ".gsuiPatterns-pattern-btnInfo" ).dataset.icon = `buf-${ val || "undefined" }`;
				break;
			case "bufferBpm":
				GSUI.$setAttribute( elPat, "data-buffer-bpm", val );
				break;
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
		const elList = this.#elements.lists[ type === "keys" ? "synth" : type ];

		elList.querySelector( ".gsuiPatterns-pattern-selected" )?.classList?.remove( "gsuiPatterns-pattern-selected" );
		this.getPattern( id )?.classList?.add( "gsuiPatterns-pattern-selected" );
	}
	selectSynth( id ) {
		this.#elements.lists.synth.querySelector( ".gsuiPatterns-synth-selected" )?.classList?.remove( "gsuiPatterns-synth-selected" );
		this.#getSynth( id ).classList.add( "gsuiPatterns-synth-selected" );
	}

	// .........................................................................
	getPattern( id ) {
		return this.querySelector( `.gsuiPatterns-pattern[data-id="${ id }"]` );
	}
	#getSynth( id ) {
		return this.#elements.lists.synth.querySelector( `.gsuiPatterns-synth[data-id="${ id }"]` );
	}
	#getPatternParent( type, synthId ) {
		switch ( type ) {
			case "slices":
			case "buffer":
			case "drums": return this.#elements.lists[ type ];
			case "keys": return this.#elements.lists.synth.querySelector( `.gsuiPatterns-synth[data-id="${ synthId }"] .gsuiPatterns-synth-patterns` );
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
			const patId = elPat.dataset.id;
			const synth = parB.parentNode.dataset.id;
			const patterns = { [ patId ]: { synth } };

			gsuiReorder.listComputeOrderChange( parA, patterns );
			gsuiReorder.listComputeOrderChange( parB, patterns );
			this.onchange( "redirectPatternKeys", patId, synth, patterns );
		}
	}
	#onclickListPatterns( e ) {
		const pat = e.target.closest( ".gsuiPatterns-pattern" );

		if ( pat ) {
			this.#fnsPattern[ e.target.dataset.action ]( pat.dataset.id, pat, e );
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

Object.freeze( gsuiPatterns );
customElements.define( "gsui-patterns", gsuiPatterns );

/*
1. The cloning feature for the patterns of type buffer is removed because it's for the moment useless.
2. We are checking if the pattern exists because the entire synth could have been removed before.
*/
