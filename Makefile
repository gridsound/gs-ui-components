MAKE = @make --no-print-directory

all:
	@echo "~~~~~~~~~ gs-ui-components ~~~~~~~~~~"
	$(MAKE) css
	$(MAKE) html
	@echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"

html:
	@echo -n "* HTML ............... "
	@handlebars `find src -name "*.handlebars"` -f bin/__templates.js
	@echo __templates.js
	$(MAKE) js

js:
	@echo -n "* JS ........ "
	@uglifyjs $(JS_FILES) -o bin/gs-ui-components.min.js --compress --mangle
	@echo gs-ui-components.min.js

css:
	@echo -n "* CSS ...... "
	@sass -I src src/main.scss bin/gs-ui-components.min.css --style compressed
	@echo gs-ui-components.min.css


.PHONY: all html css js

JS_FILES = \
	bin/__templates.js                       \
	src/gsuiOscilloscope/gsuiOscilloscope.js \
	src/gsuiSpanEditable/gsuiSpanEditable.js \
	src/gsuiToggle/gsuiToggle.js             \
	src/gsuiWaveform/gsuiWaveform.js
