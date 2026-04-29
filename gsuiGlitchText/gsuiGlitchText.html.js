"use strict";

GSUsetTemplate( "gsui-glitchtext", () => [
	GSUgetTemplate( "gsui-glitchtext-layer" ),
	GSUgetTemplate( "gsui-glitchtext-layer" ),
	GSUgetTemplate( "gsui-glitchtext-layer" ),
] );

GSUsetTemplate( "gsui-glitchtext-layer", () =>
	$.$div( { class: "gsuiGlitchText-clip" },
		$.$div( { class: "gsuiGlitchText-word" } ),
		$.$div( { class: "gsuiGlitchText-word gsuiGlitchText-blend gsuiGlitchText-blendA" } ),
		$.$div( { class: "gsuiGlitchText-word gsuiGlitchText-blend gsuiGlitchText-blendB" } ),
	)
);
