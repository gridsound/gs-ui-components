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
			this.$elements.$lists.synth.children.length > 1
				? this.onchange( "removeSynth", id )
				: GSUpopup.$alert( "Error", "You have to keep at least one synthesizer" );
		},
	} );
	static infoPopupContent = GSUgetTemplate( "gsui-patterns-infoPopup" );

	constructor() {
		super( {
			$cmpName: "gsuiPatterns",
			$tagName: "gsui-patterns",
			$elements: {
				$lists: {
					slices: ".gsuiPatterns-panel[data-type='slices'] .gsuiPatterns-panel-list",
					drums: ".gsuiPatterns-panel[data-type='drums'] .gsuiPatterns-panel-list",
					synth: ".gsuiPatterns-panel[data-type='keys'] .gsuiPatterns-panel-list",
					buffer: ".gsuiPatterns-panel[data-type='buffers'] .gsuiPatterns-panel-list",
				},
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
		this.$elements.$lists.synth.ondblclick = e => {
			if ( GSUdomHasClass( e.target, "gsuiPatterns-synth-info" ) ) {
				this.$expandSynth( e.target.closest( ".gsuiPatterns-synth" ).dataset.id );
			}
		};
		this.$elements.$lists.buffer.onclick =
		this.$elements.$lists.slices.onclick =
		this.$elements.$lists.drums.onclick = this.#onclickListPatterns.bind( this );
		this.$elements.$lists.synth.onclick = this.#onclickSynths.bind( this );
		this.$elements.$newSlices.onclick = () => this.onchange( "addPatternSlices" );
		this.$elements.$newDrums.onclick = () => this.onchange( "addPatternDrums" );
		this.$elements.$newSynth.onclick = () => this.onchange( "addSynth" );
	}

	// .........................................................................
	#initReorder( opt ) {
		new gsuiReorder( Object.assign( {
			$parentSelector: ".gsuiPatterns-panel-list",
			$itemSelector: ".gsuiPatterns-pattern",
			$itemGripSelector: ".gsuiPatterns-pattern-grip",
			$onchange: ( obj, patId ) => this.onchange( "reorderPattern", patId, obj ),
			$getTargetList: () => [ ...GSUdomQSA( ".gsuiTrack-row > div" ) ],
		}, opt ) );
	}
	#initReorderSlices() {
		this.#initReorder( {
			$root: this.$elements.$lists.slices,
			$ondrop: this.#ondropPatternInTrack.bind( this, "pattern-slices" ),
		} );
	}
	#initReorderDrums() {
		this.#initReorder( {
			$root: this.$elements.$lists.drums,
			$ondrop: this.#ondropPatternInTrack.bind( this, "pattern-drums" ),
		} );
	}
	#initReorderKeys() {
		this.#initReorder( {
			$root: this.$elements.$lists.synth,
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
			$root: this.$elements.$lists.buffer,
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
			this.$dispatch( "dropBufferOnSlicer", obj );
		} else if ( tar.tagName === "GSUI-DRUMROW" ) {
			obj.$drumrowId = tar.dataset.id;
			this.$dispatch( "dropBufferOnDrumrow", obj );
		} else if ( GSUdomHasClass( tar, "gsuiDrumrows-dropNew" ) ) {
			this.$dispatch( "dropBufferOnDrumrowNew", obj );
		} else if ( GSUdomHasClass( tar, "gsuiOscillator-waveWrap" ) ) {
			obj.$synthId = tar.closest( "gsui-synthesizer" ).dataset.id;
			obj.$oscId = tar.closest( "gsui-oscillator" ).dataset.id;
			this.$dispatch( "dropBufferOnOsc", obj );
		} else if ( GSUdomHasClass( tar, "gsuiSynthesizer-newOsc" ) ) {
			obj.$synthId = tar.closest( "gsui-synthesizer" ).dataset.id;
			this.$dispatch( "dropBufferOnOscNew", obj );
		} else {
			this.#ondropPatternInTrack( "pattern-buffer", drop );
		}
	}
	#ondropPatternInTrack( patType, drop ) {
		const ppb = GSUdomGetAttrNum( drop.$target.closest( "gsui-timewindow" ), "pxperbeat" );

		this.$dispatch( "dropPattern", {
			$type: patType,
			$pattern: drop.$item,
			$when: Math.floor( drop.$offsetX / ppb ),
			$track: drop.$target.parentNode.dataset.id,
		} );
	}

	// .........................................................................
	$expandSynth( id, b ) {
		const elSyn = this.#getSynth( id );
		const show = GSUdomTogClass( elSyn, "gsuiPatterns-synth-expanded", b );

		GSUdomQS( elSyn, ".gsuiPatterns-synth-expand" ).dataset.icon = `caret-${ show ? "down" : "right" }`;
	}
	#openChannelsPopup( action, objId, currChanId ) {
		GSUdomQS( "gsui-channels" )
			.$openSelectChannelPopup( currChanId )
			.then( chanId => chanId && this.onchange( action, objId, chanId ) );
	}
	#openInfoPopup( id, el ) {
		const radio = GSUdomQS( gsuiPatterns.infoPopupContent, `[value="${ el.dataset.bufferType }"]` );

		if ( radio ) {
			radio.checked = true;
		} else {
			const radio = GSUdomQS( gsuiPatterns.infoPopupContent, "input:checked" );

			if ( radio ) {
				radio.checked = false;
			}
		}
		GSUdomQS( gsuiPatterns.infoPopupContent, "[name='bpm']" ).value = el.dataset.bufferBpm;
		GSUdomQS( gsuiPatterns.infoPopupContent, "[name='name']" ).value = el.dataset.name;
		GSUdomQS( gsuiPatterns.infoPopupContent, "[name='reverse']" ).checked = el.dataset.reverse === "";
		GSUpopup.$custom( {
			title: "Buffer's info",
			element: gsuiPatterns.infoPopupContent,
			submit: data => {
				data.bpm = data.bpm || null;
				this.onchange( "changePatternBufferInfo", id, data );
			},
		} );
	}

	// .........................................................................
	$updateChannel( id, name ) {
		GSUdomQSA( this, `.gsuiPatterns-btnSolid[data-id="${ id }"] .gsuiPatterns-btnText` )
			.forEach( el => el.textContent = name );
	}

	// .........................................................................
	$addSynth( id ) {
		const elSyn = GSUgetTemplate( "gsui-patterns-synth" );

		elSyn.dataset.id = id;
		this.$elements.$lists.synth.prepend( elSyn );
	}
	$changeSynth( id, prop, val ) {
		const elSyn = this.#getSynth( id );

		switch ( prop ) {
			case "name": GSUdomQS( elSyn, ".gsuiPatterns-synth-name" ).textContent = val; break;
			case "dest": GSUdomQS( elSyn, ".gsuiPatterns-synth-dest" ).dataset.id = val; break;
			case "destName": GSUdomQS( elSyn, ".gsuiPatterns-synth-dest .gsuiPatterns-btnText" ).textContent = val; break;
		}
	}
	$deleteSynth( id ) {
		this.#getSynth( id ).remove();
	}

	// .........................................................................
	$addPattern( id, { type, synth } ) {
		const elPat = GSUgetTemplate( "gsui-patterns-pattern" );

		elPat.dataset.id = id;
		if ( type !== "buffer" ) {
			GSUdomQS( elPat, ".gsuiPatterns-pattern-btnInfo" ).remove();
			GSUdomQS( elPat, ".gsuiPatterns-pattern-dest" ).remove();
		}
		this.#getPatternParent( type, synth ).append( elPat );
	}
	$changePattern( id, prop, val ) {
		const elPat = this.$getPattern( id );

		switch ( prop ) {
			case "data-missing": GSUdomSetAttr( elPat, "data-missing", val ); break;
			case "order":
				elPat.dataset.order = val; // to delete
				elPat.style.order = val;
				break;
			case "reverse": GSUdomSetAttr( elPat, "data-reverse", val ); break;
			case "name":
				elPat.dataset.name = val;
				GSUdomQS( elPat, ".gsuiPatterns-pattern-name" ).title = val;
				GSUdomQS( elPat, ".gsuiPatterns-pattern-name" ).textContent = val;
				break;
			case "dest": GSUdomQS( elPat, ".gsuiPatterns-pattern-dest" ).dataset.id = val; break;
			case "destName": GSUdomQS( elPat, ".gsuiPatterns-pattern-dest .gsuiPatterns-btnText" ).textContent = val; break;
			case "synth": this.#getPatternParent( "keys", val ).append( elPat ); break;
			case "bufferType":
				GSUdomSetAttr( elPat, "data-buffer-type", val );
				GSUdomQS( elPat, ".gsuiPatterns-pattern-btnInfo" ).dataset.icon = `buf-${ val || "undefined" }`;
				break;
			case "bufferBpm":
				GSUdomSetAttr( elPat, "data-buffer-bpm", val );
				break;
		}
	}
	$appendPatternSVG( id, svg ) {
		GSUdomAddClass( svg, "gsuiPatterns-pattern-svg" );
		GSUdomQS( this.$getPattern( id ), ".gsuiPatterns-pattern-content" ).append( svg );
	}
	$deletePattern( id ) {
		this.$getPattern( id )?.remove(); // 1.
	}

	// .........................................................................
	$selectPattern( type, id ) {
		const elList = this.$elements.$lists[ type === "keys" ? "synth" : type ];

		GSUdomRmClass( GSUdomQS( elList, ".gsuiPatterns-pattern-selected" ), "gsuiPatterns-pattern-selected" );
		GSUdomAddClass( this.$getPattern( id ), "gsuiPatterns-pattern-selected" );
	}
	$selectSynth( id ) {
		GSUdomRmClass( GSUdomQS( this.$elements.$lists.synth, ".gsuiPatterns-synth-selected" ), "gsuiPatterns-synth-selected" );
		GSUdomAddClass( this.#getSynth( id ), "gsuiPatterns-synth-selected" );
	}

	// .........................................................................
	$getPattern( id ) {
		return GSUdomQS( this, `.gsuiPatterns-pattern[data-id="${ id }"]` );
	}
	#getSynth( id ) {
		return GSUdomQS( this.$elements.$lists.synth, `.gsuiPatterns-synth[data-id="${ id }"]` );
	}
	#getPatternParent( type, synthId ) {
		switch ( type ) {
			case "slices":
			case "buffer":
			case "drums": return this.$elements.$lists[ type ];
			case "keys": return GSUdomQS( this.$elements.$lists.synth, `.gsuiPatterns-synth[data-id="${ synthId }"] .gsuiPatterns-synth-patterns` );
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

GSUdefineElement( "gsui-patterns", gsuiPatterns );

/*
1. We are checking if the pattern exists because the entire synth could have been removed before.
*/
