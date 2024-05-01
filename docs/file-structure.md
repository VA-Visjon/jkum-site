# File structure

All JKUM-compatible files should have the extension `.jkum`. The
contents of the file is based on the [JSON-file standard]{:target="_blank"} and should in general
follow all syntax regulations as described there. The `.jkum` file must validate
according to this JKUM-standard, which is defined by a JSON Schema Definition file.
The Standard is for the time being applying schema definition draft 7
(see [JSON-schema]{:target="_blank"}), which covers most use cases to schema handling.

  [JSON-file standard]: https://www.json.org/
  [JSON-schema]: https://json-schema.org/

Any file created should adhere to the JSON-schemas as defined by JKUM.

The file should consist of two primary attributes: the `head` and the `manholes`. 
The structure should be similar to this:

``` json
{
  "head": {
    "epsg": 25832,
    "purpose": "Surveying"
  },
  "manholes": [...]
}
```

## Properties
The `.jkum`-file has two properties at the top level: `head` and `manholes`. In the following, all
related objects and properties are described.

## Head
The `head` property consists of these possible properties:

| Property Name | Type | Required | Description |
| ------- | -------- |-------- | ------ |
| epsg | integer | :material-check-circle:{ .success } | The EPSG ID for the coordinate system which the coordinates this file system is represented. |
| purpose | string | :material-check-circle:{ .success } | The purpose for this file, which will affect which fields are considered required or not. One of the following values: `Surveying`, `Export` |
| date | string | :material-close-circle:{ .error } | An [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)-formatted date string on the format YYYY-MM-DD. |
| author | string | :material-close-circle:{ .error } | The name or descriptive text about the author of the file. |

## Manholes
The `manholes`-property is an `array` consisting of `Manhole`.

### Manhole
The properties for manholes are listed in this table.

