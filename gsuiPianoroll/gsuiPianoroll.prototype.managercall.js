"use strict";

Object.assign( gsuiPianoroll.prototype, {
	managercallDuplicating( blcsMap, valA ) {
		const obj = {},
			mapIds = new Map();

		blcsMap.forEach( ( _blc, id ) => {
			const d = this.data[ id ],
				nId = ++this._idMax,
				copy = Object.assign( {}, d );

			copy.when += valA;
			copy.prev =
			copy.next = null;
			obj[ id ] = { selected: false };
			obj[ nId ] =
			this.data[ nId ] = copy;
			mapIds.set( id, nId );
			d.selected = false;
		} );
		blcsMap.forEach( ( _blc, id ) => {
			const d = this.data[ id ];

			if ( blcsMap.has( d.next ) ) {
				const idCurr = mapIds.get( id ),
					idNext = mapIds.get( d.next );

				obj[ idCurr ].next = idNext;
				obj[ idNext ].prev = idCurr;
			}
		} );
		this.onchange( obj );
	},
	managercallSelecting( blcsMap ) {
		const obj = {};

		blcsMap.forEach( ( _blc, id ) => {
			const d = this.data[ id ],
				selected = !d.selected;

			obj[ id ] = { selected };
			d.selected = selected;
		} );
		this.onchange( obj );
	},
	managercallMoving( blcsMap, valA, valB ) {
		const obj = {},
			when = Math.abs( valA ) > .000001 ? valA : 0;

		blcsMap.forEach( ( _blc, id ) => {
			const d = this.data[ id ],
				o = {};

			obj[ id ] = o;
			if ( when ) {
				o.when =
				d.when += when;
			}
			if ( valB ) {
				o.key =
				d.key -= valB;
			}
		} );
		this.onchange( obj );
	},
	managercallDeleting( blcsMap ) {
		const obj = {};

		blcsMap.forEach( ( _blc, id ) => {
			const { prev, next } = this.data[ id ];

			obj[ id ] = undefined;
			delete this.data[ id ];
			if ( prev !== null ) {
				const objPrev = obj[ prev ];

				if ( !( prev in obj ) || objPrev !== undefined ) {
					objPrev
						? objPrev.next = null
						: obj[ prev ] = { next: null };
				}
			}
			if ( next !== null ) {
				const objNext = obj[ next ];

				if ( !( next in obj ) || objNext !== undefined ) {
					objNext
						? objNext.prev = null
						: obj[ next ] = { prev: null };
				}
			}
		} );
		this.__unselectBlocks( obj );
		this.onchange( obj );
	},
	managercallCroppingB( blcsMap, valA ) {
		const obj = {};

		blcsMap.forEach( ( _blc, id ) => {
			const d = this.data[ id ],
				attRel = d.attack + d.release,
				duration = d.duration + valA,
				keyobj = { duration };

			if ( duration < attRel ) {
				d.attack =
				keyobj.attack = +( d.attack / attRel * duration ).toFixed( 3 );
				d.release =
				keyobj.release = +( d.release / attRel * duration ).toFixed( 3 );
			}
			obj[ id ] = keyobj;
			d.duration = duration;
		} );
		this.onchange( obj );
	},

	// .........................................................................
	managercallAttack( blcsMap, valA ) {
		this._managercallAttRel( "attack", blcsMap, valA );
	},
	managercallRelease( blcsMap, valA ) {
		this._managercallAttRel( "release", blcsMap, valA );
	},
	_managercallAttRel( prop, blcsMap, incr ) {
		const obj = {};

		blcsMap.forEach( this._managercallAttRelEach.bind( this, obj, prop, incr ) );
		this.onchange( obj );
	},
	_managercallAttRelEach( obj, prop, incr, _blc, id ) {
		const d = this.data[ id ],
			val = +( d[ prop ] + incr ).toFixed( 3 );

		obj[ id ] = { [ prop ]: val };
		d[ prop ] = val;
	},
} );
