all:
	@make css
	@make html

html:
	@echo ":: HTML"
	@handlebars `find src -name "*.handlebars"` -f bin/__templates.js
	@make js

js:
	@echo ":: JS"
	@uglifyjs $(src) -o bin/gs-ui-components.js --compress --mangle

css:
	@echo ":: CSS"
	@cd src; \
		tail -n +3 main.scss > __tmp.scss; \
		sass __tmp.scss ../bin/gs-ui-components.css --style compressed; \
		rm __tmp.scss

.PHONY: all html css js

src = \
	bin/__templates.js                       \
	src/main.js                              \
	src/toggle/gs-ui-toggle.js               \
	src/span-editable/gs-ui-span-editable.js \
