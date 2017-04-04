"use strict";

function gsuiSquareMatrix( svg ) {
	this.svg = svg;
};

gsuiSquareMatrix.prototype = {
  setResolution: function( w, h ) {
    this.width = w;
		this.height = h;
		this.svg.setAttribute( "viewBox", "0 0 " + w + " " + h );
	},
	addSquare: function( sq ) {
    var rect = document.createElementNS( "http://www.w3.org/2000/svg", "rect" );

    sq.rect = rect;
    this.moveSquare( sq );
    rect.setAttribute( "fill", sq.color );
    this.svg.appendChild( rect );
	},
  moveSquare: function( sq ) {
    sq.rect.setAttribute( "x", sq.x );
    sq.rect.setAttribute( "y", sq.y );
    sq.rect.setAttribute( "width", sq.w );
    sq.rect.setAttribute( "height", sq.h );
  },
  delSquare: function( sq ) {
    sq.rect.remove();
  },
  addSquares: function( arrsq ) {
    arrsq.forEach( this.addSquare, this );
  },
  moveSquares: function( arrsq ) {
    arrsq.forEach( this.moveSquare, this );
  },
  delSquares: function( arrsq ) {
    arrsq.forEach( this.delSquare, this );
  }
};
