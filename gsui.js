"use strict";

class GSUI {
	static $noop() {}
	static $popup = document.createElement( "gsui-popup" );
	static $dragshield = document.createElement( "gsui-dragshield" );

	static $easeInCirc( x ) {
		return 1 - Math.sqrt( 1 - Math.pow( x, 2 ) );
	}
	static $easeOutCirc( x ) {
		return Math.sqrt( 1 - Math.pow( x - 1, 2 ) );
	}

	// .........................................................................
	static $clamp( n, min, max ) {
		return (
			min < max
				? Math.max( min, Math.min( n || 0, max ) )
				: Math.max( max, Math.min( n || 0, min ) )
		);
	}

	// .........................................................................
	static $diffObjects( a, b ) {
		let empty = true;
		const diff = Object.entries( b ).reduce( ( diff, [ bk, bv ] ) => {
			const av = a[ bk ];
			const newval = av === bv ? undefined :
				typeof bv !== "object" || bv === null ? bv :
				typeof av !== "object" || av === null
					? Object.freeze( JSON.parse( JSON.stringify( bv ) ) )
					: GSUI.$diffObjects( av, bv );

			if ( newval !== undefined ) {
				empty = false;
				diff[ bk ] = newval;
			}
			return diff;
		}, {} );

		Object.keys( a ).forEach( ak => {
			if ( !( ak in b ) ) {
				empty = false;
				diff[ ak ] = undefined;
			}
		} );
		return empty ? undefined : Object.freeze( diff );
	}

	// .........................................................................
	static $loadJSFile( src ) {
		return new Promise( resolve => {
			const js = GSUI.$createElement( "script", { src, type: "text/javascript" } );

			js.onload = resolve;
			document.head.append( js );
		} );
	}

