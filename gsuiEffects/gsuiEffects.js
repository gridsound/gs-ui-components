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
			$onchange: ( obj, fxId ) => GSUdomDispatch( this, "gsuiEffects-reorderEffect", fxId, obj ),
		} );
		GSUdomListen( this, {
			"gsuiEffect-remove": d => GSUdomDispatch( this, "gsuiEffects-removeEffect", d.$target.dataset.id ),
			"gsuiEffect-toggle": d => GSUdomDispatch( this, "gsuiEffects-toggleEffect", d.$target.dataset.id ),
			"gsuiEffect-fx-liveChange": d => {
				d.$args.unshift( d.$target.dataset.id );
				d.$event = "gsuiEffects-liveChangeEffect";
				return true;
			},
			"gsuiEffect-fx-changeProp": d => {
				d.$args.unshift( d.$target.dataset.id );
				d.$event = "gsuiEffects-changeEffectProp";
				return true;
			},
			"gsuiEffect-fx-changeProps": d => {
				d.$args.unshift( d.$target.dataset.id );
				d.$event = "gsuiEffects-changeEffect";
				return true;
			},
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
		this.#actionMenu.$setCallback( act => GSUdomDispatch( this, "gsuiEffects-addEffect", act ) );
		this.#actionMenu.$setActions( [
			{ id: "filter",     name: "Filter",     desc: "LowPass, HighPass, BandPass, LowShelf, etc." },
			{ id: "delay",      name: "Delay",      desc: "Echo, left/right ping-pong" },
			{ id: "reverb",     name: "Reverb",     desc: "Convolution reverberation" },
			{ id: "waveshaper", name: "WaveShaper", desc: "Distortion" },
		] );
	}
}

GSUdefineElement( "gsui-effects", gsuiEffects );
