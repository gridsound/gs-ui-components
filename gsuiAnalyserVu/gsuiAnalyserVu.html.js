"use strict";

GSUsetTemplate( "gsui-analyser-vu", () => [
	GSUcreateDiv( { class: "gsuiAnalyserVu-meter", "data-chan": "L" },
		GSUcreateDiv( { class: "gsuiAnalyserVu-meter-val" },
			GSUcreateDiv( { class: "gsuiAnalyserVu-meter-val-max" } ),
		),
		GSUcreateDiv( { class: "gsuiAnalyserVu-meter-tick" } ),
		GSUcreateDiv( { class: "gsuiAnalyserVu-meter-0dB" } ),
	),
	GSUcreateDiv( { class: "gsuiAnalyserVu-meter", "data-chan": "R" },
		GSUcreateDiv( { class: "gsuiAnalyserVu-meter-val" },
			GSUcreateDiv( { class: "gsuiAnalyserVu-meter-val-max" } ),
		),
		GSUcreateDiv( { class: "gsuiAnalyserVu-meter-tick" } ),
		GSUcreateDiv( { class: "gsuiAnalyserVu-meter-0dB" } ),
	),
] );
