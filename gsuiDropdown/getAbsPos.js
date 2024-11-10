// pos:
//     'top'
//     'left'
//     'right'
//     'bottom'
//     'top left'
//     'top right'
//     'left top'
//     'left bottom'
//     'bottom left'
//     'bottom right'
//     'right top'
//     'right bottom'

function getAbsPos( pos, tBCR, w, h, opts = {} ) {
    const marg = opts.margin || 0;
    const newPos = _getNewPos( pos, tBCR, w, h, marg );
    let [ x, y ] = _getPos( newPos, tBCR, w, h, marg );

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

    const [ arrX, arrY ] = _getArrowPos( newPos, tBCR, x, y, w, h );

    obj.arrowLeft = arrX;
    obj.arrowTop = arrY;
    return obj;
}

getAbsPos.outMargin = 10;

function _getArrowPos( pos, tBCR, x, y, w, h ) {
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

function _getPos( pos, tBCR, w, h, margin ) {
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
        xy[ 0 ] = Math.max( getAbsPos.outMargin, Math.min( bw - getAbsPos.outMargin - w, tBCR.left + tBCR.width / 2 - w / 2 ) );
    }
    if ( xy[ 1 ] === null ) {
        xy[ 1 ] = Math.max( getAbsPos.outMargin, Math.min( bh - getAbsPos.outMargin - h, tBCR.top + tBCR.height / 2 - h / 2 ) );
    }
    return xy;
}

function _getNewPos( pos, tBCR, w, h, margin ) {
    const bw = document.body.clientWidth;
    const bh = document.body.clientHeight;

    if ( pos === "left" || pos === "right" ) {
        if ( tBCR.top < getAbsPos.outMargin ) {
            return "bottom";
        }
        if ( tBCR.bottom > bh - getAbsPos.outMargin ) {
            return "top";
        }
    }
    if ( pos === "top" || pos === "bottom" ) {
        if ( tBCR.left < getAbsPos.outMargin ) {
            return "right";
        }
        if ( tBCR.right > bw - getAbsPos.outMargin ) {
            return "left";
        }
    }

    const [ pos1, pos2 ] = pos.split( " " );
    let newPos1 = pos1;
    let newPos2 = pos2;

    switch ( pos1 ) {
        case "top":
            if ( tBCR.top - margin - h < getAbsPos.outMargin ) {
                newPos1 = "bottom";
            }
            break;
        case "bottom":
            if ( tBCR.bottom + margin + h > bh - getAbsPos.outMargin ) {
                newPos1 = "top";
            }
            break;
        case "left":
            if ( tBCR.left - margin - w < getAbsPos.outMargin ) {
                newPos1 = "right";
            }
            break;
        case "right":
            if ( tBCR.right + margin + w > bw - getAbsPos.outMargin ) {
                newPos1 = "left";
            }
            break;
    }
    if ( !pos2 ) {
        return newPos1;
    }
    switch ( pos2 ) {
        case "top":
            if ( tBCR.bottom - h < getAbsPos.outMargin ) {
                if ( tBCR.top < getAbsPos.outMargin ) {
                    return "bottom";
                }
                newPos2 = "bottom";
            }
            break;
        case "bottom":
            if ( tBCR.top + h > bh - getAbsPos.outMargin ) {
                if ( tBCR.bottom > bh - getAbsPos.outMargin ) {
                    return "top";
                }
                newPos2 = "top";
            }
            break;
        case "left":
            if ( tBCR.right - w < getAbsPos.outMargin ) {
                if ( tBCR.left < getAbsPos.outMargin ) {
                    return "right";
                }
                newPos2 = "right";
            }
            break;
        case "right":
            if ( tBCR.left + w > bw - getAbsPos.outMargin ) {
                if ( tBCR.right > bw - getAbsPos.outMargin ) {
                    return "left";
                }
                newPos2 = "left";
            }
            break;
    }
    return `${ newPos1 } ${ newPos2 }`;
}
