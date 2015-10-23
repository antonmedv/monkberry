#!/bin/bash
./node_modules/.bin/preprocess parsers/monk/grammar.jison ./parsers > parsers/monk/grammar.full.jison &&\
./node_modules/.bin/jison parsers/monk/grammar.full.jison -o parsers/monk/index.js && \
rm parsers/monk/grammar.full.jison && \
echo "Monk build successful."
