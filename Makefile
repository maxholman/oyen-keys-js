
SRCS = $(wildcard lib/**)

all: dist

.PHONY: deps
deps: node_modules

.PHONY: clean
clean:
	pnpm exec tsc -b --clean

.PHONY: test
test:
	NODE_OPTIONS=--experimental-vm-modules pnpm exec jest

node_modules: package.json
	pnpm install

dist: node_modules tsconfig.json $(SRCS)
	pnpm exec tsc

.PHONY: dist-watch
dist-watch:
	pnpm exec tsc -w --preserveWatchOutput

.PHONY: pretty
pretty: node_modules
	pnpm exec eslint --fix . || true
	pnpm exec prettier --write .
