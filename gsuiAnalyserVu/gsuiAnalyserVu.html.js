"use strict";

$.$setTemplate( "gsui-analyser-vu", () => [
	$.$getTemplate( "gsui-analyser-vu-meter", { chan: "L" } ),
	$.$getTemplate( "gsui-analyser-vu-meter", { chan: "R" } ),
] );

$.$setTemplate( "gsui-analyser-vu-meter", p =>
	$.$elem( "gsui-analyser-vu-meter", { "data-chan": p.chan, inert: true },
		$.$elem( "gsui-analyser-vu-val", null,
			$.$div(),
		),
		$.$elem( "gsui-analyser-vu-tick" ),
		$.$elem( "gsui-analyser-vu-0db" ),
	),
);
