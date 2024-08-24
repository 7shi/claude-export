all: dist/md.min.js dist/md.min.js.urlencoded

dist/md.min.js: md.js
	npx terser -c -m -o $@ $<

dist/md.min.js.urlencoded: dist/md.min.js
	node urlencode.js $< > $@
