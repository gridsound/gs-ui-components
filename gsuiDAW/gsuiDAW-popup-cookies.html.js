"use strict";

GSUI.setTemplate( "gsui-daw-popup-cookies", () =>
	GSUI.createElem( "div", { class: "gsuiDAW-popup-cookies" },
		GSUI.createElem( "fieldset", null,
			GSUI.createElem( "legend", null, "Render the current composition" ),
			GSUI.createElem( "div", null,
				GSUI.createElem( "span", null, "Do you accept to let GridSound using Cookies to offers you 3 features :" ),
				GSUI.createElem( "ul", null,
					GSUI.createElem( "li", null, "Saving compositions locally (localStorage)" ),
					GSUI.createElem( "li", null, "Offline mode (serviceWorker)" ),
					GSUI.createElem( "li", null, "Connection to GridSound's server" ),
				),
				GSUI.createElem( "span", null, "There is no tracker or adverts of any kind on this app." ),
			),
		),
	)
);
