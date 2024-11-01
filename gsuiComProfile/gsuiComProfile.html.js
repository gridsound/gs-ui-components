"use strict";

GSUsetTemplate( "gsui-com-profile", () => [
	GSUcreateDiv( { class: "gsuiComProfile-main" },
		GSUcreateDiv( { class: "gsuiComProfile-main-avatar" },
			GSUcreateElement( "img", { src: "" } ),
			GSUcreateI( { class: "gsuiIcon", "data-icon": "musician" } ),
		),
		GSUcreateDiv( { class: "gsuiComProfile-main-info" },
			GSUcreateDiv( { class: "gsuiComProfile-main-username gsui-ellipsis" } ),
			GSUcreateDiv( { class: "gsuiComProfile-main-fullname gsui-ellipsis" },
				GSUcreateSpan( { class: "gsuiComProfile-main-firstname gsui-ellipsis" } ),
				GSUcreateSpan( { class: "gsuiComProfile-main-lastname gsui-ellipsis" } ),
			),
			GSUcreateDiv( { class: "gsuiComProfile-main-email" },
				GSUcreateSpan( { class: "gsuiComProfile-main-email-addr" },
					GSUcreateI( { class: "gsuiIcon" } ),
					GSUcreateSpan(),
				),
				GSUcreateButton( { class: "gsuiComProfile-main-email-not" },
					GSUcreateI( { class: "gsuiIcon", "data-spin": "on" } ),
					GSUcreateSpan( { class: "gsuiComProfile-main-email-toSend gsui-ellipsis" }, "Email not verify, send a confirmation email again" ),
					GSUcreateSpan( { class: "gsuiComProfile-main-email-sent gsui-ellipsis" }, "Email sent" ),
				),
			),
		),
		GSUcreateButton( { class: "gsuiComProfile-main-edit gsuiIcon", "data-icon": "pen" } ),
	),
	GSUcreateDiv( { class: "gsuiComProfile-edit-title" }, "Profile edition" ),
	GSUcreateElement( "form", { class: "gsuiComProfile-form" },
		GSUcreateLabel( null,
			GSUcreateSpan( { class: "gsuiComProfile-form-label" }, "avatar" ),
			GSUcreateDiv( null,
				GSUcreateSpan( null, "GridSound accepts, for the moment, only " ),
				GSUcreateAExt( { class: "highlight", href: "https://gravatar.com" },
					GSUcreateI( { class: "gsuiIcon gsuiIconB", "data-icon": "wordpress" } ),
					GSUcreateSpan( null, "WordPress - Gravatar" ),
				),
				GSUcreateSpan( null, " as avatar." ),
			),
		),
		GSUcreateLabel( null,
			GSUcreateSpan( { class: "gsuiComProfile-form-label" }, "first name" ),
			GSUcreateInput( { class: "gsuiComProfile-form-input", type: "text", name: "firstname", spellcheck: "false" } ),
		),
		GSUcreateLabel( null,
			GSUcreateSpan( { class: "gsuiComProfile-form-label" }, "last name" ),
			GSUcreateInput( { class: "gsuiComProfile-form-input", type: "text", name: "lastname", spellcheck: "false" } ),
		),
		GSUcreateLabel( null,
			GSUcreateSpan( { class: "gsuiComProfile-form-label" }, "email" ),
			GSUcreateInput( { class: "gsuiComProfile-form-input", type: "email", name: "email", spellcheck: "false" } ),
			GSUcreateSpan( null, "if the email is changed, a confirmation email has to be sent again" ),
		),
		GSUcreateLabel( null,
			GSUcreateSpan( { class: "gsuiComProfile-form-label" }, "email public" ),
			GSUcreateDiv( null,
				GSUcreateInput( { class: "gsuiComProfile-form-input", type: "checkbox", name: "emailpublic" } ),
				GSUcreateSpan( null, "if checked, your email will be public on your profile" ),
			),
		),
		GSUcreateDiv( { class: "gsuiComProfile-form-error" } ),
		GSUcreateDiv( { class: "gsuiComProfile-form-btns" },
			GSUcreateButton( { class: "gsuiComProfile-btn" },
				GSUcreateSpan( { class: "gsuiComProfile-btn-text" }, "cancel" ),
			),
			GSUcreateButton( { class: "gsuiComProfile-btn", type: "submit" },
				GSUcreateSpan( { class: "gsuiComProfile-btn-text" }, "save" ),
			),
		),
	),
] );
