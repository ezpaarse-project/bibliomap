# bibliomap-viewer

bibliomap-viewer is the [bibliomap](https://github.com/ezpaarse-project/bibliomap) web interface HTML + Websocket front end showing [ezPAARSE](https://github.com/ezpaarse-project/ezpaarse) EC's in real time.

## Architecture

<p align="center">
<img src="https://docs.google.com/drawings/d/1bkxEEBL1kLzH76dkIYFzspYHOVajDjQHCijU3mxJLnM/pub?w=694&h=519" />
</p>

## Prerequisites

  * Docker and docker-compose

## Installation and running

As a standalone script, bibliomap-viewer is not very usefull. Please have a look to [bibliomap](https://github.com/ezpaarse-project/bibliomap) docker-compose.yml to understand how it can be orchestrated with required modules: [bibliomap-harvester](https://github.com/ezpaarse-project/bibliomap-harvester) and [bibliomap-enricher](https://github.com/ezpaarse-project/bibliomap-enricher)

## System configuration

Env variable can be used to customize it:

  * BBV_INDEX
  * BBV_JSFILE
  * BBV_LISTEN_ENRICHER_HOST
  * BBV_LISTEN_ENRICHER_PORT
  * BBV_LISTEN_HOST
  * BBV_LISTEN_PORT

Look at [config.json](https://github.com/ezpaarse-project/bibliomap-viewer/blob/master/config.json) to see the default values.

## Developement

```
git clone git@github.com:ezpaarse-project/bibliomap-viewer.git
cd bibliomap-viewer
DEBUG=bibliomap* make run-debug
```

The open http://127.0.0.1:50197/ in your browser
