"use strict";

class gsuiComPlayer extends gsui0ne {
	#settingTime = null;
	#actionMenu = null;
	#actions = null;
	#actionMenuDir = "TL";
	#intervalId = null;
	#likeCallbackPromise = null;
	#rendersCallbackPromise = null;

	constructor() {
		super( {
			$cmpName: "gsuiComPlayer",
			$tagName: "gsui-com-player",
			$elements: {
				$audio: "audio",
				$play: ".gsuiComPlayer-play",
				$name: ".gsuiComPlayer-nameLink",
				$likeBtn: ".gsuiComPlayer-like",
				$likeIco: "[].gsuiComPlayer-like .gsuiIcon",
				$likes: ".gsuiComPlayer-like span",
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
				likes: 0,
			},
		} );
		Object.seal( this );
		this.$elements.$play.onclick = this.#onclickPlay.bind( this );
		this.$elements.$likeBtn.onclick = this.#onclickLike.bind( this );
		this.$elements.$timeInpTrk.onpointerdown = this.#ptrDown.bind( this );
		this.$elements.$audio.addEventListener( "error", e => {
			GSUdomRmAttr( this, "playing", "rendered" );
			GSUdomRmAttr( this.$elements.$play, "data-spin" );
			GSUdomRmAttr( this.$elements.$audio, "src" );
		} );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.#updateRendered( GSUdomHasAttr( this, "rendered" ) );
	}
	static get observedAttributes() {
		return [
			"rendered", "name", "link", "dawlink", "duration", "bpm", "playing",
			"currenttime", "actions", "actionsdir", "actionloading", "likes",
			"itsmine", // "opensource", "private", "liked"
		];
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "itsmine": GSUdomSetAttr( this.$elements.$likeBtn, "disabled", val === "" ); break;
			case "bpm": this.$elements.$bpm.textContent = val; break;
			case "name": this.$elements.$name.textContent = val; break;
			case "likes": this.$elements.$likes.textContent = val; break;
			case "link": GSUdomSetAttr( this.$elements.$name, "href", val ); break;
			case "dawlink": GSUdomSetAttr( this.$elements.$dawlink, "href", val ); break;
			case "playing": val === "" ? this.#play() : this.#pause(); break;
			case "rendered": this.#updateRendered( val === "" ); break;
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
	$setLikeCallbackPromise( fn ) { this.#likeCallbackPromise = fn; }
	$setRendersCallbackPromise( fn ) { this.#rendersCallbackPromise = fn; }
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
	#play() {
		this.$elements.$audio.play();
		this.#intervalId = GSUsetInterval( this.#onframePlaying.bind( this ), 1 / 10 );
		GSUdomSetAttr( this.$elements.$play, "data-icon", "pause" );
	}
	#pause() {
		this.$elements.$audio.pause();
		GSUclearInterval( this.#intervalId );
		GSUdomSetAttr( this.$elements.$play, "data-icon", "play" );
	}
	#onclickLike() {
		const liked = GSUdomHasAttr( this, "liked" );

		GSUdomSetAttr( this.$elements.$likeIco[ 0 ], { "data-spin": "on" } );
		GSUdomSetAttr( this.$elements.$likeIco[ 1 ], { "data-spin": "on" } );
		this.#likeCallbackPromise( this, liked ? "unlike" : "like" )
			.then( () => {
				GSUdomSetAttr( this, {
					liked: !liked,
					likes: GSUdomGetAttrNum( this, "likes" ) + ( !liked * 2 - 1 ),
				} );
			} )
			.finally( () => {
				GSUdomRmAttr( this.$elements.$likeIco[ 0 ], "data-spin" );
				GSUdomRmAttr( this.$elements.$likeIco[ 1 ], "data-spin" );
			} );
	}
	#onclickPlay() {
		if ( this.$elements.$audio.src ) {
			GSUdomTogAttr( this, "playing" );
			GSUdomDispatch( this, GSUdomHasAttr( this, "playing" ) ? GSEV_COMPLAYER_PLAY : GSEV_COMPLAYER_STOP );
		} else {
			let hasRender;

			GSUdomSetAttr( this.$elements.$play, "data-spin", "on" );
			this.#rendersCallbackPromise( this )
				.then( url => {
					if ( url ) {
						hasRender = GSUdomHasAttr( this, "rendered" );
						GSUdomSetAttr( this, "rendered", true );
						this.$elements.$audio.src = url;
					}
				} )
				.finally( () => {
					GSUdomRmAttr( this.$elements.$play, "data-spin" );
					if ( hasRender ) {
						GSUdomSetAttr( this, "playing", true );
						GSUdomDispatch( this, GSEV_COMPLAYER_PLAY );
					}
				} );
		}
	}
	#onframePlaying() {
		GSUdomSetAttr( this, "currenttime", this.$elements.$audio.currentTime );
	}
	#updateRendered( b ) {
		GSUdomSetAttr( this.$elements.$play, b
			? { "data-spin": false, "data-icon": "play", title: false }
			: { "data-spin": false, "data-icon": "file-corrupt", title: "This composition hasn't yet been rendered by its author" } );
	}
	#updateActionMenu( actionsStr ) {
		if ( !this.#actionMenu ) {
			this.#actions = [
				{ hidden: true, id: "open",    icon: "heart",         name: "Make it open-source", desc: "The world will be able to listen to your music and will have access to the source and be able to fork/copy it." },
				{ hidden: true, id: "visible", icon: "public",        name: "Make it public", desc: "The world will be able to listen to your music, without the source (only the rendered file)." },
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
