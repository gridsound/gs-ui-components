"use strict";

class gsuiEffects {
	constructor() {
		const root = gsuiEffects.template.cloneNode( true ),
			elFxsList = root.querySelector( ".gsuiEffects-list" ),
			elBtnSelect = root.querySelector( ".gsuiEffects-addBtn" ),
			elAddSelect = root.querySelector( ".gsuiEffects-addSelect" ),
			reorder = new gsuiReorder();

		this.rootElement = root;
		this.askData =
		this.oninput =
		this.onchange = () => {};
		this._fxsHtml = new Map();
		this._attached = false;
		this._elFxsList = elFxsList;
		this._elAddSelect = elAddSelect;
		this._fxResizeTimeoutId = null;
		Object.seal( this );

		reorder.setRootElement( elFxsList );
		reorder.setSelectors( {
			item: ".gsuiEffects-fx",
			handle: ".gsuiEffects-fx-grip",
			parent: ".gsuiEffects-list",
		} );
		reorder.onchange = () => {};
		elBtnSelect.onclick = () => this._elAddSelect.value = "";
		elAddSelect.onchange = this._onchangeAddSelect.bind( this );
		elAddSelect.onkeydown = () => false;
		this._fillSelect();
	}

	// .........................................................................
	attached() {
		this._attached = true;
		this._fxsHtml.forEach( html => html.uiFx.attached() );
	}
	resized() {
		this._fxsHtml.forEach( html => html.uiFx.resized() );
	}
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
		clearTimeout( this._fxResizeTimeoutId );
		if ( b ) {
			this._fxResizeTimeoutId = setTimeout( () => {
				if ( !html.uiFx.isAttached() ) {
					html.uiFx.attached();
				}
			}, 200 );
		}
	}

	// .........................................................................
	addEffect( id, fx ) {
		const root = gsuiEffects.templateFx.cloneNode( true ),
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
		toggle.onclick = () => this.onchange( "toggleEffect", id );
		remove.onclick = () => this.onchange( "removeEffect", id );
		uiFx.askData = this.askData.bind( null, id, fx.type );
		uiFx.oninput = ( prop, val ) => this.oninput( id, prop, val );
		uiFx.onchange = ( prop, val ) => this.onchange( "changeEffect", id, prop, val );
		root.dataset.type = fx.type;
		name.textContent = fxAsset.name;
		content.append( uiFx.rootElement );
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
		this.onchange( "addEffect", type );
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

gsuiEffects.template = document.querySelector( "#gsuiEffects-template" );
gsuiEffects.template.remove();
gsuiEffects.template.removeAttribute( "id" );

gsuiEffects.templateFx = document.querySelector( "#gsuiEffects-fx-template" );
gsuiEffects.templateFx.remove();
gsuiEffects.templateFx.removeAttribute( "id" );

gsuiEffects.fxsMap = new Map();
Object.freeze( gsuiEffects );
