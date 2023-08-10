"use strict";

GSUsetTemplate( "gsui-slider", () => [
	GSUcreateElement( "input", { type: "range", class: "gsuiSlider-input" } ),
	GSUcreateElement( "div", { class: "gsuiSlider-line" },
		GSUcreateElement( "div", { class: "gsuiSlider-lineColor" } ),
	),
	GSUcreateElementSVG( "svg", { class: "gsuiSlider-svg" },
		GSUcreateElementSVG( "circle", { class: "gsuiSlider-svgLine" } ),
		GSUcreateElementSVG( "circle", { class: "gsuiSlider-svgLineColor" } ),
	),
	GSUcreateElement( "div", { class: "gsuiSlider-eventCatcher" } ),
] );
