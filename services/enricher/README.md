# bibliomap-enricher

Bibliomap Enricher is a service that listens to the data sent by Bibliomap Harvester, turns it into EC consultation events, and sends them to Bibliomap Viewer (user interface).

## Architecture

<p align="center">
<img src="https://docs.google.com/drawings/d/1bkxEEBL1kLzH76dkIYFzspYHOVajDjQHCijU3mxJLnM/pub?w=694&h=519" />
</p>

## Configuration

Bibliomap Enricher needs these environment variables:

| Name | Description | Default value |
| -- | -- | -- |
| `EZPAARSE_URL` | URL of the ezPAARSE instance used by Bibliomap. | `ezpaarse:59599` |
| `HARVESTER_URL` | URL of the Harvester instanced used by Bibliomap | `harvester:27777` |
| `WEBSOCKET_PORT` | Enricher websocket port used to connect the Enricher to the Viewer. | `27780` |
| `REPLAY_MODE` | Indicates if Bibliomap is in replay mode. | `false` |
| `REPLAY_FILE_PATHS` | Names of the replay files. If multiple, should be separated with commas. All replay files should be located in `/data/replay_files/`. Can be omitted if not in replay mode. |  |
| `REPLAY_START_DATETIME` | Datetime of the start of the replay. Should be of ISO 8601 format (standard date format). Can be omitted if not in replay mode. If omitted in replay mode, datetime will be calculated from the files, but it can be slower (especially using .log files). |  |
| `REPLAY_MULTIPLIER` | Indicates how quick a simulation should behave. 1 is real time, n is n time faster than real time. Can be omitted if not in replay mode. If omitted in replay mode, the simulation speed will be real time. | `1` |
| `REPLAY_DURATION` | Number of days of the replay simulation. Can be omitted if not in replay mode. If omitted in replay mode, the replay duration will be one day. | `1` |

The service also needs configuration in a config.json file located in `enricher/config`. In the repository, you have access to the default file (`default.json`), which you have to edit and rename to `config.json`.

Here are the needed fields:
| Name | Description | default |
| -- | -- | -- |
| `broadcasted_fields` | Consultation event fields needed to be fetched from ezPAARSE. | `["geoip-latitude", "geoip-longitude", "ezproxyName", "platform_name", "publication_title", "online_identifier", "print_identifier", "rtype", "mime"]` |
| `headers` | ezPAARSE request headers needed to configure ezPAARSE correctly. Will be different for all customized Bibliomap instances (which is why the CNRS instance's headers aren't by default). |  |
| `multiple_portals` | Boolean which indicates if the institution has multiple article portals. As an example, Bib-CNRS does: one portal for each field (Biology, Physics, Mathematics...), but most institutions do not. | `false` |
| `portal_field` | Consultation event field returned by ezPAARSE which indicates the event's portal. If not set, the portal will be fetched from the field `ezproxyName`. If `multiple_portals` is false, this variable will not be used. In this case, it is possible to ommit it. |  |
