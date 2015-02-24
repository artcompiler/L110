CLOSURE_URL = http://closure-compiler.googlecode.com/files/compiler-latest.zip
UTIL_DIR = util
LIB_DIR = ../lib
LATEST_COMMIT = $(shell git rev-parse HEAD | cut -c 1-7)
CURRENT_TAG = $(shell git name-rev --tags --name-only $(LATEST_COMMIT) | sed 's/\^0//g' | sed 's/undefined/unversioned/g')

build:
	mkdir -p $(LIB_DIR)
	cat src/license.js | sed 's/{{project}}/Mathcore/g' | sed 's/{{version}}/$(CURRENT_TAG)/g' | sed 's/{{sha}}/$(LATEST_COMMIT)/g' > license-version.js
	cat ../lib/model/lib/model.js ../lib/BigDecimal.js ../src/sympy.js ../src/mathmodel.js ../src/mathcore.js | sed 's/\"use strict\"//g' > mathcore.js
	java -jar util/cc.jar \
		--language_in ECMASCRIPT5_STRICT \
		--formatting=pretty_print \
		--compilation_level WHITESPACE_ONLY \
		--js mathcore.js \
		--js_output_file temp.js
	cat license-version.js src/head.js temp.js src/math-tail.js > $(LIB_DIR)/mathcore.js
	java -jar util/cc.jar \
		--language_in ECMASCRIPT5_STRICT \
		--jscomp_off=uselessCode \
		--compilation_level SIMPLE_OPTIMIZATIONS \
		--js mathcore.js \
		--js_output_file temp.js
	cat license-version.js src/head.js temp.js src/math-tail.js > $(LIB_DIR)/mathcore.min.js
	rm mathcore.js temp.js license-version.js
	cat src/license.js | sed 's/{{project}}/Chemcore/g' | sed 's/{{version}}/$(CURRENT_TAG)/g' | sed 's/{{sha}}/$(LATEST_COMMIT)/g' > license-version.js
	cat ../lib/model/lib/model.js ../lib/BigDecimal.js ../src/sympy.js ../src/mathmodel.js ../src/chemcore.js | sed 's/\"use strict\"//g' > chemcore.js
	java -jar util/cc.jar \
		--language_in ECMASCRIPT5_STRICT \
		--formatting=pretty_print \
		--compilation_level WHITESPACE_ONLY \
		--js chemcore.js \
		--js_output_file temp.js
	cat license-version.js src/head.js temp.js src/chem-tail.js > $(LIB_DIR)/chemcore.js
	java -jar util/cc.jar \
		--language_in ECMASCRIPT5_STRICT \
		--jscomp_off=uselessCode \
		--compilation_level SIMPLE_OPTIMIZATIONS \
		--js chemcore.js \
		--js_output_file temp.js
	cat license-version.js src/head.js temp.js src/chem-tail.js > $(LIB_DIR)/chemcore.min.js
	rm chemcore.js temp.js license-version.js

