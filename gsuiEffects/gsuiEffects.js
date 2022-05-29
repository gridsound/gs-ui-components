"use strict";

class gsuiEffects extends HTMLElement {
	static fxsMap = new Map();
	#fxsHtml = new Map();
	#dispatch = GSUI.$dispatchEvent.bind( null, this, "gsuiEffects" );
	#children = GSUI.$getTemplate( "gsui-effects" );
	#elements = GSUI.$findElements( this.#children, {
		list: ".gsuiEffects-list",
		addBtn: ".gsuiEffects-addBtn",
		addSelect: ".gsuiEffects-addSelect",
	} );

	constructor() {
		super();
		this.askData = GSUI.$noop;
		Object.seal( this );

		this.#elements.addBtn.onclick = () => this.#elements.addSelect.value = "";
		this.#elements.addSelect.onchange = this.#onchangeAddSelect.bind( this );
		this.#elements.addSelect.onkeydown = () => false;
		new gsuiReorder( {
			rootElement: this.#elements.list,
			direction: "column",
			dataTransferType: "effect",
			itemSelector: ".gsuiEffects-fx",
			handleSelector: ".gsuiEffects-fx-grip",
			parentSelector: ".gsuiEffects-list",
		} );
		GSUI.$listenEvents( this, {
			default: {
				liveChange( d, t ) {
					d.args.unshift( t.dataset.id );
					d.component = "gsuiEffects";
					d.eventName = "liveChangeEffect";
					return true;
				},
				changeProp( d, t ) {
					d.args.unshift( t.dataset.id );
					d.component = "gsuiEffects";
					d.eventName = "changeEffect";
					return true;
				},
			},
		} );
		this.#elements.addSelect.append( ...gsuiEffects.#createOptions() );
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.append( this.#elements.list );
		}
	}

	// .........................................................................
	getFxHTML( id ) {
		return this.#fxsHtml.get( id );
	}
	expandToggleEffect( id ) {
		const root = this.#fxsHtml.get( id ).root;

		this.expandEffect( id, !root.classList.contains( "gsuiEffects-fx-expanded" ) );
	}
	expandEffect( id, b ) {
		const html = this.#fxsHtml.get( id );
		const type = html.root.dataset.type;

		html.root.classList.toggle( "gsuiEffects-fx-expanded", b );
		html.expand.dataset.icon = b ? "caret-down" : "caret-right";
		html.content.style.height = `${ b ? gsuiEffects.fxsMap.get( type ).height : 0 }px`;
	}

	// .........................................................................
	addEffect( id, fx ) {
		const root = GSUI.$getTemplate( "gsui-effects-fx" );
		const name = root.querySelector( ".gsuiEffects-fx-name" );
		const expand = root.querySelector( ".gsuiEffects-fx-expand" );
		const toggle = root.querySelector( ".gsuiEffects-fx-toggle" );
		const remove = root.querySelector( ".gsuiEffects-fx-remove" );
		const content = root.querySelector( ".gsuiEffects-fx-content" );
		const fxAsset = gsuiEffects.fxsMap.get( fx.type );
		const uiFx = new fxAsset.cmp();
		const html = Object.seal( {
			uiFx,
			root,
			expand,
			content,
		} );

		expand.onclick = () => this.expandToggleEffect( id );
		toggle.onclick = () => this.#dispatch( "toggleEffect", id );
		remove.onclick = () => this.#dispatch( "removeEffect", id );
		uiFx.askData = this.askData.bind( null, id, fx.type );
		uiFx.dataset.id = id;
		root.dataset.type = fx.type;
		name.textContent = fxAsset.name;
		content.append( uiFx );
		this.#fxsHtml.set( id, html );
		this.#elements.list.append( root );
	}
	removeEffect( id ) {
		this.#fxsHtml.get( id ).root.remove();
		this.#fxsHtml.delete( id );
	}
	changeEffect( id, prop, val ) {
		switch ( prop ) {
			case "toggle": this.#changeToggle( id, val ); break;
			case "order": this.#fxsHtml.get( id ).root.dataset.order = val; break;
		}
	}
	#changeToggle( id, b ) {
		const html = this.#fxsHtml.get( id );

		html.root.classList.toggle( "gsuiEffects-fx-enable", b );
		html.uiFx.toggle( b );
	}
	reorderEffects( effects ) {
		gsuiReorder.listReorder( this.#elements.list, effects );
	}

	// .........................................................................
	#onchangeAddSelect() {
		const type = this.#elements.addSelect.value;

		this.#elements.addSelect.blur();
		this.#elements.addSelect.value = "";
		this.#dispatch( "addEffect", type );
	}

	// .........................................................................
	static #createOptions() {
		const def = gsuiEffects.#createOption( true, "", "-- Select an Fx" );
		const options = [ def ];

		gsuiEffects.fxsMap.forEach( ( fx, id ) => {
			options.push( gsuiEffects.#createOption( false, id, fx.name ) );
		} );
		return options;
	}
	static #createOption( disabled, fxId, fxName ) {
		return GSUI.$createElement( "option", { value: fxId, disabled }, fxName );
	}
}

Object.freeze( gsuiEffects );
customElements.define( "gsui-effects", gsuiEffects );
