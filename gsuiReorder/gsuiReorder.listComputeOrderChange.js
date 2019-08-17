"use strict";

gsuiReorder.listComputeOrderChange = ( list, obj ) => {
	let i = 0;

	Array.prototype.forEach.call( list.children, el => {
		const dt = el.dataset;

		if ( "id" in dt && "order" in dt ) {
			if ( +dt.order !== i ) {
				const objId = obj[ dt.id ];

				if ( objId ) {
					objId.order = i;
				} else if ( !( dt.id in obj ) ) {
					obj[ dt.id ] = { order: i };
				}
			}
			++i;
		}
	} );
	return obj;
};
