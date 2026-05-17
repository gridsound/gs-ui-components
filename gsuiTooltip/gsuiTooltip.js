"use strict";

class gsuiTooltip {
	static #elOver = $noop;
	static #elAnchor = $noop;
	static #popover = $noop;
	static #delayOut = 0;
	static #currText = null;
	static #timeoutHide = null;
	static #timeoutShow = null;
	static #intervalWatch = null;
	static #anchorName = "--gsuiTooltip-pop";
	static #fallbacks = Object.freeze( {
		top: "bottom",
		bottom: "top",
		left: "right",
		right: "left",
	} );

	static $start() {
		if ( !gsuiTooltip.#popover.$size() ) {
			gsuiTooltip.#popover = $( $.$div( { class: "gsuiTooltip", popover: "manual" } ) );
			$body.$append( gsuiTooltip.#popover )
				.$addEventListener( "mouseover", gsuiTooltip.#mouseover );
		}
	}
	static $stop() {
		gsuiTooltip.#popover.$remove();
		gsuiTooltip.#popover =
		gsuiTooltip.#elOver =
		gsuiTooltip.#elAnchor = $noop;
		$body.$rmEventListener( "mouseover", gsuiTooltip.#mouseover );
		GSUclearTimeout( gsuiTooltip.#timeoutShow );
		GSUclearTimeout( gsuiTooltip.#timeoutHide );
		GSUclearInterval( gsuiTooltip.#intervalWatch );
		gsuiTooltip.#currText =
		gsuiTooltip.#timeoutShow =
		gsuiTooltip.#timeoutHide =
		gsuiTooltip.#intervalWatch = null;
	}
	static #mouseover( e ) {
		const tar = $( e.target );

		GSUclearTimeout( gsuiTooltip.#timeoutShow );
		GSUclearInterval( gsuiTooltip.#intervalWatch );
		gsuiTooltip.#elOver = tar;
		gsuiTooltip.#timeoutShow = null;
		gsuiTooltip.#timeoutHide ||= GSUsetTimeout( gsuiTooltip.#hide, gsuiTooltip.#delayOut );
		if ( tar.$dataset( "tooltip" )?.trim() ) {
			const delA = parseFloat( tar.$css( "--gsuiTooltip-delayIn" ) ) || 0;
			const delB = parseFloat( tar.$css( "--gsuiTooltip-delayOut" ) ) || 0;

			GSUclearTimeout( gsuiTooltip.#timeoutHide );
			gsuiTooltip.#timeoutHide = null;
			gsuiTooltip.#delayOut = delB;
			gsuiTooltip.#timeoutShow = GSUsetTimeout( gsuiTooltip.#show.bind( null, tar ), delA );
		}
	}
	static #hide() {
		gsuiTooltip.#timeoutHide = null;
		if ( !gsuiTooltip.#popover.$contains( gsuiTooltip.#elOver ) ) {
			gsuiTooltip.#popover.$togglePopover( false ).$empty();
			gsuiTooltip.#setAnchor( $noop );
			gsuiTooltip.#elOver = $noop;
			gsuiTooltip.#currText = null;
		}
	}
	static #getElemAnchor( el ) {
		return ( $.$css( el, "anchor-name" ) || "" ).split( ", " ).filter( a => a !== "none" );
	}
	static #addElemAnchor( el ) {
		return `${ GSUarrayPushBack( gsuiTooltip.#getElemAnchor( el ), gsuiTooltip.#anchorName ) }`;
	}
	static #rmElemAnchor( el ) {
		return `${ gsuiTooltip.#getElemAnchor( el ).filter( a => a !== gsuiTooltip.#anchorName ) }`;
	}
	static #setAnchor( tar ) {
		gsuiTooltip.#elAnchor.$css( "anchor-name", gsuiTooltip.#rmElemAnchor );
		gsuiTooltip.#elAnchor = tar.$css( "anchor-name", gsuiTooltip.#addElemAnchor );
	}
	static #show( tar ) {
		const pos = tar.$css( "--gsuiTooltip-pos" );

		gsuiTooltip.#setAnchor( tar );
		gsuiTooltip.#updateContent();
		gsuiTooltip.#popover
			.$css( "position-area", pos )
			.$css( "position-try-fallbacks", gsuiTooltip.#fallbacks[ pos ] || "none" )
			.$togglePopover( true );
		gsuiTooltip.#intervalWatch = GSUsetInterval( gsuiTooltip.#updateContent, .25 );
	}
	static #updateContent() {
		const txt = gsuiTooltip.#elAnchor.$dataset( "tooltip" );

		if ( txt !== gsuiTooltip.#currText ) {
			gsuiTooltip.#currText = txt;
			txt.includes( "<" )
				? gsuiTooltip.#popover.$empty().$append( ...$.$simpleStringHTML( txt ) )
				: gsuiTooltip.#popover.$text( txt );
		}
	}
}
