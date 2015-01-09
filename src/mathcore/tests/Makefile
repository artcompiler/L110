default:
	@echo "run: make [new|all|number|algebra|syntax|error|math|chem]"

all:	check
	open ../tests/jasmine/FullRunner.html

error:	check
	open ../tests/jasmine/ErrorRunner.html

syntax:	check
	open ../tests/jasmine/SyntaxRunner.html

number: check
	open ../tests/jasmine/NumberRunner.html

algebra: check
	open ../tests/jasmine/AlgebraRunner.html

math:	check
	open ../tests/jasmine/MathCoreRunner.html

chem:	check
	open ../tests/jasmine/ChemCoreRunner.html

debug:	check
	open ../tests/jasmine/DebugRunner.html

new:	check
	open ../tests/jasmine/NewRunner.html

check:
	$(shell echo ./check-lib.sh)

install:
	npm install requirejs

