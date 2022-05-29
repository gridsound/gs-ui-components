"use strict";

GSUI.$setTemplate( "gsui-slider", () => [
	GSUI.$createElement( "input", { type: "range", class: "gsuiSlider-input" } ),
	GSUI.$createElement( "div", { class: "gsuiSlider-line" },
		GSUI.$createElement( "div", { class: "gsuiSlider-lineColor" } ),
	),
	GSUI.$createElementSVG( "svg", { class: "gsuiSlider-svg" },
		GSUI.$createElementSVG( "circle", { class: "gsuiSlider-svgLine" } ),
		GSUI.$createElementSVG( "circle", { class: "gsuiSlider-svgLineColor" } ),
	),
	GSUI.$createElement( "div", { class: "gsuiSlider-eventCatcher" } ),
] );
