"use strict";

gsuiReorder.listReorder = ( list, optObj ) => {
	const toSort = !optObj || Object.values( optObj ).some( obj => obj && "order" in obj );

	if ( toSort ) {
		const arr = Array.prototype
			.filter.call( list.children, el => "order" in el.dataset )
			.sort( ( a, b ) => a.dataset.order - b.dataset.order );

		list.append( ...arr );
	}
};
