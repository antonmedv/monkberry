build:
	cd ./src/parser && \
	preprocess grammar.jison . > ~grammar.jison && \
	jison ~grammar.jison -o index.js && \
	rm ~grammar.jison
