"use strict";

class gsuiCalcAbsPos {
	static $outMargin = 10;
	static #list = {
		// TBLR: Top Bottom Left Right
		T:  "T TL TR LT RT B BL BR LB RB L R".split( " " ),
		B:  "B BL BR LB RB T TL TR LT RT L R".split( " " ),
		L:  "L LT LB TL BL R RT RB TR BR T B".split( " " ),
		R:  "R RT RB TR BR L LT LB TL BL T B".split( " " ),
		RT: "RT TR RB BR LT TL BL LB R T L B".split( " " ),
		TR: "TR RT TL LT BR RB BL LB T R B L".split( " " ),
		TL: "TL LT TR RT BL LB BR RB T L B R".split( " " ),
		LT: "LT TL RT TR LB BL RB BR L T R B".split( " " ),
		LB: "LB BL RB BR LT TL RT TR L B R T".split( " " ),
		BL: "BL LB BR RB TL LT TR RT B L T R".split( " " ),
		BR: "BR RB BL LB TR RT TL LT B R T L".split( " " ),
		RB: "RB BR LB BL RT TR LT TL R B L T".split( " " ),
	};

	static $calc( pos, tBCR, w, h, opts = {} ) {
		___( pos, "oneOf", gsuiCalcAbsPos.#list.T );
		___( w, "number-positive" );
		___( h, "number-positive" );
		const posList = gsuiCalcAbsPos.#list[ pos ];
		const marg = opts.margin || 0;
		let newPos = pos;
		let x = 0;
		let y = 0;

		posList.find( pos2 => {
			newPos = pos2;
			[ x, y ] = gsuiCalcAbsPos.#getPos( pos2, tBCR, w, h, marg );
			return !gsuiCalcAbsPos.#isCollide( x, y, w, h, marg );
		} );

		x += GSUdomHtml.scrollLeft;
		y += GSUdomHtml.scrollTop;
		if ( opts.absolute === false ) {
			x -= tBCR.left;
			y -= tBCR.top;
		}

		const obj = {
			newPosition: newPos,
			left: `${ x }px`,
			top: `${ y }px`,
		};

		if ( !opts.withArrow ) {
			return obj;
		}

		const [ arrX, arrY ] = gsuiCalcAbsPos.#getArrowPos( newPos, tBCR, x, y, w, h );

		obj.arrowLeft = arrX;
		obj.arrowTop = arrY;
		return obj;
	}

	static #isCollide( x, y, w, h, marg ) {
		const bw = GSUdomBody.clientWidth;
		const bh = GSUdomBody.clientHeight;

		return (
			!GSUmathInRange( x, marg, bw - w - marg ) ||
			!GSUmathInRange( y, marg, bh - h - marg )
		);
	}
	static #getArrowPos( pos, tBCR, x, y, w, h ) {
		const [ p0, p1 ] = pos.split( "" );
		let ax;
		let ay;

		switch ( p0 ) {
			case "T": ax = w / 2; ay = h; break;
			case "B": ax = w / 2; ay = 0; break;
		}
		switch ( p1 ) {
			case "L": ax = w - tBCR.width / 2; break;
			case "R": ax =     tBCR.width / 2; break;
		}
		return [
			ax ? `${ ax }px` : "auto",
			ay ? `${ ay }px` : "auto",
		];
	}
	static #getPos( pos, tBCR, w, h, margin ) {
		const xy = [ null, null ];

		switch ( pos ) {
			case "T": xy[ 1 ] = tBCR.top    - margin - h; break;
			case "B": xy[ 1 ] = tBCR.bottom + margin;     break;
			case "L": xy[ 0 ] = tBCR.left   - margin - w; break;
			case "R": xy[ 0 ] = tBCR.right  + margin;     break;

			case "TL": return [ tBCR.right - w, tBCR.top    - margin - h ];
			case "TR": return [ tBCR.left,      tBCR.top    - margin - h ];
			case "BL": return [ tBCR.right - w, tBCR.bottom + margin ];
			case "BR": return [ tBCR.left,      tBCR.bottom + margin ];

			case "LT": return [ tBCR.left  - margin - w, tBCR.bottom - h ];
			case "LB": return [ tBCR.left  - margin - w, tBCR.top ];
			case "RT": return [ tBCR.right + margin,     tBCR.bottom - h ];
			case "RB": return [ tBCR.right + margin,     tBCR.top ];
		}

		const bw = GSUdomBody.clientWidth;
		const bh = GSUdomBody.clientHeight;

		if ( xy[ 0 ] === null ) {
			xy[ 0 ] = Math.max( gsuiCalcAbsPos.$outMargin, Math.min( bw - gsuiCalcAbsPos.$outMargin - w, tBCR.left + tBCR.width / 2 - w / 2 ) );
		}
		if ( xy[ 1 ] === null ) {
			xy[ 1 ] = Math.max( gsuiCalcAbsPos.$outMargin, Math.min( bh - gsuiCalcAbsPos.$outMargin - h, tBCR.top + tBCR.height / 2 - h / 2 ) );
		}
		return xy;
	}
}
