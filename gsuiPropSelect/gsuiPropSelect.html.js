"use strict";

GSUsetTemplate( "gsui-prop-select", () =>
	GSUcreateElement( "form", { class: "gsuiPropSelect-form" } )
);

GSUsetTemplate( "gsui-prop-select-btn", ( prop, txt ) =>
	GSUcreateLabel( { class: "gsuiPropSelect-btn", "data-prop": prop, tabindex: 0 },
		GSUcreateInput( { class: "gsuiPropSelect-btn-radio", type: "radio", name: "prop", value: prop } ),
		GSUcreateSpan( { class: "gsuiPropSelect-btn-span", "data-label": txt || prop, inert: true } ),
	)
);
