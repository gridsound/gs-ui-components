"use strict";

$.$setTemplate( "gsui-effects", () => {
	const popId = GSUuuid();

	return [
		$.$button( { popovertarget: popId, "data-tooltip": GSTX.$effects_add },
			$.$icon( { icon: "add-effect" } ),
		),
		$.$elem( "gsui-effects-poplist", { id: popId, popover: true },
			[
				[ "filter",     "Filter",     "LowPass, HighPass, BandPass, LowShelf, etc." ],
				[ "delay",      "Delay",      "Echo, left/right ping-pong" ],
				[ "reverb",     "Reverb",     "Convolution reverberation" ],
				[ "waveshaper", "WaveShaper", "Distortion" ],
			].map( fx => $.$button( { "data-prop": fx[ 0 ] },
				$.$bold( { inert: true }, fx[ 1 ] ),
				$.$span( { inert: true }, fx[ 2 ] ),
			) ),
		),
	];
} );
