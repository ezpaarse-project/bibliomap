# Inist-CNRS usecases

This folder contains 4 docker-compose.yml:

For Bibliomap Bibcnrs
- vpportail/docker-compose.prod.yml to be deployed on the vpportail server
- vpbibliomap/docker-compose.prod.yml to be deployed on the vpbibliomap server

For Bibliomap Istex
- vp-istex-api/docker-compose.prod.yml to be deployed on the vp-istex-api server
- vpbibliomap-istex/docker-compose.prod.yml to be deployed on the vpbibliomap-istex server


## Bibliomap BibCnrs
Servers list:
- vpbibliomap.intra.inist.fr used to run bibliomap enricher and viewer
- vpportail.intra.inist.fr used to run bibcnrs services

vpportail is running 10 ezproxies (for CNRS instituts IN2P3 INC INEE INP INS2I INSB INSHS INSIS INSMI INSU) and these ezproxies write logs in files: ./logs/in2p3.log ./logs/inc.log ./logs/inee.log ./logs/inp.log ./logs/ins2i.log ./logs/insb.log ./logs/inshs.log ./logs/insis.log ./logs/insmi.log ./logs/insu.log

vpbibliomap is running bibliomap-enricher, ezpaarse and bibliomap-viewer to display a nice real time dynamic map of usage event processed in live by ezpaarse.

## Bibliomap Istex
Servers list:
- vpbibliomap-istex.intra.inist.fr used to run bibliomap enricher and viewer
- vp-istex-api.intra.inist.fr used to run bibcnrs services

vp-istex-api write logs in files: ./var/log/istex-api.log

vpbibliomap-istex is running bibliomap-enricher, ezpaarse and bibliomap-viewer to display a nice real time dynamic map of usage event processed in live by ezpaarse.

