"use strict";

class gsuiEffects extends HTMLElement {
	$askData = GSUI.$noop;
	#fxsHtml = new Map();
	#dispatch = GSUI.$dispatchEvent.bind( null, this, "gsuiEffects" );
	#children = GSUI.$getTemplate( "gsui-effects" );
	#elements = GSUI.$findElements( this.#children, {
		addBtn: ".gsuiEffects-addBtn",
		addSelect: ".gsuiEffects-addSelect",
	} );
	static #fxsMap = Object.freeze( {
		delay: { cmp: "gsui-fx-delay", name: "Delay", height: 140 },
		filter: { cmp: "gsui-fx-filter", name: "Filter", height: 160 },
	} );

	constructor() {
		super();
		Object.seal( this );

		this.#elements.addBtn.onclick = () => this.#elements.addSelect.value = "";
		this.#elements.addSelect.onchange = this.#onchangeAddSelect.bind( this );
		this.#elements.addSelect.onkeydown = () => false;
		new gsuiReorder( {
			rootElement: this,
			direction: "column",
			dataTransferType: "effect",
			itemSelector: ".gsuiEffects-fx",
			handleSelector: ".gsuiEffects-fx-grip",
			parentSelector: "gsui-effects",
		} );
		GSUI.$listenEvents( this, {
			gsuiToggle: {
				toggle: ( d, btn ) => {
					this.#dispatch( "toggleEffect", btn.parentNode.parentNode.dataset.id );
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
	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( ...this.#children );
			this.#children = null;
		}
	}
	static get observedAttributes() {
		return [ "timedivision" ];
	}
	attributeChangedCallback( prop, prev, val ) {
		if ( prev !== val ) {
			switch ( prop ) {
				case "timedivision":
					this.#fxsHtml.forEach( html => GSUI.$setAttribute( html.content.firstChild, "timedivision", val ) );
					break;
			}
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
		const root = GSUI.$getTemplate( "gsui-effects-fx" );
		const name = root.querySelector( ".gsuiEffects-fx-name" );
		const expand = root.querySelector( ".gsuiEffects-fx-expand" );
		const remove = root.querySelector( ".gsuiEffects-fx-remove" );
		const content = root.querySelector( ".gsuiEffects-fx-content" );
		const fxAsset = gsuiEffects.#fxsMap[ fx.type ];
		const uiFx = GSUI.$createElement( fxAsset.cmp );
		const html = Object.seal( {
			uiFx,
			root,
			expand,
			content,
		} );

		expand.onclick = () => this.$expandToggleEffect( id );
		remove.onclick = () => this.#dispatch( "removeEffect", id );
		if ( "$askData" in uiFx ) {
			uiFx.$askData = this.$askData.bind( null, id, fx.type );
		}
		root.dataset.id =
		uiFx.dataset.id = id;
		root.dataset.type = fx.type;
		GSUI.$setAttribute( uiFx, "timedivision", GSUI.$getAttribute( this, "timedivision" ) );
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
		html.uiFx.$toggle( b );
	}
	#onchangeAddSelect() {
		const type = this.#elements.addSelect.value;

		this.#elements.addSelect.blur();
		this.#elements.addSelect.value = "";
		this.#dispatch( "addEffect", type );
	}
}

Object.freeze( gsuiEffects );
customElements.define( "gsui-effects", gsuiEffects );
