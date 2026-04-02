"use strict";

GSUsetTemplate( "gsui-patternroll-block", () =>
	GSUcreateDiv( { class: "gsuiBlocksManager-block gsuiPatternroll-block", "data-action": "move" },
		GSUcreateDiv( { "data-action": "cropA" } ),
		GSUcreateDiv( { "data-action": "cropB" } ),
		GSUcreateDiv( { class: "gsuiPatternroll-block-header" },
			GSUcreateSpan( { class: "gsuiPatternroll-block-name" } ),
		),
		GSUcreateDiv( { class: "gsuiPatternroll-block-content" } ),
	)
);
