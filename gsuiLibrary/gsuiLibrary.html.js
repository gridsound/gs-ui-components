"use strict";

GSUI.$setTemplate( "gsui-library", () => [
	GSUI.$createElement( "div", { class: "gsuiLibrary-head" } ),
	GSUI.$createElement( "div", { class: "gsuiLibrary-body" } ),
] );

GSUI.$setTemplate( "gsui-library-sep", id =>
	GSUI.$createElement( "div", { class: "gsuiLibrary-sep gsuiLibrary-sep-expanded", "data-id": id, title: id },
		GSUI.$createElement( "button", { class: "gsuiLibrary-sep-btn", type: "button", tabindex: -1 },
			GSUI.$createElement( "i", { class: "gsuiIcon", "data-icon": "caret-right" } ),
			GSUI.$createElement( "span", null, id ),
		),
	)
);

GSUI.$setTemplate( "gsui-library-sample", obj =>
	GSUI.$createElement( "div", { class: "gsuiLibrary-sample gsuiLibrary-sample-expanded", draggable: "true", "data-id": obj.title, title: obj.title },
		GSUI.$createElement( "div", { class: "gsuiLibrary-sample-wave" },
			GSUI.$createElementSVG( "svg", { class: "gsuiLibrary-sample-svg", viewBox: obj.viewBox, preserveAspectRatio: "none" },
				GSUI.$createElementSVG( "polygon", { class: "gsuiLibrary-sample-poly", points: obj.points } ),
			),
		),
	)
);
