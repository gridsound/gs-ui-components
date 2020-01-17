"use strict";

class gsuiDrums {
	constructor() {
		const root = gsuiDrums.template.cloneNode( true ),
			elRows = root.querySelector( ".gsuiDrums-rows" ),
			elLines = root.querySelector( ".gsuiDrums-lines" ),
			timeline = new gsuiTimeline(),
			beatlines = new gsuiBeatlines( elLines ),
			panels = new gsuiPanels( root ),
			gsdata = null;
			// gsdata = new GSDataDrums();

		this.rootElement = root;
		this.gsdata = gsdata;
		this.oninput =
		this.onchange = GSData.noop;
		this._uiPanels = panels;
		this._timeline = timeline;
		this._beatlines = beatlines;
		this._elRows = elRows;
		this._elLines = elLines;
		this._elLineHover = null;
		this._width =
		this._height =
		this._offset =
		this._scrollTop =
		this._scrollLeft = 0;
		this._lineHoverX =
		this._linesPanelWidth = 0;
		this._pxPerBeat = 128;
		this._stepsPerBeat = 4;
		this._attached = false;
		this._nlLinesIn = root.getElementsByClassName( "gsuiDrums-lineIn" );
		this._drumHover = this._qS( "drumHover" );
		Object.seal( this );

		this._drumHover.remove();
		elRows.onscroll = this._onscrollRows.bind( this );
		elLines.onclick = this._onclickLines.bind( this );
		elLines.onscroll = this._onscrollLines.bind( this );
		elLines.onmousemove = this._mousemoveLines.bind( this );
		this._qS( "rows" ).onclick = this._onclickRows.bind( this );
		this._qS( "timelineWrap" ).append( timeline.rootElement );
		this._qS( "linesPanel" ).onresizing = this._linesPanelResizing.bind( this );
		this._qS( "linesAbsolute" ).onmouseleave = this._onmouseleaveLines.bind( this );
	}

	attached() {
		const elRows = this._qS( "rows" );

		this._attached = true;
		this._uiPanels.attached();
		this._timeline.resized();
		this._timeline.offset( this._offset, this._pxPerBeat );
	}
	resize( w, h ) {
		this._width = w;
		this._height = h;
		this._timeline.resized();
		this._timeline.offset( this._offset, this._pxPerBeat );
	}
	timeSignature( a, b ) {
		this._stepsPerBeat = b;
		this._timeline.timeSignature( a, b );
		this._beatlines.timeSignature( a, b );
		Array.prototype.forEach.call( this._nlLinesIn, el => this._colorStepsSignature( el.children ) );
		this.setPxPerBeat( this._pxPerBeat );
		this._drumHover.style.width = `${ 1 / b }em`;
	}
	setFontSize( fs ) {
		this._qS( "rows" ).style.fontSize =
		this._qS( "lines" ).style.fontSize = `${ fs }px`;
	}
	setPxPerBeat( ppb ) {
		this._pxPerBeat = ppb;
		this._timeline.offset( this._offset, ppb );
		this._beatlines.pxPerBeat( ppb );
		Array.prototype.forEach.call( this._nlLinesIn, el => el.style.fontSize = `${ ppb }px` );
	}

	// private:
	// .........................................................................
	_addRow( id, obj ) {
		const elRow = gsuiDrums.templateRow.cloneNode( true ),
			elLine = gsuiDrums.templateLine.cloneNode( true );

		elRow.dataset.id =
		elLine.dataset.id = id;
		elLine.firstElementChild.style.fontSize = `${ this._pxPerBeat / this._stepsPerBeat }px`;
		this._qS( "rows" ).append( elRow );
		this._qS( "linesAbsolute" ).append( elLine );
	}
	_renameRow( id, name ) {
		this._qS( `row[data-id='${ id }'] .gsuiDrums-row-name` ).textContent = name;
	}

