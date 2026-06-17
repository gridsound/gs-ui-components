"use strict";

class gsuiComPlayer extends gsui0ne {
	#settingTime = null;
	#intervalId = null;
	#promises = {};
	#scratch = $noop;
	#currentTimeStr = "";
	static #actions = GSUdeepFreeze( [
		{ id: "open",    icon: "opensource", name: GSTX.$player_opensourceIt, desc: GSTX.$player_opensourceDesc },
		{ id: "visible", icon: "public",     name: GSTX.$player_publicIt,     desc: GSTX.$player_publicDesc },
		{ id: "private", icon: "private",    name: GSTX.$player_privateIt,    desc: GSTX.$player_privateDesc },
		{ id: "fork",    icon: "fork",       name: GSTX.$player_forkIt,       desc: GSTX.$player_forkDesc },
		{ id: "delete",  icon: "trash",      name: GSTX.$player_deleteIt,     desc: GSTX.$player_deleteDesc },
		{ id: "restore", icon: "untrash",    name: GSTX.$player_restoreIt,    desc: GSTX.$player_restoreDesc },
	] );

	constructor() {
		super( {
			$tagName: "gsui-com-player",
			$elements: {
				$audio: "audio",
				$play: "[data-action=play]",
				$playIco: "[data-action=play] gsui-icon",
				$name: "gsui-com-player-name a",
				$likeBtn: "[data-action=like]",
				$likeIco: "[data-action=like] gsui-icon",
				$likes: "[data-action=like] span",
				$scratchBtn: "[data-action=scratch]",
				$bpm: "gsui-com-player-tempo span",
				$dur: "gsui-com-player-duration",
				$time: "gsui-com-player-currenttime",
				$timeInp: "gsui-com-player-slider",
				$timeInpVal: "gsui-com-player-slider *",
				$dawlink: "[data-action=daw]",
				$actionsBtn: "[popovertarget]",
				$actionPop: "gsui-com-player-actions-pop",
			},
			$attributes: {
				name: "",
				bpm: 60,
				duration: 0,
				currenttime: 0,
				likes: 0,
			},
		} );
		this.$elements.$play.$onclick( this.#onclickPlay.bind( this ) );
		this.$elements.$likeBtn.$onclick( this.#onclickLike.bind( this ) );
		this.$elements.$scratchBtn.$onclick( () => {
			if ( this.$this.$hasAttr( "scratch" ) ) {
				this.$this.$rmAttr( "scratch" );
			} else {
				this.#getRender().then( () => this.$this.$addAttr( "scratch" ) );
			}
		} );
		this.$elements.$timeInp.$on( "pointerdown", this.#ptrDown.bind( this ) );
		this.$elements.$audio
			.$prop( "preservesPitch", false )
			.$on( {
				play: this.#onplay.bind( this ),
				pause: this.#onpause.bind( this ),
				loadedmetadata: e => this.$this.$setAttr( "duration", e.target.duration ),
				error: () => {
					this.$this.$setAttr( { playing: false, rendered: false } );
					this.$elements.$playIco.$rmAttr( "data-spin" );
					this.$elements.$audio.$rmAttr( "src" );
				},
			} );
		this.$elements.$actionPop
			.$on( "beforetoggle", e => {
				this.$elements.$actionPop.$empty();
				if ( e.newState === "open" ) {
					this.$elements.$actionPop.$append( ...this.#createMenuActions() );
				}
			} )
			.$onclick( e => {
				const act = $( e.target ).$dataProp();

				if ( act ) {
					this.$elements.$actionPop.$togglePopover( false );
					this.#cbActionMenu( act );
				}
			} );
		this.$this.$listen( {
			[ GSEV_SCRATCH_CLOSE ]: () => this.$this.$rmAttr( "scratch" ),
		} );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.#updateRendered( this.$this.$hasAttr( "rendered" ) );
	}
	static get observedAttributes() {
		return [ "rendered", "name", "link", "dawlink", "duration", "bpm", "currenttime", "likes", "itsmine", "scratch" ];
		// + "opensource" + "private" + "liked" + "playing" + "actions"
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "scratch": this.#toggleScratch( val === "" ); break;
			case "itsmine":
				this.$elements.$likeBtn.$disabled( val === "" );
				this.$elements.$dawlink.$setAttr( "data-icon", val === "" ? "cu-music-edit" : "cu-music-spark" );
				break;
			case "bpm":
				this.$elements.$bpm.$text( val );
				this.#scratch.$setAttr( "bpm", val );
				break;
			case "name": this.$elements.$name.$text( val ); break;
			case "likes": this.$elements.$likes.$text( val ); break;
			case "link": this.$elements.$name.$setAttr( "href", val ); break;
			case "dawlink": this.$elements.$dawlink.$setAttr( "href", val ); break;
			case "rendered": this.#updateRendered( val === "" ); break;
			case "duration":
				this.$elements.$dur.$text( gsuiComPlayer.$calcDuration( val ) );
				this.#updateTimeSlider();
				break;
			case "currenttime":
				if ( this.#settingTime === null ) {
					const t = gsuiComPlayer.$calcDuration( val );

					if ( t !== this.#currentTimeStr ) {
						this.#currentTimeStr = t;
						this.$elements.$time.$text( t );
					}
					this.#updateTimeSlider();
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
	$setForkCallbackPromise( fn ) { this.#promises.fork = fn; }
	$setRendersCallbackPromise( fn ) { this.#promises.renders = fn; }
	$setDeleteCallbackPromise( fn ) { this.#promises.delete = fn; }
	$setRestoreCallbackPromise( fn ) { this.#promises.restore = fn; }
	$setVisibilityCallbackPromise( fn ) { this.#promises.visibility = fn; }
	static $calcDuration( sec ) {
		const t = GSUsplitSeconds( sec );

		return `${ t.m }:${ t.s }`;
	}
	#updateTimeSlider() {
		const [ dur, time ] = this.$this.$getAttr( "duration", "currenttime" );

		this.$elements.$timeInpVal.$width( time / dur * 100, "%" );
	}

	// .........................................................................
	#getCurrentTime() {
		const rev = this.#scratch.$query( "audio" ).$get( 0 );

		return rev?.playbackRate > 0
			? rev.duration - rev.currentTime
			: this.$elements.$audio.$prop( "currentTime" );
	}
	#setCurrentTime( t ) {
		const elB = this.#scratch.$query( "audio" );
		const forward = this.$elements.$audio.$prop( "playbackRate" ) > 0;
		const elA = forward ? this.$elements.$audio : elB;
		const t2 = forward ? t : elA.$prop( "duration" ) - t;

		elA.$prop( "currentTime", t2 );
	}

	// .........................................................................
	#onplay() {
		this.#intervalId = GSUsetInterval( this.#onframePlaying.bind( this ), 1 / 16 );
		this.$elements.$playIco.$setAttr( "data-icon", "pause" );
		this.$this.$addAttr( "playing" );
	}
	#onpause() {
		GSUclearInterval( this.#intervalId );
		this.$elements.$playIco.$setAttr( "data-icon", "play" );
		this.$this.$rmAttr( "playing" );
	}
	#onclickLike() {
		const liked = this.$this.$hasAttr( "liked" );

		this.$elements.$likeBtn.$disabled( true );
		this.$elements.$likeIco.$setAttr( "data-spin", "on" );
		this.#promises.like( this, liked ? "unlike" : "like" )
			.then( () => {
				this.$this.$setAttr( {
					liked: !liked,
					likes: +this.$this.$getAttr( "likes" ) + ( !liked * 2 - 1 ),
				} );
			} )
			.catch( err => $popup.$alert( `Error ${ err.code }`, err.msg ) )
			.finally( () => {
				this.$elements.$likeBtn.$disabled( false );
				this.$elements.$likeIco.$rmAttr( "data-spin" );
			} );
	}
	#onclickPlay() {
		if ( this.$elements.$audio.$prop( "src" ) ) {
			this.$elements.$audio.$prop( "paused" )
				? this.$play()
				: this.$pause();
		} else {
			let hasRender = this.$this.$hasAttr( "rendered" );

			this.#getRender().then( () => {
				if ( hasRender ) {
					this.$play();
				}
			} );
		}
	}
	#getRender() {
		if ( !this.$elements.$audio.$prop( "src" ) ) {
			this.$elements.$playIco.$setAttr( "data-spin", "on" );
			return this.#promises.renders( this )
				.then( url => {
					if ( url ) {
						this.$this.$addAttr( "rendered" );
						this.$elements.$audio.$setAttr( "src", url );
						this.#activateScratch();
					}
				} )
				.finally( () => {
					this.$elements.$playIco.$rmAttr( "data-spin" );
				} );
		}
		return Promise.resolve();
	}
	#onframePlaying() {
		const t = this.#getCurrentTime();

		if ( t !== null ) {
			this.$this.$setAttr( "currenttime", t );
		}
	}
	#updateRendered( b ) {
		this.$elements.$play.$setAttr( "data-tooltip", b ? false : GSTX.$player_notRendered );
		this.$elements.$playIco.$setAttr( b
			? { "data-spin": false, "data-icon": "play" }
			: { "data-spin": false, "data-icon": "file-corrupt" } );
		this.$elements.$scratchBtn
			.$disabled( !b )
			.$setAttr( "data-tooltip", b ? GSTX.$player_openTurntable : GSTX.$player_noTurntable )
			.$child( 0 ).$setAttr( "data-icon", b ? "turntable" : "cu-no-turntable" );
		if ( !b ) {
			this.$this.$rmAttr( "scratch" );
		}
	}
	#createMenuActions() {
		const actionsStr = this.$this.$getAttr( "actions" );

		return gsuiComPlayer.#actions.map( act => {
			return !actionsStr.includes( act.id )
				? null
				: $.$button( { "data-prop": act.id },
					$.$bold( { inert: true },
						$.$icon( { icon: act.icon } ),
						$.$span( null, act.name ),
					),
					$.$span( { inert: true }, act.desc ),
				);
		} );
	}
	static #actioning = {
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
			.then( res => {
				this.$this.$setAttr( {
					[ clazz ]: true,
					deleted: act === "delete",
				} );
				this.$this.$dispatch( GSEV_COMPLAYER_ACTION, act, res );
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
		$( e.target )
			.$setPtrCapture( e.pointerId )
			.$on( {
				pointerup: this.#ptrUp.bind( this ),
				pointermove: this.#ptrMove.bind( this ),
			} );
		this.#ptrMove( e );
	}
	#ptrMove( e ) {
		const { x, w } = $.$bcr( e.target );
		const x2 = GSUmathClamp( ( e.clientX - x ) / w, 0, 1 );

		this.#settingTime = x2;
		this.$elements.$timeInpVal.$width( x2 * 100, "%" );
	}
	#ptrUp( e ) {
		const t = this.#settingTime;

		$( e.target )
			.$relPtrCapture( e.pointerId )
			.$off( "pointerup", "pointermove" );
		this.#settingTime = null;
		this.#setCurrentTime( t * this.$this.$getAttr( "duration" ) );
	}

	// .........................................................................
	#toggleScratch( b ) {
		if ( !b ) {
			this.#scratch.$remove();
			this.#scratch = $noop;
			this.$elements.$audio.$prop( "playbackRate", 1 );
		} else {
			this.#scratch = $( "<gsui-scratch>" )
				.$setAttr( "bpm", this.$this.$getAttr( "bpm" ) )
				.$appendTo( this );
			if ( this.$elements.$audio.$getAttr( "src" ) ) {
				this.#activateScratch();
			}
		}
		this.$elements.$scratchBtn.$setAttr( "data-tooltip", b ? GSTX.$player_closeTurntable : GSTX.$player_openTurntable );
	}
	#activateScratch() {
		this.#scratch.$message( GSEV_SCRATCH_LOAD, this.$elements.$audio );
	}
}

$.$define( "gsui-com-player", gsuiComPlayer );
