"use strict";

class gsuiEffects extends gsui0ne {
	$askData = GSUnoop;
	#fxsHtml = new Map();
	static #fxsMap = Object.freeze( {
		delay: { cmp: "gsui-fx-delay", name: "Delay" },
		filter: { cmp: "gsui-fx-filter", name: "Filter" },
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

		this.$elements.$addBtn.onclick = () => this.$elements.$addSelect.value = "";
		this.$elements.$addSelect.onchange = this.#onchangeAddSelect.bind( this );
		this.$elements.$addSelect.onkeydown = GSUnoopFalse;
		new gsuiReorder( {
			rootElement: this,
			direction: "column",
			dataTransferType: "effect",
			itemSelector: "gsui-effect",
			handleSelector: ".gsuiEffect-grip",
			parentSelector: "gsui-effects",
		} );
		GSUlistenEvents( this, {
			gsuiEffect: {
				remove: ( d, t ) => this.$dispatch( "removeEffect", t.dataset.id ),
				toggle: ( d, t ) => this.$dispatch( "toggleEffect", t.dataset.id ),
			},
			default: {
				liveChange: ( d, t ) => {
					d.args.unshift( t.dataset.id );
					d.component = "gsuiEffects";
					d.eventName = "liveChangeEffect";
					return true;
				},
				changeProp: ( d, t ) => {
					d.args.unshift( t.dataset.id );
					d.component = "gsuiEffects";
					d.eventName = "changeEffectProp";
					return true;
				},
				changeProps: ( d, t ) => {
					d.args.unshift( t.dataset.id );
					d.component = "gsuiEffects";
					d.eventName = "changeEffect";
					return true;
				},
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
				this.#fxsHtml.forEach( el => GSUsetAttribute( el.$getFxElement(), "timedivision", val ) );
				break;
		}
	}

	// .........................................................................
	$getFxHTML( id ) {
		return this.#fxsHtml.get( id );
	}
	$expandToggleEffect( id ) {
		GSUtoggleAttribute( this.#fxsHtml.get( id ), "expanded" );
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
		GSUsetAttribute( uiFx, "timedivision", GSUgetAttribute( this, "timedivision" ) );
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
			case "toggle": GSUsetAttribute( this.#fxsHtml.get( id ), "enable", val ); break;
			case "order": GSUsetAttribute( this.#fxsHtml.get( id ), "data-order", val ); break;
		}
	}
	$reorderEffects( effects ) {
		gsuiReorder.listReorder( this, effects );
	}

	// .........................................................................
	#onchangeAddSelect() {
		const type = this.$elements.$addSelect.value;

		this.$elements.$addSelect.blur();
		this.$elements.$addSelect.value = "";
		this.$dispatch( "addEffect", type );
	}
}

GSUdefineElement( "gsui-effects", gsuiEffects );
