"use strict";

GSUsetTemplate( "gsui-prop-select", () =>
	GSUcreateElement( "form", { class: "gsuiPropSelect-form" },
		GSUgetTemplate( "gsui-prop-select-btn", "detune", "pitch" ),
		GSUgetTemplate( "gsui-prop-select-btn", "pan", "pan" ),
		GSUgetTemplate( "gsui-prop-select-btn", "gain", "gain" ),
	)
);

GSUsetTemplate( "gsui-prop-select-btn", ( prop, txt ) =>
	GSUcreateLabel( { class: "gsuiPropSelect-btn", "data-prop": prop, tabindex: 0 },
		GSUcreateInput( { class: "gsuiPropSelect-btn-radio", type: "radio", name: "prop", value: prop } ),
		GSUcreateSpan( { class: "gsuiPropSelect-btn-span", "data-label": txt, inert: true } ),
	)
);
