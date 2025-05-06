"use strict";

GSUsetTemplate( "gsui-library", () => [
	GSUcreateDiv( { class: "gsuiLibrary-head" } ),
	GSUcreateDiv( { class: "gsuiLibrary-body" },
		GSUcreateDiv( { class: "gsuiLibrary-placeholder" }, "no sample here..." ),
	),
] );

GSUsetTemplate( "gsui-library-sep", id =>
	GSUcreateDiv( { class: "gsuiLibrary-sep gsuiLibrary-sep-expanded", "data-id": id, title: id },
		GSUcreateButton( { class: "gsuiLibrary-sep-btn", tabindex: -1 },
			GSUcreateI( { class: "gsuiIcon", "data-icon": "caret-right" } ),
			GSUcreateSpan( null, id ),
		),
	)
);

GSUsetTemplate( "gsui-library-sample", obj =>
	GSUcreateDiv( { class: "gsuiLibrary-sample gsuiLibrary-sample-expanded", "data-id": obj.id, "data-name": obj.name, title: obj.name },
		GSUcreateDiv( { class: "gsuiLibrary-sample-wave", inert: true },
			GSUcreateElementSVG( "svg", { class: "gsuiLibrary-sample-svg", viewBox: "0 0 40 10", preserveAspectRatio: "none" },
				GSUcreateElementSVG( "polygon", { class: "gsuiLibrary-sample-poly", points: obj.points } ),
			),
		),
	)
);
