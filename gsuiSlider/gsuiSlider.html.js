"use strict";

GSUsetTemplate( "gsui-slider", () => [
	GSUcreateDiv( { class: "gsuiSlider-line" },
		GSUcreateDiv( { class: "gsuiSlider-lineColor" } ),
	),
	GSUcreateElementSVG( "svg", { class: "gsuiSlider-svg" },
		GSUcreateElementSVG( "circle", { class: "gsuiSlider-svgLine" } ),
		GSUcreateElementSVG( "circle", { class: "gsuiSlider-svgLineColor" } ),
	),
	GSUcreateDiv( { class: "gsuiSlider-eventCatcher" } ),
] );
