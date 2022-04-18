"use strict";

GSUI.setTemplate( "gsui-dragline", () =>
	GSUI.createElem( "div", { class: "gsuiDragline" },
		GSUI.createElem( "div", { class: "gsuiDragline-main" },
			GSUI.createElemSVG( "svg", { class: "gsuiDragline-line" },
				GSUI.createElemSVG( "polyline" ),
			),
			GSUI.createElem( "div", { class: "gsuiDragline-to" } ),
		),
	)
);
