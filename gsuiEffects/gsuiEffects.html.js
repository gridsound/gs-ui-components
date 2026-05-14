"use strict";

let gsuiEffects_count = 0;

$.$setTemplate( "gsui-effects", () => {
	const popId = `gsuiEffects_count_${ ++gsuiEffects_count }`;

	return [
		$.$button( { class: "gsuiEffects-addBtn", popovertarget: popId, "data-tooltip": GSTX.$effects_add },
			$.$icon( { icon: "add-effect" } ),
		),
		$.$div( { class: "gsuiEffects-addList", id: popId, popover: true },
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
