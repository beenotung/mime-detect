all: install build test

install: package.json
	npm i

build: index.js

test: test.js index.js
	node test.js

index.js: index.ts
	npx tsc -p .

test.js: index.ts test.ts
	npx tsc -p .
