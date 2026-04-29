"use strict";

GSUsetTemplate( "gsui-analyser-vu", () => [
	GSUgetTemplate( "gsui-analyser-vu-meter", { chan: "L" } ),
	GSUgetTemplate( "gsui-analyser-vu-meter", { chan: "R" } ),
] );

GSUsetTemplate( "gsui-analyser-vu-meter", p =>
	$.$div( { class: "gsuiAnalyserVu-meter", "data-chan": p.chan, inert: true },
		$.$div( { class: "gsuiAnalyserVu-meter-val" },
			$.$div(),
		),
		$.$div( { class: "gsuiAnalyserVu-meter-tick" } ),
		$.$div( { class: "gsuiAnalyserVu-meter-0dB" } ),
	),
);
