# bibliomap-enricher

Bibliomap Enricher is a service that listens to the data sent by Bibliomap Harvester, turns it into EC consultation events, and sends them to Bibliomap Viewer (user interface).

## Architecture

<p align="center">
<img src="https://docs.google.com/drawings/d/1bkxEEBL1kLzH76dkIYFzspYHOVajDjQHCijU3mxJLnM/pub?w=694&h=519" />
</p>

## Configuration

Bibliomap Enricher needs three environment variables:

| Name | Description | Default value |
| -- | -- | -- |
| EZPAARSE_URL | URL of the ezPAARSE instance used by Bibliomap. | ezpaarse:59599 |
| HARVESTER_URL | URL of the Harvester instanced used by Bibliomap | harvester:27777 |
| WEBSOCKET_PORT | Enricher websocket port used to connect the Enricher to the Viewer. | 27780 |

The service also needs configuration in a config.json file located in `enricher/config`. In the repository, you have access to the default file (`default.json`), which you have to edit and rename to `config.json`.

Here are the needed fields:
| Name | Description | default |
| -- | -- | -- |
| broadcasted_fields | Consultation event fields needed to be fetched from ezPAARSE. | ["geoip-latitude", "geoip-longitude", "ezproxyName", "platform_name", "publication_title", "online_identifier", "print_identifier", "rtype", "mime"] |
| headers | ezPAARSE request headers needed to configure ezPAARSE correctly. Will be different for all customized Bibliomap instances (which is why the CNRS instance's headers aren't by default). |  |
| multiple_portals | Boolean which indicates if the institution has multiple article portals. As an example, Bib-CNRS does: one portal for each field (Biology, Physics, Mathematics...), but most institutions do not. | false |
| portal_field | Consultation event field returned by ezPAARSE which indicates the event's portal. If not set, the portal will be fetched from the field `ezproxyName`. If `multiple_portals` is false, this variable will not be used. In this case, it is possible to ommit it. |  |