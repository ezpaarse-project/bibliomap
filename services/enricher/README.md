# bibliomap-enricher

Bibliomap Enricher is a service that listens to the data sent by Bibliomap Harvester, turns it into EC consultation events, and sends them to Bibliomap Viewer (user interface).

## Architecture

<p align="center">
<img src="https://github.com/user-attachments/assets/74ddb927-b6b6-4e55-b3af-243983654e5c" />
</p>

## Configuration

Bibliomap Enricher needs these environment variables:

| Name | Description | Default value |
| -- | -- | -- |
| `EZPAARSE_URL` | URL of the ezPAARSE instance used by Bibliomap. | `ezpaarse:59599` |
| `HARVESTER_URL` | URL of the Harvester instanced used by Bibliomap | `harvester:27777` |
| `WEBSOCKET_PORT` | Enricher websocket port used to connect the Enricher to the Viewer. | `27780` |
| `REPLAY_MODE` | Indicates if Bibliomap is in replay mode. | `false` |

The service also needs configuration in a config.json file located in `enricher/config`. In the repository, you have access to the default file (`default.json`), which you have to edit and rename to `config.json`.

Here are the needed fields:
| Name | Description | default |
| -- | -- | -- |
| `broadcasted_fields` | Consultation event fields needed to be fetched from ezPAARSE. | `["geoip-latitude", "geoip-longitude", "ezproxyName", "platform_name", "publication_title", "online_identifier", "print_identifier", "rtype", "mime"]` |
| `headers` | ezPAARSE request headers needed to configure ezPAARSE correctly. Will be different for all customized Bibliomap instances (which is why the CNRS instance's headers aren't by default). |  |
| `multiple_portals` | Boolean which indicates if the institution has multiple article portals. As an example, Bib-CNRS does: one portal for each field (Biology, Physics, Mathematics...), but most institutions do not. | `false` |
| `portal_field` | Consultation event field returned by ezPAARSE which indicates the event's portal. If not set, the portal will be fetched from the field `ezproxyName`. If `multiple_portals` is false, this variable will not be used. In this case, it is possible to ommit it. |  |

### Replay configuration

To use the replay mode, the service needs a few more configuration steps. First, need to gather log or consultation events files for the enricher to read them. EC files are better for the replay mode as the service does not need to use ezPAARSE in real time, which makes the operations faster, more reliable and more accurate.

For each replay session, the file(s) should be located in one folder, inside `enricher/data/replay_files`. The folder can be named anything. Bibliomap will loop in each folder that is in the `replay_files` folder. Inside of each replay folder, you will also need to create a config.json file. It is used to give more detailed about how the simulation should work. Here are all the possible fields:

| Name | Description | Default value |
| -- | -- | -- |
| `disable` | Indicates if Bibliomap should omit this replay. | `undefined` |
| `index` | Indicates the order of each replay session. | `0` |
| `replayStartDatetime` | Indicates when the replay session should start. If undefined, it will look for the first event in each of the files, but it is far less efficient. It must be using the __standard ISO 8601 format__. | `"2025-04-16T16:00:00+01:00"` |
| `replayEndDatetime` | Indicates when the replay session should end. If undefined, it will use the replayDuration variable to know when to stop. It must be using the __standard ISO 8601 format__. | `"2025-04-16T16:30:00+01:00"` |
| `replayDuration` | Indicates in days how long should the replay session be. If replayEndDatetime is set, this variable will not be used. If replayEndDatetime and replayDuration is not set, the simulation will last for one day. | `1` |
| `description` | Replay description displayed in the corresponding section of the viewer. If the description starts by the `$` character, it will look for the corresponding values in the customizable locale json files of the viewer to make it internationalized with i18n (more details in the Internationalized replay description part). | `"$2025-04-16"` |

### Internationalized replay description

To internationalize the replay descriptions, you need to set the `description` field of the config.json with a name starting with '$'. The name should not contain any spaces. It will be the key of another json files located in the viewer.

After that, the description needs to be written in each json files in `viewer/src/locales/custom/` inside of the "replay-descriptions" block. As an example:

`enricher/data/replay_files/2025-04-16/config.json`
```json
{
  "index": 0,
  "replayStartDatetime": "2025-04-16T16:00:00+01:00",
  "replayEndDatetime": "2025-04-16T16:30:00+01:00",
  "replayMultiplier": 60,
  "replayDuration": 1,
  "description": "$2025-04-16"
}
```

`viewer/src/locales/custom/en.json`
```json
{
  ...
  "replay-descriptions":{
    "2025-05-23": "Friday 23rd May 2025 afternoon.",
  }
}
```
