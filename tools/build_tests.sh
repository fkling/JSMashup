#!/bin/sh

PATTERN='*_test.html'
FILES=`find ./mide -name $PATTERN`
STR='var _allTests=['
for FILE in $FILES
do
    STR="$STR'$FILE',"
done

STR="$STR];"

echo $STR > alltests.js