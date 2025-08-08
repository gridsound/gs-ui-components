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
		GSUlistenEvents( this, {
			gsuiDrumrow: {
				remove: ( d, el ) => this.$dispatch( "remove", el.dataset.id ),
				expand: ( d, el ) => this.$dispatch( "expand", el.dataset.id ),
				toggle: ( d, el ) => this.$dispatch( "toggle", el.dataset.id, ...d.args ),
				toggleSolo: ( d, el ) => this.$dispatch( "toggleSolo", el.dataset.id ),
				changeProp: ( d, el ) => this.$dispatch( "change", el.dataset.id, ...d.args ),
				liveChangeProp: ( d, el ) => this.$dispatch( "liveChangeDrumrow", el.dataset.id, ...d.args ),
				propFilter: ( d, el ) => this.$dispatch( "propFilter", el.dataset.id, ...d.args ),
				propFilters: ( d, el ) => this.$dispatch( "propFilters", ...d.args ),
			},
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
			this.$dispatch(
				e.button === 0 ? "liveStartDrum" : "liveStopDrum",
				e.target.parentNode.dataset.id );
		}
	}
}

GSUdefineElement( "gsui-drumrows", gsuiDrumrows );
