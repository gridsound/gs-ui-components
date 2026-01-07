"use strict";

class gsuiBeatlines extends gsui0ne {
	#ppb = 1;
	#axeX = true;
	#timeDiv = [ 1, 1 ];
	#color = "";

	constructor() {
		super( {
			$cmpName: "gsuiBeatlines",
			$tagName: "gsui-beatlines",
			$attributes: {
				inert: true,
				color: "#000",
				timedivision: "4/4",
				pxperbeat: 10,
			},
		} );
	}
	static get observedAttributes() {
		return [ "vertical", "timedivision", "pxperbeat", "color" ]; // + "coloredodds"
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "vertical": this.#axeX = val === null; break;
			case "timedivision": this.#timeDiv = val.split( "/" ); break;
			case "color": this.#color = val.replace( "#", "%23" ); break;
			case "pxperbeat":
				this.#ppb = +val;
				this.style.fontSize = `${ val * this.#timeDiv[ 0 ] }px`;
				break;
		}
		this.style.backgroundImage = gsuiBeatlines.#svg( this.#axeX, ...this.#timeDiv, this.#ppb, this.#color );
	}

	// .........................................................................
	static #rect( axeX, w, x ) {
		return axeX
			? `<rect x="${ x - ~~( w / 2 ) }" width="${ w }" height="1"/>`
			: `<rect y="${ x - ~~( w / 2 ) }" height="${ w }" width="1"/>`;
	}
	static #svg( axeX, bPM, sPB, ppb, color ) {
		const w = ppb * bPM;
		const wb = w / bPM;
		const measuOp = GSUmathClamp( ( ppb -  1 ) /  32, 0, 1 );
		const beatsOp = GSUmathClamp( ( ppb - 12 ) /  50, 0, 1 );
		const stepsOp = GSUmathClamp( ( ppb - 32 ) / 100, 0, 1 );
		const beats = beatsOp ? [] : null;
		const steps = stepsOp ? [] : null;
		const svgSize = axeX
			? `width="${ w }" height="1" viewBox="0 0 ${ w } 1"`
			: `height="${ w }" width="1" viewBox="0 0 1 ${ w }"`;

		if ( beats ) {
			for ( let i = 0; i < bPM; ++i ) {
				if ( i > 0 ) {
					beats.push( gsuiBeatlines.#rect( axeX, 1, i * wb ) );
				}
				if ( steps ) {
					for ( let j = 1; j < sPB; ++j ) {
						steps.push( gsuiBeatlines.#rect( axeX, 1, ( i + j / sPB ) * wb ) );
					}
				}
			}
		}
		return `url('data:image/svg+xml,${
			`<svg ${ svgSize } fill="${ color }" xmlns="http://www.w3.org/2000/svg">${
				( !measuOp ? "" : `<g opacity="${ measuOp }">${
					gsuiBeatlines.#rect( axeX, 1, 0 ) +
					gsuiBeatlines.#rect( axeX, 1, w )
				}</g>` ) +
				( beats ? `<g opacity="${ beatsOp * .4 }">${ beats.join( "" ) }</g>` : "" ) +
				( steps ? `<g opacity="${ stepsOp * .2 }">${ steps.join( "" ) }</g>` : "" )
			}</svg>`
		}')`;
	}
}

GSUdomDefine( "gsui-beatlines", gsuiBeatlines );
