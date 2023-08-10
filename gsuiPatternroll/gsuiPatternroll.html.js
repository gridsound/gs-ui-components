"use strict";

GSUsetTemplate( "gsui-patternroll-block", () =>
	GSUcreateElement( "div", { class: "gsuiBlocksManager-block gsuiPatternroll-block", "data-action": "move" },
		GSUcreateElement( "div", { class: "gsuiBlocksManager-block-crop gsuiBlocksManager-block-cropA", "data-action": "cropA" } ),
		GSUcreateElement( "div", { class: "gsuiBlocksManager-block-crop gsuiBlocksManager-block-cropB", "data-action": "cropB" } ),
		GSUcreateElement( "div", { class: "gsuiPatternroll-block-header" },
			GSUcreateElement( "span", { class: "gsuiPatternroll-block-name" } ),
		),
		GSUcreateElement( "div", { class: "gsuiPatternroll-block-content" } ),
		GSUcreateElement( "div", { class: "gsuiPatternroll-block-placeholder" },
			GSUcreateElement( "i", { class: "gsuiPatternroll-block-placeholderIcon gsuiIcon", "data-icon": "file-corrupt" } ),
			GSUcreateElement( "span", { class: "gsuiPatternroll-block-placeholderText" }, "missing data" ),
		),
	)
);
