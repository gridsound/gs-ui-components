"use strict";

class gsuiEffects extends gsui0ne {
	$askData = GSUnoop;
	#fxsHtml = new Map();
	#actionMenu = new gsuiActionMenu();
	static #fxsMap = Object.freeze( {
		delay: { cmp: "gsui-fx-delay", name: "Delay" },
		filter: { cmp: "gsui-fx-filter", name: "Filter" },
		reverb: { cmp: "gsui-fx-reverb", name: "Reverb" },
		waveshaper: { cmp: "gsui-fx-waveshaper", name: "WaveShaper" },
	} );

	constructor() {
		super( {
			$cmpName: "gsuiEffects",
			$tagName: "gsui-effects",
			$elements: {
				$addBtn: ".gsuiEffects-addBtn",
				$addSelect: ".gsuiEffects-addSelect",
			},
		} );
		Object.seal( this );
		this.#initActionMenu();
		new gsuiReorder( {
			$root: this,
			$parentSelector: "gsui-effects",
			$itemSelector: "gsui-effect",
			$itemGripSelector: ".gsuiEffect-grip",
			$onchange: ( obj, fxId ) => GSUdomDispatch( this, GSEV_EFFECTS_REORDEREFFECT, fxId, obj ),
		} );
		GSUdomListen( this, {
			[ GSEV_EFFECT_REMOVE ]: d => GSUdomDispatch( this, GSEV_EFFECTS_REMOVEEFFECT, d.$targetId ),
			[ GSEV_EFFECT_TOGGLE ]: d => GSUdomDispatch( this, GSEV_EFFECTS_TOGGLEEFFECT, d.$targetId ),
			[ GSEV_EFFECT_FX_LIVECHANGE ]: d => GSUdomDispatch( this, GSEV_EFFECTS_LIVECHANGEEFFECT, d.$targetId, ...d.$args ),
			[ GSEV_EFFECT_FX_CHANGEPROP ]: d => GSUdomDispatch( this, GSEV_EFFECTS_CHANGEEFFECTPROP, d.$targetId, ...d.$args ),
			[ GSEV_EFFECT_FX_CHANGEPROPS ]: d => GSUdomDispatch( this, GSEV_EFFECTS_CHANGEEFFECT, d.$targetId, ...d.$args ),
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "timedivision" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "timedivision":
				this.#fxsHtml.forEach( el => GSUdomSetAttr( el.$getFxElement(), "timedivision", val ) );
				break;
		}
	}

	// .........................................................................
	$getFxHTML( id ) {
		return this.#fxsHtml.get( id );
	}
	$expandToggleEffect( id ) {
		GSUdomTogAttr( this.#fxsHtml.get( id ), "expanded" );
	}

	// .........................................................................
	$addEffect( id, fx ) {
		const fxAsset = gsuiEffects.#fxsMap[ fx.type ];
		const uiFx = GSUcreateElement( fxAsset.cmp, { "data-id": id } );
		const root = GSUcreateElement( "gsui-effect", {
			name: fxAsset.name,
			"data-id": id,
			"data-type": fx.type,
		} );

		if ( "$askData" in uiFx ) {
			uiFx.$askData = this.$askData.bind( null, id, fx.type );
		}
		GSUdomSetAttr( uiFx, "timedivision", GSUdomGetAttr( this, "timedivision" ) );
		root.$setFxElement( uiFx );
		this.#fxsHtml.set( id, root );
		this.append( root );
	}
	$removeEffect( id ) {
		this.#fxsHtml.get( id ).remove();
		this.#fxsHtml.delete( id );
	}
	$changeEffect( id, prop, val ) {
		switch ( prop ) {
			case "toggle": GSUdomSetAttr( this.#fxsHtml.get( id ), "enable", val ); break;
			case "order": GSUdomSetAttr( this.#fxsHtml.get( id ), "order", val ); break;
		}
	}

	// .........................................................................
	#initActionMenu() {
		this.#actionMenu.$bindTargetElement( this.$elements.$addBtn );
		this.#actionMenu.$setDirection( "B" );
		this.#actionMenu.$setMaxSize( "260px", "180px" );
		this.#actionMenu.$setCallback( act => GSUdomDispatch( this, GSEV_EFFECTS_ADDEFFECT, act ) );
		this.#actionMenu.$setActions( [
			{ id: "filter",     name: "Filter",     desc: "LowPass, HighPass, BandPass, LowShelf, etc." },
			{ id: "delay",      name: "Delay",      desc: "Echo, left/right ping-pong" },
			{ id: "reverb",     name: "Reverb",     desc: "Convolution reverberation" },
			{ id: "waveshaper", name: "WaveShaper", desc: "Distortion" },
		] );
	}
}

GSUdefineElement( "gsui-effects", gsuiEffects );
