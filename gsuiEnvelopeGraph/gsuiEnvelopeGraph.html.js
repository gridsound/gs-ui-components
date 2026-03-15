"use strict";

GSUsetTemplate( "gsui-envelope-graph", () =>
	GSUcreateElement( "svg", { preserveAspectRatio: "none" },
		GSUcreateElement( "polyline" ),
		GSUcreateElement( "polyline" ),
		GSUcreateElement( "polyline" ),
	)
);
