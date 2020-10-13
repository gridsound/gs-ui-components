"use strict";

gsuiBlocksManager.prototype.__mouseup = function() {
	const blcsEditing = this.__blcsEditing,
		mdBlc = this.__mdBlc;

	if ( this.__status ) {
		gsuiBlocksManager.__mouseupFns.get( this.__status ).call( this, blcsEditing, mdBlc );
	}
	this.__eventReset();
	if ( mdBlc ) {
		mdBlc.classList.remove( "gsui-hover" );
		this.__mdTarget.classList.remove( "gsui-hover" );
		this.__mdTarget =
		this.__mdBlc = null;
	}
	delete gsuiBlocksManager._focused;
};

gsuiBlocksManager.__mouseupFns = new Map( [
	[ "moving", function( blcsEditing ) {
		if ( this.__valueB || Math.abs( this.__valueA ) > .000001 ) {
			this._opts.managercallMoving( blcsEditing, this.__valueA, this.__valueB );
		}
	} ],
	[ "attack", function( blcsEditing ) {
		if ( Math.abs( this.__valueA ) > .000001 ) {
			this._opts.managercallAttack( blcsEditing, this.__valueA );
		}
	} ],
	[ "release", function( blcsEditing ) {
		if ( Math.abs( this.__valueA ) > .000001 ) {
			this._opts.managercallRelease( blcsEditing, this.__valueA );
		}
	} ],
	[ "deleting", function( blcsEditing ) {
		if ( blcsEditing.size || this.__blcsSelected.size ) {
			this._opts.managercallDeleting( blcsEditing );
		}
	} ],
	[ "cropping-a", function( blcsEditing ) {
		if ( Math.abs( this.__valueA ) > .000001 ) {
			this._opts.managercallCroppingA( blcsEditing, this.__valueA );
		}
	} ],
	[ "cropping-b", function( blcsEditing ) {
		if ( Math.abs( this.__valueA ) > .000001 ) {
			this._opts.managercallCroppingB( blcsEditing, this.__valueA );
		}
	} ],
	[ "selecting-1", function( blcsEditing, mdBlc ) {
		if ( mdBlc ) {
			mdBlc.classList.contains( "gsuiBlocksManager-block-selected" )
				? this._opts.managercallUnselectingOne( mdBlc.dataset.id )
				: this._opts.managercallSelecting( [ mdBlc.dataset.id ] );
		}
	} ],
	[ "selecting-2", function( blcsEditing ) {
		this.__selection.classList.add( "gsuiBlocksManager-selection-hidden" );
		if ( blcsEditing.size ) {
			this._opts.managercallSelecting( Array.from( blcsEditing.keys() ) );
		}
	} ],
] );
