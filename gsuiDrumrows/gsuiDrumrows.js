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
			"gsuiDrumrow-remove": d => GSUdomDispatch( this, "gsuiDrumrows-remove", d.$target.dataset.id ),
			"gsuiDrumrow-expand": d => GSUdomDispatch( this, "gsuiDrumrows-expand", d.$target.dataset.id ),
			"gsuiDrumrow-toggle": d => GSUdomDispatch( this, "gsuiDrumrows-toggle", d.$target.dataset.id, ...d.$args ),
			"gsuiDrumrow-toggleSolo": d => GSUdomDispatch( this, "gsuiDrumrows-toggleSolo", d.$target.dataset.id ),
			"gsuiDrumrow-changeProp": d => GSUdomDispatch( this, "gsuiDrumrows-change", d.$target.dataset.id, ...d.$args ),
			"gsuiDrumrow-liveChangeProp": d => GSUdomDispatch( this, "gsuiDrumrows-liveChangeDrumrow", d.$target.dataset.id, ...d.$args ),
			"gsuiDrumrow-propFilter": d => GSUdomDispatch( this, "gsuiDrumrows-propFilter", d.$target.dataset.id, ...d.$args ),
			"gsuiDrumrow-propFilters": d => GSUdomDispatch( this, "gsuiDrumrows-propFilters", ...d.$args ),
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
				e.button === 0 ? "gsuiDrumrows-liveStartDrum" : "gsuiDrumrows-liveStopDrum",
				e.target.parentNode.dataset.id );
		}
	}
}

GSUdefineElement( "gsui-drumrows", gsuiDrumrows );