| Property Name | Type | Required | Description |
| ------- | -------- |-------- | ------ |
| guid | GUID | :material-check-circle:{ .success } | A unique system-generated GUID for future reference and identification for the object. |
| sid | string | :material-close-circle:{ .error } | A unique ID commonly used in mapping systems. Enables a better human-readable ID for the object. |
| shape | string | :material-close-circle:{ .error } | The shape of the Manhole, one of: `Circular`, `Rectangular` or `Polygonal`. |
| elevationBottom | number | :material-close-circle:{ .error } | The altitude (elevation) for the bottom inside of the manhole in absolute elevation relative to zero. |
| elevationBanquet | number | :material-close-circle:{ .error } | The altitude (elevation) for any potential banquet, relative to zero. Skip this property if a banquet is not present. |
| topSolution | string | :material-close-circle:{ .error } | The solution applied for the top part of the manhole, one of:  `Cone`, `Top plate`, `Cast removable`, `Cast not removable`, `Unknown` |
| material | string | :material-close-circle:{ .error } | The material of the manhole construction. Restricted by predefined values, one of: `Concrete`, `Bricks`, `Plastic`, `Rehabilitated`, `Other` |
| diameter | integer | :material-close-circle:{ .error } | The inner diameter of the manhole construction. |
| lids | array<[Lid](#lid)> | :material-check-circle:{ .success } | An array of Lid objects. Contains an array of Lids, since some manholes may have more than one Lid. |
| pipes | array<[PipeConnection](#pipeconnection)> | :material-close-circle:{ .error } | An array of PipeConnection objects. |
| images | array<[ImageData](#imagedata)> | :material-close-circle:{ .error } | An array of ImageData objects. |

Depending on the `shape` of the manhole, the following properties are also required:

=== "Circular"

    | Property Name | Type | Required | Description |
    | ------- | -------- |-------- | ------ |
    | diameter | integer | :material-check-circle:{ .success } | The manhole inner diameter in millimeters. |
    | isEccentric | bool | :material-check-circle:{ .success } | Wether the manhole is eccentric or centric. |
    | rotation | integer | :material-check-circle:{ .warning } | `Required if the manhole is eccentric.`<br />The rotation pointing towards the center of the manhole lid. Relative to north, oriented clockwise from between 0 and 359 degrees. |


=== "Rectangular"

    | Property Name | Type | Required | Description |
    | ------- | -------- |-------- | ------ |
    | sizeX | integer | :material-check-circle:{ .success } | The manhole size in millimeters, along the X-axis according to its rotation. |
    | sizeY | integer | :material-check-circle:{ .success } | The manhole size in millimeters, along the Y-axis according to its rotation. |
    | rotation | integer | :material-check-circle:{ .success } | The y-axis relative to north, oriented clockwise from between 0 and 359 degrees. |
    | center | [Location](#location) | :material-check-circle:{ .success } | The center position of the manhole chamber. |

=== "Polygonal"

    | Property Name | Type | Required | Description |
    | ------- | -------- |-------- | ------ |
    | circumference | array | :material-check-circle:{ .success } | A [circumference](#circumference)-object consisting of the inner and outer boundary representing the Manhole constructions' shape. |

### Location
The `location`-attribute consists of the three properties `east`, `north` and `elevation`. 

| Property Name | Type | Required | Description |
| ------- | -------- |-------- | ------ |
| east | float | :material-check-circle:{ .success } | A float representing the east coordinate within the EPSG-system as defined in the file `head`-property. |
| north | float | :material-check-circle:{ .success } | A float representing the north coordinate within the EPSG-system as defined in the file `head`-property. |
| elevation | float | :material-close-circle:{ .error } | A float representing the elevation of the coordinate within the EPSG-system as defined in the file `head`-property. |


### Circumference

| Property Name | Type | Required | Description |
| ------- | -------- |-------- | ------ |
| innerVertices | array<[Location](#location)> | :material-check-circle:{ .success } | An array of vertices within the EPSG-system as defined in the file `head`-property. |
| outerVertices | array<[Location](#location)> | :material-check-circle:{ .success } | An array of vertices within the EPSG-system as defined in the file `head`-property. |

### Lid

| Property Name | Type | Required | Description |
| ------- | -------- |-------- | ------ |
| guid | GUID | :material-check-circle:{ .success } | A unique system-generated GUID for future reference and identification for the object. |
| position | [Location](#location) | :material-check-circle:{ .success } | The position of the center point of the lid in the terrain. |
| diameter | integer | :material-close-circle:{ .error } | The manhole lid diameter in millimeters. Measured as lid size, not outer ring size. |
| ladder | string | :material-close-circle:{ .error } | If there is a ladder: `Yes`, otherwise `No`. Defaults to `Unspecified` in the absence of the property. |
| classification | string | :material-close-circle:{ .error } | Details of the lid type, one of: `Unspecified`, `D400`, `D700` |



### PipeConnection
When looking down into the manhole, pipe ends can be seen. Not knowing where the other end
of the pipe is going or coming from, this file format instead focus on the relevant
connector points that can be seen from inside the manhole.

| Property Name | Type | Required | Description |
| ------- | -------- |-------- | ------ |
| guid | GUID | :material-check-circle:{ .success } | A unique system-generated GUID for future reference and identification for the object. |
| sid | string | :material-close-circle:{ .error } | A unique ID commonly used in mapping systems. Enables a better human-readable ID for the object. |
| medium | string | :material-close-circle:{ .error } | The medium transported in the pipe. Must be one of the following: `Water`, `Sewer`, `Combination sewer`, `Storm water`, `Drain` |
| direction | string | :material-close-circle:{ .error } | The assumed flow direction of the pipe contents. Must be one of the following: `Ingoing`, `Outgoing` |
| material | string | :material-close-circle:{ .error } | The material of the pipe in the connection. Enum restricted to predefined values. |
| pressurized | boolean | :material-check-circle:{ .success } | If the pipe is a pressurized system. |
| measurementLocation | string | :material-check-circle:{ .success } | The location of where on the pipe the elevation was measured. One of: `topOutsidePipe`, `bottomInsidePipe`, `centerPipe` |
| elevation | float | :material-check-circle:{ .success } | The real-world elevation coordinate for the pipe connection. |
| clockPosition | integer | :material-check-circle:{ .success } | The location of the pipe as seen inside the manhole, oriented clockwise from between 0 and 359 degrees relative to north. |
| diameter | integer | :material-close-circle:{ .error } | The pipe diameter in millimeters. |



### ImageData
The `images`-items needs one of the following data contents:

=== "Base64 and media type"

    | Property Name | Type | Required | Description |
    | ------- | -------- |-------- | ------ |
    | base64String | string | :material-check-circle:{ .success } | A base 64 encoded string representing the image. |
    | mediaType | string | :material-check-circle:{ .success } | A valid url to the location of the file, where it should be available for download. |

=== "Image URL to online source"

    | Property Name | Type | Required | Description |
    | ------- | -------- |-------- | ------ |
    | imageUrl | string | :material-check-circle:{ .success } | A valid url to the location of the file, where it should be available for download. |

