"use strict";

class gsuiComPlayer extends gsui0ne {
	#settingTime = null;
	#intervalId = null;
	#promises = {};
	#scratch = $noop;
	#currentTimeStr = "";
	static #options = GSUdeepFreeze( {
		open:    { value: "open",    icon: "opensource", name: GSTX.$player_opensourceIt, desc: GSTX.$player_opensourceDesc },
		visible: { value: "visible", icon: "public",     name: GSTX.$player_publicIt,     desc: GSTX.$player_publicDesc },
		private: { value: "private", icon: "private",    name: GSTX.$player_privateIt,    desc: GSTX.$player_privateDesc },
		fork:    { value: "fork",    icon: "fork",       name: GSTX.$player_forkIt,       desc: GSTX.$player_forkDesc },
		restore: { value: "restore", icon: "untrash",    name: GSTX.$player_restoreIt,    desc: GSTX.$player_restoreDesc },
		delete:  { value: "delete",  icon: "trash",      name: GSTX.$player_deleteIt,     desc: GSTX.$player_deleteDesc, danger: true },
	} );

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
				$menuBtn: "[popovertarget]",
				$menu: "gsui-dropdown",
			},
			$attributes: {
				name: "",
				bpm: 60,
				duration: 0,
				currenttime: 0,
				likes: 0,
			},
		} );
		this.#updateMenuBtn();
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
					this.$elements.$playIco.$rmAttr( "spin" );
					this.$elements.$audio.$rmAttr( "src" );
				},
			} );
		this.$elements.$menu
			.$on( "beforetoggle", e => {
				this.$elements.$menu.$empty();
				if ( e.newState === "open" ) {
					this.$elements.$menu.$append( ...gsuiComPlayer.#createOptions( this.$this ) );
				}
			} );
		this.$this.$listen( {
			[ GSEV_DROPDOWN_CLICK ]: d => this.#menuClick( d.$args[ 0 ] ),
			[ GSEV_SCRATCH_CLOSE ]: () => this.$this.$rmAttr( "scratch" ),
			[ GSEV_SCRATCH_PTRDOWN ]: () => {
				if ( this.$elements.$audio.$prop( "paused" ) ) {
					this.$play();
				}
			},
		} );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.#updateRendered( this.$this.$hasAttr( "rendered" ) );
	}
	static get observedAttributes() {
		return [ "rendered", "name", "link", "duration", "bpm", "currenttime", "likes", "itsmine", "opensource", "scratch" ];
		// "private" + "liked" + "deleted" + "playing"
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "itsmine":
				this.$elements.$likeBtn.$disabled( val === "" );
				this.$elements.$dawlink.$child( 0 ).$setAttr( "icon", val === "" ? "cu-music-edit" : "cu-music-spark" );
			case "opensource":
				this.#updateMenuBtn();
				this.#updateDawLink();
				break;
			case "scratch": this.#toggleScratch( val === "" ); break;
			case "bpm":
				this.$elements.$bpm.$text( val );
				this.#scratch.$setAttr( "bpm", val );
				break;
			case "name": this.$elements.$name.$text( val ); break;
			case "likes": this.$elements.$likes.$text( val ); break;
			case "link": this.$elements.$name.$setAttr( "href", val ); break;
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
		this.$elements.$playIco.$setAttr( "icon", "pause" );
		this.$this.$addAttr( "playing" );
	}
	#onpause() {
		GSUclearInterval( this.#intervalId );
		this.$elements.$playIco.$setAttr( "icon", "play" );
		this.$this.$rmAttr( "playing" );
	}
	#onclickLike() {
		const liked = this.$this.$hasAttr( "liked" );

		this.$elements.$likeBtn.$disabled( true );
		this.$elements.$likeIco.$addAttr( "spin" );
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
				this.$elements.$likeIco.$rmAttr( "spin" );
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
			this.$elements.$playIco.$addAttr( "spin" );
			return this.#promises.renders( this )
				.then( url => {
					if ( url ) {
						this.$this.$addAttr( "rendered" );
						this.$elements.$audio.$setAttr( "src", url );
						this.#activateScratch();
					}
				} )
				.finally( () => {
					this.$elements.$playIco.$rmAttr( "spin" );
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
	#isMineOrOpen() {
		return this.$this.$hasAttr( "itsmine" ) || this.$this.$hasAttr( "opensource" );
	}
	#updateDawLink() {
		this.$elements.$dawlink.$setAttr( "href", this.#isMineOrOpen() ? `${ GSURL.$gsDAW }/#${ this.$this.$dataId() }` : false );
	}
	#updateMenuBtn() {
		this.$elements.$menuBtn.$css( "display", this.#isMineOrOpen() ? "flex" : "none" );
	}
	#updateRendered( b ) {
		this.$elements.$play.$setAttr( "data-tooltip", b ? false : GSTX.$player_notRendered );
		this.$elements.$playIco.$setAttr( b
			? { spin: false, icon: "play" }
			: { spin: false, icon: "file-corrupt" } );
		this.$elements.$scratchBtn
			.$disabled( !b )
			.$setAttr( "data-tooltip", b ? GSTX.$player_openTurntable : GSTX.$player_noTurntable )
			.$child( 0 ).$setAttr( "icon", b ? "turntable" : "cu-no-turntable" );
		if ( !b ) {
			this.$this.$rmAttr( "scratch" );
		}
	}
	static #createOption( obj, b ) {
		return b && $.$elem( "gsui-dropdown-option", obj );
	}
	static #createOptions( el ) {
		const acts = gsuiComPlayer.#options;
		const isMine = el.$hasAttr( "itsmine" );
		const isPriv = el.$hasAttr( "private" );
		const isOpen = el.$hasAttr( "opensource" );
		const isDel = el.$hasAttr( "deleted" );

		return [
			gsuiComPlayer.#createOption( acts.open,    !isDel && isMine && !isOpen ),
			gsuiComPlayer.#createOption( acts.private, !isDel && isMine && !isPriv ),
			gsuiComPlayer.#createOption( acts.visible, !isDel && isMine && ( isOpen || isPriv ) ),
			gsuiComPlayer.#createOption( acts.fork,    !isDel && ( isMine || isOpen ) ),
			gsuiComPlayer.#createOption( acts.restore,  isDel && isMine ),
			gsuiComPlayer.#createOption( acts.delete,  !isDel && isMine ),
		];
	}
	static #actioning = {
		delete: "deleting",
		restore: "restoring",
	};
	#menuLoading( b ) {
		this.$elements.$menuBtn
			.$disabled( b )
			.$child( 0 ).$setAttr( "spin", b );
	}
	#menuClick( act ) {
		const actVis = GSUisOneOf( act, "open", "visible", "private" );
		const actDel = GSUisOneOf( act, "restore", "delete" );
		const prom = actVis
			? this.#promises.visibility
			: this.#promises[ act ];
		const clazz = gsuiComPlayer.#actioning[ act ];

		this.#menuLoading( true );
		prom( this, act )
			.then( res => {
				const o = { [ clazz ]: true };

				if ( actDel ) {
					o.deleted = act === "delete";
				} else if ( actVis ) {
					o.private = act === "private";
					o.opensource = act === "open";
				}
				this.$this.$setAttr( o ).$dispatch( GSEV_COMPLAYER_ACTION, act, res );
				GSUsetTimeout( () => this.$this.$rmAttr( clazz ), .35 );
			} )
			.finally( () => this.#menuLoading( false ) );
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