	// .........................................................................
	_qS( c ) {
		return this.rootElement.querySelector( `.gsuiDrums-${ c }` );
	}
	_createDrum( step ) {
		const drm = gsuiDrums.templateDrum.cloneNode( true );

		drm.dataset.step = step;
		drm.style.left = `${ step }em`;
		return drm;
	}
	_colorStepsSignature( steps ) {
		const sPB = this._stepsPerBeat;

		Array.prototype.forEach.call( steps, ( s, i ) => {
			s.classList.toggle( "gsuiDrums-drumOdd", i % ( 2 * sPB ) >= sPB );
		} );
	}

	// events:
	// .........................................................................
	_linesPanelResizing( pan ) {
		const width = pan.clientWidth;

		if ( this._offset > 0 ) {
			this._offset -= ( width - this._linesPanelWidth ) / this._pxPerBeat;
			this._elLines.scrollLeft -= width - this._linesPanelWidth;
		}
		this._linesPanelWidth = width;
		this._timeline.resized();
		this._timeline.offset( this._offset, this._pxPerBeat );
	}
	_onclickRows( e ) {
		const tar = e.target,
			rowId = tar.parentNode.dataset.id;

		if ( tar.classList.contains( "gsuiDrums-row-toggle" ) ) {
			this.gsdata.callAction( "toggleRow", id );
		}
		if ( tar.classList.contains( "gsuiDrums-row-delete" ) ) {
			this.gsdata.callAction( "deleteRow", id );
		}
	}
	_onclickLines( e ) {
		const elStep = e.target.parentNode,
			step = elStep.dataset.step,
			rowId = elStep.parentNode.parentNode.dataset.id;

		if ( step ) {
			lg( "_onclickLines", {step, rowId, elStep}, e );
		}
	}
	_onscrollRows( e ) {
		const scrollTop = this._elRows.scrollTop;

		if ( scrollTop !== this._scrollTop ) {
			this._scrollTop =
			this._elLines.scrollTop = scrollTop;
		}
	}
	_onscrollLines( e ) {
		const scrollTop = this._elLines.scrollTop,
			scrollLeft = this._elLines.scrollLeft;

		if ( scrollTop !== this._scrollTop ) {
			this._scrollTop =
			this._elRows.scrollTop = scrollTop;
		}
		if ( scrollLeft !== this._scrollLeft ) {
			this._scrollLeft = scrollLeft;
			this._offset = scrollLeft / this._pxPerBeat;
			this._timeline.offset( this._offset, this._pxPerBeat );
		}
		if ( this._elLineHover ) {
			this.__mousemoveLines( this._elLineHover, this._lineHoverX );
		}
	}
	_mousemoveLines( e ) {
		const line = e.target;

		if ( line.classList.contains( "gsuiDrums-lineIn" ) ) {
			this._lineHoverX = e.pageX;
			this.__mousemoveLines( line, e.pageX );
		}
	}
	__mousemoveLines( line, pageX ) {
		const el = this._drumHover,
			lineX = line.getBoundingClientRect().left,
			stepW = this._pxPerBeat / this._stepsPerBeat,
			x = pageX - lineX;

		el.style.left = `${ ( x / stepW | 0 ) * stepW }px`;
		if ( el.parentNode !== line ) {
			this._elLineHover = line;
			line.append( el );
		}
	}
	_onmouseleaveLines( e ) {
		this._drumHover.remove();
	}
}

gsuiDrums.template = document.querySelector( "#gsuiDrums-template" );
gsuiDrums.template.remove();
gsuiDrums.template.removeAttribute( "id" );

gsuiDrums.templateRow = document.querySelector( "#gsuiDrums-row-template" );
gsuiDrums.templateRow.remove();
gsuiDrums.templateRow.removeAttribute( "id" );

gsuiDrums.templateLine = document.querySelector( "#gsuiDrums-line-template" );
gsuiDrums.templateLine.remove();
gsuiDrums.templateLine.removeAttribute( "id" );

gsuiDrums.templateDrum = document.querySelector( "#gsuiDrums-drum-template" );
gsuiDrums.templateDrum.remove();
gsuiDrums.templateDrum.removeAttribute( "id" );
