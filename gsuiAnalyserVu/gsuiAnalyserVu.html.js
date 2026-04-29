"use strict";

$.$setTemplate( "gsui-analyser-vu", () => [
	$.$getTemplate( "gsui-analyser-vu-meter", { chan: "L" } ),
	$.$getTemplate( "gsui-analyser-vu-meter", { chan: "R" } ),
] );

$.$setTemplate( "gsui-analyser-vu-meter", p =>
	$.$div( { class: "gsuiAnalyserVu-meter", "data-chan": p.chan, inert: true },
		$.$div( { class: "gsuiAnalyserVu-meter-val" },
			$.$div(),
		),
		$.$div( { class: "gsuiAnalyserVu-meter-tick" } ),
		$.$div( { class: "gsuiAnalyserVu-meter-0dB" } ),
	),
);
