all: install build test

install: package.json
	npm i

build: index.js

test: test.js index.js
	node test.js

index.js: index.ts mime.types.ts
	npx tsc -p .

mime.types.ts: mime.types.macro.ts
	npx tsc-macro

test.js: index.ts test.ts
	npx tsc -p .
