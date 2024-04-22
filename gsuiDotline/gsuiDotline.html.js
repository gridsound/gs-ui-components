"use strict";

GSUsetTemplate( "gsui-dotline", () => (
	GSUcreateDiv( { class: "gsuiDotline-padding" },
		GSUcreateElementSVG( "svg", { preserveAspectRatio: "none" },
			GSUcreateElementSVG( "path" ),
		),
	)
) );
