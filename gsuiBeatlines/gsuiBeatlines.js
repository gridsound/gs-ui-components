"use strict";

class gsuiBeatlines extends gsui0ne {
	constructor() {
		super( {
			$cmpName: "gsuiBeatlines",
			$tagName: "gsui-beatlines",
			$attributes: {
				timedivision: "4/4",
				coloredbeats: true,
				pxperbeat: 10,
			},
		} );
	}
	static get observedAttributes() {
		return [ "timedivision", "pxperbeat" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "timedivision":
				GSUdomStyle( this, {
					"--gsui-bPM": `${ val.split( "/" )[ 0 ] }em`,
					"--gsui-sPB": `${ 1 / val.split( "/" )[ 1 ] }em`,
				} );
				break;
			case "pxperbeat":
				GSUdomStyle( this, {
					fontSize: `${ val }px`,
					opacity: Math.min( val / 48, 1 ),
				} );
				break;
		}
	}
}

GSUdomDefine( "gsui-beatlines", gsuiBeatlines );
