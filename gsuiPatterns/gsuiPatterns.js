"use strict";

class gsuiPatterns extends gsui0ne {
	#fnsPattern = Object.freeze( {
		clone: id => this.onchange( "clonePattern", id ),
		remove: id => this.onchange( "removePattern", id ),
		editInfo: ( id, el ) => this.#openInfoPopup( id, el ),
		undefined: id => this.onchange( "openPattern", id ),
		redirect: ( id, el, e ) => this.#openChannelsPopup( "redirectPatternBuffer", id, e.target.dataset.id ),
	} );
	#fnsSynth = Object.freeze( {
		expand: id => this.$expandSynth( id ),
		undefined: id => this.onchange( "openSynth", id ),
		redirect: ( id, e ) => this.#openChannelsPopup( "redirectSynth", id, e.target.dataset.id ),
		newPattern: id => {
			this.onchange( "addPatternKeys", id );
			this.$expandSynth( id, true );
		},
		delete: id => {
			this.#getList( "keys" ).$children().$size() > 1
				? this.onchange( "removeSynth", id )
				: GSUpopup.$alert( "Error", "You have to keep at least one synthesizer" );
		},
	} );
	static infoPopupContent = GSUgetTemplate( "gsui-patterns-infoPopup" );

	constructor() {
		super( {
			$cmpName: "gsuiPatterns",
			$tagName: "gsui-patterns",
			$jqueryfy: true,
			$elements: {
				$lists: ".gsuiPatterns-panel-list",
				$newSlices: "[data-action='newSlices']",
				$newDrums: "[data-action='newDrums']",
				$newSynth: "[data-action='newSynth']",
			},
		} );
		this.onchange = null;
		Object.seal( this );
		this.#initReorderBuffers();
		this.#initReorderSlices();
		this.#initReorderDrums();
		this.#initReorderKeys();
		this.#getList( "keys" ).$on( "dblclick", e => {
			if ( GSUdomHasClass( e.target, "gsuiPatterns-synth-info" ) ) {
				this.$expandSynth( e.target.closest( ".gsuiPatterns-synth" ).dataset.id );
			}
		} );
		this.#getList( "buffers" ).$on( "click", this.#onclickListPatterns.bind( this ) );
		this.#getList( "slices" ).$on( "click", this.#onclickListPatterns.bind( this ) );
		this.#getList( "drums" ).$on( "click", this.#onclickListPatterns.bind( this ) );
		this.#getList( "keys" ).$on( "click", this.#onclickSynths.bind( this ) );
		this.$elements.$newSlices.$on( "click", () => this.onchange( "addPatternSlices" ) );
		this.$elements.$newDrums.$on( "click", () => this.onchange( "addPatternDrums" ) );
		this.$elements.$newSynth.$on( "click", () => this.onchange( "addSynth" ) );
	}

	// .........................................................................
	#getList( list ) { // slices | drums | keys | buffers
		return this.$elements.$lists.$filter( `.gsuiPatterns-panel[data-type='${ list }'] *` );
	}
	#initReorder( opt ) {
		new gsuiReorder( {
			$parentSelector: ".gsuiPatterns-panel-list",
			$itemSelector: ".gsuiPatterns-pattern",
			$itemGripSelector: ".gsuiPatterns-pattern-grip",
			$onchange: ( obj, patId ) => this.onchange( "reorderPattern", patId, obj ),
			$getTargetList: () => [ ...GSUdomQSA( ".gsuiTrack-row > div" ) ],
			...opt,
		} );
	}
	#initReorderSlices() {
		this.#initReorder( {
			$root: this.#getList( "slices" ).$get( 0 ),
			$ondrop: this.#ondropPatternInTrack.bind( this, "pattern-slices" ),
		} );
	}
	#initReorderDrums() {
		this.#initReorder( {
			$root: this.#getList( "drums" ).$get( 0 ),
			$ondrop: this.#ondropPatternInTrack.bind( this, "pattern-drums" ),
		} );
	}
	#initReorderKeys() {
		this.#initReorder( {
			$root: this.#getList( "keys" ).$get( 0 ),
			$parentSelector: ".gsuiPatterns-synth-patterns",
			$onchange: ( obj, patId ) => {
				if ( "parent" in obj[ patId ] ) {
					const synth = obj[ patId ].parent;

					obj[ patId ].synth = synth;
					delete obj[ patId ].parent;
					this.onchange( "redirectPatternKeys", patId, synth, obj );
				} else {
					this.onchange( "reorderPattern", patId, obj );
				}
			},
			$ondrop: this.#ondropPatternInTrack.bind( this, "pattern-keys" ),
			$ondragoverenter: el => {
				const synthId = el.closest( ".gsuiPatterns-synth-head" )?.parentNode.dataset.id;

				if ( synthId ) {
					this.$expandSynth( synthId, true );
				}
			},
		} );
	}
	#initReorderBuffers() {
		this.#initReorder( {
			$root: this.#getList( "buffers" ).$get( 0 ),
			$ondrop: this.#ondropPatternBuffer.bind( this ),
			$getTargetList: () => [
				GSUdomQS( "gsui-slicer" ),
				...GSUdomQSA( "gsui-oscillator:not([wavetable]) .gsuiOscillator-waveWrap" ),
				GSUdomQS( ".gsuiSynthesizer-newOsc" ),
				...GSUdomQSA( "gsui-drumrow" ),
				GSUdomQS( ".gsuiDrumrows-dropNew" ),
				...GSUdomQSA( ".gsuiTrack-row > div" ),
			],
		} );
	}
	#ondropPatternBuffer( drop ) {
		const tar = drop.$target;
		const obj = {
			$patternType: "pattern-buffer",
			$patternId: drop.$item,
		};

		if ( tar.tagName === "GSUI-SLICER" ) {
			this.$this.$dispatch( GSEV_PATTERNS_DROPBUFFERONSLICER, obj );
		} else if ( tar.tagName === "GSUI-DRUMROW" ) {
			obj.$drumrowId = tar.dataset.id;
			this.$this.$dispatch( GSEV_PATTERNS_DROPBUFFERONDRUMROW, obj );
		} else if ( GSUdomHasClass( tar, "gsuiDrumrows-dropNew" ) ) {
			this.$this.$dispatch( GSEV_PATTERNS_DROPBUFFERONDRUMROWNEW, obj );
		} else if ( GSUdomHasClass( tar, "gsuiOscillator-waveWrap" ) ) {
			obj.$synthId = tar.closest( "gsui-synthesizer" ).dataset.id;
			obj.$oscId = tar.closest( "gsui-oscillator" ).dataset.id;
			this.$this.$dispatch( GSEV_PATTERNS_DROPBUFFERONOSC, obj );
		} else if ( GSUdomHasClass( tar, "gsuiSynthesizer-newOsc" ) ) {
			obj.$synthId = tar.closest( "gsui-synthesizer" ).dataset.id;
			this.$this.$dispatch( GSEV_PATTERNS_DROPBUFFERONOSCNEW, obj );
		} else {
			this.#ondropPatternInTrack( "pattern-buffer", drop );
		}
	}
	#ondropPatternInTrack( patType, drop ) {
		const ppb = GSUdomGetAttrNum( drop.$target.closest( "gsui-timewindow" ), "pxperbeat" );

		this.$this.$dispatch( GSEV_PATTERNS_DROPPATTERN, {
			$type: patType,
			$pattern: drop.$item,
			$when: Math.floor( drop.$offsetX / ppb ),
			$track: drop.$target.parentNode.dataset.id,
		} );
	}

	// .........................................................................
	$expandSynth( id, b ) {
		this.#getSynth( id )
			.$togClass( "gsuiPatterns-synth-expanded", b )
			.$find( ".gsuiPatterns-synth-expand" )
			.$attr( "data-icon", b ? "caret-down" : "caret-right" );
	}
	#openChannelsPopup( action, objId, currChanId ) {
		GSUdomQS( "gsui-channels" )
			.$openSelectChannelPopup( currChanId )
			.then( chanId => chanId && this.onchange( action, objId, chanId ) );
	}
	#openInfoPopup( id, el ) {
		const cnt = gsuiPatterns.infoPopupContent;
		const radio = GSUjq( cnt, `[value="${ el.dataset.bufferType }"]` ).$prop( "checked", true );

		if ( !radio.$size() ) {
			GSUjq( cnt, "input:checked" ).$prop( "checked", false );
		}
		GSUjq( cnt, "[name='bpm']" ).$value( el.dataset.bufferBpm );
		GSUjq( cnt, "[name='name']" ).$value( el.dataset.name );
		GSUjq( cnt, "[name='reverse']" ).$prop( "checked", el.dataset.reverse === "" );
		GSUpopup.$custom( {
			title: "Buffer's info",
			element: cnt,
			submit: data => {
				data.bpm = data.bpm || null;
				this.onchange( "changePatternBufferInfo", id, data );
			},
		} );
	}

	// .........................................................................
	$updateChannel( id, name ) {
		this.$this.$find( `.gsuiPatterns-btnSolid[data-id="${ id }"] .gsuiPatterns-btnText` ).$text( name );
	}

	// .........................................................................
	$addSynth( id ) {
		const elSyn = GSUgetTemplate( "gsui-patterns-synth" );

		elSyn.dataset.id = id;
		this.#getList( "keys" ).$prepend( elSyn );
	}
	$changeSynth( id, prop, val ) {
		const elSyn = this.#getSynth( id );

		switch ( prop ) {
			case "name": elSyn.$find( ".gsuiPatterns-synth-name" ).$text( val ); break;
			case "dest": elSyn.$find( ".gsuiPatterns-synth-dest" ).$attr( "data-id", val ); break;
			case "destName": elSyn.$find( ".gsuiPatterns-synth-dest .gsuiPatterns-btnText" ).$text( val ); break;
		}
	}
	$deleteSynth( id ) {
		this.#getSynth( id ).$remove();
	}

	// .........................................................................
	$addPattern( id, { type, synth } ) {
		const elPat = GSUgetTemplate( "gsui-patterns-pattern" );

		elPat.dataset.id = id;
		if ( type !== "buffer" ) {
			GSUdomQS( elPat, ".gsuiPatterns-pattern-btnInfo" ).remove();
			GSUdomQS( elPat, ".gsuiPatterns-pattern-dest" ).remove();
		}
		this.#getPatternParent( type, synth ).$append( elPat );
	}
	$changePattern( id, prop, val ) {
		const elPat = this.$getPattern( id );

		switch ( prop ) {
			case "data-missing": elPat.$attr( "data-missing", val ); break;
			case "order":
				elPat.$css( "order", val )
					.$attr( "data-order", val ); // to delete
				break;
			case "reverse": elPat.$attr( "data-reverse", val ); break;
			case "name":
				elPat.$attr( "data-name", val );
				elPat.$find( ".gsuiPatterns-pattern-name" ).$prop( "title", val ).$text( val );
				break;
			case "dest": elPat.$find( ".gsuiPatterns-pattern-dest" ).$attr( "data-id", val ); break;
			case "destName": elPat.$find( ".gsuiPatterns-pattern-dest .gsuiPatterns-btnText" ).$text( val ); break;
			case "synth": this.#getPatternParent( "keys", val ).$append( elPat ); break;
			case "bufferType":
				elPat.$attr( "data-buffer-type", val );
				elPat.$find( ".gsuiPatterns-pattern-btnInfo" ).$attr( "data-icon", `buf-${ val || "undefined" }` );
				break;
			case "bufferBpm":
				elPat.$attr( "data-buffer-bpm", val );
				break;
		}
	}
	$appendPatternSVG( id, svg ) {
		GSUdomAddClass( svg, "gsuiPatterns-pattern-svg" );
		this.$getPattern( id ).$find( ".gsuiPatterns-pattern-content" ).$append( svg );
	}
	$deletePattern( id ) {
		this.$getPattern( id ).$remove();
	}

	// .........................................................................
	$selectPattern( type, id ) {
		const elList = this.#getList( type === "buffer" ? "buffers" : type );

		elList.$find( ".gsuiPatterns-pattern-selected" ).$rmClass( "gsuiPatterns-pattern-selected" );
		this.$getPattern( id ).$addClass( "gsuiPatterns-pattern-selected" );
	}
	$selectSynth( id ) {
		this.#getList( "keys" ).$find( ".gsuiPatterns-synth-selected" ).$rmClass( "gsuiPatterns-synth-selected" );
		this.#getSynth( id ).$addClass( "gsuiPatterns-synth-selected" );
	}

	// .........................................................................
	$getPattern( id ) {
		return this.$this.$find( `.gsuiPatterns-pattern[data-id="${ id }"]` );
	}
	#getSynth( id ) {
		return this.#getList( "keys" ).$find( `.gsuiPatterns-synth[data-id="${ id }"]` );
	}
	#getPatternParent( type, synthId ) {
		switch ( type ) {
			case "slices":
			case "drums": return this.#getList( type );
			case "buffer": return this.#getList( "buffers" );
			case "keys": return this.#getList( "keys" ).$find( `.gsuiPatterns-synth[data-id="${ synthId }"] .gsuiPatterns-synth-patterns` );
		}
	}

	// .........................................................................
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

GSUdomDefine( "gsui-patterns", gsuiPatterns );
