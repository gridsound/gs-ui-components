"use strict";

GSUI.setTemplate( "gsui-slidergroup", () => {
	return (
		GSUI.createElem( "div", { class: "gsuiSliderGroup-slidersWrap" },
			GSUI.createElem( "div", { class: "gsuiSliderGroup-sliders" },
				GSUI.createElem( "gsui-beatlines", { coloredbeats: "" } ),
				GSUI.createElem( "div", { class: "gsuiSliderGroup-currentTime" } ),
				GSUI.createElem( "div", { class: "gsuiSliderGroup-defaultValue" } ),
				GSUI.createElem( "div", { class: "gsuiSliderGroup-loop gsuiSliderGroup-loopA" } ),
				GSUI.createElem( "div", { class: "gsuiSliderGroup-loop gsuiSliderGroup-loopB" } ),
			),
		)
	);
} );

GSUI.setTemplate( "gsui-slidergroup-slider", () => {
	return (
		GSUI.createElem( "div", { class: "gsuiSliderGroup-slider" },
			GSUI.createElem( "div", { class: "gsuiSliderGroup-sliderInner" } ),
		)
	);
} );
