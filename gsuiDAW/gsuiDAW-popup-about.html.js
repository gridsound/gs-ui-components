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
			$.$linkExt( { "data-tooltip": "GitHub",   href: "https://github.com/gridsound"           }, $.$icon( { icon: "br-github"   } ) ),
			$.$linkExt( { "data-tooltip": "Bluesky",  href: "https://bsky.app/profile/gridsound.com" }, $.$icon( { icon: "br-bluesky"  } ) ),
			$.$linkExt( { "data-tooltip": "YouTube",  href: "https://youtube.com/@gridsound"         }, $.$icon( { icon: "br-youtube"  } ) ),
			$.$linkExt( { "data-tooltip": "Facebook", href: "https://facebook.com/gridsound"         }, $.$icon( { icon: "br-facebook" } ) ),
			$.$linkExt( { "data-tooltip": "CodePen",  href: "https://codepen.io/gridsound"           }, $.$icon( { icon: "br-codepen"  } ) ),
			$.$linkExt( { "data-tooltip": "Discord",  href: "https://discord.gg/NUYxHAg"             }, $.$icon( { icon: "br-discord"  } ) ),
		),
	)
);
