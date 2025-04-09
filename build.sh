#!/bin/bash

export ENRICHER_VERSION="4.1.1"
export HARVESTER_VERSION="4.0.3"
export VIEWER_VERSION="5.1.6"

cd bibliomap-enricher;
docker compose build;
docker tag ezpaarseproject/bibliomap-enricher:$ENRICHER_VERSION vxnexus-registry.intra.inist.fr:8083/biblomap/enricher:$ENRICHER_VERSION;
docker push vxnexus-registry.intra.inist.fr:8083/biblomap/enricher:$ENRICHER_VERSION;

cd ..
cd bibliomap-harvester;
docker compose build;
docker tag ezpaarseproject/bibliomap-harvester:$HARVESTER_VERSION vxnexus-registry.intra.inist.fr:8083/biblomap/harvester:$HARVESTER_VERSION;
docker push vxnexus-registry.intra.inist.fr:8083/biblomap/harvester:$HARVESTER_VERSION;

cd ..
cd bibliomap-viewer;
docker compose build;
docker tag ezpaarseproject/bibliomap-viewer:$VIEWER_VERSION vxnexus-registry.intra.inist.fr:8083/biblomap/viewer:$VIEWER_VERSION;
docker push vxnexus-registry.intra.inist.fr:8083/biblomap/viewer:$VIEWER_VERSION;