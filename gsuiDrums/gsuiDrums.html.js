"use strict";

GSUI.setTemplate( "gsui-drums-line", () =>
	GSUI.createElem( "div", { class: "gsuiDrums-line" },
		GSUI.createElem( "div", { class: "gsuiDrums-lineDrums" },
			GSUI.createElem( "div", { class: "gsuiDrums-lineIn" } ),
		),
		GSUI.createElem( "div", { class: "gsuiDrums-lineProps" },
			GSUI.createElem( "gsui-slidergroup" ),
		),
	)
);

GSUI.setTemplate( "gsui-drums-drum", () =>
	GSUI.createElem( "div", { class: "gsuiDrums-drum" },
		GSUI.createElem( "div", { class: "gsuiDrums-drumIn" },
			[ "detune", "pan", "gain" ].map( p =>
				GSUI.createElem( "div", { class: "gsuiDrums-drumProp", "data-value": p },
					GSUI.createElem( "div", { class: "gsuiDrums-drumPropValue" } ),
				)
			),
		),
	)
);

GSUI.setTemplate( "gsui-drums-drumcut", () =>
	GSUI.createElem( "div", { class: "gsuiDrums-drumcut" },
		GSUI.createElem( "div", { class: "gsuiDrums-drumcutIn" },
			GSUI.createElem( "i", { class: "gsuiIcon", "data-icon": "drumcut" } ),
		),
	)
);
