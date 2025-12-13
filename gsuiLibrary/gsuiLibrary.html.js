"use strict";

GSUsetTemplate( "gsui-library", () => [
	GSUcreateDiv( { class: "gsuiLibrary-head" } ),
	GSUcreateDiv( { class: "gsuiLibrary-body" },
		GSUcreateDiv( { class: "gsuiLibrary-placeholder" }, "no sample here..." ),
	),
] );

GSUsetTemplate( "gsui-library-sep", id =>
	GSUcreateDiv( { class: "gsuiLibrary-sep", "data-id": id, "data-expanded": true },
		GSUcreateButton( { tabindex: -1 },
			GSUcreateIcon( { icon: "caret-right" } ),
			GSUcreateSpan( null, id ),
		),
	)
);

GSUsetTemplate( "gsui-library-sample", obj =>
	GSUcreateDiv( { class: "gsuiLibrary-sample", "data-id": obj.id, "data-expanded": true, "data-name": obj.name, title: obj.name },
		GSUcreateDiv( { class: "gsuiLibrary-sample-wave", inert: true },
			GSUcreateElement( "svg", { class: "gsuiLibrary-sample-svg", viewBox: "0 0 40 10", preserveAspectRatio: "none" },
				GSUcreateElement( "polygon", { class: "gsuiLibrary-sample-poly", points: obj.points } ),
			),
		),
	)
);
