"use strict";

GSUsetTemplate( "gsui-glitchtext", () => [
	GSUgetTemplate( "gsui-glitchtext-layer" ),
	GSUgetTemplate( "gsui-glitchtext-layer" ),
	GSUgetTemplate( "gsui-glitchtext-layer" ),
] );

GSUsetTemplate( "gsui-glitchtext-layer", () =>
	GSUcreateDiv( { class: "gsuiGlitchText-clip" },
		GSUcreateDiv( { class: "gsuiGlitchText-word" } ),
		GSUcreateDiv( { class: "gsuiGlitchText-word gsuiGlitchText-blend gsuiGlitchText-blendA" } ),
		GSUcreateDiv( { class: "gsuiGlitchText-word gsuiGlitchText-blend gsuiGlitchText-blendB" } ),
	)
);
