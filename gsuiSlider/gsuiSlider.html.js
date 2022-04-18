"use strict";

GSUI.setTemplate( "gsui-slider", () => [
	GSUI.createElem( "input", { type: "range", class: "gsuiSlider-input" } ),
	GSUI.createElem( "div", { class: "gsuiSlider-line" },
		GSUI.createElem( "div", { class: "gsuiSlider-lineColor" } ),
	),
	GSUI.createElemSVG( "svg", { class: "gsuiSlider-svg" },
		GSUI.createElemSVG( "circle", { class: "gsuiSlider-svgLine" } ),
		GSUI.createElemSVG( "circle", { class: "gsuiSlider-svgLineColor" } ),
	),
	GSUI.createElem( "div", { class: "gsuiSlider-eventCatcher" } ),
] );
