"use strict";

gsuiReorder.listReorder = ( list, optObj ) => {
	const toSort = !optObj || Object.values( optObj ).some( obj => obj && "order" in obj );

	if ( toSort ) {
		const arr = Array.prototype
			.filter.call( list.children, el => GSUhasAttribute( el, "order" ) || "order" in el.dataset )
			.sort( ( a, b ) =>
				+( a.dataset.order || GSUgetAttribute( a, "order" ) ) -
				+( b.dataset.order || GSUgetAttribute( b, "order" ) ) );

		list.append( ...arr );
	}
};
