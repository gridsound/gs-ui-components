MAKE = @make --no-print-directory
CMP  = gs-ui-components
TPL  = __templates.js

all:
	@echo "~~~~~~~ $(CMP) ~~~~~~~~"
	$(MAKE) css
	$(MAKE) html
	@echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"

html:
	@echo -n "* HTML ..... "
	@handlebars `find src -name "*.handlebars"` -f bin/$(TPL)
	@echo $(TPL)
	$(MAKE) js

js:
	@echo -n "* JS ....... "
	@uglifyjs $(JS_FILES) -o bin/$(CMP).js --compress --mangle
	@echo $(CMP).js

css:
	@echo -n "* CSS ...... "
	@cd src; \
		tail -n +3 main.scss > __tmp.scss; \
		sass __tmp.scss ../bin/$(CMP).css --style compressed; \
		rm __tmp.scss
	@echo $(CMP).css


.PHONY: all html css js

JS_FILES = \
	bin/$(TPL)                               \
	src/span-editable/gs-ui-span-editable.js \
	src/toggle/gs-ui-toggle.js               \
