"use strict";

class gsuiEffects extends gsui0ne {
	$askData = GSUnoop;
	#fxsHtml = new Map();
	#actionMenu = new gsuiActionMenu();
	static #fxsMap = Object.freeze( {
		delay: { cmp: "<gsui-fx-delay>", name: "Delay" },
		filter: { cmp: "<gsui-fx-filter>", name: "Filter" },
		reverb: { cmp: "<gsui-fx-reverb>", name: "Reverb" },
		waveshaper: { cmp: "<gsui-fx-waveshaper>", name: "WaveShaper" },
	} );

	constructor() {
		super( {
			$cmpName: "gsuiEffects",
			$tagName: "gsui-effects",
			$jqueryfy: true,
			$elements: {
				$addBtn: ".gsuiEffects-addBtn",
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
				this.#fxsHtml.forEach( el => el.$get( 0 ).$getFxElement().$attr( "timedivision", val ) );
				break;
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
		const fxAsset = gsuiEffects.#fxsMap[ fx.type ];
		const uiFx = GSUjq( fxAsset.cmp ).$attr( {
			"data-id": id,
			timedivision: this.$this.$attr( "timedivision" ),
		} );
		const root = GSUjq( "<gsui-effect>" ).$attr( {
			name: fxAsset.name,
			"data-id": id,
			"data-type": fx.type,
		} );

		if ( "$askData" in uiFx.$get( 0 ) ) {
			uiFx.$get( 0 ).$askData = this.$askData.bind( null, id, fx.type );
		}
		root.$get( 0 ).$setFxElement( uiFx );
		this.#fxsHtml.set( id, root );
		this.$this.$append( root );
	}
	$removeEffect( id ) {
		this.#fxsHtml.get( id ).$remove();
		this.#fxsHtml.delete( id );
	}
	$changeEffect( id, prop, val ) {
		switch ( prop ) {
			case "toggle": this.#fxsHtml.get( id ).$attr( "enable", val ); break;
			case "order": this.#fxsHtml.get( id ).$attr( "order", val ); break;
		}
	}

	// .........................................................................
	#initActionMenu() {
		this.#actionMenu.$bindTargetElement( this.$elements.$addBtn.$get( 0 ) );
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

GSUdomDefine( "gsui-effects", gsuiEffects );
