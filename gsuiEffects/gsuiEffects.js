"use strict";

class gsuiEffects extends HTMLElement {
	static fxsMap = new Map()
	#fxsHtml = new Map()
	#dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiEffects" )
	#children = GSUI.getTemplate( "gsui-effects" )
	#elements = GSUI.findElements( this.#children, {
		list: ".gsuiEffects-list",
		addBtn: ".gsuiEffects-addBtn",
		addSelect: ".gsuiEffects-addSelect",
	} )

	constructor() {
		super();
		this.askData = GSUI.noop;
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
		this.#elements.addSelect.append( ...options );
	}
}

Object.freeze( gsuiEffects );
customElements.define( "gsui-effects", gsuiEffects );
