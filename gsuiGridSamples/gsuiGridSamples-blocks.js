"use strict";

/*
_pxPerBeat
_fontSize
_rowByValue
_rowIndexByData
_rowIndexByElement
_deletionStarted
_findTrack
uiTimeLine._stepsPerBeat
uiTimeLine._round
onchange
fnSampleCreate
fnSampleUpdate
fnSampleDelete
*/

Object.assign( gsuiGridSamples.prototype, {
	_bcInit() {
		this._bcAll = {};
		this._bcSelected = {};
		this._bcLastDur = 1;
	},
	_bcEmpty() {
		for ( var id in this._bcAll ) {
			this._bcAll[ id ].rootElement.remove();
			delete this._bcAll[ id ];
			delete this._bcSelected[ id ];
		}
	},
	_bcChange( obj ) {
		for ( var id in obj ) {
			obj[ id ]
				? this._bcAll[ id ]
					? this._bcUpdate( id, obj[ id ] )
					: this._bcCreate( id, obj[ id ] )
				: this._bcDelete( id );
		}
	},
	_bcCreate( id, data ) {
		var bc = new gsuiAudioBlock();

		this._bcAll[ id ] = bc;
		bc.id = id;
		bc.data = data;
		if ( data.key ) {
			bc.datatype( "key" );
			bc.name( data.key );
		} else {
			bc.datatype( "keys" );
		}
		bc.onmousedown = this._bcBodyDown.bind( this );
		bc.onmousemove = this._bcBodyMove.bind( this );
		bc.onmouseup = this._bcBodyUp.bind( this );
		bc.onmousedownCrop = this._bcCropDown.bind( this );
		bc.onmousemoveCrop = this._bcCropMove.bind( this );
		bc.onmouseupCrop = this._bcCropUp.bind( this );
		this.__bcUpdate( id, data );
		this.fnSampleCreate && this.fnSampleCreate( id, bc );
		this.fnSampleUpdate && this.fnSampleUpdate( id, bc );
		return bc;
	},
	_bcUpdate( id, data ) {
		var bc = this.__bcUpdate( id, data );

		if ( this.fnSampleUpdate ) {
			this.fnSampleUpdate( id, bc );
		}
	},
	__bcUpdate( id, data ) {
		var bc = this._bcAll[ id ];

		"when" in data && bc.when( data.when );
		"selected" in data && this._bcSelect( id, data.selected );
		if ( "duration" in data ) {
			this._bcLastDur = data.duration;
			bc.duration( data.duration );
			bc.contentWidthFixed();
			bc.setResolution( data.duration * this._pxPerBeat, this._fontSize );
		}
		if ( "key" in data || "track" in data ) {
			if ( "key" in data ) {
				bc.name( data.key );
			}
			this._rowByValue( data.key || data.track ).firstChild.append( bc.rootElement );
		}
		return bc;
	},
	_bcDelete( id ) {
		var bc = this._bcAll[ id ];

		if ( bc ) {
			bc.rootElement.remove();
			delete this._bcAll[ id ];
			delete this._bcSelected[ id ];
			if ( this.fnSampleDelete ) {
				this.fnSampleDelete( id, bc );
			}
		}
	},
	_bcForEach( bc, fn ) {
		if ( bc.data.selected ) {
			for ( var id in this._bcSelected ) {
				fn( this._bcSelected[ id ] );
			}
		} else {
			fn( bc );
		}
	},
	_bcSelect( id, b ) {
		var bc = this._bcAll[ id ];

		bc.select( b );
		if ( b ) {
			this._bcSelected[ id ] = bc;
		} else {
			delete this._bcSelected[ id ];
		}
	},
	_bcSelectAll() {
		return Object.keys( this._bcAll ).reduce( ( obj, id ) => {
			if ( !this._bcAll[ id ].data.selected ) {
				this._bcSelect( id, true );
				obj[ id ] = { selected: true };
			}
			return obj;
		}, {} );
	},
	_bcUnselectAll() {
		return Object.keys( this._bcSelected ).reduce( ( obj, id ) => {
			this._bcSelect( id, false );
			obj[ id ] = { selected: false };
			return obj;
		}, {} );
	},
	_bcCropDown( bc, side, e ) {
		var id,
			whenMin = bc.data.when,
			offMin = bc.data.offset,
			durMin = bc.data.duration,
			selection = this._bcSelected,
			stepBeat = 1 / this.uiTimeLine._stepsPerBeat;

		if ( bc.data.selected ) {
			for ( id in selection ) {
				whenMin = Math.min( whenMin, selection[ id ].data.when );
				offMin = Math.min( offMin, selection[ id ].data.offset );
				durMin = Math.min( durMin, selection[ id ].data.duration );
			}
		}
		this._cropPageX = e.pageX;
		this._cropWhenMin = whenMin;
		this._cropOffMin = offMin;
		this._cropDurMin = durMin > stepBeat ? durMin - stepBeat : 0;
		this._cropWhenRel =
		this._cropOffRel =
		this._cropDurRel = 0;
	},
	_bcCropMove( bc, side, e ) {
		var whenRel, offRel, durRel,
			beatRel = this.uiTimeLine._round( ( e.pageX - this._cropPageX ) / this._pxPerBeat );

		if ( side === 1 ) {
			whenRel =
			offRel = 0;
			durRel = beatRel >= 0
				? beatRel
				: Math.max( -this._cropDurMin, beatRel );
		} else if ( beatRel < 0 ) {
			durRel = -(
				offRel =
				whenRel = Math.max( -this._cropWhenMin, beatRel ) );
			beatRel = Math.max( -this._cropOffMin, offRel );
			whenRel += beatRel - offRel;
			durRel -= beatRel - offRel;
			offRel = beatRel;
		} else {
			offRel =
			whenRel = -(
				durRel = Math.max( -this._cropDurMin, -beatRel ) );
		}
		this._cropWhenRel = whenRel;
		this._cropOffRel = offRel;
		this._cropDurRel = durRel;
		this._bcForEach( bc, this.__bcCropMove.bind( this, side, whenRel, durRel ) );
	},
	__bcCropMove( side, whenRel, durRel, bc ) {
		if ( !side ) {
			bc.whenOffset( bc.data.when + whenRel );
		}
		bc.duration( bc.data.duration + durRel );
	},
	_bcCropUp( bc ) {
		delete this._cropPageX;
		if ( Math.abs( this._cropWhenRel ) > .0001 ||
			Math.abs( this._cropDurRel ) > .0001
		) {
			var data = {};

			this._bcForEach( bc, this.__bcCropUp.bind( this, data,
				this._cropWhenRel,
				this._cropOffRel,
				this._cropDurRel ) );
			this.onchange( data );
		}
	},
	__bcCropUp( data, whenRel, offRel, durRel, bc ) {
		var obj = {};

		if ( Math.abs( whenRel ) > .0001 ) {
			obj.when = bc.data.when + whenRel;
			obj.offset = bc.data.offset + offRel;
		}
		if ( Math.abs( durRel ) > .0001 ) {
			obj.duration = bc.data.duration + durRel;
			if ( !bc.data.durationEdited ) {
				obj.durationEdited = true;
			}
		}
		data[ bc.id ] = obj;
	},
	_bcBodyDown( bc, e ) {
		var selected,
			whenMin,
			trkMin,
			trkMax,
			rowInd,
			sel = this._bcSelected,
			id = bc.id;

		this._bcClicked = bc;
		if ( e.button === 2 ) {
			this._deletionStarted( id );
			return false;
		}
		if ( e.shiftKey ) {
			selected = !sel[ id ];
			this._bcSelect( id, selected );
			this.onchange( { [ id ]: { selected: selected } } );
			return false;
		}
		if ( e.altKey ) {
			// copy and move the key(s)
			return false;
		}
		this._movePageX = e.pageX;
		this._moveTrack =
		trkMax =
		trkMin = this._rowIndexByData( bc.data );
		whenMin = bc.data.when;
		if ( bc.data.selected ) {
			for ( id in sel ) {
				bc = sel[ id ];
				rowInd = this._rowIndexByData( bc.data );
				whenMin = Math.min( whenMin, bc.data.when );
				trkMin = Math.min( trkMin, rowInd );
				trkMax = Math.max( trkMax, rowInd );
			}
		}
		this._moveWhenMin = whenMin;
		this._moveTrackMin = trkMin;
		this._moveTrackMax = this.rows.length - trkMax - 1;
		this._moveWhenRel =
		this._moveTrackRel = 0;
	},
	_bcBodyMove( bc, e ) {
		var beatRel = this.uiTimeLine._round( ( e.pageX - this._movePageX ) / this._pxPerBeat ),
			track = this._findTrack( e.pageY ),
			trackInd = this._rowIndexByElement( track ),
			trackRel = trackInd - this._moveTrack;

		if ( beatRel < 0 ) {
			beatRel = Math.max( -this._moveWhenMin, beatRel );
		}
		if ( trackRel < 0 ) {
			trackRel = Math.max( -this._moveTrackMin, trackRel );
		} else if ( trackRel > 0 ) {
			trackRel = Math.min( this._moveTrackMax, trackRel );
		}
		this._moveWhenRel = beatRel;
		this._moveTrackRel = trackRel;
		this._bcForEach( bc, this.__bcBodyMove.bind( this, beatRel, trackRel ) );
	},
	__bcBodyMove( whenRel, trackRel, bc ) {
		bc.when( bc.data.when + whenRel );
		if ( bc._gsuigsTrackRel !== trackRel ) {
			bc._gsuigsTrackRel = trackRel;
			this.rows[ this._rowIndexByData( bc.data ) + trackRel ].firstChild.append( bc.rootElement );
		}
	},
	_bcBodyUp( bc, e ) {
		delete this._movePageX;
		if ( this._moveTrackRel ||
			Math.abs( this._moveWhenRel ) > .0001
		) {
			var data = {};

			this._bcForEach( bc, this.__bcBodyUp.bind( this, data,
				this._moveWhenRel,
				this._moveTrackRel ) );
			this.onchange( data );
		}
	},
	__bcBodyUp( data, whenRel, trackRel, bc ) {
		var dataset,
			obj = {};

		if ( trackRel ) {
			dataset = bc.rootElement.parentNode.parentNode.dataset;
			if ( dataset.track ) {
				obj.track = dataset.track;
			} else {
				obj.key = dataset.key + dataset.octave;
			}
		}
		if ( Math.abs( whenRel ) > .0001 ) {
			obj.when = bc.data.when + whenRel;
		}
		data[ bc.id ] = obj;
	}	
} );
