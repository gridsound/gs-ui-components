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
		this.onchange = GSData.noop;
		this.gsdata = new GSDataEffects( {
			actionCallback: ( obj, msg ) => this.onchange( obj, msg ),
			dataCallbacks: {
				addFx: this._addFx.bind( this ),
				removeFx: this._removeFx.bind( this ),
				toggleFx: this._toggleFx.bind( this ),
				reorderFx: this._reorderFx.bind( this ),
				changeFxData: this._changeFxData.bind( this ),
			},
		} );
		this._fxNames = 0;
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
	empty() {
		this.gsdata.clear();
	}
	change( obj ) {
		this.gsdata.change( obj );
		gsuiReorder.listReorder( this._elFxsList, obj );
	}
	attached() {
		this._attached = true;
		this._fxsHtml.forEach( html => html.uiFx.attached() );
	}
	resized() {
		this._fxsHtml.forEach( html => html.uiFx.resized() );
	}
	setDestFilter( dest ) {
		this.gsdata.setDestFilter( dest );
	}

	// dataCallbacks:
	// .........................................................................
	_addFx( id, fx ) {
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
				expanded: false,
			} );

		expand.onclick = this._onclickShowFx.bind( this, id );
		toggle.onclick = this._onclickToggleFx.bind( this, id );
		remove.onclick = this._onclickRemoveFx.bind( this, id );
		uiFx.askData = this.askData.bind( null, id, fx.type );
		uiFx.oninput = ( prop, val ) => this.oninput( id, prop, val );
		uiFx.onchange = this.gsdata.callAction.bind( this.gsdata, "changeFxData", id );
		name.textContent = fxAsset.name;
		content.append( uiFx.rootElement );
		this._fxsHtml.set( id, html );
		this._elFxsList.append( root );
	}
	_removeFx( id ) {
		this._fxsHtml.get( id ).root.remove();
		this._fxsHtml.delete( id );
	}
	_toggleFx( id, b ) {
		const html = this._fxsHtml.get( id );

		html.root.classList.toggle( "gsuiEffects-fx-enable", b );
		html.uiFx.toggle( b );
	}
	_reorderFx( id, order ) {
		this._fxsHtml.get( id ).root.dataset.order = order;
	}
	_changeFxData( id, data ) {
		this._fxsHtml.get( id ).uiFx.change( data );
	}

	// .........................................................................
	_expandFx( id, b ) {
		const html = this._fxsHtml.get( id ),
			type = this.gsdata.data[ id ].type;

		html.expanded = b;
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

	// events:
	// .........................................................................
	_onchangeAddSelect() {
		const type = this._elAddSelect.value;

		this._elAddSelect.blur();
		this._elAddSelect.value = "";
		this.gsdata.callAction( "addFx", type );
	}
	_onclickShowFx( id ) {
		this._expandFx( id, !this._fxsHtml.get( id ).expanded );
	}
	_onclickToggleFx( id ) {
		this.gsdata.callAction( "toggleFx", id );
	}
	_onclickRemoveFx( id ) {
		this.gsdata.callAction( "removeFx", id );
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
