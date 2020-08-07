"use strict";

const GSUI = {

	dragshield: document.createElement( "gsui-dragshield" ),

	dispatchEvent( el, component, eventName, ...args ) {
		el.dispatchEvent( new CustomEvent( "gsuiEvents", {
			bubbles: true,
			detail: { component, eventName, args },
		} ) );
	},
};

document.body.prepend( GSUI.dragshield );
