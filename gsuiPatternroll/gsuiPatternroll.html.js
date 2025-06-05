"use strict";

GSUsetTemplate( "gsui-patternroll-block", () =>
	GSUcreateDiv( { class: "gsuiBlocksManager-block gsuiPatternroll-block", "data-action": "move" },
		GSUcreateDiv( { class: "gsuiBlocksManager-block-crop gsuiBlocksManager-block-cropA", "data-action": "cropA" } ),
		GSUcreateDiv( { class: "gsuiBlocksManager-block-crop gsuiBlocksManager-block-cropB", "data-action": "cropB" } ),
		GSUcreateDiv( { class: "gsuiPatternroll-block-header" },
			GSUcreateSpan( { class: "gsuiPatternroll-block-name" } ),
		),
		GSUcreateDiv( { class: "gsuiPatternroll-block-content" } ),
		GSUcreateDiv( { class: "gsuiPatternroll-block-placeholder" },
			GSUcreateIcon( { class: "gsuiPatternroll-block-placeholderIcon", icon: "file-corrupt" } ),
			GSUcreateSpan( { class: "gsuiPatternroll-block-placeholderText" }, "missing data" ),
		),
	)
);
