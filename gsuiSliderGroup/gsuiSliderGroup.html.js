"use strict";

GSUsetTemplate( "gsui-slidergroup", () =>
	$.$div( { class: "gsuiSliderGroup-slidersWrap" },
		$.$div( { class: "gsuiSliderGroup-sliders" },
			$.$elem( "gsui-beatlines", { coloredodds: true } ),
			$.$div( { class: "gsuiSliderGroup-currentTime" } ),
			$.$div( { class: "gsuiSliderGroup-defaultValue" } ),
			$.$div( { class: "gsuiSliderGroup-loop gsuiSliderGroup-loopA" } ),
			$.$div( { class: "gsuiSliderGroup-loop gsuiSliderGroup-loopB" } ),
		),
	)
);

GSUsetTemplate( "gsui-slidergroup-slider", () =>
	$.$div( { class: "gsuiSliderGroup-slider" },
		$.$div( { class: "gsuiSliderGroup-sliderInner", inert: true } ),
	)
);
