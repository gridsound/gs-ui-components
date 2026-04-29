"use strict";

$.$setTemplate( "gsui-glitchtext", () => [
	$.$getTemplate( "gsui-glitchtext-layer" ),
	$.$getTemplate( "gsui-glitchtext-layer" ),
	$.$getTemplate( "gsui-glitchtext-layer" ),
] );

$.$setTemplate( "gsui-glitchtext-layer", () =>
	$.$div( { class: "gsuiGlitchText-clip" },
		$.$div( { class: "gsuiGlitchText-word" } ),
		$.$div( { class: "gsuiGlitchText-word gsuiGlitchText-blend gsuiGlitchText-blendA" } ),
		$.$div( { class: "gsuiGlitchText-word gsuiGlitchText-blend gsuiGlitchText-blendB" } ),
	)
);
