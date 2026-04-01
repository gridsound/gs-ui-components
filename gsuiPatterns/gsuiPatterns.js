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
	static infoPopupContent = $( GSUgetTemplate( "gsui-patterns-infoPopup" ) );

	constructor() {
		super( {
			$tagName: "gsui-patterns",
			$elements: {
				$lists: ".gsuiPatterns-panel-list",
				$newSlices: "[data-action='newSlices']",
				$newDrums: "[data-action='newDrums']",
				$newSynth: "[data-action='newSynth']",
				$newAutomation: "[data-action='newAutomation']",
			},
		} );
		this.onchange = null;
		this.#initReorderBuffers();
		this.#initReorderSlices();
		this.#initReorderDrums();
		this.#initReorderKeys();
		this.#initReorderAutomations();
		this.#getList( "keys" ).$on( "dblclick", e => {
			const tar = $( e.target );

			if ( tar.$hasClass( "gsuiPatterns-synth-info" ) ) {
				this.$expandSynth( tar.$closest( ".gsuiPatterns-synth" ).$dataId() );
			}
		} );
		this.#getList( "automation" ).$onclick( this.#onclickListPatterns.bind( this ) );
		this.#getList( "buffer" ).$onclick( this.#onclickListPatterns.bind( this ) );
		this.#getList( "slices" ).$onclick( this.#onclickListPatterns.bind( this ) );
		this.#getList( "drums" ).$onclick( this.#onclickListPatterns.bind( this ) );
		this.#getList( "keys" ).$onclick( this.#onclickSynths.bind( this ) );
		this.$elements.$newSlices.$onclick( () => this.onchange( "addPatternSlices" ) );
		this.$elements.$newDrums.$onclick( () => this.onchange( "addPatternDrums" ) );
		this.$elements.$newSynth.$onclick( () => this.onchange( "addSynth" ) );
		this.$elements.$newAutomation.$onclick( () => this.onchange( "addAutomation" ) );
	}

	// .........................................................................
	#getList( patType ) {
		return this.$elements.$lists.$filter( `.gsuiPatterns-panel[data-type='${ patType }'] *` );
	}
	#initReorder( opt ) {
		new gsuiReorder( {
			$parentSelector: ".gsuiPatterns-panel-list",
			$itemSelector: ".gsuiPatterns-pattern",
			$itemGripSelector: ".gsuiPatterns-pattern-grip",
			$onchange: ( obj, patId ) => this.onchange( "reorderPattern", patId, obj ),
			$getTargetList: () => $( ".gsuiTrack-row > div" ),
			...opt,
		} );
	}
	#initReorderSlices() {
		this.#initReorder( {
			$root: this.#getList( "slices" ),
			$ondrop: this.#ondropPatternInTrack.bind( this, "pattern-slices" ),
		} );
	}
	#initReorderDrums() {
		this.#initReorder( {
			$root: this.#getList( "drums" ),
			$ondrop: this.#ondropPatternInTrack.bind( this, "pattern-drums" ),
		} );
	}
	#initReorderAutomations() {
		this.#initReorder( {
			$root: this.#getList( "automation" ),
			$ondrop: this.#ondropPatternInTrack.bind( this, "pattern-automation" ),
		} );
	}
	#initReorderKeys() {
		this.#initReorder( {
			$root: this.#getList( "keys" ),
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
				const synthId = el.$closest( ".gsuiPatterns-synth-head" ).$parent().$dataId();

				if ( synthId ) {
					this.$expandSynth( synthId, true );
				}
			},
		} );
	}
	#initReorderBuffers() {
		this.#initReorder( {
			$root: this.#getList( "buffer" ),
			$ondrop: this.#ondropPatternBuffer.bind( this ),
			$getTargetList: () => $( [
				$( "gsui-slicer" ),
				$( "gsui-oscillator:not([wavetable]) .gsuiOscillator-waveWrap" ),
				$( ".gsuiSynthesizer-newOsc" ),
				$( "gsui-drumrow" ),
				$( ".gsuiDrumrows-dropNew" ),
				$( ".gsuiTrack-row > div" ),
			] ),
		} );
	}
	#ondropPatternBuffer( drop ) {
		const tar = drop.$target;
		const obj = {
			$patternType: "pattern-buffer",
			$patternId: drop.$item,
		};

		if ( tar.$tag() === "gsui-slicer" ) {
			this.$this.$dispatch( GSEV_PATTERNS_DROPBUFFERONSLICER, obj );
		} else if ( tar.$tag() === "gsui-drumrow" ) {
			obj.$drumrowId = tar.$dataId();
			this.$this.$dispatch( GSEV_PATTERNS_DROPBUFFERONDRUMROW, obj );
		} else if ( tar.$hasClass( "gsuiDrumrows-dropNew" ) ) {
			this.$this.$dispatch( GSEV_PATTERNS_DROPBUFFERONDRUMROWNEW, obj );
		} else if ( tar.$hasClass( "gsuiOscillator-waveWrap" ) ) {
			obj.$synthId = tar.$closest( "gsui-synthesizer" ).$dataId();
			obj.$oscId = tar.$closest( "gsui-oscillator" ).$dataId();
			this.$this.$dispatch( GSEV_PATTERNS_DROPBUFFERONOSC, obj );
		} else if ( tar.$hasClass( "gsuiSynthesizer-newOsc" ) ) {
			obj.$synthId = tar.$closest( "gsui-synthesizer" ).$dataId();
			this.$this.$dispatch( GSEV_PATTERNS_DROPBUFFERONOSCNEW, obj );
		} else {
			this.#ondropPatternInTrack( "pattern-buffer", drop );
		}
	}
	#ondropPatternInTrack( patType, drop ) {
		const ppb = +drop.$target.$closest( "gsui-timewindow" ).$getAttr( "pxperbeat" );

		this.$this.$dispatch( GSEV_PATTERNS_DROPPATTERN, {
			$type: patType,
			$pattern: drop.$item,
			$when: Math.floor( drop.$offsetX / ppb ),
			$track: drop.$target.$parent().$dataId(),
		} );
	}

	// .........................................................................
	$expandSynth( id, b ) {
		this.#getSynth( id )
			.$togClass( "gsuiPatterns-synth-expanded", b )
			.$query( ".gsuiPatterns-synth-expand" )
			.$setAttr( "data-icon", b ? "caret-down" : "caret-right" );
	}
	#openChannelsPopup( action, objId, currChanId ) {
		GSUdomQS( "gsui-channels" )
			.$openSelectChannelPopup( currChanId )
			.then( chanId => chanId && this.onchange( action, objId, chanId ) );
	}
	#openInfoPopup( id, el ) {
		const cnt = gsuiPatterns.infoPopupContent;
		const radio = cnt.$query( `[value="${ el.dataset.bufferType }"]` ).$checked( true );

		if ( !radio.$size() ) {
			cnt.$query( "input:checked" ).$checked( false );
		}
		cnt.$query( "[name='bpm']" ).$value( el.dataset.bufferBpm );
		cnt.$query( "[name='name']" ).$value( el.dataset.name );
		cnt.$query( "[name='reverse']" ).$checked( el.dataset.reverse === "" );
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
		this.$this.$query( `.gsuiPatterns-btnSolid[data-id="${ id }"] .gsuiPatterns-btnText` ).$text( name );
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
			case "name": elSyn.$query( ".gsuiPatterns-synth-name" ).$text( val ); break;
			case "dest": elSyn.$query( ".gsuiPatterns-synth-dest" ).$dataId( val ); break;
			case "destName": elSyn.$query( ".gsuiPatterns-synth-dest .gsuiPatterns-btnText" ).$text( val ); break;
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
			case "data-missing": elPat.$setAttr( "data-missing", val ); break;
			case "order":
				elPat.$css( "order", val )
					.$setAttr( "data-order", val ); // to delete
				break;
			case "reverse": elPat.$setAttr( "data-reverse", val ); break;
			case "name":
				elPat.$setAttr( "data-name", val );
				elPat.$query( ".gsuiPatterns-pattern-name" ).$prop( "title", val ).$text( val );
				break;
			case "dest": elPat.$query( ".gsuiPatterns-pattern-dest" ).$dataId( val ); break;
			case "destName": elPat.$query( ".gsuiPatterns-pattern-dest .gsuiPatterns-btnText" ).$text( val ); break;
			case "synth": this.#getPatternParent( "keys", val ).$append( elPat ); break;
			case "bufferType":
				elPat.$setAttr( "data-buffer-type", val );
				elPat.$query( ".gsuiPatterns-pattern-btnInfo" ).$setAttr( "data-icon", `buf-${ val || "undefined" }` );
				break;
			case "bufferBpm":
				elPat.$setAttr( "data-buffer-bpm", val );
				break;
		}
	}
	$appendPatternSVG( id, svg ) {
		GSUdomAddClass( svg, "gsuiPatterns-pattern-svg" );
		this.$getPattern( id ).$query( ".gsuiPatterns-pattern-content" ).$append( svg );
	}
	$deletePattern( id ) {
		this.$getPattern( id ).$remove();
	}

	// .........................................................................
	$selectPattern( type, id ) {
		const elList = this.#getList( type );

		elList.$query( ".gsuiPatterns-pattern-selected" ).$rmClass( "gsuiPatterns-pattern-selected" );
		this.$getPattern( id ).$addClass( "gsuiPatterns-pattern-selected" );
	}
	$selectSynth( id ) {
		this.#getList( "keys" ).$query( ".gsuiPatterns-synth-selected" ).$rmClass( "gsuiPatterns-synth-selected" );
		this.#getSynth( id ).$addClass( "gsuiPatterns-synth-selected" );
	}

	// .........................................................................
	$getPattern( id ) {
		return this.$this.$query( `.gsuiPatterns-pattern[data-id="${ id }"]` );
	}
	#getSynth( id ) {
		return this.#getList( "keys" ).$query( `.gsuiPatterns-synth[data-id="${ id }"]` );
	}
	#getPatternParent( type, synthId ) {
		switch ( type ) {
			case "slices":
			case "buffer":
			case "automation":
			case "drums": return this.#getList( type );
			case "keys": return this.#getList( type ).$query( `.gsuiPatterns-synth[data-id="${ synthId }"] .gsuiPatterns-synth-patterns` );
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
