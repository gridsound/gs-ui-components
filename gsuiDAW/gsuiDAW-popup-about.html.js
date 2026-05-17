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
			$.$linkExt( { "data-tooltip": "GitHub",   class: "gsuiIcon", "data-icon": "br-github",   href: "https://github.com/gridsound" } ),
			$.$linkExt( { "data-tooltip": "Bluesky",  class: "gsuiIcon", "data-icon": "br-bluesky",  href: "https://bsky.app/profile/gridsound.com" } ),
			$.$linkExt( { "data-tooltip": "YouTube",  class: "gsuiIcon", "data-icon": "br-youtube",  href: "https://youtube.com/@gridsound" } ),
			$.$linkExt( { "data-tooltip": "Facebook", class: "gsuiIcon", "data-icon": "br-facebook", href: "https://facebook.com/gridsound" } ),
			$.$linkExt( { "data-tooltip": "CodePen",  class: "gsuiIcon", "data-icon": "br-codepen",  href: "https://codepen.io/gridsound" } ),
			$.$linkExt( { "data-tooltip": "Discord",  class: "gsuiIcon", "data-icon": "br-discord",  href: "https://discord.gg/NUYxHAg" } ),
		),
	)
);
