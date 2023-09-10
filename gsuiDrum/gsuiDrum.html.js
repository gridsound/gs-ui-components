"use strict";

GSUsetTemplate( "gsui-drum", () =>
	GSUcreateDiv( { class: "gsuiDrum-in", inert: true },
		[ "detune", "pan", "gain" ].map( p =>
			GSUcreateDiv( { class: "gsuiDrum-prop", "data-value": p },
				GSUcreateDiv( { class: "gsuiDrum-propValue" } ),
			)
		),
	)
);

GSUsetTemplate( "gsui-drumcut", () =>
	GSUcreateDiv( { class: "gsuiDrumcut-in", inert: true },
		GSUcreateI( { class: "gsuiIcon", "data-icon": "drumcut" } ),
	)
);
