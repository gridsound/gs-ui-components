"use strict";

class gsuiComPlayer extends gsui0ne {
	#url = null;
	#settingTime = null;
	#actionMenu = null;
	#actions = null;
	#actionMenuDir = "TL";
	#intervalId = null;

	constructor() {
		super( {
			$cmpName: "gsuiComPlayer",
			$tagName: "gsui-com-player",
			$elements: {
				$audio: "audio",
				$play: ".gsuiComPlayer-play",
				$name: ".gsuiComPlayer-nameLink",
				$bpm: ".gsuiComPlayer-bpm",
				$dur: ".gsuiComPlayer-duration",
				$time: ".gsuiComPlayer-currentTime",
				$timeInpVal: ".gsuiComPlayer-sliderValue",
				$timeInpTrk: ".gsuiComPlayer-sliderInput",
				$dawlink: ".gsuiComPlayer-dawlink",
				$actionsBtn: ".gsuiComPlayer-actions",
			},
			$attributes: {
				name: "",
				bpm: 60,
				duration: 0,
				currenttime: 0,
			},
		} );
		Object.seal( this );
		this.$elements.$play.onclick = this.#onclickPlay.bind( this );
		this.$elements.$timeInpTrk.onpointerdown = this.#ptrDown.bind( this );
		this.$elements.$audio.addEventListener( "error", () => {
			GSUdomRmAttr( this, "playing" );
			GSUdomRmAttr( this.$elements.$audio, "src" );
			GSUdomSetAttr( this.$elements.$play, {
				"data-icon": "file-corrupt",
				title: "This composition hasn't yet been rendered by its author",
			} );
		} );
	}

	// .........................................................................
	static get observedAttributes() {
		return [ "url", "name", "link", "dawlink", "duration", "bpm", "playing", "currenttime", "actions", "actionsdir", "actionloading" ];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "url": this.#setURL( val ); break;
			case "bpm": this.$elements.$bpm.textContent = val; break;
			case "name": this.$elements.$name.textContent = val; break;
			case "link": GSUdomSetAttr( this.$elements.$name, "href", val ); break;
			case "dawlink": GSUdomSetAttr( this.$elements.$dawlink, "href", val ); break;
			case "playing": val === "" ? this.#play() : this.#pause(); break;
			case "actions": this.#updateActionMenu( val ); break;
			case "actionsdir":
				this.#actionMenuDir = val;
				this.#actionMenu?.$setDirection( val );
				break;
			case "actionloading":
				GSUdomSetAttr( this.$elements.$actionsBtn, "data-spin", val === "" ? "on" : false );
				this.$elements.$actionsBtn.disabled = val === "";
				break;
			case "duration":
				this.$elements.$dur.textContent = gsuiComPlayer.$calcDuration( val );
				this.$updateTimeSlider();
				break;
			case "currenttime":
				if ( this.#settingTime === null ) {
					this.$elements.$time.textContent = gsuiComPlayer.$calcDuration( val );
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
		const dur = GSUdomGetAttrNum( this, "duration" );
		const time = GSUdomGetAttrNum( this, "currenttime" );

		this.$elements.$timeInpVal.style.width = `${ time / dur * 100 }%`;
	}

	// .........................................................................
	#setURL( url ) {
		GSUdomSetAttr( this.$elements.$play, "data-icon", "play" );
		GSUdomRmAttr( this.$elements.$play, "title" );
		this.#url = url ?? null;
		this.$elements.$audio.src = url;
	}
	#isReady() {
		return this.$elements.$audio.readyState > 0;
	}
	#play() {
		if ( this.#isReady() ) {
			this.$elements.$audio.play();
			this.#intervalId = GSUsetInterval( this.#onframePlaying.bind( this ), 1 / 10 );
			GSUdomSetAttr( this.$elements.$play, "data-icon", "pause" );
		}
	}
	#pause() {
		if ( this.#isReady() ) {
			this.$elements.$audio.pause();
			GSUclearInterval( this.#intervalId );
			GSUdomSetAttr( this.$elements.$play, "data-icon", "play" );
		}
	}
	#onclickPlay() {
		if ( this.#isReady() ) {
			GSUdomTogAttr( this, "playing" );
			GSUdomDispatch( this, GSUdomHasAttr( this, "playing" ) ? GSEV_COMPLAYER_PLAY : GSEV_COMPLAYER_STOP );
		} else {
			this.#setURL( this.#url );
		}
	}
	#onframePlaying() {
		GSUdomSetAttr( this, "currenttime", this.$elements.$audio.currentTime );
	}
	#updateActionMenu( actionsStr ) {
		if ( !this.#actionMenu ) {
			this.#actions = [
				{ hidden: true, id: "open",    icon: "heart",         name: "Make it visible and open-source", desc: "The world will be able to listen to your music and will have access to the source and be able to fork it." },
				{ hidden: true, id: "visible", icon: "public",        name: "Make it visible", desc: "The world will be able to listen to your music, without the source (only the mp3)." },
				{ hidden: true, id: "private", icon: "private",       name: "Make it private", desc: "Only you will see the composition, no one will be able to listen it online." },
				{ hidden: true, id: "fork",    icon: "fork",          name: "Fork it", desc: "Copy the composition to your profile to apply the changes you want." },
				{ hidden: true, id: "delete",  icon: "trash",         name: "Delete it", desc: "The composition will stay in your private bin for 30 days (only premium users have access to the bin)." },
				{ hidden: true, id: "restore", icon: "trash-restore", name: "Restore it", desc: "Get the composition out of the bin." },
			];
			this.#actionMenu = new gsuiActionMenu();
			this.#actionMenu.$bindTargetElement( this.$elements.$actionsBtn );
			this.#actionMenu.$setActions( this.#actions );
			this.#actionMenu.$setDirection( this.#actionMenuDir );
			this.#actionMenu.$setMaxSize( "260px", "180px" );
			this.#actionMenu.$setCallback( act => GSUdomDispatch( this, GSEV_COMPLAYER_ACTION, act ) );
		}
		if ( actionsStr ) {
			this.#actions.forEach( act => this.#actionMenu.$changeAction( act.id, "hidden", !actionsStr.includes( act.id ) ) );
		}
	}
	#ptrDown( e ) {
		e.target.setPointerCapture( e.pointerId );
		e.target.onpointerup = this.#ptrUp.bind( this );
		e.target.onpointermove = this.#ptrMove.bind( this );
		this.#ptrMove( e );
	}
	#ptrMove( e ) {
		const bcr = GSUdomBCR( e.target );
		const x = GSUmathClamp( ( e.clientX - bcr.x ) / bcr.width, 0, 1 );

		this.#settingTime = x;
		this.$elements.$timeInpVal.style.width = `${ x * 100 }%`;
	}
	#ptrUp( e ) {
		const t = this.#settingTime;

		e.target.releasePointerCapture( e.pointerId );
		e.target.onpointerup =
		e.target.onpointermove =
		this.#settingTime = null;
		this.$elements.$audio.currentTime = t * GSUdomGetAttrNum( this, "duration" );
	}
}

GSUdomDefine( "gsui-com-player", gsuiComPlayer );
