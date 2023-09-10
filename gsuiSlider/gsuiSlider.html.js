"use strict";

GSUsetTemplate( "gsui-slider", () => [
	GSUcreateInput( { type: "range", class: "gsuiSlider-input" } ),
	GSUcreateDiv( { class: "gsuiSlider-line" },
		GSUcreateDiv( { class: "gsuiSlider-lineColor" } ),
	),
	GSUcreateElementSVG( "svg", { class: "gsuiSlider-svg" },
		GSUcreateElementSVG( "circle", { class: "gsuiSlider-svgLine" } ),
		GSUcreateElementSVG( "circle", { class: "gsuiSlider-svgLineColor" } ),
	),
	GSUcreateDiv( { class: "gsuiSlider-eventCatcher" } ),
] );
