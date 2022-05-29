"use strict";

GSUI.$setTemplate( "gsui-dragline", () =>
	GSUI.$createElement( "div", { class: "gsuiDragline" },
		GSUI.$createElement( "div", { class: "gsuiDragline-main" },
			GSUI.$createElementSVG( "svg", { class: "gsuiDragline-line" },
				GSUI.$createElementSVG( "polyline" ),
			),
			GSUI.$createElement( "div", { class: "gsuiDragline-to" } ),
		),
	)
);
