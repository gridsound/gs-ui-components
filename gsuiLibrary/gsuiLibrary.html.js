"use strict";

GSUI.$setTemplate( "gsui-library", () => [
	GSUI.$createElement( "div", { class: "gsuiLibrary-head" } ),
	GSUI.$createElement( "div", { class: "gsuiLibrary-body" } ),
] );

GSUI.$setTemplate( "gsui-library-sep", text =>
	GSUI.$createElement( "div", { class: "gsuiLibrary-sep", title: text },
		GSUI.$createElement( "i", { class: "gsuiIcon", "data-icon": "arrow-levelleftdown" } ),
		GSUI.$createElement( "span", null, text ),
	)
);

GSUI.$setTemplate( "gsui-library-sample", obj =>
	GSUI.$createElement( "div", { class: "gsuiLibrary-sample", "data-id": obj.title, title: obj.title },
		GSUI.$createElement( "div", { class: "gsuiLibrary-sample-wave" },
			GSUI.$createElementSVG( "svg", { class: "gsuiLibrary-sample-svg", viewBox: obj.viewBox, preserveAspectRatio: "none" },
				GSUI.$createElementSVG( "polygon", { class: "gsuiLibrary-sample-poly", points: obj.points } ),
			),
		),
	)
);
