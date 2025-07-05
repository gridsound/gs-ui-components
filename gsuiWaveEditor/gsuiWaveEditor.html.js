"use strict";

GSUsetTemplate( "gsui-wave-editor", () =>
	GSUcreateFlex( { class: "gsuiWaveEditor-in", x: true, f1: true, g6: true },
		GSUcreateFlex( { class: "gsuiWaveEditor-menu", y: true, g6: true },
			GSUcreateFlex( { class: "gsuiWaveEditor-tools", y: true, g2: true },
				GSUgetTemplate( "gsui-wave-editor-tool-btn", "goUp",   "2,8 8,2" ),
				GSUgetTemplate( "gsui-wave-editor-tool-btn", "goDown", "2,2 8,8" ),
				GSUgetTemplate( "gsui-wave-editor-tool-btn", "stayUp",   "2,3 8,3" ),
				GSUgetTemplate( "gsui-wave-editor-tool-btn", "stayDown", "2,7 8,7" ),
			),
			GSUgetTemplate( "gsui-wave-editor-gridSize", "x" ),
			GSUgetTemplate( "gsui-wave-editor-gridSize", "y" ),
		),
		GSUcreateFlex( { class: "gsuiWaveEditor-wave", x: true, f1: true },
			GSUcreateElement( "gsui-beatlines", { dir: "x", timedivision: "1/1" } ),
			GSUcreateElement( "gsui-beatlines", { dir: "y", timedivision: "1/1", vertical: true } ),
			GSUcreateElementSVG( "svg", { viewBox: "0 0 5 5", preserveAspectRatio: "none", inert: true },
				GSUcreateElementSVG( "polyline" ),
			),
			GSUcreateDiv( { class: "gsuiWaveEditor-wave-hover-square", inert: true } ),
		),
	),
);

GSUsetTemplate( "gsui-wave-editor-tool-btn", ( tool, points ) =>
	GSUcreateButton( { "data-tool": tool },
		GSUcreateElementSVG( "svg", { viewBox: "0 0 10 10", preserveAspectRatio: "none", inert: true },
			GSUcreateElementSVG( "polyline", { points } ),
		),
	),
);

GSUsetTemplate( "gsui-wave-editor-gridSize", dir =>
	GSUcreateFlex( { class: "gsuiWaveEditor-gridSize", dir, y: true, xcenter: true, g2: true },
		GSUcreateFlex( { x: true, ycenter: true, g2: true },
			GSUcreateSpan(),
			GSUcreateIcon( { icon: dir === "x" ? "arrows-h" : "arrows-v" } ),
		),
		GSUcreateElement( "gsui-slider", { type: "linear-x", min: 1, max: 64, step: 1, "mousemove-size": 2000 } ),
	),
);
