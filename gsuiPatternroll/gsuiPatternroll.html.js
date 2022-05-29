"use strict";

GSUI.$setTemplate( "gsui-patternroll-block", () =>
	GSUI.$createElement( "div", { class: "gsuiBlocksManager-block gsuiPatternroll-block", "data-action": "move" },
		GSUI.$createElement( "div", { class: "gsuiBlocksManager-block-crop gsuiBlocksManager-block-cropA", "data-action": "cropA" } ),
		GSUI.$createElement( "div", { class: "gsuiBlocksManager-block-crop gsuiBlocksManager-block-cropB", "data-action": "cropB" } ),
		GSUI.$createElement( "div", { class: "gsuiPatternroll-block-header" },
			GSUI.$createElement( "span", { class: "gsuiPatternroll-block-name" } ),
		),
		GSUI.$createElement( "div", { class: "gsuiPatternroll-block-content" } ),
		GSUI.$createElement( "div", { class: "gsuiPatternroll-block-placeholder" },
			GSUI.$createElement( "i", { class: "gsuiPatternroll-block-placeholderIcon gsuiIcon", "data-icon": "file-corrupt" } ),
			GSUI.$createElement( "span", { class: "gsuiPatternroll-block-placeholderText" }, "missing data" ),
		),
	)
);
