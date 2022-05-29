"use strict";

GSUI.$setTemplate( "gsui-drums-line", () =>
	GSUI.$createElement( "div", { class: "gsuiDrums-line" },
		GSUI.$createElement( "div", { class: "gsuiDrums-lineDrums" },
			GSUI.$createElement( "div", { class: "gsuiDrums-lineIn" } ),
		),
		GSUI.$createElement( "div", { class: "gsuiDrums-lineProps" },
			GSUI.$createElement( "gsui-slidergroup" ),
		),
	)
);

GSUI.$setTemplate( "gsui-drums-drum", () =>
	GSUI.$createElement( "div", { class: "gsuiDrums-drum" },
		GSUI.$createElement( "div", { class: "gsuiDrums-drumIn" },
			[ "detune", "pan", "gain" ].map( p =>
				GSUI.$createElement( "div", { class: "gsuiDrums-drumProp", "data-value": p },
					GSUI.$createElement( "div", { class: "gsuiDrums-drumPropValue" } ),
				)
			),
		),
	)
);

GSUI.$setTemplate( "gsui-drums-drumcut", () =>
	GSUI.$createElement( "div", { class: "gsuiDrums-drumcut" },
		GSUI.$createElement( "div", { class: "gsuiDrums-drumcutIn" },
			GSUI.$createElement( "i", { class: "gsuiIcon", "data-icon": "drumcut" } ),
		),
	)
);
