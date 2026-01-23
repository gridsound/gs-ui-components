"use strict";

class gsuiComPlayer extends gsui0ne {
	#settingTime = null;
	#actionMenu = null;
	#actions = null;
	#actionMenuDir = "TL";
	#intervalId = null;
	#promises = {};

	constructor() {
		super( {
			$cmpName: "gsuiComPlayer",
			$tagName: "gsui-com-player",
			$jqueryfy: true,
			$elements: {
				$audio: "audio",
				$play: ".gsuiComPlayer-play",
				$name: ".gsuiComPlayer-nameLink",
				$likeBtn: ".gsuiComPlayer-like",
				$likeIco: ".gsuiComPlayer-like .gsuiIcon",
				$likes: ".gsuiComPlayer-like span",
				$bpm: ".gsuiComPlayer-bpm",
				$dur: ".gsuiComPlayer-duration",
				$time: ".gsuiComPlayer-currentTime",
				$timeInp: ".gsuiComPlayer-slider",
				$timeInpVal: ".gsuiComPlayer-slider *",
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
		this.$elements.$play.$on( "click", this.#onclickPlay.bind( this ) );
		this.$elements.$likeBtn.$on( "click", this.#onclickLike.bind( this ) );
		this.$elements.$timeInp.$on( "pointerdown", this.#ptrDown.bind( this ) );
		this.$elements.$audio.$on( {
			play: this.#onplay.bind( this ),
			pause: this.#onpause.bind( this ),
			loadedmetadata: e => this.$this.$setAttr( "duration", e.target.duration ),
			error: () => {
				this.$this.$setAttr( { playing: false, rendered: false } );
				this.$elements.$play.$rmAttr( "data-spin" );
				this.$elements.$audio.$rmAttr( "src" );
			},
		} );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.#updateRendered( this.$this.$hasAttr( "rendered" ) );
	}
	static get observedAttributes() {
		return [ "rendered", "name", "link", "dawlink", "duration", "bpm", "currenttime", "actions", "actionsdir", "likes", "itsmine" ];
		// + "opensource" + "private" + "liked" + "playing"
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "itsmine": this.$elements.$likeBtn.$setAttr( "disabled", val === "" ); break;
			case "bpm": this.$elements.$bpm.$text( val ); break;
			case "name": this.$elements.$name.$text( val ); break;
			case "likes": this.$elements.$likes.$text( val ); break;
			case "link": this.$elements.$name.$setAttr( "href", val ); break;
			case "dawlink": this.$elements.$dawlink.$setAttr( "href", val ); break;
			case "rendered": this.#updateRendered( val === "" ); break;
			case "actions": this.#updateActionMenu( val ); break;
			case "actionsdir":
				this.#actionMenuDir = val;
				this.#actionMenu?.$setDirection( val );
				break;
			case "duration":
				this.$elements.$dur.$text( gsuiComPlayer.$calcDuration( val ) );
				this.$updateTimeSlider();
				break;
			case "currenttime":
				if ( this.#settingTime === null ) {
					this.$elements.$time.$text( gsuiComPlayer.$calcDuration( val ) );
					this.$updateTimeSlider();
				}
				break;
		}
	}

	// .........................................................................
	$play() {
		this.$elements.$audio.$play();
		this.$this.$dispatch( GSEV_COMPLAYER_PLAY );
	}
	$pause() {
		this.$elements.$audio.$pause();
		this.$this.$dispatch( GSEV_COMPLAYER_STOP );
	}

	// .........................................................................
	$setLikeCallbackPromise( fn ) { this.#promises.like = fn; }
	$setRendersCallbackPromise( fn ) { this.#promises.renders = fn; }
	$setDeleteCallbackPromise( fn ) { this.#promises.delete = fn; }
	$setRestoreCallbackPromise( fn ) { this.#promises.restore = fn; }
	$setVisibilityCallbackPromise( fn ) { this.#promises.visibility = fn; }
	static $calcDuration( sec ) {
		const t = GSUsplitSeconds( sec );

		return `${ t.m }:${ t.s }`;
	}
	$updateTimeSlider() {
		const [ dur, time ] = this.$this.$getAttr( "duration", "currenttime" );

		this.$elements.$timeInpVal.$width( time / dur * 100, "%" );
	}

	// .........................................................................
	#onplay() {
		this.#intervalId = GSUsetInterval( this.#onframePlaying.bind( this ), 1 / 10 );
		this.$elements.$play.$setAttr( "data-icon", "pause" );
		this.$this.$addAttr( "playing" );
	}
	#onpause() {
		GSUclearInterval( this.#intervalId );
		this.$elements.$play.$setAttr( "data-icon", "play" );
		this.$this.$rmAttr( "playing" );
	}
	#onclickLike() {
		const liked = this.$this.$hasAttr( "liked" );

		this.$elements.$likeBtn.$addAttr( "disabled" );
		this.$elements.$likeIco.$setAttr( "data-spin", "on" );
		this.#promises.like( this, liked ? "unlike" : "like" )
			.then( () => {
				this.$this.$setAttr( {
					liked: !liked,
					likes: +this.$this.$getAttr( "likes" ) + ( !liked * 2 - 1 ),
				} );
			} )
			.catch( err => GSUpopup.$alert( `Error ${ err.code }`, err.msg ) )
			.finally( () => {
				this.$elements.$likeBtn.$rmAttr( "disabled" );
				this.$elements.$likeIco.$rmAttr( "data-spin" );
			} );
	}
	#onclickPlay() {
		if ( this.$elements.$audio.$get( 0 ).src ) {
			this.$elements.$audio.$get( 0 ).paused
				? this.$play()
				: this.$pause();
		} else {
			let hasRender;

			this.$elements.$play.$setAttr( "data-spin", "on" );
			this.#promises.renders( this )
				.then( url => {
					if ( url ) {
						hasRender = this.$this.$hasAttr( "rendered" );
						this.$this.$addAttr( "rendered" );
						this.$elements.$audio.$setAttr( "src", url );
					}
				} )
				.finally( () => {
					this.$elements.$play.$rmAttr( "data-spin" );
					if ( hasRender ) {
						this.$play();
					}
				} );
		}
	}
	#onframePlaying() {
		this.$this.$setAttr( "currenttime", this.$elements.$audio.$get( 0 ).currentTime );
	}
	#updateRendered( b ) {
		this.$elements.$play.$setAttr( b
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
			this.#actionMenu.$bindTargetElement( this.$elements.$actionsBtn.$get( 0 ) );
			this.#actionMenu.$setActions( this.#actions );
			this.#actionMenu.$setDirection( this.#actionMenuDir );
			this.#actionMenu.$setMaxSize( "260px", "180px" );
			this.#actionMenu.$setCallback( this.#cbActionMenu.bind( this ) );
		}
		if ( actionsStr ) {
			this.#actions.forEach( act => this.#actionMenu.$changeAction( act.id, "hidden", !actionsStr.includes( act.id ) ) );
		}
	}
	static #actioning = {
		fork: "forking",
		delete: "deleting",
		restore: "restoring",
	};
	#cbActionMenu( act ) {
		const prom = act === "open" || act === "visible" || act === "private"
			? this.#promises.visibility
			: this.#promises[ act ];
		const clazz = gsuiComPlayer.#actioning[ act ];

		this.$elements.$actionsBtn.$setAttr( {
			"data-spin": "on",
			disabled: true,
		} );
		prom( this, act )
			.then( () => {
				this.$this.$setAttr( {
					[ clazz ]: true,
					deleted: act === "delete",
				} );
				this.$this.$dispatch( GSEV_COMPLAYER_ACTION, act );
				GSUsetTimeout( () => this.$this.$rmAttr( clazz ), .35 );
			} )
			.finally( () => {
				this.$elements.$actionsBtn.$setAttr( {
					"data-spin": false,
					disabled: false,
				} );
			} );
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
		this.$elements.$timeInpVal.$width( x * 100, "%" );
	}
	#ptrUp( e ) {
		const t = this.#settingTime;

		e.target.releasePointerCapture( e.pointerId );
		e.target.onpointerup =
		e.target.onpointermove =
		this.#settingTime = null;
		this.$elements.$audio.$get( 0 ).currentTime = t * this.$this.$getAttr( "duration" );
	}
}

GSUdomDefine( "gsui-com-player", gsuiComPlayer );
