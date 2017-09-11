"use strict";

/*
_findTrack
_elSelection
_selectionIsStarting
_getMouseBeat
_mdBeat
_timeOffset
_pxPerBeat
_elGridCntBCR
_contentY
_fontSize
_uiBlocks
_uiBlocksSelected
*/

Object.assign( gsuiGridSamples.prototype, {
	_selectionStarting( e, pxRel, pyRel ) {
		if ( Math.max( Math.abs( pxRel ), Math.abs( pyRel ) ) > 6 ) {
			this._mdTrack =
			this._mmTrack = this._findTrack( e.pageY );
			this._selectionCalc( e.pageX );
			this._elSelection.classList.remove( "hidden" );
			this._selectionIsStarted = true;
			delete this._selectionIsStarting;
		}
	},
	_selectionStarted( e ) {
		this._mmTrack = this._findTrack( e.pageY );
		this._selectionCalc( e.pageX );
	},
	_selectionCalc( pageX ) {
		var trkA = this._mdTrack,
			trkB = this._mmTrack,
			beatA = this._getMouseBeat( pageX ),
			beatB = this._mdBeat;

		if ( trkA.compareDocumentPosition( trkB ) & 2 ) {
			trkA = trkB;
			trkB = this._mdTrack;
		}
		this._selectionDraw( trkA, trkB,
			Math.min( beatA, beatB ),
			Math.max( beatA, beatB ) );
	},
	_selectionDraw( trkA, trkB, beatA, beatB ) {
		if ( trkA !== this._selectionTrkA || trkB !== this._selectionTrkB ||
			beatA !== this._selectionBeatA || beatB !== this._selectionBeatB )
		{
			var sty = this._elSelection.style,
				top = trkA.getBoundingClientRect().top;

			this._selectionBeatA = beatA;
			this._selectionBeatB = beatB;
			this._selectionTrkA = trkA;
			this._selectionTrkB = trkB;
			sty.left = ( beatA - this._timeOffset ) * this._pxPerBeat + "px";
			sty.width = ( beatB - beatA ) * this._pxPerBeat + "px";
			sty.top = top - this._elGridCntBCR.top - this._contentY * this._fontSize + "px";
			sty.height = trkB.getBoundingClientRect().bottom - top + "px";
			this._selectionSelect();
		}
	},
	_selectionSelect( x, y, w, h ) {
		var id,
			uiBlock,
			cmp,
			cmpPos,
			trkA = this._selectionTrkA,
			trkB = this._selectionTrkB,
			beatA = this._selectionBeatA,
			beatB = this._selectionBeatB,
			uiBlocks = this._uiBlocks,
			uiBlocksSel = this._uiBlocksSelected;

		this._selectionList = [];
		for ( id in uiBlocks ) {
			uiBlock = uiBlocks[ id ];
			if ( !uiBlocksSel[ id ] ) {
				if ( cmp = beatA < uiBlock.data.when + uiBlock.data.duration &&
					uiBlock.data.when < beatB )
				{
					cmpPos = uiBlock.rootElement.compareDocumentPosition( trkA );
					if ( cmp = cmpPos & 2 || cmpPos & 8 ) {
						cmpPos = uiBlock.rootElement.compareDocumentPosition( trkB );
						cmp = cmpPos & 4 || cmpPos & 8;
					}
				}
				if ( cmp ) {
					this._selectionList.push( uiBlock );
				}
				uiBlock.select( cmp );
			}
		}
	},
	_selectionEnd() {
		if ( this._selectionIsStarted ) {
			this._elSelection.classList.add( "hidden" );
			delete this._selectionTrkA;
			delete this._selectionTrkB;
			delete this._selectionIsStarted;
			if ( this._selectionList.length > 0 ) {
				this.onchange( this._selectionList.reduce( ( obj, uiBlock ) => {
					this._uiBlocksSelected[ uiBlock.id ] = uiBlock;
					obj[ uiBlock.id ] = { selected: true };
					return obj;
				}, {} ) );
			}
		}
		delete this._selectionIsStarting;
	}
} );
