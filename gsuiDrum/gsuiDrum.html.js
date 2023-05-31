"use strict";

GSUI.$setTemplate( "gsui-drum", () =>
	GSUI.$createElement( "div", { class: "gsuiDrum-in", inert: true },
		[ "detune", "pan", "gain" ].map( p =>
			GSUI.$createElement( "div", { class: "gsuiDrum-prop", "data-value": p },
				GSUI.$createElement( "div", { class: "gsuiDrum-propValue" } ),
			)
		),
	)
);

GSUI.$setTemplate( "gsui-drumcut", () =>
	GSUI.$createElement( "div", { class: "gsuiDrumcut-in", inert: true },
		GSUI.$createElement( "i", { class: "gsuiIcon", "data-icon": "drumcut" } ),
	)
);
