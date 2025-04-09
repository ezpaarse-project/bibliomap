# bibliomap-harvester

Monitors and harvests ezproxy log files for [bibliomap](https://github.com/ezpaarse-project/bibliomap) visualization.

## Architecture

<p align="center">
<img src="https://docs.google.com/drawings/d/1bkxEEBL1kLzH76dkIYFzspYHOVajDjQHCijU3mxJLnM/pub?w=694&h=519" />
</p>

## Prerequisites

  * Docker and docker-compose

## Installation and running

As a standalone script, bibliomap-harvester is not very usefull. Please have a look to [bibliomap](https://github.com/ezpaarse-project/bibliomap) docker-compose.yml to understand how it can be orchestrated with required modules: [bibliomap-enricher](https://github.com/ezpaarse-project/bibliomap-enricher) and [bibliomap-viewer](https://github.com/ezpaarse-project/bibliomap-viewer)

## Configuration

Env variable can be used to customize it:

  * BBH_ENRICHER_HOST
  * BBH_ENRICHER_PORT
  * BBH_STREAMNAMES
  * BBH_STREAMPATHS

Look at [config.json](https://github.com/ezpaarse-project/bibliomap-harvester/blob/master/config.json) to see the default values.

To connect external log files, you have to mount docker volumes this way.
  * Supposing you have 2 ezproxy log file here on the hosting server:
    * /bibcnrs/inp/ezproxy/ezproxy.log
    * /bibcnrs/insb/ezproxy/ezproxy.log
  * Then you have to add these volumes when running bibliomap-harvester container:
    * ``-v  /bibcnrs/inp/ezproxy/ezproxy.log:/app/tmp/inc.log``
    * ``-v  /bibcnrs/insb/ezproxy/ezproxy.log:/app/tmp/insb.log``
  * Then when running bibliomap-harvester container, you have to setup theses variables:
    * BBH_STREAMNAMES="INC INSB"
    * BBH_STREAMPATHS="/app/tmp/inc.log /app/tmp/insb.log"

## Developement

```
git clone git@github.com:ezpaarse-project/bibliomap-harvester.git
cd bibliomap-harvester
DEBUG=bibliomap* make run-debug
```

