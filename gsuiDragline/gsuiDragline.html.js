"use strict";

GSUI.setTemplate( "gsui-dragline", () => (
	GSUI.createElement( "div", { class: "gsuiDragline" },
		GSUI.createElement( "div", { class: "gsuiDragline-main" },
			GSUI.createElementNS( "svg", { class: "gsuiDragline-line" },
				GSUI.createElementNS( "polyline" ),
			),
			GSUI.createElement( "div", { class: "gsuiDragline-to" } ),
		),
	)
) );
