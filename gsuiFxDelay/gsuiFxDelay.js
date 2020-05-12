"use strict";

class gsuiFxDelay {
	constructor() {
		const root = gsuiFxDelay.template.cloneNode( true ),
			elEchoes = root.querySelector( ".gsuiFxDelay-echoes" ),
			elLinkBtn = root.querySelector( ".gsuiFxDelay-echoesLink" ),
			uiSliderZoom = new gsuiSlider(),
			uiDotline = new gsuiDotline(),
			blines = new gsuiBeatlines( elEchoes ),
			gsdata = new GSDataFxDelay( {
				actionCallback: ( obj, msg ) => this.onchange( obj, msg ),
				dataCallbacks: {
					changeEchoes: uiDotline.change.bind( uiDotline ),
				},
			} );

		this.rootElement = root;
		this.gsdata = gsdata;
		this.oninput =
		this.onchange = GSUtils.noop;
		this._uiSliderZoom = uiSliderZoom;
		this._uiDotline = uiDotline;
		this._elLinkBtn = elLinkBtn;
		this._blines = blines;
		this._blinesW = 0;
		Object.seal( this );

		elEchoes.prepend( uiDotline.rootElement, uiSliderZoom.rootElement );
		uiDotline.options( {
			x: "delay",
			y: "pan",
			minX: 0, maxX: 8,
			minY: -1, maxY: 1,
			step: 1 / 8,
			moveMode: "free",
			firstDotLinked: 0,
		} );
		this._setLinkBtn( "free" );
		uiSliderZoom.options( { type: "linear-x", min: 1, max: 8, step: 1 / 8 } );
		blines.render();
		elLinkBtn.onclick = this._onclickLinkBtn.bind( this );
		uiSliderZoom.oninput =
		uiSliderZoom.onchange = this.zoom.bind( this );
		uiDotline.onchange = echoes => this.gsdata.callAction( "changeEchoes", echoes );
		uiDotline.oninput = ( id, delay, pan ) => this.oninput( "echoes", id, delay, pan );
	}

	attached() {
		this._uiDotline.attached();
		this._uiSliderZoom.attached();
		this.resized();
		this.zoom( 4 );
	}
	resized() {
		this._blinesW = this._blines.rootElement.getBoundingClientRect().width;
		this._uiDotline.resize();
		this.zoom( this._uiSliderZoom.value );
	}
	timeSignature( a, b ) {
		this._blines.timeSignature( a, b );
	}
	zoom( beats ) {
		this._uiSliderZoom.setValue( beats );
		this._blines.pxPerBeat( this._blinesW / beats );
		this._blines.render();
		this._uiDotline.options( { maxX: beats } );
	}

	// .........................................................................
	_setLinkBtn( moveMode ) {
		this._elLinkBtn.dataset.icon = moveMode === "linked" ? "link" : "unlink";
	}

	// events
	// .........................................................................
	_onclickLinkBtn() {
		const moveMode = this._uiDotline.options().moveMode === "free" ? "linked" : "free";

		this._setLinkBtn( moveMode );
		this._uiDotline.options( { moveMode } );
	}
}

gsuiFxDelay.template = document.querySelector( "#gsuiFxDelay" );
gsuiFxDelay.template.remove();
gsuiFxDelay.template.removeAttribute( "id" );

if ( typeof gsuiEffects !== "undefined" ) {
	gsuiEffects.fxsMap.set( "delay", { cmp: gsuiFxDelay, name: "Delay", height: 120 } );
}
