"use strict";

class gsuiComPlayer extends gsui0ne {
	#settingTime = null;
	#intervalId = null;
	#promises = {};
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
				$actionPop: ".gsuiComPlayer-actions-pop",
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
		this.$elements.$actionPop
			.$on( "beforetoggle", e => {
				e.newState === "open"
					? this.$elements.$actionPop.$append( ...this.#createMenuActions() )
					: this.$elements.$actionPop.$empty();
			} )
			.$onclick( e => {
				const act = $( e.target ).$dataProp();

				if ( act ) {
					this.#cbActionMenu( act );
				}
			} );
	}

	// .........................................................................
	$firstTimeConnected() {
		this.#updateRendered( this.$this.$hasAttr( "rendered" ) );
	}
	static get observedAttributes() {
		return [ "rendered", "name", "link", "dawlink", "duration", "bpm", "currenttime", "likes", "itsmine" ];
		// + "opensource" + "private" + "liked" + "playing" + "actions"
	}
	$attributeChanged( prop, val ) {
		switch ( prop ) {
			case "itsmine":
				this.$elements.$likeBtn.$disabled( val === "" );
				this.$elements.$dawlink.$setAttr( "data-icon", val === "" ? "cu-music-edit" : "cu-music-spark" );
				break;
			case "bpm": this.$elements.$bpm.$text( val ); break;
			case "name": this.$elements.$name.$text( val ); break;
			case "likes": this.$elements.$likes.$text( val ); break;
			case "link": this.$elements.$name.$setAttr( "href", val ); break;
			case "dawlink": this.$elements.$dawlink.$setAttr( "href", val ); break;
			case "rendered": this.#updateRendered( val === "" ); break;
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
	$setForkCallbackPromise( fn ) { this.#promises.fork = fn; }
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
		this.$this.$setAttr( "currenttime", this.$elements.$audio.$prop( "currentTime" ) );
	}
	#updateRendered( b ) {
		this.$elements.$play.$setAttr( b
			? { "data-spin": false, "data-icon": "play", "data-tooltip": false }
			: { "data-spin": false, "data-icon": "file-corrupt", "data-tooltip": GSTX.$player_notRendered } );
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
		this.$elements.$audio.$prop( "currentTime", t * this.$this.$getAttr( "duration" ) );
	}
}

$.$define( "gsui-com-player", gsuiComPlayer );
