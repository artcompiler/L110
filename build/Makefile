LIB_DIR = ../lib

default: build run

build:
	mkdir -p $(LIB_DIR)
#	cat ../src/L15/lib/model.js ../src/compile.js > ../src/temp.js
	compile-modules convert ../src/compile.js > ../lib/compile.js

run:
	node --harmony_generators ../index

