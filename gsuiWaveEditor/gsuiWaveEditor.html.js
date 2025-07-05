"use strict";

GSUsetTemplate( "gsui-wave-editor", () =>
	GSUcreateFlex( { class: "gsuiWaveEditor-in", x: true, f1: true },
		GSUcreateFlex( { class: "gsuiWaveEditor-menu", y: true, g6: true },
			GSUcreateButton( { class: "gsuiWaveEditor-reset" }, "reset" ),
			GSUcreateButton( { class: "gsuiWaveEditor-symmetry", icon: "arrows-h2", title: "Toggle symmetry" } ),
			GSUcreateFlex( { class: "gsuiWaveEditor-tools", x: true },
				GSUgetTemplate( "gsui-wave-editor-tool-btn", "goUp",     [ [ 2, 8 ], [ 8,   2    ] ] ),
				GSUgetTemplate( "gsui-wave-editor-tool-btn", "goDown",   [ [ 2, 2 ], [ 8,   8    ] ] ),
				GSUgetTemplate( "gsui-wave-editor-tool-btn", "stayUp",   [ [ 2, 3 ], [ 8,   3    ] ] ),
				GSUgetTemplate( "gsui-wave-editor-tool-btn", "stayDown", [ [ 2, 7 ], [ 8,   7    ] ] ),
				GSUgetTemplate( "gsui-wave-editor-tool-btn", "hillUp",   [ [ 2, 8 ], [ 3,   4    ], [ 4,   2.5  ], [ 5,   2    ], [ 6,   2.5  ], [ 7, 4 ], [ 8, 8   ] ] ),
				GSUgetTemplate( "gsui-wave-editor-tool-btn", "hillDown", [ [ 2, 2 ], [ 3,   6    ], [ 4,   7.5  ], [ 5,   8    ], [ 6,   7.5  ], [ 7, 6 ], [ 8, 2   ] ] ),
				GSUgetTemplate( "gsui-wave-editor-tool-btn", "sineUp",   [ [ 2, 5 ], [ 3,   2.5  ], [ 4,   2    ], [ 4.5, 2.5  ], [ 5.5, 7.5  ], [ 6, 8 ], [ 7, 7.5 ], [ 8, 5 ] ] ),
				GSUgetTemplate( "gsui-wave-editor-tool-btn", "sineDown", [ [ 2, 5 ], [ 3,   7.5  ], [ 4,   8    ], [ 4.5, 7.5  ], [ 5.5, 2.5  ], [ 6, 2 ], [ 7, 2.5 ], [ 8, 5 ] ] ),
				GSUgetTemplate( "gsui-wave-editor-tool-btn", "easeUp",   [ [ 2, 8 ], [ 3.5, 7.75 ], [ 4.5, 7.25 ], [ 5.5, 2.75 ], [ 6.5, 2.25 ], [ 8, 2 ] ] ),
				GSUgetTemplate( "gsui-wave-editor-tool-btn", "easeDown", [ [ 2, 2 ], [ 3.5, 2.25 ], [ 4.5, 2.75 ], [ 5.5, 7.25 ], [ 6.5, 7.75 ], [ 8, 8 ] ] ),
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

GSUsetTemplate( "gsui-wave-editor-tool-btn", ( tool, pts ) =>
	GSUcreateButton( { "data-tool": tool },
		GSUcreateElementSVG( "svg", { viewBox: "0 0 10 10", preserveAspectRatio: "none", inert: true },
			GSUcreateElementSVG( "polyline", { points: pts.join( " " ) } ),
		),
	),
);

GSUsetTemplate( "gsui-wave-editor-gridSize", dir =>
	GSUcreateFlex( { class: "gsuiWaveEditor-gridSize", dir, y: true, xcenter: true, g2: true },
		GSUcreateFlex( { x: true, ycenter: true, g6: true },
			GSUcreateSpan(),
			GSUcreateIcon( { icon: dir === "x" ? "arrows-h" : "arrows-v" } ),
		),
		GSUcreateElement( "gsui-slider", { type: "linear-x", min: 1, max: 64, step: 1, "mousemove-size": 2000 } ),
	),
);
