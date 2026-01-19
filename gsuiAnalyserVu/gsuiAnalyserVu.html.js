"use strict";

GSUsetTemplate( "gsui-analyser-vu", () => [
	GSUgetTemplate( "gsui-analyser-vu-meter", { chan: "L" } ),
	GSUgetTemplate( "gsui-analyser-vu-meter", { chan: "R" } ),
] );

GSUsetTemplate( "gsui-analyser-vu-meter", p =>
	GSUcreateDiv( { class: "gsuiAnalyserVu-meter", "data-chan": p.chan, inert: true },
		GSUcreateDiv( { class: "gsuiAnalyserVu-meter-val" },
			GSUcreateDiv(),
		),
		GSUcreateDiv( { class: "gsuiAnalyserVu-meter-tick" } ),
		GSUcreateDiv( { class: "gsuiAnalyserVu-meter-0dB" } ),
	),
);
