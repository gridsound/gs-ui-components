"use strict";

GSUsetTemplate( "gsui-dragline", () =>
	GSUcreateDiv( { class: "gsuiDragline-main" },
		GSUcreateElement( "svg", { class: "gsuiDragline-line" },
			GSUcreateElement( "polyline" ),
		),
		GSUcreateDiv( { class: "gsuiDragline-to" } ),
	),
);
