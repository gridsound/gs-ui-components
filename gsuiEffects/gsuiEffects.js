"use strict";

class gsuiEffects extends gsui0ne {
	$askData = GSUnoop;
	#fxsHtml = new Map();
	static #fxsMap = Object.freeze( {
		delay: { cmp: "gsui-fx-delay", name: "Delay", height: 140 },
		filter: { cmp: "gsui-fx-filter", name: "Filter", height: 160 },
		waveshaper: { cmp: "gsui-fx-waveshaper", name: "WaveShaper", height: 160 },
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
			itemSelector: ".gsuiEffects-fx",
			handleSelector: ".gsuiEffects-fx-grip",
			parentSelector: "gsui-effects",
		} );
		GSUlistenEvents( this, {
			gsuiToggle: {
				toggle: ( d, btn ) => {
					this.$dispatch( "toggleEffect", btn.parentNode.parentNode.dataset.id );
				},
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
				this.#fxsHtml.forEach( html => GSUsetAttribute( html.content.firstChild, "timedivision", val ) );
				break;
		}
	}

	// .........................................................................
	$getFxHTML( id ) {
		return this.#fxsHtml.get( id );
	}
	$expandToggleEffect( id ) {
		const root = this.#fxsHtml.get( id ).root;

		this.$expandEffect( id, !root.classList.contains( "gsuiEffects-fx-expanded" ) );
	}
	$expandEffect( id, b ) {
		const html = this.#fxsHtml.get( id );
		const type = html.root.dataset.type;

		html.root.classList.toggle( "gsuiEffects-fx-expanded", b );
		html.expand.dataset.icon = b ? "caret-down" : "caret-right";
		html.content.style.height = `${ b ? gsuiEffects.#fxsMap[ type ].height : 0 }px`;
	}

	// .........................................................................
	$addEffect( id, fx ) {
		const root = GSUgetTemplate( "gsui-effects-fx" );
		const name = root.querySelector( ".gsuiEffects-fx-name" );
		const expand = root.querySelector( ".gsuiEffects-fx-expand" );
		const toggle = root.querySelector( "gsui-toggle" );
		const remove = root.querySelector( ".gsuiEffects-fx-remove" );
		const content = root.querySelector( ".gsuiEffects-fx-content" );
		const fxAsset = gsuiEffects.#fxsMap[ fx.type ];
		const uiFx = GSUcreateElement( fxAsset.cmp );
		const html = Object.seal( {
			root,
			uiFx,
			expand,
			toggle,
			content,
		} );

		expand.onclick = () => this.$expandToggleEffect( id );
		remove.onclick = () => this.$dispatch( "removeEffect", id );
		if ( "$askData" in uiFx ) {
			uiFx.$askData = this.$askData.bind( null, id, fx.type );
		}
		root.dataset.id =
		uiFx.dataset.id = id;
		root.dataset.type = fx.type;
		GSUsetAttribute( uiFx, "timedivision", GSUgetAttribute( this, "timedivision" ) );
		name.textContent = fxAsset.name;
		content.append( uiFx );
		this.#fxsHtml.set( id, html );
		this.append( root );
	}
	$removeEffect( id ) {
		this.#fxsHtml.get( id ).root.remove();
		this.#fxsHtml.delete( id );
	}
	$changeEffect( id, prop, val ) {
		switch ( prop ) {
			case "toggle": this.#changeToggle( id, val ); break;
			case "order": this.#fxsHtml.get( id ).root.dataset.order = val; break;
		}
	}
	$reorderEffects( effects ) {
		gsuiReorder.listReorder( this, effects );
	}

	// .........................................................................
	#changeToggle( id, b ) {
		const html = this.#fxsHtml.get( id );

		html.root.classList.toggle( "gsuiEffects-fx-enable", b );
		GSUsetAttribute( html.toggle, "off", !b );
		GSUsetAttribute( html.uiFx, "off", !b );
	}
	#onchangeAddSelect() {
		const type = this.$elements.$addSelect.value;

		this.$elements.$addSelect.blur();
		this.$elements.$addSelect.value = "";
		this.$dispatch( "addEffect", type );
	}
}

Object.freeze( gsuiEffects );
customElements.define( "gsui-effects", gsuiEffects );
