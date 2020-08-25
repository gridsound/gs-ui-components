"use strict";

GSUI.setTemplate( "gsui-slider", () => {
	return [
		GSUI.createElement( "input", { type: "range", class: "gsuiSlider-input" } ),
		GSUI.createElement( "div", { class: "gsuiSlider-line" },
			GSUI.createElement( "div", { class: "gsuiSlider-lineColor" } ),
		),
		GSUI.createElementNS( "svg", { class: "gsuiSlider-svg" },
			GSUI.createElementNS( "circle", { class: "gsuiSlider-svgLine" } ),
			GSUI.createElementNS( "circle", { class: "gsuiSlider-svgLineColor" } ),
		),
		GSUI.createElement( "div", { class: "gsuiSlider-eventCatcher" } ),
	];
} );
