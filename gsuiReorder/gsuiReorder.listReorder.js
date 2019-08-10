"use strict";

gsuiReorder.listReorder = list => {
	const arr = Array.prototype
			.filter.call( list.children, el => "order" in el.dataset )
			.sort( ( a, b ) => +a.dataset.order - +b.dataset.order );

	list.append.apply( list, arr );
};
