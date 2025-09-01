"use strict";

GSUsetTemplate( "gsui-envelope-graph", () =>
	GSUcreateElement( "svg", { preserveAspectRatio: "none" },
		GSUcreateElement( "polyline", { class: "gsuiEnvelopeGraph-mainLine" } ),
		GSUcreateElement( "polyline", { class: "gsuiEnvelopeGraph-line" } ),
		GSUcreateElement( "polyline", { class: "gsuiEnvelopeGraph-line" } ),
	)
);
