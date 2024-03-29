"use strict";

GSUsetTemplate( "gsui-daw-popup-about", () =>
	GSUcreateDiv( { class: "gsuiDAW-popup-about" },
		GSUcreateDiv( { class: "gsuiDAW-popup-about-head" },
			GSUcreateSpan( { class: "gsuiDAW-popup-about-title" }, "GridSound" ),
			GSUcreateSpan( { class: "gsuiDAW-popup-about-versionNum" } ),
			GSUcreateI( { class: "gsuiIcon" } ),
			GSUcreateButton( { class: "gsuiDAW-popup-about-versionCheck" }, "check the version" ),
		),
		GSUcreateDiv( null,
			"GridSound is a ",
			GSUcreateElement( "b", null, "work-in-progress" ),
			" free browser-based digital audio workstation following the ",
			GSUcreateAExt( { href: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API" }, "Web Audio API" ),
			".",
		),
		GSUcreateDiv( null,
			"You can create an account (by clicking ", GSUcreateI( { class: "gsuiIcon", "data-icon": "profile" } ),
			") and start uploading your compositions online ", GSUcreateI( { class: "gsuiIcon", "data-icon": "cloud" } ),
		),
		GSUcreateDiv( { class: "gsuiDAW-popup-about-links" },
			GSUcreateAExt( { title: "GitHub",   class: "gsuiIcon gsuiIconB", "data-icon": "github",   href: "https://github.com/gridsound" } ),
			GSUcreateAExt( { title: "Twitter",  class: "gsuiIcon gsuiIconB", "data-icon": "twitter",  href: "https://twitter.com/gridsound" } ),
			GSUcreateAExt( { title: "YouTube",  class: "gsuiIcon gsuiIconB", "data-icon": "youtube",  href: "https://youtube.com/@gridsound" } ),
			GSUcreateAExt( { title: "Facebook", class: "gsuiIcon gsuiIconB", "data-icon": "facebook", href: "https://facebook.com/gridsound" } ),
			GSUcreateAExt( { title: "CodePen",  class: "gsuiIcon gsuiIconB", "data-icon": "codepen",  href: "https://codepen.io/gridsound" } ),
			GSUcreateAExt( { title: "Discord",  class: "gsuiIcon gsuiIconB", "data-icon": "discord",  href: "https://discord.gg/NUYxHAg" } ),
		),
	)
);
