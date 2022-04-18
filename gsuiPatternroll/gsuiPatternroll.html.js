"use strict";

GSUI.setTemplate( "gsui-patternroll-block", () =>
	GSUI.createElem( "div", { class: "gsuiBlocksManager-block gsuiPatternroll-block", "data-action": "move" },
		GSUI.createElem( "div", { class: "gsuiBlocksManager-block-crop gsuiBlocksManager-block-cropA", "data-action": "cropA" } ),
		GSUI.createElem( "div", { class: "gsuiBlocksManager-block-crop gsuiBlocksManager-block-cropB", "data-action": "cropB" } ),
		GSUI.createElem( "div", { class: "gsuiPatternroll-block-header" },
			GSUI.createElem( "span", { class: "gsuiPatternroll-block-name" } ),
		),
		GSUI.createElem( "div", { class: "gsuiPatternroll-block-content" } ),
		GSUI.createElem( "div", { class: "gsuiPatternroll-block-placeholder" },
			GSUI.createElem( "i", { class: "gsuiPatternroll-block-placeholderIcon gsuiIcon", "data-icon": "file-corrupt" } ),
			GSUI.createElem( "span", { class: "gsuiPatternroll-block-placeholderText" }, "missing data" ),
		),
	)
);
