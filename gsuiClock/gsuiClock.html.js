"use strict";

$.$setTemplate( "gsui-clock", () => [
	$.$div( { inert: true },
		$.$div( null,
			$.$span(),
			$.$span(),
			$.$span(),
			$.$span(),
		),
	),
	$.$button( { "data-tooltip": GSTX.$clock_switch },
		$.$div( { inert: true } ),
		$.$div( { inert: true } ),
	),
] );
