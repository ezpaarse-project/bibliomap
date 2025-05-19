# bibliomap viewer

Bibliomap viewer is a service that connects to Bibliomap enricher via websockets. It shows the received information on a map, allowing the user to concretely view the consultations events.

## Configuration

With this new version of Bibliomap Viewer, it is possible to configurate every of the page's modules, which make it easy to create a custom version of the user interface.

**All of the customization options are done in the file src/assets/config.json.**

Each module owns a json block containing parameters. All of them have a "include" parameter. If set to true, the module will be shown on the map. If set to false, the module will be hidden.

**Here is the list of all modules:**
- Map
- Drawer
  - Description section
  - Timer section
  - Counter section
  - Portal section
- Appbar
- Minimap
- Information drawer

### Map configuration

The map configurations are done in the "mapParams" block. Here are the different parameters:

| Name | Description | Default | 
| --- | --- | --- |
| include | Indicates if the map should be shown or hidden. | true |
| defaultX | Default X coordinate when the page is opened. The 'center map' button will center the map at this X axis. Default centers to France. | 46.603354 |
| defaultY |  Default Y coordinate when the page is opened. The 'center map' button will center the map at this Y axis. Default centers to France.  | 1.888334 |
| defaultZoom | Default zoom when the page is opened. The 'center map' button will set the map zoom at this value. | 6 |
| minZoom | Minimum zoom value. The user won't be allowed to zoom out bellow this value. | 3 |
| maxZoom | Maximum zoom value. The user won't be allowed to zoom in above this value. | 9 |
| defaultPhoneZoom | Default zoom when the page is opened from a phone. The 'center map' button will set the map zoom at this value. | 5 |
| bubbleDuration | The duration of a bubble appearing on the map in seconds. | 5 |
| bubbleSize | The size of a bubble appearing on the map in pixels. | 60 |
| includePopup | Indicates if the popup should be shown or hidden. If false, only bubbles will be shown and not their popups. | true |
| popupText | The fields that should appear on a bubble popup. Set to true to show them, false (or nothing) to hide them. | {"datetime": false, "ezproxyName": false, "geoip-pos": true, "mime": true, "platform_name": true, "rtype": true, "publication_title": false} |
| attributesColors | Colors of the fields in popupText. | {"rtype": "#7F8C8D"} |

### Drawer configuration

The drawer configurations are done in the "drawerParams" block. Here are the different parameters:

| Name | Description | Default | 
| --- | --- | --- |
| include | Indicates if the drawer should be shown or hidden. | true |
| position | Position of the drawer. Can be "left", "right", "bottom" or "top". | "left" |
| width | Drawer width in pixels. | 350 |

The drawer contains several subsections: 
- Description
- Timer
- Counter
- Portals

They all contain an "index" parameter, which indicates in what order they should be shown, from top to bottom.

### Description section configuration

The description section configurations are done in the "descriptionSection" block, inside the "drawerParams" block. Here are the different parameters:

| Name | Description | Default | 
| --- | --- | --- |
| include | Indicates if the description section should be shown or hidden. | true |
| index | Indicates in which order this component should be in the drawer. | 0 |
| icon | Icon sitting to the left of the description text. Can be empty. | "" |

### Timer section configuration

The timer section configurations are done in the "timerSection" block, inside the "drawerParams" block. Here are the different parameters:

| Name | Description | Default | 
| --- | --- | --- |
| include | Indicates if the timer section should be shown or hidden. | true |
| index | Indicates in which order this component should be in the drawer. | 1 |
| dayLetter | Letter used for the day unit. | "j" |
| hourLetter |  Letter used for the hour unit. | "h" |
| minuteLetter |  Letter used for the minute unit.  | "m" |
| secondLetter |  Letter used for the second unit.  | "s" |
| timerDateFormat | Format used to show the simulation time on replay. | "EEEE dd/MM/yyyy HH:mm:ss" |
| showStartEndTime | Indicates if the interface should show or hide the start and end times of the replay simulation. | true |
| startEndDatesFormat | Format that will be used to show the start and end times. |  "HH:mm:ss" |
| showMultiplier | Indicates if the multiplier should be shown or hidden. | true |

### Counter section configuration

The counter section configurations are done in the "counterSection" block, inside the "drawerParams" block. Here are the different parameters:

| Name | Description | Default | 
| --- | --- | --- |
| include | Indicates if the counter section should be shown or hidden. | true |
| index | Indicates in which order this component should be in the drawer. | 2 |
| showTotal | Indicates if the total amount of consultations should be shown or hidden. | true |

### Portal section configuration

The portal section configurations are done in the "descriptionSection" block, inside the "drawerParams" block. Here are the different parameters:

| Name | Description | Default | 
| --- | --- | --- |
| include | Indicates if the portal section should be shown or hidden. | true |
| index | Indicates in which order this component should be in the drawer. | 3 |
| portals | The included portals will be shown in the drawer, and their consultation events will be shown on the map using bubbles. Each portal should be of this format: "nameOfPortal": {"color": "colorOfPortal", "icon": "iconOfPortal"}. The icon can be null or unmarked. | {} |

### Appbar configurations

The appbar configurations are done in the "appbarParams" block. Here are the different parameters:

| Name | Description | Default | 
| --- | --- | --- |
| include | Indicates if the appbar should be shown or hidden. | true |

### Minimap configurations
The appbar configurations are done in the "minimapParams" block. Here are the different parameters:

| Name | Description | Default | 
| --- | --- | --- |
| include | Indicates if the minimap should be shown or hidden. | true |
| defaultZoom | Default zoom of the minimap when it appears | 4 |
| minZoom | Minimum minimap zoom value. The user won't be allowed to zoom out bellow this value. | 2 |
| maxZoom | Maximum minimap zoom value. The user won't be allowed to zoom in above this value. | 4 |
| disableOnPhone | Indicates if the minimap should be disabled on phone, as it takes a lot of space on the screen. | true |

### Information drawer configurations

The Information drawer configurations are done in the "infoDrawerParams" block. Here are the different parameters:

| Name | Description | Default | 
| --- | --- | --- |
| include | Indicates if the minimap should be shown or hidden. | true |
| position | Position of the information drawer. Can be "left", "right", "bottom" or "top". | "right" |

## Customizable text

It is possible to configure customizable text fields thanks to the use of i18n. The text should be written in json files at src/locals/custom/{language}.json. Writing text in these files ensure content can be translated. Here are the fields:

| Name | Description |
| description | Text of the description section in the drawer. |
| portals | Portals can have a title and a subtitle. They must be of this format: "nameOfPortal": {"title": "titleOfPortal", "subtitle": "subtitleOfPortal"} |

## Information card

It is possible to fully customize the information card that appears as a drawer to the right of the page by default. To do so, you need to change the "InformationContent" component, located inside the information-components folder. You can also use the customizable text files to write text in your information card. To do so, visit the [vue-i18n documentation page](https://vue-i18n.intlify.dev/).