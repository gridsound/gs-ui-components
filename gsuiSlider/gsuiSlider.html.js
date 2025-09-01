"use strict";

GSUsetTemplate( "gsui-slider", () => [
	GSUcreateDiv( { class: "gsuiSlider-line" },
		GSUcreateDiv( { class: "gsuiSlider-lineColor" } ),
	),
	GSUcreateElement( "svg", { class: "gsuiSlider-svg" },
		GSUcreateElement( "circle", { class: "gsuiSlider-svgLine" } ),
		GSUcreateElement( "circle", { class: "gsuiSlider-svgLineColor" } ),
	),
	GSUcreateDiv( { class: "gsuiSlider-eventCatcher" } ),
] );
