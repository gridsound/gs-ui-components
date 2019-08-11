"use strict";

gsuiReorder.listComputeOrderChange = ( list, obj ) => {
	let i = 0;

	Array.prototype.forEach.call( list.children, el => {
		if ( "id" in el.dataset && "order" in el.dataset ) {
			if ( +el.dataset.order !== i ) {
				obj[ el.dataset.id ] = { order: i };
			}
			++i;
		}
	} );
	return obj;
};
