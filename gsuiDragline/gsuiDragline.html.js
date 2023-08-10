"use strict";

GSUsetTemplate( "gsui-dragline", () =>
	GSUcreateElement( "div", { class: "gsuiDragline" },
		GSUcreateElement( "div", { class: "gsuiDragline-main" },
			GSUcreateElementSVG( "svg", { class: "gsuiDragline-line" },
				GSUcreateElementSVG( "polyline" ),
			),
			GSUcreateElement( "div", { class: "gsuiDragline-to" } ),
		),
	)
);
