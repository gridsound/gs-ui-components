"use strict";

gsuiKeys.keyNames = Object.freeze( {
	en: Object.freeze( [ "c",  "c#",  "d",  "d#",  "e",  "f",  "f#",  "g",   "g#",   "a",  "a#",  "b" ] ),
	fr: Object.freeze( [ "do", "do#", "ré", "ré#", "mi", "fa", "fa#", "sol", "sol#", "la", "la#", "si" ] ),
} );

gsuiKeys.keyIds = Array.from( gsuiKeys.keyNames.en );
gsuiKeys.keyIds.forEach( ( k, i, arr ) => arr[ k ] = i );
Object.freeze( gsuiKeys.keyIds );
