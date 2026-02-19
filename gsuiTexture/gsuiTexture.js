"use strict";

/*
	Thanks to: https://heropatterns.com
	GridSound credit page: https://github.com/gridsound/daw/wiki/about
*/

class gsuiTexture {
	static #bg = {
		dots:   [ 4, 4, "<path fill='#fff5' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'/>" ],
		diag:   [ 6, 6, "<path fill='#0003' d='M5 0h1L0 6V5zM6 5v1H5z'/>" ],
		damier: [ 8, 8, "<path fill='#0001' d='M0 0h4v4H0V0zm4 4h4v4H4V4z'/>" ],
	};

	static $set( el, t ) {
		const [ w, h, cnt ] = gsuiTexture.#bg[ t ];
		const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${ w }' height='${ h }' viewBox='0 0 ${ w } ${ h }'>${ cnt }</svg>`;

		el.$css( "backgroundImage", `url("data:image/svg+xml,${ encodeURIComponent( svg ) }")` );
	}
}
