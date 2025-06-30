"use strict";

const getAbsPos_list = {
    "right top":    [ "right top",    "top right",    "right bottom", "bottom right", "left top",     "top left",     "bottom left",  "left bottom",  "right",       "top",          "left",   "bottom" ],
    "top right":    [ "top right",    "right top",    "top left",     "left top",     "bottom right", "right bottom", "bottom left",  "left bottom",  "top",         "right",        "bottom", "left"   ],
    "top left":     [ "top left",     "left top",     "top right",    "right top",    "bottom left",  "left bottom",  "bottom right", "right bottom", "top",         "left",         "bottom", "right"  ],
    "left top":     [ "left top",     "top left",     "right top",    "top right",    "left bottom",  "bottom left",  "right bottom", "bottom right", "left",        "top",          "right",  "bottom" ],
    "left bottom":  [ "left bottom",  "bottom left",  "right bottom", "bottom right", "left top",     "top left",     "right top",    "top right",    "left",        "bottom",       "right",  "top"    ],
    "bottom left":  [ "bottom left",  "left bottom",  "bottom right", "right bottom", "top left",     "left top",     "top right",    "right top",    "bottom",      "left",         "top",    "right"  ],
    "bottom right": [ "bottom right", "right bottom", "bottom left",  "left bottom",  "top right",    "right top",    "top left",     "left top",     "bottom",      "right",        "top",    "left"   ],
    "right bottom": [ "right bottom", "bottom right", "left bottom",  "bottom left",  "right top",    "top right",    "left top",     "top left",     "right",       "bottom",       "left",   "top"    ],
    "top":          [ "top",          "top left",     "top right",    "left top",     "right top",    "bottom",       "bottom left",  "bottom right", "left bottom", "right bottom", "left",   "right"  ],
    "bottom":       [ "bottom",       "bottom left",  "bottom right", "left bottom",  "right bottom", "top",          "top left",     "top right",    "left top",    "right top",    "left",   "right"  ],
    "left":         [ "left",         "left top",     "left bottom",  "top left",     "bottom left",  "right",        "right top",    "right bottom", "top right",   "bottom right", "top",    "bottom" ],
    "right":        [ "right",        "right top",    "right bottom", "top right",    "bottom right", "left",         "left top",     "left bottom",  "top left",    "bottom left",  "top",    "bottom" ],
};

const getAbsPos_outMargin = 10;

function getAbsPos( pos, tBCR, w, h, opts = {} ) {
    ___( pos, "oneOf", getAbsPos_list.top );
    ___( w, "number-positive" );
    ___( h, "number-positive" );
    const posList = getAbsPos_list[ pos ];
    const nbPos = posList.length;
    const marg = opts.margin || 0;
    let newPos = pos;
    let x = 0;
    let y = 0;

    posList.find( pos2 => {
        newPos = pos2;
        [ x, y ] = getAbsPos_getPos( pos2, tBCR, w, h, marg );
        return !getAbsPos_isCollide( x, y, w, h, marg );
    } );

    x += document.documentElement.scrollLeft;
    y += document.documentElement.scrollTop;
    if ( opts.absolute === false ) {
        x -= tBCR.left;
        y -= tBCR.top;
    }

    const obj = {
        newPosition: newPos,
        left: `${ x }px`,
        top: `${ y }px`,
    };

    if ( !opts.withArrow ) {
        return obj;
    }

    const [ arrX, arrY ] = getAbsPos_getArrowPos( newPos, tBCR, x, y, w, h );

    obj.arrowLeft = arrX;
    obj.arrowTop = arrY;
    return obj;
}

function getAbsPos_isCollide( x, y, w, h, marg ) {
    const bw = document.body.clientWidth;
    const bh = document.body.clientHeight;

    return (
        !GSUmathInRange( x, marg, bw - w - marg ) ||
        !GSUmathInRange( y, marg, bh - h - marg )
    );
}

function getAbsPos_getArrowPos( pos, tBCR, x, y, w, h ) {
    const [ p0, p1 ] = pos.split( " " );
    let ax;
    let ay;

    switch ( p0 ) {
        case "top":    ax = w / 2; ay = h; break;
        case "bottom": ax = w / 2; ay = 0; break;
    }
    switch ( p1 ) {
        case "left":  ax = w - tBCR.width / 2; break;
        case "right": ax =     tBCR.width / 2; break;
    }
    return [
        ax ? `${ ax }px` : "auto",
        ay ? `${ ay }px` : "auto",
    ];
}

function getAbsPos_getPos( pos, tBCR, w, h, margin ) {
    const xy = [ null, null ];

    switch ( pos ) {
        case 'top':    xy[ 1 ] = tBCR.top    - margin - h; break;
        case 'bottom': xy[ 1 ] = tBCR.bottom + margin;     break;
        case 'left':   xy[ 0 ] = tBCR.left   - margin - w; break;
        case 'right':  xy[ 0 ] = tBCR.right  + margin;     break;

        case 'top left':     return [ tBCR.right - w, tBCR.top    - margin - h ];
        case 'top right':    return [ tBCR.left,      tBCR.top    - margin - h ];
        case 'bottom left':  return [ tBCR.right - w, tBCR.bottom + margin ];
        case 'bottom right': return [ tBCR.left,      tBCR.bottom + margin ];

        case 'left top':     return [ tBCR.left  - margin - w, tBCR.bottom - h ];
        case 'left bottom':  return [ tBCR.left  - margin - w, tBCR.top ];
        case 'right top':    return [ tBCR.right + margin,     tBCR.bottom - h ];
        case 'right bottom': return [ tBCR.right + margin,     tBCR.top ];
    }

    const bw = document.body.clientWidth;
    const bh = document.body.clientHeight;

    if ( xy[ 0 ] === null ) {
        xy[ 0 ] = Math.max( getAbsPos_outMargin, Math.min( bw - getAbsPos_outMargin - w, tBCR.left + tBCR.width / 2 - w / 2 ) );
    }
    if ( xy[ 1 ] === null ) {
        xy[ 1 ] = Math.max( getAbsPos_outMargin, Math.min( bh - getAbsPos_outMargin - h, tBCR.top + tBCR.height / 2 - h / 2 ) );
    }
    return xy;
}
