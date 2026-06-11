"use strict";

$.$setTemplate( "gsui-com-player", () => {
	const popId = GSUuuid();

	return [
		$.$elem( "audio", { loop: true } ),
		$.$button( { class: "gsuiComPlayer-btn gsuiComPlayer-play", icon: "play" } ),
		$.$div( { class: "gsuiComPlayer-body" },
			$.$div( { class: "gsuiComPlayer-text" },
				$.$div( { class: "gsuiComPlayer-name" },
					$.$icon( { icon: "private", inert: false, "data-tooltip": GSTX.$player_isPrivate } ),
					$.$icon( { icon: "opensource", inert: false, "data-tooltip": GSTX.$player_isOpensource } ),
					$.$link( { class: "gsuiComPlayer-nameLink", href: false } ),
				),
				$.$div( { class: "gsuiComPlayer-info-wrap" },
					$.$div( { class: "gsuiComPlayer-info" },
						$.$div( { class: "gsuiComPlayer-time" },
							$.$icon( { icon: "clock" } ),
							$.$span( { class: "gsuiComPlayer-currentTime" } ),
							$.$span( { class: "gsuiComPlayer-duration" } ),
						),
						$.$div( { class: "gsuiComPlayer-tempo" },
							$.$icon( { icon: "speed" } ),
							$.$span( { class: "gsuiComPlayer-bpm" } ),
						),
					),
				),
			),
			$.$div( { class: "gsuiComPlayer-slider" },
				$.$div(),
			),
		),
		$.$linkExt( { class: "gsuiComPlayer-btn gsuiComPlayer-dawlink gsuiIcon", "data-icon": "cu-music-spark", "data-tooltip": GSTX.$player_openInDAW, href: false } ),
		$.$button( { class: "gsuiComPlayer-btn gsuiComPlayer-like" },
			$.$icon( { icon: "cu-heart-stroke" } ),
			$.$icon( { icon: "heart" } ),
			$.$span(),
		),
		$.$button( { class: "gsuiComPlayer-btn gsuiComPlayer-actions", popovertarget: popId, icon: "ellipsis-v" } ),
		$.$div( { class: "gsuiComPlayer-actions-pop", id: popId, popover: true } ),
	];
} );
