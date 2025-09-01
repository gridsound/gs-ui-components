"use strict";

class gsuiDrumrows extends gsui0ne {
	#rows = new Map();

	constructor() {
		super( {
			$cmpName: "gsuiDrumrows",
			$tagName: "gsui-drumrows",
			$template: GSUcreateDiv( { class: "gsuiDrumrows-dropNew" } ),
		} );
		Object.seal( this );
		this.onmousedown = this.#onmousedownRows.bind( this );
		GSUdomListen( this, {
			[ GSEV_DRUMROW_REMOVE ]: d => GSUdomDispatch( this, GSEV_DRUMROWS_REMOVE, d.$targetId ),
			[ GSEV_DRUMROW_EXPAND ]: d => GSUdomDispatch( this, GSEV_DRUMROWS_EXPAND, d.$targetId ),
			[ GSEV_DRUMROW_TOGGLE ]: d => GSUdomDispatch( this, GSEV_DRUMROWS_TOGGLE, d.$targetId, ...d.$args ),
			[ GSEV_DRUMROW_TOGGLESOLO ]: d => GSUdomDispatch( this, GSEV_DRUMROWS_TOGGLESOLO, d.$targetId ),
			[ GSEV_DRUMROW_CHANGEPROP ]: d => GSUdomDispatch( this, GSEV_DRUMROWS_CHANGE, d.$targetId, ...d.$args ),
			[ GSEV_DRUMROW_LIVECHANGEPROP ]: d => GSUdomDispatch( this, GSEV_DRUMROWS_LIVECHANGEDRUMROW, d.$targetId, ...d.$args ),
			[ GSEV_DRUMROW_PROPFILTER ]: d => GSUdomDispatch( this, GSEV_DRUMROWS_PROPFILTER, d.$targetId, ...d.$args ),
			[ GSEV_DRUMROW_PROPFILTERS ]: d => GSUdomDispatch( this, GSEV_DRUMROWS_PROPFILTERS, ...d.$args ),
		} );
	}

	// .........................................................................
	$playRow( id ) {
		this.#rows.get( id ).$play();
	}
	$stopRow( id ) {
		this.#rows.get( id ).$stop();
	}
	$setPropFilter( rowId, prop ) {
		GSUdomSetAttr( this.#getPropSelect( rowId ), "prop", prop );
	}
	$setDrumPropValue( rowId, prop, val ) {
		GSUdomSetAttr( this.#getPropSelect( rowId ), "value", val );
	}
	$removeDrumPropValue( rowId, prop ) {
		GSUdomRmAttr( this.#getPropSelect( rowId ), "value" );
	}
	#getPropSelect( rowId ) {
		return GSUdomQS( this.#rows.get( rowId ), "gsui-prop-select" );
	}

	// .........................................................................
	$add( id ) {
		const elDrumrow = GSUcreateElement( "gsui-drumrow", { "data-id": id } );

		this.#rows.set( id, elDrumrow );
		this.append( elDrumrow );
		return elDrumrow;
	}
	$remove( id ) {
		this.#rows.get( id ).remove();
		this.#rows.delete( id );
	}
	$change( id, prop, val ) {
		switch ( prop ) {
			case "order":
			case "pan":
			case "name":
			case "gain":
			case "detune":
			case "toggle":
			case "duration":
				GSUdomSetAttr( this.#rows.get( id ), prop, val );
				break;
			case "pattern":
				this.#rows.get( id ).$changePattern( val );
				break;
		}
	}

	// .........................................................................
	#onmousedownRows( e ) {
		if ( ( e.button === 0 || e.button === 2 ) && GSUdomHasClass( e.target, "gsuiDrumrow-main" ) ) {
			GSUdomDispatch( this,
				e.button === 0 ? GSEV_DRUMROWS_LIVESTARTDRUM : GSEV_DRUMROWS_LIVESTOPDRUM,
				e.target.parentNode.dataset.id );
		}
	}
}

GSUdomDefine( "gsui-drumrows", gsuiDrumrows );
