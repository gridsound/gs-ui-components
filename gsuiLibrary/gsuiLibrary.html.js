"use strict";

GSUsetTemplate( "gsui-library", () => [
	GSUcreateElement( "div", { class: "gsuiLibrary-head" } ),
	GSUcreateElement( "div", { class: "gsuiLibrary-body" },
		GSUcreateElement( "div", { class: "gsuiLibrary-placeholder" }, "no sample here..." ),
	),
] );

GSUsetTemplate( "gsui-library-sep", id =>
	GSUcreateElement( "div", { class: "gsuiLibrary-sep gsuiLibrary-sep-expanded", "data-id": id, title: id },
		GSUcreateButton( { class: "gsuiLibrary-sep-btn", tabindex: -1 },
			GSUcreateElement( "i", { class: "gsuiIcon", "data-icon": "caret-right" } ),
			GSUcreateElement( "span", null, id ),
		),
	)
);

GSUsetTemplate( "gsui-library-sample", obj =>
	GSUcreateElement( "div", { class: "gsuiLibrary-sample gsuiLibrary-sample-expanded", draggable: "true", "data-id": obj.id, "data-name": obj.name, title: obj.name },
		GSUcreateElement( "div", { class: "gsuiLibrary-sample-wave" },
			GSUcreateElementSVG( "svg", { class: "gsuiLibrary-sample-svg", viewBox: "0 0 40 10", preserveAspectRatio: "none" },
				GSUcreateElementSVG( "polygon", { class: "gsuiLibrary-sample-poly", points: obj.points } ),
			),
		),
	)
);
