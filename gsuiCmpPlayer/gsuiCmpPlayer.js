"use strict";

class gsuiCmpPlayer extends gsui0ne {
	#settingTime = null;
	#actionMenu = null;
	#actions = null;
	#actionMenuDir = "top left";

	constructor() {
		super( {
			$cmpName: "gsuiCmpPlayer",
			$tagName: "gsui-cmp-player",
			$elements: {
				$play: ".gsuiCmpPlayer-play",
				$name: ".gsuiCmpPlayer-nameLink",
				$bpm: ".gsuiCmpPlayer-bpm",
				$dur: ".gsuiCmpPlayer-duration",
				$time: ".gsuiCmpPlayer-currentTime",
				$timeInpVal: ".gsuiCmpPlayer-sliderValue",
				$timeInpTrk: ".gsuiCmpPlayer-sliderInput",
				$dawlink: ".gsuiCmpPlayer-dawlink",
				$actionsBtn: ".gsuiCmpPlayer-actions",
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
		return [ "name", "link", "dawlink", "duration", "bpm", "playing", "currenttime", "actions", "actionsdir" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "bpm": this.$elements.$bpm.textContent = val; break;
			case "name": this.$elements.$name.textContent = val; break;
			case "link": GSUsetAttribute( this.$elements.$name, "href", val ); break;
			case "dawlink": GSUsetAttribute( this.$elements.$dawlink, "href", val ); break;
			case "playing": GSUsetAttribute( this.$elements.$play, "data-icon", val === "" ? "pause" : "play" ); break;
			case "actions": this.#updateActionMenu( val ); break;
			case "actionsdir":
				this.#actionMenuDir = val;
				this.#actionMenu?.$setDirection( val );
				break;
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
	#updateActionMenu( actionsStr ) {
		if ( !this.#actionMenu ) {
			this.#actions = [
				{ hidden: true, id: "open",    icon: "heart",         name: "Make it visible and open-source", desc: "The world will be able to listen to your music and will have access to the source and be able to fork it." },
				{ hidden: true, id: "visible", icon: "public",        name: "Make it visible", desc: "The world will be able to listen to your music, without the source (only the mp3)." },
				{ hidden: true, id: "private", icon: "private",       name: "Make it private", desc: "Only you will see the composition, no one will be able to listen it online." },
				{ hidden: true, id: "delete",  icon: "trash",         name: "Delete it", desc: "The composition will stay in your private bin for 30 days (only premium users have access to the bin)." },
				{ hidden: true, id: "restore", icon: "trash-restore", name: "Restore it", desc: "Get the composition out of the bin." },
			];
			this.#actionMenu = new gsuiActionMenu();
			this.#actionMenu.$bindTargetElement( this.$elements.$actionsBtn );
			this.#actionMenu.$setActions( this.#actions );
			this.#actionMenu.$setDirection( this.#actionMenuDir );
			this.#actionMenu.$setMaxSize( "260px", "180px" );
		}
		if ( actionsStr ) {
			this.#actions.forEach( act => this.#actionMenu.$showAction( act.id, actionsStr.includes( act.id ) ) );
		}
	}
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
