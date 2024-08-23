all: dist/md.min.js

dist/md.min.js: md.js
	npx terser -c -m -o $@ $<
