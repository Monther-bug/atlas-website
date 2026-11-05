#!/bin/bash
# usage: ab.sh visits "name:port ..." [path]
cd /Users/montheribrahim/Downloads/atlas-wt/PA
for v in $2; do n=${v%%:*}; p=${v##*:}
  echo "== $n slow"; VISITS=$1 node docs/perf/tools/trace.mjs https://localhost:$p ${3:-/} t-$n 2>&1 | grep -v "^    at" | cut -c1-260 | head -4
  if [ -z "$NOFAST" ]; then echo "== $n fast"; NET=fast VISITS=$1 node docs/perf/tools/trace.mjs https://localhost:$p ${3:-/} t-${n}f 2>&1 | grep -v "^    at" | cut -c1-260 | head -4; fi
done
