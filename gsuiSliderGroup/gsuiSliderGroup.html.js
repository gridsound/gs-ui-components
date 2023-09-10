"use strict";

GSUsetTemplate( "gsui-slidergroup", () => {
	return (
		GSUcreateDiv( { class: "gsuiSliderGroup-slidersWrap" },
			GSUcreateDiv( { class: "gsuiSliderGroup-sliders" },
				GSUcreateElement( "gsui-beatlines", { coloredbeats: "" } ),
				GSUcreateDiv( { class: "gsuiSliderGroup-currentTime" } ),
				GSUcreateDiv( { class: "gsuiSliderGroup-defaultValue" } ),
				GSUcreateDiv( { class: "gsuiSliderGroup-loop gsuiSliderGroup-loopA" } ),
				GSUcreateDiv( { class: "gsuiSliderGroup-loop gsuiSliderGroup-loopB" } ),
			),
		)
	);
} );

GSUsetTemplate( "gsui-slidergroup-slider", () => {
	return (
		GSUcreateDiv( { class: "gsuiSliderGroup-slider" },
			GSUcreateDiv( { class: "gsuiSliderGroup-sliderInner" } ),
		)
	);
} );
