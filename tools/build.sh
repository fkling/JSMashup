#!/bin/sh
../Mashup_Server/static/js/google_closure/closure/bin/build/closurebuilder.py \
  --root=../Mashup_Server/static/js/google_closure/ \
  --root=../Mashup_Server/static/js/mashupIDE/ \
  --namespace="mashupIDE" \
  --output_mode=compiled \
  --compiler_jar=compiler.jar \
  > ../Mashup_Server/static/js/mashupIDE.js