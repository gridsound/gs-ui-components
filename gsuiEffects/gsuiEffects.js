"use strict";

class gsuiEffects extends HTMLElement {
	#fxsHtml = new Map()
	#dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiEffects" )
	#elFxsList = null
	#elAddSelect = null

	constructor() {
		const elFxsList = GSUI.getTemplate( "gsui-effects" ),
			elBtnSelect = elFxsList.querySelector( ".gsuiEffects-addBtn" ),
			elAddSelect = elFxsList.querySelector( ".gsuiEffects-addSelect" );

		super();
		this.askData = GSUI.noop;
		this.#elFxsList = elFxsList;
		this.#elAddSelect = elAddSelect;
		Object.seal( this );

		elBtnSelect.onclick = () => this.#elAddSelect.value = "";
		elAddSelect.onchange = this.#onchangeAddSelect.bind( this );
		elAddSelect.onkeydown = () => false;
		new gsuiReorder( {
			rootElement: elFxsList,
			direction: "column",
			dataTransferType: "effect",
			itemSelector: ".gsuiEffects-fx",
			handleSelector: ".gsuiEffects-fx-grip",
			parentSelector: ".gsuiEffects-list",
		} );
		GSUI.listenEvents( this, {
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
		this.#fillSelect();
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.classList.add( "gsuiEffects" );
			this.append( this.#elFxsList );
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
		const html = this.#fxsHtml.get( id ),
			type = html.root.dataset.type;

		html.root.classList.toggle( "gsuiEffects-fx-expanded", b );
		html.expand.dataset.icon = b ? "caret-down" : "caret-right";
		html.content.style.height = `${ b ? gsuiEffects.fxsMap.get( type ).height : 0 }px`;
	}

	// .........................................................................
	addEffect( id, fx ) {
		const root = GSUI.getTemplate( "gsui-effects-fx" ),
			name = root.querySelector( ".gsuiEffects-fx-name" ),
			expand = root.querySelector( ".gsuiEffects-fx-expand" ),
			toggle = root.querySelector( ".gsuiEffects-fx-toggle" ),
			remove = root.querySelector( ".gsuiEffects-fx-remove" ),
			content = root.querySelector( ".gsuiEffects-fx-content" ),
			fxAsset = gsuiEffects.fxsMap.get( fx.type ),
			uiFx = new fxAsset.cmp(),
			html = Object.seal( {
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
		this.#elFxsList.append( root );
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
		gsuiReorder.listReorder( this.#elFxsList, effects );
	}

	// .........................................................................
	#onchangeAddSelect() {
		const type = this.#elAddSelect.value;

		this.#elAddSelect.blur();
		this.#elAddSelect.value = "";
		this.#dispatch( "addEffect", type );
	}

	// .........................................................................
	#createOption( enable, fxId, fxName ) {
		const opt = document.createElement( "option" );

		opt.value = fxId;
		opt.disabled = !enable;
		opt.textContent = fxName;
		return opt;
	}
	#fillSelect() {
		const def = this.#createOption( false, "", "-- Select an Fx" ),
			options = [ def ];

		gsuiEffects.fxsMap.forEach( ( fx, id ) => {
			options.push( this.#createOption( true, id, fx.name ) );
		} );
		this.#elAddSelect.append( ...options );
	}
}

gsuiEffects.fxsMap = new Map();

customElements.define( "gsui-effects", gsuiEffects );
