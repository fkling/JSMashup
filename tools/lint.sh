#/bin/sh

#echo "Running gjslint on source tree"
#/usr/local/share/python/gjslint --strict -r ../src
#/usr/local/share/python/fixjsstyle --strict -r ../src
#echo "Running jslint on source tree"
#./jslint.py ../src

lib/closure/bin/build/closurebuilder.py --root="/Users/kling/projects/libraries/JavaScript/Google Closure" --root=src/mashupIDE --namespace="mashupIDE" --output_mode=compiled --compiler_jar="tools/compiler.jar" > build/mashupIDE.js
