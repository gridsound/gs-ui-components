"use strict";

class gsuiDrums {
	constructor() {
		const root = gsuiDrums.template.cloneNode( true ),
			elRows = root.querySelector( ".gsuiDrums-rows" ),
			elLines = root.querySelector( ".gsuiDrums-lines" ),
			reorder = new gsuiReorder(),
			timeline = new gsuiTimeline(),
			beatlines = new gsuiBeatlines( elLines ),
			panels = new gsuiPanels( root ),
			gsdata = { callAction( ...args ) { lg( ...args ) } };
			// gsdata = new GSDataDrums();

		this.rootElement = root;
		this.gsdata = gsdata;
		this.oninput =
		this.onchange =
		this.onchangeLoop =
		this.onchangeCurrentTime = GSData.noop;

		this._reorder = reorder;
		this._uiPanels = panels;
		this._timeline = timeline;
		this._beatlines = beatlines;
		this._elRows = elRows;
		this._elLines = elLines;
		this._timeoutIdBeatlines = null;
		this._width =
		this._height =
		this._offset =
		this._pxPerStep =
		this._pxPerBeat =
		this._scrollTop =
		this._scrollLeft =
		this._drumHoverX =
		this._drumHoverBeat =
		this._linesPanelWidth = 0;
		this._stepsPerBeat = 4;
		this._attached =
		this._drumHovering = false;
		this._elLoopA = this._qS( "loopA" );
		this._elLoopB = this._qS( "loopB" );
		this._elLinesAbs = this._qS( "linesAbsolute" );
		this._elDrumHover = this._qS( "drumHover" );
		this._elCurrentTime = this._qS( "currentTime" );
		this._nlLinesIn = root.getElementsByClassName( "gsuiDrums-lineIn" );
		Object.seal( this );

		reorder.onchange = ( ...args ) => lg( ...args );
		reorder.setRootElement( elRows );
		reorder.setShadowElement( this._elLinesAbs );
		reorder.setSelectors( {
			item: ".gsuiDrums-rows .gsuiDrums-row",
			handle: ".gsuiDrums-rows .gsuiDrums-row-grip",
			parent: ".gsuiDrums-rows",
		} );
		this._elDrumHover.remove();
		this._elDrumHover.onclick = this._onclickNewDrum.bind( this );
		elRows.onclick = this._onclickRows.bind( this );
		elRows.onscroll = this._onscrollRows.bind( this );
		elRows.oncontextmenu = this._oncontextmenuRows.bind( this );
		elLines.onclick = this._onclickLines.bind( this );
		elLines.onscroll = this._onscrollLines.bind( this );
		elLines.onwheel = this._onwheelLines.bind( this );
		elLines.onmousemove = this._mousemoveLines.bind( this );
		timeline.oninputLoop = this._oninputLoop.bind( this );
		timeline.onchangeLoop = ( isLoop, a, b ) => this.onchangeLoop( isLoop, a, b );
		timeline.onchangeCurrentTime = t => {
			this._setCurrentTime( t );
			this.onchangeCurrentTime( t );
		};
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
	currentTime( beat ) {
		this._timeline.currentTime( beat );
		this._setCurrentTime( beat );
	}
	loop( a, b ) {
		this._timeline.loop( a, b );
		this._setLoop( Number.isFinite( a ), a, b );
	}
	timeSignature( a, b ) {
		this._stepsPerBeat = b;
		this._timeline.timeSignature( a, b );
		this._beatlines.timeSignature( a, b );
		this.setPxPerBeat( this._pxPerBeat );
		this._elDrumHover.style.width =
		this._elCurrentTime.style.width = `${ 1 / b }em`;
	}
	setFontSize( fs ) {
		this._qS( "rows" ).style.fontSize =
		this._qS( "lines" ).style.fontSize = `${ fs }px`;
	}
	setPxPerBeat( ppb ) {
		const ppbpx = `${ ppb }px`;

		this._pxPerBeat = ppb;
		this._pxPerStep = ppb / this._stepsPerBeat;
		this._timeline.offset( this._offset, ppb );
		this._beatlines.pxPerBeat( ppb );
		this._elLoopA.style.fontSize =
		this._elLoopB.style.fontSize =
		this._elCurrentTime.style.fontSize = ppbpx;
		Array.prototype.forEach.call( this._nlLinesIn, el => el.style.fontSize = ppbpx );
		clearTimeout( this._timeoutIdBeatlines );
		this._timeoutIdBeatlines = setTimeout( () => this._beatlines.render(), 100 );
	}

	// private:
	// .........................................................................
	_qS( c ) {
		return this.rootElement.querySelector( `.gsuiDrums-${ c }` );
	}
	_has( el, c ) {
		return el.classList.contains( `gsuiDrums-${ c }` );
	}
	_setCurrentTime( t ) {
		this._elCurrentTime.style.left = `${ t }em`;
	}
	_setLoop( isLoop, a, b ) {
		this._elLoopA.classList.toggle( "gsuiDrums-loopOn", isLoop );
		this._elLoopB.classList.toggle( "gsuiDrums-loopOn", isLoop );
		if ( isLoop ) {
			this._elLoopA.style.width = `${ a }em`;
			this._elLoopB.style.left = `${ b }em`;
		}
	}
	_hideDrumHover() {
		this._drumHovering = false;
		this._elDrumHover.remove();
	}

	// data callbacks:
	// .........................................................................
	_addDrumrow( id ) {
		const elRow = gsuiDrums.templateRow.cloneNode( true ),
			elLine = gsuiDrums.templateLine.cloneNode( true );

		elRow.dataset.id =
		elLine.dataset.id = id;
		elLine.firstElementChild.style.fontSize = `${ this._pxPerBeat }px`;
		this._qS( "rows" ).append( elRow );
		this._qS( "linesAbsolute" ).append( elLine );
	}
	_renameDrumrow( id, name ) {
		this._qS( `row[data-id='${ id }'] .gsuiDrums-row-name` ).textContent = name;
	}
	_addDrum( id, when, rowId ) {
		const elDrm = gsuiDrums.templateDrum.cloneNode( true );

		elDrm.style.left = `${ when }em`;
		elDrm.style.width = `${ 1 / this._stepsPerBeat }em`;
		this._qS( `line[data-id='${ rowId }'] .gsuiDrums-lineIn` ).append( elDrm );
	}

	// events:
	// .........................................................................
	_oninputLoop( isLoop, a, b ) {
		this._setLoop( isLoop, a, b );
		// this.oninputLoop( isLoop && a, b );
	}
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
			id = tar.parentNode.dataset.id;

		if ( this._has( tar, "row-toggle" ) ) {
			this.gsdata.callAction( "toggleDrumrow", id );
		}
		if ( this._has( tar, "row-delete" ) ) {
			this.gsdata.callAction( "deleteDrumrow", id );
		}
	}
	_oncontextmenuRows( e ) {
		const tar = e.target,
			id = tar.parentNode.dataset.id;

		if ( this._has( tar, "row-toggle" ) ) {
			this.gsdata.callAction( "toggleOnlyDrumrow", id );
		}
		e.preventDefault();
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
		this.__mousemoveLines();
	}
	_onwheelLines( e ) {
		if ( e.ctrlKey ) {
			const elLines = this._elLines,
				layerX = e.pageX - elLines.getBoundingClientRect().left + elLines.scrollLeft,
				ppb = Math.round( Math.min( Math.max( 48, this._pxPerBeat * ( e.deltaY > 0 ? .9 : 1.1 ) ), 128 ) );

			this._scrollLeft =
			elLines.scrollLeft += layerX / this._pxPerBeat * ( ppb - this._pxPerBeat );
			this._offset = elLines.scrollLeft / ppb;
			this.setPxPerBeat( ppb );
			this.__mousemoveLines();
		}
	}
	_mousemoveLines( e ) {
		const tar = e.target,
			elLine = this._has( tar, "lineIn" ) ? tar :
				this._has( tar, "drum" ) ? tar.parentNode : null;

		if ( elLine ) {
			this._drumHovering = true;
			this._drumHoverX = e.pageX;
			this.__mousemoveLines();
			if ( this._elDrumHover.parentNode !== elLine ) {
				elLine.append( this._elDrumHover );
			}
		}
	}
	__mousemoveLines() {
		if ( this._drumHovering ) {
			const el = this._elDrumHover,
				bcr = this._elLinesAbs.getBoundingClientRect(),
				pageX = this._drumHoverX,
				beat = ( ( pageX - bcr.left ) / this._pxPerStep | 0 ) / this._stepsPerBeat;

			this._drumHoverBeat = beat;
			el.style.left = `${ beat * this._pxPerBeat }px`;
		}
	}
	_onmouseleaveLines() {
		this._hideDrumHover();
	}
	_onclickNewDrum() {
		this.gsdata.callAction( "addDrum", this._drumHoverBeat );
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
