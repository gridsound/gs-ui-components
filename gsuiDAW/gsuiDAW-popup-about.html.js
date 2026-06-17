"use strict";

$.$setTemplate( "gsui-daw-popup-about", () =>
	$.$div( { class: "gsuiDAW-popup-about" },
		$.$div( { class: "gsuiDAW-popup-about-head" },
			$.$span( { class: "gsuiDAW-popup-about-title" } ),
			$.$span( { class: "gsuiDAW-popup-about-versionNum" } ),
			$.$icon( null ),
			$.$button( { class: "gsuiDAW-popup-about-versionCheck" }, GSTX.$checkVersion ),
		),
		$.$div( null, $.$simpleStringHTML( GSTX.$about_gridsound ) ),
		$.$div( null, $.$simpleStringHTML( GSTX.$about_gridsound2 ) ),
		$.$div( { class: "gsuiDAW-popup-about-links" },
			$.$linkExt( { "data-tooltip": "GitHub",   href: GSURL.$github   }, $.$icon( { icon: "br-github"   } ) ),
			$.$linkExt( { "data-tooltip": "Bluesky",  href: GSURL.$bluesky  }, $.$icon( { icon: "br-bluesky"  } ) ),
			$.$linkExt( { "data-tooltip": "YouTube",  href: GSURL.$youtube  }, $.$icon( { icon: "br-youtube"  } ) ),
			$.$linkExt( { "data-tooltip": "Facebook", href: GSURL.$facebook }, $.$icon( { icon: "br-facebook" } ) ),
			$.$linkExt( { "data-tooltip": "CodePen",  href: GSURL.$codepen  }, $.$icon( { icon: "br-codepen"  } ) ),
			$.$linkExt( { "data-tooltip": "Discord",  href: GSURL.$discord  }, $.$icon( { icon: "br-discord"  } ) ),
		),
	)
);
