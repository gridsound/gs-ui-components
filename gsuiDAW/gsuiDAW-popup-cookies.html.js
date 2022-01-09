"use strict";

GSUI.setTemplate( "gsui-daw-popup-cookies", () => (
	GSUI.createElement( "div", { class: "gsuiDAW-popup-cookies" },
		GSUI.createElement( "fieldset", null,
			GSUI.createElement( "legend", null, "Render the current composition" ),
			GSUI.createElement( "div", null,
				GSUI.createElement( "span", null, "Do you accept to let GridSound using Cookies to offers you 3 features :" ),
				GSUI.createElement( "ul", null,
					GSUI.createElement( "li", null, "Saving compositions locally (localStorage)" ),
					GSUI.createElement( "li", null, "Offline mode (serviceWorker)" ),
					GSUI.createElement( "li", null, "Connection to GridSound's server" ),
				),
				GSUI.createElement( "span", null, "There is no tracker or adverts of any kind on this app." ),
			),
		),
	)
) );
