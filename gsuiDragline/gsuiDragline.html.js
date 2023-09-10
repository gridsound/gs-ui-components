"use strict";

GSUsetTemplate( "gsui-dragline", () =>
	GSUcreateDiv( { class: "gsuiDragline" },
		GSUcreateDiv( { class: "gsuiDragline-main" },
			GSUcreateElementSVG( "svg", { class: "gsuiDragline-line" },
				GSUcreateElementSVG( "polyline" ),
			),
			GSUcreateDiv( { class: "gsuiDragline-to" } ),
		),
	)
);
