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
			[ GSEV_DRUMROW_REMOVE ]: d => this.$this.$dispatch( GSEV_DRUMROWS_REMOVE, d.$targetId ),
			[ GSEV_DRUMROW_EXPAND ]: d => this.$this.$dispatch( GSEV_DRUMROWS_EXPAND, d.$targetId ),
			[ GSEV_DRUMROW_TOGGLE ]: d => this.$this.$dispatch( GSEV_DRUMROWS_TOGGLE, d.$targetId, ...d.$args ),
			[ GSEV_DRUMROW_TOGGLESOLO ]: d => this.$this.$dispatch( GSEV_DRUMROWS_TOGGLESOLO, d.$targetId ),
			[ GSEV_DRUMROW_CHANGEPROP ]: d => this.$this.$dispatch( GSEV_DRUMROWS_CHANGE, d.$targetId, ...d.$args ),
			[ GSEV_DRUMROW_LIVECHANGEPROP ]: d => this.$this.$dispatch( GSEV_DRUMROWS_LIVECHANGEDRUMROW, d.$targetId, ...d.$args ),
			[ GSEV_DRUMROW_PROPFILTER ]: d => this.$this.$dispatch( GSEV_DRUMROWS_PROPFILTER, d.$targetId, ...d.$args ),
			[ GSEV_DRUMROW_PROPFILTERS ]: d => this.$this.$dispatch( GSEV_DRUMROWS_PROPFILTERS, ...d.$args ),
		} );
	}

	// .........................................................................
	$playRow( id ) {
		this.#rows.get( id ).$get( 0 ).$play();
	}
	$stopRow( id ) {
		this.#rows.get( id ).$get( 0 ).$stop();
	}
	$setPropFilter( rowId, prop ) {
		this.#getPropSelect( rowId ).$setAttr( "prop", prop );
	}
	$setDrumPropValue( rowId, prop, val ) {
		this.#getPropSelect( rowId ).$setAttr( "value", val );
	}
	$removeDrumPropValue( rowId, _prop ) {
		this.#getPropSelect( rowId ).$rmAttr( "value" );
	}
	#getPropSelect( rowId ) {
		return this.#rows.get( rowId ).$find( "gsui-prop-select" );
	}

	// .........................................................................
	$add( id ) {
		const elDrumrow = $( "<gsui-drumrow>" ).$setAttr( "data-id", id );

		this.#rows.set( id, elDrumrow );
		this.$this.$append( elDrumrow );
		return elDrumrow;
	}
	$remove( id ) {
		this.#rows.get( id ).$remove();
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
				this.#rows.get( id ).$setAttr( prop, val );
				break;
			case "pattern":
				this.#rows.get( id ).$get( 0 ).$changePattern( val );
				break;
		}
	}

	// .........................................................................
	#onmousedownRows( e ) {
		const tar = $( e.target );
		const btn = e.button;

		if ( ( btn === 0 || btn === 2 ) && tar.$hasClass( "gsuiDrumrow-main" ) ) {
			this.$this.$dispatch(
				btn === 0 ? GSEV_DRUMROWS_LIVESTARTDRUM : GSEV_DRUMROWS_LIVESTOPDRUM,
				tar.$parent().$getAttr( "data-id" ) );
		}
	}
}

GSUdomDefine( "gsui-drumrows", gsuiDrumrows );
