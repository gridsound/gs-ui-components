"use strict";

GSUsetTemplate( "gsui-slidergroup", () => {
	return (
		GSUcreateElement( "div", { class: "gsuiSliderGroup-slidersWrap" },
			GSUcreateElement( "div", { class: "gsuiSliderGroup-sliders" },
				GSUcreateElement( "gsui-beatlines", { coloredbeats: "" } ),
				GSUcreateElement( "div", { class: "gsuiSliderGroup-currentTime" } ),
				GSUcreateElement( "div", { class: "gsuiSliderGroup-defaultValue" } ),
				GSUcreateElement( "div", { class: "gsuiSliderGroup-loop gsuiSliderGroup-loopA" } ),
				GSUcreateElement( "div", { class: "gsuiSliderGroup-loop gsuiSliderGroup-loopB" } ),
			),
		)
	);
} );

GSUsetTemplate( "gsui-slidergroup-slider", () => {
	return (
		GSUcreateElement( "div", { class: "gsuiSliderGroup-slider" },
			GSUcreateElement( "div", { class: "gsuiSliderGroup-sliderInner" } ),
		)
	);
} );
