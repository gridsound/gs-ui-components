"use strict";

const GSTXall = GSUdeepFreeze( {
	en: {
		$loading:      "loading…",
		$checkVersion: "check the version",
		// .....................................................................
		$user_login:     "Login / connection",
		$user_logout:    "Logout / disconnect",
		$user_saveCmp:   "<b>Save</b> composition",
		$user_renameCmp: "Edit composition's title",
		$user_goProfile: "Go to your <b>profile</b>",
		// .....................................................................
		$about_gridsound:  "GridSound is a <b>work-in-progress</b> free browser-based digital audio workstation following the <a https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API>Web Audio API</a>.",
		$about_gridsound2: "You can create an account (by clicking the profile icon on the top-left corner) and start uploading your compositions online.",
		// .....................................................................
		$daw_gain:          "Main app <b>volume</b> (this will not affect the rendering)",
		$daw_focus:         "Switch <b>focus</b> between the composition and piano windows",
		$daw_reboot:        "<b>Reboot</b> the audio engine",
		$daw_undo:          "<b>Undo</b> the previous action",
		$daw_redo:          "<b>Redo</b> the last action",
		$daw_render:        "<b>Render</b> the composition",
		$daw_settings:      "Settings",
		$daw_open_compo:    "Toggle the <b>composition</b> window",
		$daw_open_patterns: "Toggle the <b>patterns</b> panel",
		$daw_open_mixer:    "Toggle the <b>mixer</b> window",
		$daw_open_synth:    "Toggle the <b>synthesizer</b> window",
		$daw_open_drums:    "Toggle the <b>drums</b> window",
		$daw_open_piano:    "Toggle the <b>piano</b> window",
		$daw_open_slicer:   "Toggle the <b>slicer</b> window",
		$daw_showHelp:      "Show <b>help</b> links [❓] and tooltips",
		$daw_hideHelp:      "Hide <b>help</b> links [❓] and tooltips",
		$daw_about:         "About <i>GridSound</i> 🎵🎶",
		$daw_changelog:     "Read the <b>changelog</b>",
		// .....................................................................
		$patterns_createSlices:  "<b>Create</b> a new <b>slices</b> pattern",
		$patterns_createDrums:   "<b>Create</b> a new <b>drums</b> pattern",
		$patterns_createSynth:   "<b>Create</b> a new <b>synthesizer</b>",
		$patterns_createAutomat: "<b>Create</b> a new <b>automation</b> pattern",
		$patterns_placehBuffer:  "No buffer pattern in use yet",
		$patterns_placehSlices:  "no slices yet",
		$patterns_placehDrums:   "no drums yet",
		$patterns_placehSynths:  "no synth yet",
		$patterns_placehAutomat: "no automation yet",
		// .....................................................................
		$library_placehUser: "drag'n drop your own samples in the app, they will appear here",
		// .....................................................................
		$win_rename_keys:   "<b>Rename</b> this keys pattern",
		$win_rename_synth:  "<b>Rename</b> this synthesizer",
		$win_rename_drums:  "<b>Rename</b> this drums pattern",
		$win_rename_slices: "<b>Rename</b> this slices pattern",
		$win_autoscroll:    "Auto scrolling",
		// .....................................................................
		$clock_switch: "Switch <b>beat</b> or <b>second</b> unit",
		// .....................................................................
		$tempo_edit: "Edit <b>BPM</b> + <b>time signature</b>",
		$tempo_tap:  "Hit that button in rhythm<br/>it will calculate the <b>BPM</b>",
		// .....................................................................
		$timewindow_zoomX: "Zoom X",
		$timewindow_zoomY: "Zoom Y",
		// .....................................................................
		$track_mute:   "<b>Mute</b> track (right click for solo)",
		$track_unmute: "<b>Unmute</b> track (right click for solo)",
		$track_rename: "Double-click to <b>rename</b> track",
		// .....................................................................
		$stepSelect_snap: "Grid snap",
		// .....................................................................
		$patterns_redirectSynth:   "<b>Redirect</b> this synthesizer",
		$patterns_createKeys:      "<b>Create</b> a new <b>keys</b> pattern with this synthesizer",
		$patterns_deleteSynth:     "<b>Delete</b> this synthesizer and its patterns",
		$patterns_editPatternInfo: "<b>Edit</b> this buffer pattern's info",
		$patterns_redirectPattern: "<b>Redirect</b> this pattern",
		$patterns_clonePattern:    "<b>Clone</b> this pattern",
		$patterns_deletePattern:   "<b>Delete</b> this pattern",
		// .....................................................................
		$mixer_visu: "Switch visualisation type",
		// .....................................................................
		$channels_vu:  "VU of the <b>selected channel</b><br/>🔴 = over 100% (the graphic goes to 120%)",
		$channels_add: "Add a channel",
		// .....................................................................
		$channel_rename: "Double-click to <b>rename</b> the channel",
		$channel_remove: "<b>Remove</b> the channel",
		$channel_pan:    "Left/right panning",
		$channel_gain:   "Gain, volume",
		$channel_mute:   "<b>Mute</b> the channel",
		$channel_unmute: "<b>Unmute</b> the channel",
		// .....................................................................
		$effects_add: "<b>Add</b> an effect",
		// .....................................................................
		$effect_mute:   "<b>Mute</b> this effect",
		$effect_unmute: "<b>Unmute</b> this effect",
		$effect_remove: "<b>Delete</b> this effect",
		// .....................................................................
		$drumrow_mute:   "<b>Mute</b> the drumrow (right click for solo)",
		$drumrow_unmute: "<b>Unmute</b> the drumrow (right click for solo)",
		$drumrow_expand: "<b>Expand</b> props panel",
		$drumrow_remove: "<b>Remove</b> the drumrow",
		// .....................................................................
		$oscillator_prevWave:  "Previous wave",
		$oscillator_nextWave:  "Next wave",
		$oscillator_wavetable: "<b>Wavetable</b> editor",
		$oscillator_remove:    "<b>Remove</b> the oscillator",
		// .....................................................................
		$wavetable_cloneWave:  "<b>Clone</b> this wave",
		$wavetable_removeWave: "<b>Remove</b> this wave",
		// .....................................................................
		$waveEditor_toggleSymm: "Toggle <b>symmetry</b>",
		// .....................................................................
		$automation_selectTarget: "Select automation's target",
	},
} );

const GSTX = GSTXall.en;
