"use strict";

GSUsetTemplate( "gsui-drum", () =>
	GSUcreateElement( "div", { class: "gsuiDrum-in", inert: true },
		[ "detune", "pan", "gain" ].map( p =>
			GSUcreateElement( "div", { class: "gsuiDrum-prop", "data-value": p },
				GSUcreateElement( "div", { class: "gsuiDrum-propValue" } ),
			)
		),
	)
);

GSUsetTemplate( "gsui-drumcut", () =>
	GSUcreateElement( "div", { class: "gsuiDrumcut-in", inert: true },
		GSUcreateElement( "i", { class: "gsuiIcon", "data-icon": "drumcut" } ),
	)
);
