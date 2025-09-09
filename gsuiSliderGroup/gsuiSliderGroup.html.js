"use strict";

GSUsetTemplate( "gsui-slidergroup", () =>
	GSUcreateDiv( { class: "gsuiSliderGroup-slidersWrap" },
		GSUcreateDiv( { class: "gsuiSliderGroup-sliders" },
			GSUcreateElement( "gsui-beatlines", { coloredodds: true } ),
			GSUcreateDiv( { class: "gsuiSliderGroup-currentTime" } ),
			GSUcreateDiv( { class: "gsuiSliderGroup-defaultValue" } ),
			GSUcreateDiv( { class: "gsuiSliderGroup-loop gsuiSliderGroup-loopA" } ),
			GSUcreateDiv( { class: "gsuiSliderGroup-loop gsuiSliderGroup-loopB" } ),
		),
	)
);

GSUsetTemplate( "gsui-slidergroup-slider", () =>
	GSUcreateDiv( { class: "gsuiSliderGroup-slider" },
		GSUcreateDiv( { class: "gsuiSliderGroup-sliderInner" } ),
	)
);
