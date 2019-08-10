"use strict";

gsuiReorder.listReorder = list => {
	const arr = Array.from( list.children ).sort( ( a, b ) => +a.dataset.order - +b.dataset.order );

	list.append.apply( list, arr );
};
