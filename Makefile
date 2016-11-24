all:
	@make css
	@make html

html:
	@echo ":: HTML"
	@handlebars src/ -f bin/__templates.js
	@make js

js:
	@echo ":: JS"
	@uglifyjs $(src) -o bin/gs-ui-components.js --compress --mangle

css:
	@echo ":: CSS"
	@cd src; \
		tail -n +3 _main.scss > __tmp.scss; \
		sass __tmp.scss ../bin/gs-ui-components.css; \
		rm __tmp.scss

.PHONY: all html css js

src = \
	bin/__templates.js            \
	src/_main.js                  \
	src/toggle.js                 \