	// .........................................................................
	static $findElements( root, graph ) {
		return typeof graph === "string"
			? GSUI.#findElemStr( root, graph )
			: Object.seal( Array.isArray( graph )
				? GSUI.#findElemArr( root, graph )
				: GSUI.#findElemObj( root, graph ) );
	}
	static #findElemArr( root, arr ) {
		return arr.map( sel => GSUI.$findElements( root, sel ) );
	}
	static #findElemObj( root, obj ) {
		if ( obj ) {
			const ent = Object.entries( obj );

			ent.forEach( kv => kv[ 1 ] = GSUI.$findElements( root, kv[ 1 ] ) );
			return Object.fromEntries( ent );
		}
	}
	static #findElemStr( root, sel ) {
		if ( Array.isArray( root ) ) {
			let el;

			Array.prototype.find.call( root, r => el = GSUI.#findElemQuery( r, sel ) );
			return el || null;
		}
		return GSUI.#findElemQuery( root, sel );
	}
	static #findElemQuery( root, sel ) {
		return root.matches( sel )
			? root
			: root.querySelector( sel );
	}

	// .........................................................................
	static $dispatchEvent( el, component, eventName, ...args ) {
		el.dispatchEvent( new CustomEvent( "gsuiEvents", {
			bubbles: true,
			detail: { component, eventName, args },
		} ) );
	}
	static $listenEvents( el, cbs ) {
		el.addEventListener( "gsuiEvents", e => {
			const d = e.detail;
			const cbs2 = cbs[ d.component ] || cbs.default;
			const fn = cbs2 && ( cbs2[ d.eventName ] || cbs2.default );

			if ( fn && fn( d, e.target, e ) !== true ) {
				e.stopPropagation();
				e.stopImmediatePropagation();
			}
		} );
	}

	// .........................................................................
	static #templates = new Map();
	static $setTemplate( tmpId, fn ) {
		GSUI.#templates.set( tmpId, fn );
	}
	static $hasTemplate( tmpId ) {
		return GSUI.#templates.has( tmpId );
	}
	static $getTemplate( tmpId, ...args ) {
		return GSUI.#templates.get( tmpId )( ...args );
	}

	// .........................................................................
	static $createElement( tag, attr, ...children ) {
		return GSUI.#createElement( "http://www.w3.org/1999/xhtml", tag, attr, children );
	}
	static $createElementSVG( tag, attr, ...children ) {
		return GSUI.#createElement( "http://www.w3.org/2000/svg", tag, attr, children );
	}
	static #createElement( ns, tag, attrObj, children ) {
		const el = document.createElementNS( ns, tag );

		GSUI.$setAttribute( el, attrObj );
		el.append( ...children.flat( 1 ).filter( ch => Boolean( ch ) || Number.isFinite( ch ) ) );
		return el;
	}
	static $setAttribute( el, attr, val ) {
		if ( typeof attr === "string" ) {
			GSUI.#setAttribute( el, attr, val );
		} else if ( attr ) {
			Object.entries( attr ).forEach( kv => GSUI.#setAttribute( el, ...kv ) );
		}
	}
	static $setGetAttribute( el, attr, val ) {
		GSUI.#setAttribute( el, attr, val );
		return GSUI.$getAttribute( el, attr );
	}
	static #setAttribute( el, attr, val ) {
		val !== false && val !== null && val !== undefined
			? el.setAttribute( attr, val === true ? "" : val )
			: el.removeAttribute( attr );
	}
	static $hasAttribute( el, attr ) {
		return el.hasAttribute( attr );
	}
	static $getAttribute( el, attr ) {
		return el.getAttribute( attr );
	}
	static $getAttributeNum( el, attr ) {
		const val = el.getAttribute( attr );
		const n = +val;

		if ( Number.isNaN( n ) ) {
			console.error( `GSUI.$getAttributeNum: ${ attr } is NaN (${ val })` );
		}
		return n;
	}

	// .........................................................................
	static $observeSizeOf( el, fn ) {
		if ( GSUI.#resizeMap.has( el ) ) {
			GSUI.#resizeMap.get( el ).push( fn );
		} else {
			GSUI.#resizeMap.set( el, [ fn ] );
		}
		GSUI.#resizeObs.observe( el );
	}
	static $unobserveSizeOf( el, fn ) {
		const fns = GSUI.#resizeMap.get( el );
		const fnInd = fns?.indexOf( fn );

		if ( fnInd > -1 ) {
			GSUI.#resizeObs.unobserve( el );
			fns.splice( fnInd, 1 );
			if ( fns.length === 0 ) {
				GSUI.#resizeMap.delete( el );
			}
		}
	}
	static #resizeMap = new Map();
	static #resizeObs = new ResizeObserver( entries => {
		entries.forEach( e => {
			GSUI.#resizeMap.get( e.target )
				.forEach( fn => fn( e.contentRect.width, e.contentRect.height ) );
		} );
	} );

	// .........................................................................
	static $emptyElement( el ) {
		while ( el.lastChild ) {
			el.lastChild.remove();
		}
	}

	// .........................................................................
	static $unselectText() {
		window.getSelection().removeAllRanges();
	}

	// .........................................................................
	static $recallAttributes( el, props ) {
		Object.entries( props ).forEach( ( [ p, val ] ) => {
			el.hasAttribute( p )
				? el.attributeChangedCallback?.( p, null, el.getAttribute( p ) )
				: GSUI.#setAttribute( el, p, val );
		} );
	}

	// .........................................................................
	static $getFilesDataTransfert( dataTransferItems ) {
		const files = [];

		return new Promise( res => {
			const proms = [];

			for ( const it of dataTransferItems ) {
				const ent = it.webkitGetAsEntry();

				if ( ent ) {
					proms.push( GSUI.#getFilesDataTransfertRec( files, ent ) );
				}
			}
			Promise.all( proms ).then( () => res( files ) );
		} );
	}
	static #getFilesDataTransfertRec( files, item, path = "" ) {
		return new Promise( res => {
			if ( item.isFile ) {
				item.file( f => {
					f.filepath = path + f.name;
					files.push( f );
					res( f );
				} );
			} else if ( item.isDirectory ) {
				const dirReader = item.createReader();

				dirReader.readEntries( entries => {
					const proms = [];

					for ( let ent of entries ) {
						proms.push( GSUI.#getFilesDataTransfertRec( files, ent, path + item.name + "/" ) );
					}
					res( Promise.all( proms ) );
				} );
			}
		} );
	}
}

document.body.prepend( GSUI.$dragshield, GSUI.$popup );
