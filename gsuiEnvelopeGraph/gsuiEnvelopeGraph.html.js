"use strict";

GSUsetTemplate( "gsui-envelope-graph", () =>
	GSUcreateElementSVG( "svg", { preserveAspectRatio: "none" },
		GSUcreateElementSVG( "polyline", { class: "gsuiEnvelopeGraph-mainLine" } ),
		GSUcreateElementSVG( "polyline", { class: "gsuiEnvelopeGraph-line" } ),
		GSUcreateElementSVG( "polyline", { class: "gsuiEnvelopeGraph-line" } ),
	)
);
