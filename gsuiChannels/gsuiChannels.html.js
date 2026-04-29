"use strict";

GSUsetTemplate( "gsui-channels", () => [
	$.$div( { class: "gsuiChannels-panMain" },
		$.$elem( "gsui-analyser-vu", { max: 120, title: "current channel's VU (max 120%)" } ),
	),
	$.$div( { class: "gsuiChannels-panChannels" },
		$.$button( { class: "gsuiChannels-addChan", title: "Add a channel" },
			$.$icon( { icon: "channels" } ),
			$.$icon( { icon: "plus" } ),
		),
	),
] );

GSUsetTemplate( "gsui-channels-selectPopup", () =>
	$.$div( null,
		$.$elem( "fieldset", null,
			$.$elem( "legend", null, "Select a channel" ),
			$.$select( { name: "channel", size: 8, style: "height:146px" } ),
		),
	)
);
