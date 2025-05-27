# bibliomap Viewer

Bibliomap Viewer is a service that connects to Bibliomap enricher via websockets. It shows the received information on a map, allowing the user to concretely view the consultations events.

## Communication with Enricher

<p align="center">
  <img src="https://github.com/user-attachments/assets/d30b0e05-022f-47c4-bb69-212a840e896a" />
</p>

## Modules

Bibliomap Viewer is composed of interface modules, each having a descriptive role.

**Here is the list of all modules:**
- `Map`
- `Drawer`
  - `Description section`
  - `Timer section`
  - `Counter section`
  - `Portal section`
- `Appbar`
- `Minimap`
- `Information drawer`

### Map

<p align="center">
  <img src="https://github.com/user-attachments/assets/de35d119-32ef-4a17-a637-e84ac61b2f30" />
</p>

The map is the main module used to visualize consultation event data. Everytime a consultation happens, it shows a colored bubble with a small popup card showing information about the event. 

It uses [Leaflet](https://leafletjs.com/) paired with [OpenStreetMap](https://www.openstreetmap.org/). Code is available in `src/components/WorldMap.vue`.

### Drawer

<p align="center">
  <img src="https://github.com/user-attachments/assets/c1fbd746-ea00-4007-b43a-625e2e7afb22" />
</p>

The drawer is a component that contains several subsections. It shows more detailed information about the consultation events. Code is available in `src/components/Drawer.vue`.

### Description section

<p align="center">
  <img src="https://github.com/user-attachments/assets/dddd48fb-9c8c-48e6-8c95-a9c9e3ca847c" />
</p>

It is a subsection of the Drawer module. It displays a short description of what Bibliomap is as well as the CNRS logo. Code is available in `src/components/drawer-modules/Description.vue`.

### Timer section

<p align="center">
  <img src="https://github.com/user-attachments/assets/8287d982-7089-4b09-bc88-9e0d67533a79" />
</p>

It is a subsection of the Drawer module. It has two different views depending on the mode:
- If Bibliomap is in Live mode, it displays the amount of time the page has been opened
- If Bibliomap is in Replay mode, it displays the date and time of the simulation at the current time. It also shows a progressbar which indicates the progress of the current simulation.

Code is available in `src/components/drawer-modules/Timer.vue`.

### Counter section

<p align="center">
  <img src="https://github.com/user-attachments/assets/a5aba38c-371d-4da9-88c2-7050eed2c4f1" />
</p>

It is a subsection of the Drawer module. It displays a count of different document types, as well as a total count. Code is available in `src/components/drawer-modules/Counter.vue`.

### Portal section

<p align="center">
  <img src="https://github.com/user-attachments/assets/2ab7257e-eb66-445b-9d8e-a2827bb6cb24" />
</p>

It is a subsection of the Drawer module. It displays a count of articles from all the different Bib-CNRS portals. Hovering on a portal element will show more detail information such as the count of the document types for this specific one. Clicking on it redirects to the portal's web page. Code is available in `src/components/drawer-modules/Portals.vue`.

### Appbar

<p align="center">
  <img src="https://github.com/user-attachments/assets/c4b0b054-8190-4e58-b8c2-d748884b669a" />
</p>

The Appbar contains five buttons as well as the button used to close or open the drawer. Here are what the buttons do:
- Target button: centers the map (France)
- Translate button: used to choose languages
- map button: used to change the map background
- cogwheel button: opens the settings menu
- information button: opens the information drawer

Code is available in `src/components/Appbar.vue/` as well as `src/components/appbar-buttons/`.

### Minimap

<p align="center">
  <img src="https://github.com/user-attachments/assets/b010646d-89f1-4a9f-b095-6dc57d6976a0" />
</p>

The minimap is shown when an event happens at a place that is uncovered by the main map (for example, an event in the USA if the map is centered to France). It will show a zoomed out version of the map with a bubble and its popup card. It is possible to disable it in the settings menu. Code is available in `src/components/Minimap.vue`.

### Information drawer

<p align="center">
  <img src="https://github.com/user-attachments/assets/44f8b518-32a5-40a9-8486-6c7c876f84c1" />
</p>

Drawer than shows additional information about [Bibliomap](https://bibliomap.inist.fr/), [ezPAARSE](https://www.readmetrics.org/) and [bibCNRS](https://bib.cnrs.fr/). With using expo mode, it is possible to automatically open and close it after a certain amount of time. Code is available in `src/components/information-components/`.

### Settings menu

<p align="center">
  <img src="https://github.com/user-attachments/assets/e35444a6-762c-4168-8801-5d1c48bc5b59" />
</p>


Dialog that allows the user to customize their view. Here are the possible settings options:
- Able / disable Minimap
- Show / hide each portal
- Show / hide article titles
- Filter events by institution name

Code is available in `src/components/SettingsDialog.vue`.

## Configuration

Bibliomap Viewer needs two environment variables:
| Name | Description | Default value |
| -- | -- | -- |
| `VITE_ENRICHER_WEBSOCKET_URL` | The URL of the enricher's websocket server. Needed to get the EC consultation events. | `localhost:27780` |
| `VITE_REPLAY_MODE` | Boolean indicating the Bibliomap mode. Needed to know which view to use (how to display certain components). | `false` |

## Customization

Since Bibliomap 6.0.0, it is possible to configure each of the page's modules, which make it easy to create a custom version of the user interface.

**All of the customization options are done in the file src/assets/config.json.**

Each module owns a json block containing parameters. All of them have a `"include"` parameter. If set to true, the module will be shown on the interface. If set to false, the module will be hidden.

### Map configuration

The map configurations are done in the `"mapParams"` block. Here are the different parameters:

| Name | Description | Default | 
| --- | --- | --- |
| `include` | Indicates if the map should be shown or hidden. | `true` |
| `defaultX` | Default X coordinate when the page is opened. The 'center map' button will center the map at this X axis. Default centers to France. | `46.603354` |
| `defaultY` |  Default Y coordinate when the page is opened. The 'center map' button will center the map at this Y axis. Default centers to France.  | `1.888334` |
| `defaultZoom` | Default zoom when the page is opened. The 'center map' button will set the map zoom at this value. | `6` |
| `minZoom` | Minimum zoom value. The user won't be allowed to zoom out bellow this value. | `3` |
| `maxZoom` | Maximum zoom value. The user won't be allowed to zoom in above this value. | `9` |
| `defaultPhoneZoom` | Default zoom when the page is opened from a phone. The 'center map' button will set the map zoom at this value. | `5` |
| `bubbleDuration` | The duration of a bubble appearing on the map in seconds. | `5` |
| `bubbleSize` | The size of a bubble appearing on the map in pixels. | `60` |
| `includePopup` | Indicates if the popup should be shown or hidden. If false, only bubbles will be shown and not their popups. | `true` |
| `popupText` | The fields that should appear on a bubble popup. Set to true to show them, false (or nothing) to hide them. | `{"datetime": false, "ezproxyName": false, "geoip-pos": true, "mime": true, "platform_name": true, "rtype": true, "publication_title": false}` |
| `attributesColors` | Colors of the fields in popupText. | `{"rtype": "#7F8C8D"}` |

### Drawer configuration

The drawer configurations are done in the `"drawerParams"` block. Here are the different parameters:

| Name | Description | Default | 
| --- | --- | --- |
| `include` | Indicates if the drawer should be shown or hidden. | `true` |
| `position` | Position of the drawer. Can be `"left"`, `"right"`, `"bottom"` or `"top"`. | `"left"` |
| `width` | Drawer width in pixels. | `350` |

The drawer contains several subsections: 
- `Description`
- `Timer`
- `Counter`
- `Portals`

They all contain an `"index"` parameter, which indicates in what order they should be shown, from top to bottom.

### Description section configuration

The description section configurations are done in the `"descriptionSection"` block, inside the `"drawerParams"` block. Here are the different parameters:

| Name | Description | Default | 
| --- | --- | --- |
| `include` | Indicates if the description section should be shown or hidden. | `true` |
| `index` | Indicates in which order this component should be in the drawer. | `0` |
| `icon` | Icon sitting to the left of the description text. Can be empty. | `""` |

### Timer section configuration

The timer section configurations are done in the `"timerSection"` block, inside the `"drawerParams"` block. Here are the different parameters:

| Name | Description | Default | 
| --- | --- | --- |
| `include` | Indicates if the timer section should be shown or hidden. | `true` |
| `index` | Indicates in which order this component should be in the drawer. | `1` |
| `dayLetter` | Letter used for the day unit. | `"j"` |
| `hourLetter` |  Letter used for the hour unit. | `"h"` |
| `minuteLetter` |  Letter used for the minute unit.  | `"m"` |
| `secondLetter` |  Letter used for the second unit.  | `"s"` |
| `timerDateFormat` | Format used to show the simulation time on replay. You can visit [this documentation page](https://date-fns.org/v4.1.0/docs/format) to know how to use it. | `"EEEE dd/MM/yyyy HH:mm:ss"` |
| `showStartEndTime` | Indicates if the interface should show or hide the start and end times of the replay simulation. | `true` |
| `startEndDatesFormat` | Format that will be used to show the start and end times. |  `"HH:mm:ss"` |
| `showMultiplier` | Indicates if the multiplier should be shown or hidden. | `true` |

### Counter section configuration

The counter section configurations are done in the `"counterSection"` block, inside the `"drawerParams"` block. Here are the different parameters:

| Name | Description | Default | 
| --- | --- | --- |
| `include` | Indicates if the counter section should be shown or hidden. | `true` |
| `index` | Indicates in which order this component should be in the drawer. | `2` |
| `showTotal` | Indicates if the total amount of consultations should be shown or hidden. | `true` |

### Portal section configuration

The portal section configurations are done in the `"descriptionSection"` block, inside the `"drawerParams"` block. Here are the different parameters:

| Name | Description | Default |
| --- | --- | --- |
| `include` | Indicates if the portal section should be shown or hidden. | `true` |
| `index` | Indicates in which order this component should be in the drawer. | `3` |
| `portals` | The included portals will be shown in the drawer, and their consultation events will be shown on the map using bubbles. Each portal should be of this format: `{"name": "nameOfPortal", "color": "colorOfPortal", "icon": "iconOfPortal", "url": "urlOfPortal"}`. The icon can be null or undefined. If the user clicks on the portal description, the website redirects to the url parameter. The url can be null or undefined. | `{}` |

### Appbar configurations

The appbar configurations are done in the `"appbarParams"` block. Here are the different parameters:

| Name | Description | Default | 
| --- | --- | --- |
| `include` | Indicates if the appbar should be shown or hidden. | `true` |

### Minimap configurations

The appbar configurations are done in the `"minimapParams"` block. Here are the different parameters:

| Name | Description | Default | 
| --- | --- | --- |
| `include` | Indicates if the minimap should be shown or hidden. | `true` |
| `defaultZoom` | Default zoom of the minimap when it appears | `4` |
| `minZoom` | Minimum minimap zoom value. The user won't be allowed to zoom out bellow this value. | `2` |
| `maxZoom` | Maximum minimap zoom value. The user won't be allowed to zoom in above this value. | `4` |
| `disableOnPhone` | Indicates if the minimap should be disabled on phone, as it takes a lot of space on the screen. | `true` |

### Information drawer configurations

The Information drawer configurations are done in the `"infoDrawerParams"` block. Here are the different parameters:

| Name | Description | Default | 
| --- | --- | --- |
| `include` | Indicates if the minimap should be shown or hidden. | `true` |
| `position` | Position of the information drawer. Can be `"left"`, `"right"`, `"bottom"` or `"top"`. | `"right"` |

## Customizable text

It is possible to configure customizable text fields thanks to the use of i18n. The text should be written in json files at src/locals/custom/{language}.json. Writing text in these files ensure content can be translated. Here are the fields:

| Name | Description |
| -- | -- |
| `description` | Text of the description section in the drawer. |
| `portals` | Portals can have a title and a subtitle. They must be of this format: `"nameOfPortal": {"title": "titleOfPortal", "subtitle": "subtitleOfPortal"}` |

## Information card

It is possible to fully customize the information card that appears as a drawer to the right of the page by default. To do so, you need to change the `InformationContent` component in `src/components/information-components/`. You can also use the customizable text files to write text in your information card. To do so, visit the [vue-i18n documentation page](https://vue-i18n.intlify.dev/).
