.PHONY: help install clean build chown

.DEFAULT_GOAL := help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# If the first argument is one of the supported commands...
SUPPORTED_COMMANDS := version
SUPPORTS_MAKE_ARGS := $(findstring $(firstword $(MAKECMDGOALS)), $(SUPPORTED_COMMANDS))
ifneq "$(SUPPORTS_MAKE_ARGS)" ""
    # use the rest as arguments for the command
    COMMAND_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
    # ...and turn them into do-nothing targets
    $(eval $(COMMAND_ARGS):;@:)
endif

install: ## install depedencies thanks to a dockerized npm install
	@docker run -it --rm -v $$(pwd):/app -w /app --net=host -e NODE_ENV -e http_proxy -e https_proxy node:10.15.3 npm install
	@make chown

build: ## build the docker ezpaarseproject/bibliomap-harvester image localy
	@docker build -t ezpaarseproject/bibliomap-harvester --build-arg http_proxy --build-arg https_proxy .

run-debug: ## run bibliomap-harvester in debug mode with docker
	@docker-compose -f ./docker-compose.debug.yml up -d
	@# attach to the bibliomap-harvester container in order to be able to stop it easily with CTRL+C
	@docker attach bibliomap-harvester

run-prod: ## run bibliomap-harvester in production mode with the full dockerized image (see build)
	@docker-compose -f ./docker-compose.yml up -d

# makefile rule used to keep current user's unix rights on the docker mounted files
chown:
	@test ! -d $$(pwd)/node_modules || docker run -it --rm -v $$(pwd):/app node:10.15.3 chown -R $$(id -u):$$(id -g) /app/

clean: ## remove node_modules and temp files
	@rm -Rf ./node_modules/ ./npm-debug.log

version: ## creates a new ezmaster version (same way npm version works)
ifdef COMMAND_ARGS
	@npm version $(COMMAND_ARGS)
else
	@echo "Usage: make version <arg> (same as npm syntax)"
	@npm version --help
endif
