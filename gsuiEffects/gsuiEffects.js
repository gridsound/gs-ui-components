"use strict";

class gsuiEffects extends gsui0ne {
	#dataCallback = GSUnoop;
	#fxsHtml = new Map();
	static #fxMap = GSUdeepFreeze( {
		delay: { cmp: "<gsui-fx-delay>", name: "Delay" },
		filter: { cmp: "<gsui-fx-filter>", name: "Filter" },
		reverb: { cmp: "<gsui-fx-reverb>", name: "Reverb" },
		waveshaper: { cmp: "<gsui-fx-waveshaper>", name: "WaveShaper" },
	} );

	constructor() {
		super( {
			$tagName: "gsui-effects",
			$elements: {
				$addBtn: ".gsuiEffects-addBtn",
				$addList: ".gsuiEffects-addList",
			},
		} );
		new gsuiReorder( {
			$root: this.$this,
			$parentSelector: "gsui-effects",
			$itemSelector: "gsui-effect",
			$itemGripSelector: ".gsuiEffect-grip",
			$onchange: ( obj, fxId ) => this.$this.$dispatch( GSEV_EFFECTS_REORDEREFFECT, fxId, obj ),
		} );
		this.$this.$listen( {
			[ GSEV_EFFECT_REMOVE ]: d => this.$this.$dispatch( GSEV_EFFECTS_REMOVEEFFECT, d.$targetId ),
			[ GSEV_EFFECT_TOGGLE ]: d => this.$this.$dispatch( GSEV_EFFECTS_TOGGLEEFFECT, d.$targetId ),
			[ GSEV_EFFECT_FX_LIVECHANGE ]: d => this.$this.$dispatch( GSEV_EFFECTS_LIVECHANGEEFFECT, d.$targetId, ...d.$args ),
			[ GSEV_EFFECT_FX_CHANGEPROP ]: d => this.$this.$dispatch( GSEV_EFFECTS_CHANGEEFFECTPROP, d.$targetId, ...d.$args ),
			[ GSEV_EFFECT_FX_CHANGEPROPS ]: d => this.$this.$dispatch( GSEV_EFFECTS_CHANGEEFFECT, d.$targetId, ...d.$args ),
		} );
		this.$elements.$addList.$onclick( e => {
			const fx = $( e.target ).$dataProp();

			if ( fx ) {
				this.$this.$dispatch( GSEV_EFFECTS_ADDEFFECT, fx );
				this.$elements.$addList.$togglePopover( false );
			}
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "timedivision" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "timedivision":
				this.#fxsHtml.forEach( el => el.$get( 0 ).$getFxElement().$setAttr( "timedivision", val ) );
				break;
		}
	}
	$onmessage( ev, val ) {
		switch ( ev ) {
			case GSEV_EFFECTS_DATACALLBACK: this.#dataCallback = val; break;
		}
	}

	// .........................................................................
	$getFxHTML( id ) {
		return this.#fxsHtml.get( id ).$get( 0 );
	}
	$expandToggleEffect( id ) {
		this.#fxsHtml.get( id ).$togAttr( "expanded" );
	}

	// .........................................................................
	$addEffect( id, fx ) {
		const fxAsset = gsuiEffects.#fxMap[ fx.type ];
		const root = $( "<gsui-effect>" ).$dataId( id ).$setAttr( {
			name: fxAsset.name,
			"data-type": fx.type,
		} );

		root.$get( 0 ).$setFxElement(
			$( fxAsset.cmp )
				.$dataId( id )
				.$setAttr( "timedivision", this.$this.$getAttr( "timedivision" ) )
				.$message( GSEV_EFFECT_DATACALLBACK, this.#dataCallback.bind( null, id, fx.type ) )
		);
		this.#fxsHtml.set( id, root );
		this.$this.$append( root );
	}
	$removeEffect( id ) {
		this.#fxsHtml.get( id ).$remove();
		this.#fxsHtml.delete( id );
	}
	$changeEffect( id, prop, val ) {
		switch ( prop ) {
			case "toggle": this.#fxsHtml.get( id ).$setAttr( "enable", val ); break;
			case "order": this.#fxsHtml.get( id ).$setAttr( "order", val ); break;
		}
	}
}

$.$define( "gsui-effects", gsuiEffects );
