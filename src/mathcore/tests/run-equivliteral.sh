function error_exit
{
	echo "$1" 1>&2
	exit 1
}

SHA=$(git rev-parse HEAD | cut -c 1-7)
LIB_FILE=../lib/mathcore.js


# Check test lib...
if ! [ -f $LIB_FILE ]; then
	# Lib file not found
	error_exit "lib/mathcore.js does not exist. project must be built before testing. aborting."
else
	if ! grep -q $SHA $LIB_FILE; then
		# Lib file exists but the version sha is not up to date
   		error_exit "lib/mathcore.js is not up to date. re-build project before testing. aborting."
 	fi
fi

open ../tests/jasmine/EquivLiteralRunner.html






