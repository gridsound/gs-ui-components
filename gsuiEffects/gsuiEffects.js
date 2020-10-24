"use strict";

class gsuiEffects extends HTMLElement {
	constructor() {
		const elFxsList = GSUI.getTemplate( "gsui-effects" ),
			elBtnSelect = elFxsList.querySelector( ".gsuiEffects-addBtn" ),
			elAddSelect = elFxsList.querySelector( ".gsuiEffects-addSelect" );

		super();
		this.askData = () => {};
		this._fxsHtml = new Map();
		this._elFxsList = elFxsList;
		this._elAddSelect = elAddSelect;
		this._dispatch = GSUI.dispatchEvent.bind( null, this, "gsuiEffects" );
		Object.seal( this );

		elBtnSelect.onclick = () => this._elAddSelect.value = "";
		elAddSelect.onchange = this._onchangeAddSelect.bind( this );
		elAddSelect.onkeydown = () => false;
		new gsuiReorder( {
			rootElement: elFxsList,
			direction: "column",
			dataTransferType: "effect",
			itemSelector: ".gsuiEffects-fx",
			handleSelector: ".gsuiEffects-fx-grip",
			parentSelector: ".gsuiEffects-list",
		} );
		GSUI.listenEvent( this, {
			default: {
				liveChange: ( d, e ) => {
					d.args.unshift( e.target.dataset.id );
					d.component = "gsuiEffects";
					d.eventName = "liveChangeEffect";
					return true;
				},
				changeProp: ( d, e ) => {
					d.args.unshift( e.target.dataset.id );
					d.component = "gsuiEffects";
					d.eventName = "changeEffect";
					return true;
				},
			},
		} );
		this._fillSelect();
	}

	// .........................................................................
	connectedCallback() {
		if ( !this.firstChild ) {
			this.classList.add( "gsuiEffects" );
			this.append( this._elFxsList );
		}
	}

	// .........................................................................
	expandToggleEffect( id ) {
		const root = this._fxsHtml.get( id ).root;

		this.expandEffect( id, !root.classList.contains( "gsuiEffects-fx-expanded" ) );
	}
	expandEffect( id, b ) {
		const html = this._fxsHtml.get( id ),
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
		toggle.onclick = () => this._dispatch( "toggleEffect", id );
		remove.onclick = () => this._dispatch( "removeEffect", id );
		uiFx.askData = this.askData.bind( null, id, fx.type );
		uiFx.dataset.id = id;
		root.dataset.type = fx.type;
		name.textContent = fxAsset.name;
		content.append( uiFx );
		this._fxsHtml.set( id, html );
		this._elFxsList.append( root );
	}
	removeEffect( id ) {
		this._fxsHtml.get( id ).root.remove();
		this._fxsHtml.delete( id );
	}
	changeEffect( id, prop, val ) {
		switch ( prop ) {
			case "toggle": this._changeToggle( id, val ); break;
			case "order": this._fxsHtml.get( id ).root.dataset.order = val; break;
		}
	}
	_changeToggle( id, b ) {
		const html = this._fxsHtml.get( id );

		html.root.classList.toggle( "gsuiEffects-fx-enable", b );
		html.uiFx.toggle( b );
	}
	reorderEffects( effects ) {
		gsuiReorder.listReorder( this._elFxsList, effects );
	}

	// events:
	// .........................................................................
	_onchangeAddSelect() {
		const type = this._elAddSelect.value;

		this._elAddSelect.blur();
		this._elAddSelect.value = "";
		this._dispatch( "addEffect", type );
	}

	// .........................................................................
	_createOption( enable, fxId, fxName ) {
		const opt = document.createElement( "option" );

		opt.value = fxId;
		opt.disabled = !enable;
		opt.textContent = fxName;
		return opt;
	}
	_fillSelect() {
		const def = this._createOption( false, "", "-- Select an Fx" ),
			options = [ def ];

		gsuiEffects.fxsMap.forEach( ( fx, id ) => {
			options.push( this._createOption( true, id, fx.name ) );
		} );
		this._elAddSelect.append( ...options );
	}
}

gsuiEffects.fxsMap = new Map();

customElements.define( "gsui-effects", gsuiEffects );
