MAKE = @make --no-print-directory
N = gs-ui-components.min

all:
	@echo "~~~~~~~~~ gs-ui-components ~~~~~~~~~~"
	$(MAKE) html
	$(MAKE) css
	$(MAKE) js
	@echo "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"

html:
	@echo -n "* HTML .... "
	@cat `find src -name "*.html"` > _html
	@tr -d '\t' < _html > _html2
	@tr -d '\n' < _html2 > _html
	@tr -d '\r' < _html > bin/$(N).html
	@rm _html _html2
	@echo $(N).html

js:
	@echo -n "* JS ........ "
	@echo "\"use strict\";" > bin/$(N).js
	@cat `find src -name "*.js"` | sed -e "s/\"use strict\";//g" >> bin/$(N).js
	@babili bin/$(N).js -o bin/$(N).js
	@echo $(N).js

css:
	@echo -n "* CSS ...... "
	@cat `find src -name "*.css"` | csso > bin/$(N).css
	@echo $(N).css

.PHONY: all html css js
