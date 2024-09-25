"use strict";

class gsuiCmpPlayer extends gsui0ne {
	#settingTime = null;

	constructor() {
		super( {
			$cmpName: "gsuiCmpPlayer",
			$tagName: "gsui-cmp-player",
			$elements: {
				$play: ".gsuiCmpPlayer-play",
				$edit: ".gsuiCmpPlayer-edit",
				$name: ".gsuiCmpPlayer-nameLink",
				$bpm: ".gsuiCmpPlayer-bpm",
				$dur: ".gsuiCmpPlayer-duration",
				$time: ".gsuiCmpPlayer-currentTime",
				$timeInpVal: ".gsuiCmpPlayer-sliderValue",
				$timeInpTrk: ".gsuiCmpPlayer-sliderInput",
			},
			$attributes: {
				name: "",
				bpm: 60,
				duration: 0,
				currenttime: 0,
			},
		} );
		Object.seal( this );
		this.$elements.$play.onclick = () => this.$dispatch( GSUhasAttribute( this, "playing" ) ? "stop" : "play" );
		this.$elements.$timeInpTrk.onpointerdown = this.#ptrDown.bind( this );
		this.onclick = e => {
			const act = e.target.dataset.action;

			if ( act ) {
				this.$dispatch( act );
			}
		};
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "name", "link", "edit", "duration", "bpm", "playing", "currenttime" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "bpm": this.$elements.$bpm.textContent = val; break;
			case "name": this.$elements.$name.textContent = val; break;
			case "link": GSUsetAttribute( this.$elements.$name, "href", val ); break;
			case "edit": GSUsetAttribute( this.$elements.$edit, "href", val ); break;
			case "playing": GSUsetAttribute( this.$elements.$play, "data-icon", val === "" ? "pause" : "play" ); break;
			case "duration":
				this.$elements.$dur.textContent = gsuiCmpPlayer.$calcDuration( val );
				this.$updateTimeSlider();
				break;
			case "currenttime":
				if ( this.#settingTime === null ) {
					this.$elements.$time.textContent = gsuiCmpPlayer.$calcDuration( val );
					this.$updateTimeSlider();
				}
				break;
		}
	}

	// .........................................................................
	static $calcDuration( sec ) {
		const t = GSUsplitSeconds( sec );

		return `${ t.m }:${ t.s }`;
	}
	$updateTimeSlider() {
		const dur = GSUgetAttributeNum( this, "duration" );
		const time = GSUgetAttributeNum( this, "currenttime" );

		this.$elements.$timeInpVal.style.width = `${ time / dur * 100 }%`;
	}

	// .........................................................................
	#ptrDown( e ) {
		e.target.setPointerCapture( e.pointerId );
		e.target.onpointerup = this.#ptrUp.bind( this );
		e.target.onpointermove = this.#ptrMove.bind( this );
		this.#ptrMove( e );
	}
	#ptrMove( e ) {
		const bcr = e.target.getBoundingClientRect();
		const x = GSUclampNum( ( e.clientX - bcr.x ) / bcr.width, 0, 1 );

		this.#settingTime = x;
		this.$elements.$timeInpVal.style.width = `${ x * 100 }%`;
	}
	#ptrUp( e ) {
		const t = this.#settingTime;

		e.target.releasePointerCapture( e.pointerId );
		e.target.onpointerup =
		e.target.onpointermove =
		this.#settingTime = null;
		this.$dispatch( "currentTime", t * GSUgetAttributeNum( this, "duration" ) );
	}
}

GSUdefineElement( "gsui-cmp-player", gsuiCmpPlayer );
