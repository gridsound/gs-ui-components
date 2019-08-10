"use strict";

gsuiReorder.listComputeOrderChange = list => {
	const obj = {};
	let filled,
		i = 0;

	Array.prototype.forEach.call( list.children, el => {
		if ( "id" in el.dataset && "order" in el.dataset ) {
			if ( el.dataset.order !== i ) {
				filled = true;
				obj[ el.dataset.id ] = { order: i };
			}
			++i;
		}
	} );
	return filled ? obj : null;
};
