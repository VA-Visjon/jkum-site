# JKUM 1.0

**Title:** JKUM 1.0

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | No                                                      |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |

**Description:** A file standard for transporting information about manhole data

| Property                 | Pattern | Type          | Deprecated | Definition            | Title/Description |
| ------------------------ | ------- | ------------- | ---------- | --------------------- | ----------------- |
| + [head](#head )         | No      | object        | No         | In #/definitions/head | -                 |
| - [manholes](#manholes ) | No      | array or null | No         | -                     | -                 |

## <a name="head"></a>1. Property `head`

|                           |                                                         |
| ------------------------- | ------------------------------------------------------- |
| **Type**                  | `object`                                                |
| **Required**              | Yes                                                     |
| **Additional properties** | [[Not allowed]](# "Additional Properties not allowed.") |
| **Defined in**            | #/definitions/head                                      |

**Example:** 

```json
{
    "epsg": 28532,
    "date": "2024-01-17",
    "author": "Hans Martin Eikerol"
}
```

| Property                  | Pattern | Type    | Deprecated | Definition | Title/Description                               |
| ------------------------- | ------- | ------- | ---------- | ---------- | ----------------------------------------------- |
| + [epsg](#head_epsg )     | No      | integer | No         | -          | EPSG                                            |
| - [date](#head_date )     | No      | string  | No         | -          | A valid date on the ISO 8601-format: YYYY-MM-DD |
| - [author](#head_author ) | No      | string  | No         | -          | The name of the company or author of the file   |

### <a name="head_epsg"></a>1.1. Property `epsg`

**Title:** EPSG

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | Yes       |
| **Default**  | `""`      |

**Description:** A valid EPSG code, see www.epsg.io for reference.

**Examples:** 

```json
25832
```

```json
25833
```

```json
5110
```

```json
5111
```

| Restrictions                      |                                                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Must match regular expression** | ```^[0-9]{4,5}$``` [Test](https://regex101.com/?regex=%5E%5B0-9%5D%7B4%2C5%7D%24&testString=25832) |

### <a name="head_date"></a>1.2. Property `date`

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |
| **Default**  | `""`     |

**Description:** A valid date on the ISO 8601-format: YYYY-MM-DD

**Example:** 

```json
"2020-01-22"
```

| Restrictions                      |                                                                                                                                                                                                                                        |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Must match regular expression** | ```^[0-9]{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[1-2][0-9]\|3[0-1])$``` [Test](https://regex101.com/?regex=%5E%5B0-9%5D%7B4%7D-%280%5B1-9%5D%7C1%5B0-2%5D%29-%280%5B1-9%5D%7C%5B1-2%5D%5B0-9%5D%7C3%5B0-1%5D%29%24&testString=%222020-01-22%22) |

### <a name="head_author"></a>1.3. Property `author`

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |
| **Default**  | `""`     |

**Description:** The name of the company or author of the file

**Example:** 

```json
"Hans Martin Eikerol"
```

## <a name="manholes"></a>2. Property `manholes`

|              |                 |
| ------------ | --------------- |
| **Type**     | `array or null` |
| **Required** | No              |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be | Description |
| ------------------------------- | ----------- |
| [manhole](#manholes_items)      | -           |

### <a name="autogenerated_heading_2"></a>2.1. manhole

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |
| **Defined in**            | #/definitions/manhole                                                     |

| Property                                          | Pattern | Type             | Deprecated | Definition                | Title/Description                              |
| ------------------------------------------------- | ------- | ---------------- | ---------- | ------------------------- | ---------------------------------------------- |
| + [guid](#manholes_items_guid )                   | No      | string           | No         | In #/definitions/guid     | -                                              |
| - [elementId](#manholes_items_elementId )         | No      | string           | No         | -                         | -                                              |
| + [bottomCenter](#manholes_items_bottomCenter )   | No      | object           | No         | In #/definitions/location | -                                              |
| - [shape](#manholes_items_shape )                 | No      | enum (of string) | No         | -                         | -                                              |
| - [material](#manholes_items_material )           | No      | enum (of string) | No         | -                         | -                                              |
| - [diameter](#manholes_items_diameter )           | No      | integer          | No         | -                         | -                                              |
| - [width](#manholes_items_width )                 | No      | integer          | No         | -                         | -                                              |
| - [length](#manholes_items_length )               | No      | integer          | No         | -                         | -                                              |
| - [rotation](#manholes_items_rotation )           | No      | integer          | No         | -                         | Clockwise cone or rectangular manhole rotation |
| + [lids](#manholes_items_lids )                   | No      | array            | No         | -                         | -                                              |
| - [links](#manholes_items_links )                 | No      | array            | No         | -                         | -                                              |
| - [circumference](#manholes_items_circumference ) | No      | array            | No         | -                         | -                                              |

#### <a name="manholes_items_guid"></a>2.1.1. Property `guid`

|                |                    |
| -------------- | ------------------ |
| **Type**       | `string`           |
| **Required**   | Yes                |
| **Defined in** | #/definitions/guid |

**Example:** 

```json
"cc984777-f7fc-475b-9f32-7cafd70a09cb"
```

| Restrictions                      |                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Must match regular expression** | ```^[0-9a-fA-F]{8}[-]{1}[0-9a-fA-F]{4}[-]{1}[0-9a-fA-F]{4}[-]{1}[0-9a-fA-F]{4}[-]{1}[0-9a-fA-F]{12}$``` [Test](https://regex101.com/?regex=%5E%5B0-9a-fA-F%5D%7B8%7D%5B-%5D%7B1%7D%5B0-9a-fA-F%5D%7B4%7D%5B-%5D%7B1%7D%5B0-9a-fA-F%5D%7B4%7D%5B-%5D%7B1%7D%5B0-9a-fA-F%5D%7B4%7D%5B-%5D%7B1%7D%5B0-9a-fA-F%5D%7B12%7D%24&testString=%22cc984777-f7fc-475b-9f32-7cafd70a09cb%22) |

#### <a name="manholes_items_elementId"></a>2.1.2. Property `elementId`

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |
| **Default**  | `""`     |

**Example:** 

```json
"556001"
```

#### <a name="manholes_items_bottomCenter"></a>2.1.3. Property `bottomCenter`

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | Yes                                                                       |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |
| **Defined in**            | #/definitions/location                                                    |

| Property                                               | Pattern | Type   | Deprecated | Definition | Title/Description |
| ------------------------------------------------------ | ------- | ------ | ---------- | ---------- | ----------------- |
| + [east](#manholes_items_bottomCenter_east )           | No      | number | No         | -          | -                 |
| + [north](#manholes_items_bottomCenter_north )         | No      | number | No         | -          | -                 |
| + [elevation](#manholes_items_bottomCenter_elevation ) | No      | number | No         | -          | -                 |

##### <a name="manholes_items_bottomCenter_east"></a>2.1.3.1. Property `east`

|              |          |
| ------------ | -------- |
| **Type**     | `number` |
| **Required** | Yes      |

##### <a name="manholes_items_bottomCenter_north"></a>2.1.3.2. Property `north`

|              |          |
| ------------ | -------- |
| **Type**     | `number` |
| **Required** | Yes      |

##### <a name="manholes_items_bottomCenter_elevation"></a>2.1.3.3. Property `elevation`

|              |          |
| ------------ | -------- |
| **Type**     | `number` |
| **Required** | Yes      |

#### <a name="manholes_items_shape"></a>2.1.4. Property `shape`

|              |                    |
| ------------ | ------------------ |
| **Type**     | `enum (of string)` |
| **Required** | No                 |
| **Default**  | `"Circular"`       |

**Example:** 

```json
"Rectangular"
```

Must be one of:
* "Circular"
* "Rectangular"
* "Polygon"

#### <a name="manholes_items_material"></a>2.1.5. Property `material`

|              |                    |
| ------------ | ------------------ |
| **Type**     | `enum (of string)` |
| **Required** | No                 |
| **Default**  | `"Concrete"`       |

**Example:** 

```json
"Concrete"
```

Must be one of:
* "Concrete"
* "Bricks"
* "Plastic"
* "Rehabilitated"
* "Other"

#### <a name="manholes_items_diameter"></a>2.1.6. Property `diameter`

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | No        |

**Example:** 

```json
1600
```

#### <a name="manholes_items_width"></a>2.1.7. Property `width`

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | No        |

**Example:** 

```json
1200
```

#### <a name="manholes_items_length"></a>2.1.8. Property `length`

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | No        |

**Example:** 

```json
1600
```

#### <a name="manholes_items_rotation"></a>2.1.9. Property `rotation`

**Title:** Clockwise cone or rectangular manhole rotation

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | No        |
| **Default**  | `0`       |

**Description:** The rotation on a clock dial in degrees (0 - 360), starting at 12 O'clock, with positive numbers going clockwise

**Example:** 

```json
120
```

#### <a name="manholes_items_lids"></a>2.1.10. Property `lids`

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | Yes     |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be   | Description |
| --------------------------------- | ----------- |
| [lid](#manholes_items_lids_items) | -           |

##### <a name="autogenerated_heading_3"></a>2.1.10.1. lid

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |
| **Defined in**            | #/definitions/lid                                                         |

| Property                                                       | Pattern | Type             | Deprecated | Definition                | Title/Description |
| -------------------------------------------------------------- | ------- | ---------------- | ---------- | ------------------------- | ----------------- |
| - [guid](#manholes_items_lids_items_guid )                     | No      | string or null   | No         | -                         | -                 |
| + [position](#manholes_items_lids_items_position )             | No      | object           | No         | In #/definitions/location | -                 |
| + [diameter](#manholes_items_lids_items_diameter )             | No      | integer          | No         | -                         | -                 |
| - [ladder](#manholes_items_lids_items_ladder )                 | No      | enum (of string) | No         | -                         | -                 |
| - [classification](#manholes_items_lids_items_classification ) | No      | enum (of string) | No         | -                         | -                 |

##### <a name="manholes_items_lids_items_guid"></a>2.1.10.1.1. Property `guid`

|              |                  |
| ------------ | ---------------- |
| **Type**     | `string or null` |
| **Required** | No               |

##### <a name="manholes_items_lids_items_position"></a>2.1.10.1.2. Property `position`

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | Yes                                                                       |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |
| **Defined in**            | #/definitions/location                                                    |

| Property                                                      | Pattern | Type   | Deprecated | Definition | Title/Description |
| ------------------------------------------------------------- | ------- | ------ | ---------- | ---------- | ----------------- |
| + [east](#manholes_items_lids_items_position_east )           | No      | number | No         | -          | -                 |
| + [north](#manholes_items_lids_items_position_north )         | No      | number | No         | -          | -                 |
| + [elevation](#manholes_items_lids_items_position_elevation ) | No      | number | No         | -          | -                 |

##### <a name="manholes_items_lids_items_position_east"></a>2.1.10.1.2.1. Property `east`

|              |          |
| ------------ | -------- |
| **Type**     | `number` |
| **Required** | Yes      |

##### <a name="manholes_items_lids_items_position_north"></a>2.1.10.1.2.2. Property `north`

|              |          |
| ------------ | -------- |
| **Type**     | `number` |
| **Required** | Yes      |

##### <a name="manholes_items_lids_items_position_elevation"></a>2.1.10.1.2.3. Property `elevation`

|              |          |
| ------------ | -------- |
| **Type**     | `number` |
| **Required** | Yes      |

##### <a name="manholes_items_lids_items_diameter"></a>2.1.10.1.3. Property `diameter`

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | Yes       |

**Example:** 

```json
650
```

##### <a name="manholes_items_lids_items_ladder"></a>2.1.10.1.4. Property `ladder`

|              |                    |
| ------------ | ------------------ |
| **Type**     | `enum (of string)` |
| **Required** | No                 |
| **Default**  | `"Unspecified"`    |

**Example:** 

```json
"Yes"
```

Must be one of:
* "Unspecified"
* "Yes"
* "No"

##### <a name="manholes_items_lids_items_classification"></a>2.1.10.1.5. Property `classification`

|              |                    |
| ------------ | ------------------ |
| **Type**     | `enum (of string)` |
| **Required** | No                 |
| **Default**  | `"Unspecified"`    |

**Example:** 

```json
"D400"
```

Must be one of:
* "Unspecified"
* "D400"
* "D700"

#### <a name="manholes_items_links"></a>2.1.11. Property `links`

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be            | Description |
| ------------------------------------------ | ----------- |
| [manholeLink](#manholes_items_links_items) | -           |

##### <a name="autogenerated_heading_4"></a>2.1.11.1. manholeLink

|                |                           |
| -------------- | ------------------------- |
| **Type**       | `object or null`          |
| **Required**   | No                        |
| **Defined in** | #/definitions/manholeLink |

| Property                                                      | Pattern | Type             | Deprecated | Definition            | Title/Description                               |
| ------------------------------------------------------------- | ------- | ---------------- | ---------- | --------------------- | ----------------------------------------------- |
| + [guid](#manholes_items_links_items_guid )                   | No      | string           | No         | In #/definitions/guid | -                                               |
| - [elementId](#manholes_items_links_items_elementId )         | No      | string           | No         | -                     | -                                               |
| - [medium](#manholes_items_links_items_medium )               | No      | string           | No         | -                     | The medium transported in the pipe              |
| - [direction](#manholes_items_links_items_direction )         | No      | enum (of string) | No         | -                     | The assumed flow direction of the pipe contents |
| + [pressurized](#manholes_items_links_items_pressurized )     | No      | boolean          | No         | -                     | -                                               |
| + [elevation](#manholes_items_links_items_elevation )         | No      | number           | No         | -                     | -                                               |
| + [clockPosition](#manholes_items_links_items_clockPosition ) | No      | integer          | No         | -                     | The Clockposition Schema                        |
| + [diameter](#manholes_items_links_items_diameter )           | No      | integer          | No         | -                     | -                                               |

##### <a name="manholes_items_links_items_guid"></a>2.1.11.1.1. Property `guid`

|                |                    |
| -------------- | ------------------ |
| **Type**       | `string`           |
| **Required**   | Yes                |
| **Defined in** | #/definitions/guid |

**Example:** 

```json
"cc984777-f7fc-475b-9f32-7cafd70a09cb"
```

| Restrictions                      |                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Must match regular expression** | ```^[0-9a-fA-F]{8}[-]{1}[0-9a-fA-F]{4}[-]{1}[0-9a-fA-F]{4}[-]{1}[0-9a-fA-F]{4}[-]{1}[0-9a-fA-F]{12}$``` [Test](https://regex101.com/?regex=%5E%5B0-9a-fA-F%5D%7B8%7D%5B-%5D%7B1%7D%5B0-9a-fA-F%5D%7B4%7D%5B-%5D%7B1%7D%5B0-9a-fA-F%5D%7B4%7D%5B-%5D%7B1%7D%5B0-9a-fA-F%5D%7B4%7D%5B-%5D%7B1%7D%5B0-9a-fA-F%5D%7B12%7D%24&testString=%22cc984777-f7fc-475b-9f32-7cafd70a09cb%22) |

##### <a name="manholes_items_links_items_elementId"></a>2.1.11.1.2. Property `elementId`

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Example:** 

```json
"548861"
```

##### <a name="manholes_items_links_items_medium"></a>2.1.11.1.3. Property `medium`

**Title:** The medium transported in the pipe

|              |          |
| ------------ | -------- |
| **Type**     | `string` |
| **Required** | No       |

**Example:** 

```json
"Water"
```

##### <a name="manholes_items_links_items_direction"></a>2.1.11.1.4. Property `direction`

**Title:** The assumed flow direction of the pipe contents

|              |                    |
| ------------ | ------------------ |
| **Type**     | `enum (of string)` |
| **Required** | No                 |

**Example:** 

```json
"Ingoing"
```

Must be one of:
* "Ingoing"
* "Outgoing"

##### <a name="manholes_items_links_items_pressurized"></a>2.1.11.1.5. Property `pressurized`

|              |           |
| ------------ | --------- |
| **Type**     | `boolean` |
| **Required** | Yes       |
| **Default**  | `false`   |

**Example:** 

```json
false
```

##### <a name="manholes_items_links_items_elevation"></a>2.1.11.1.6. Property `elevation`

|              |          |
| ------------ | -------- |
| **Type**     | `number` |
| **Required** | Yes      |

**Example:** 

```json
53.11
```

##### <a name="manholes_items_links_items_clockPosition"></a>2.1.11.1.7. Property `clockPosition`

**Title:** The Clockposition Schema

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | Yes       |

**Example:** 

```json
20
```

| Restrictions                      |                                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Must match regular expression** | ```^[0-3][0-9]?[0-9]?$``` [Test](https://regex101.com/?regex=%5E%5B0-3%5D%5B0-9%5D%3F%5B0-9%5D%3F%24&testString=20) |

##### <a name="manholes_items_links_items_diameter"></a>2.1.11.1.8. Property `diameter`

|              |           |
| ------------ | --------- |
| **Type**     | `integer` |
| **Required** | Yes       |

**Example:** 

```json
150
```

#### <a name="manholes_items_circumference"></a>2.1.12. Property `circumference`

|              |         |
| ------------ | ------- |
| **Type**     | `array` |
| **Required** | No      |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                             | Description |
| ----------------------------------------------------------- | ----------- |
| [manholeCircumference](#manholes_items_circumference_items) | -           |

##### <a name="autogenerated_heading_5"></a>2.1.12.1. manholeCircumference

|                |                                    |
| -------------- | ---------------------------------- |
| **Type**       | `object or null`                   |
| **Required**   | No                                 |
| **Defined in** | #/definitions/manholeCircumference |

| Property                                                              | Pattern | Type          | Deprecated | Definition | Title/Description |
| --------------------------------------------------------------------- | ------- | ------------- | ---------- | ---------- | ----------------- |
| - [innerVertices](#manholes_items_circumference_items_innerVertices ) | No      | array or null | No         | -          | -                 |
| - [outerVertices](#manholes_items_circumference_items_outerVertices ) | No      | array or null | No         | -          | -                 |

##### <a name="manholes_items_circumference_items_innerVertices"></a>2.1.12.1.1. Property `innerVertices`

|              |                 |
| ------------ | --------------- |
| **Type**     | `array or null` |
| **Required** | No              |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                     | Description |
| ------------------------------------------------------------------- | ----------- |
| [location](#manholes_items_circumference_items_innerVertices_items) | -           |

##### <a name="autogenerated_heading_6"></a>2.1.12.1.1.1. location

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |
| **Defined in**            | #/definitions/location                                                    |

| Property                                                                          | Pattern | Type   | Deprecated | Definition | Title/Description |
| --------------------------------------------------------------------------------- | ------- | ------ | ---------- | ---------- | ----------------- |
| + [east](#manholes_items_circumference_items_innerVertices_items_east )           | No      | number | No         | -          | -                 |
| + [north](#manholes_items_circumference_items_innerVertices_items_north )         | No      | number | No         | -          | -                 |
| + [elevation](#manholes_items_circumference_items_innerVertices_items_elevation ) | No      | number | No         | -          | -                 |

##### <a name="manholes_items_circumference_items_innerVertices_items_east"></a>2.1.12.1.1.1.1. Property `east`

|              |          |
| ------------ | -------- |
| **Type**     | `number` |
| **Required** | Yes      |

##### <a name="manholes_items_circumference_items_innerVertices_items_north"></a>2.1.12.1.1.1.2. Property `north`

|              |          |
| ------------ | -------- |
| **Type**     | `number` |
| **Required** | Yes      |

##### <a name="manholes_items_circumference_items_innerVertices_items_elevation"></a>2.1.12.1.1.1.3. Property `elevation`

|              |          |
| ------------ | -------- |
| **Type**     | `number` |
| **Required** | Yes      |

##### <a name="manholes_items_circumference_items_outerVertices"></a>2.1.12.1.2. Property `outerVertices`

|              |                 |
| ------------ | --------------- |
| **Type**     | `array or null` |
| **Required** | No              |

|                      | Array restrictions |
| -------------------- | ------------------ |
| **Min items**        | N/A                |
| **Max items**        | N/A                |
| **Items unicity**    | False              |
| **Additional items** | False              |
| **Tuple validation** | See below          |

| Each item of this array must be                                     | Description |
| ------------------------------------------------------------------- | ----------- |
| [location](#manholes_items_circumference_items_outerVertices_items) | -           |

##### <a name="autogenerated_heading_7"></a>2.1.12.1.2.1. location

|                           |                                                                           |
| ------------------------- | ------------------------------------------------------------------------- |
| **Type**                  | `object`                                                                  |
| **Required**              | No                                                                        |
| **Additional properties** | [[Any type: allowed]](# "Additional Properties of any type are allowed.") |
| **Defined in**            | #/definitions/location                                                    |

| Property                                                                          | Pattern | Type   | Deprecated | Definition | Title/Description |
| --------------------------------------------------------------------------------- | ------- | ------ | ---------- | ---------- | ----------------- |
| + [east](#manholes_items_circumference_items_outerVertices_items_east )           | No      | number | No         | -          | -                 |
| + [north](#manholes_items_circumference_items_outerVertices_items_north )         | No      | number | No         | -          | -                 |
| + [elevation](#manholes_items_circumference_items_outerVertices_items_elevation ) | No      | number | No         | -          | -                 |

##### <a name="manholes_items_circumference_items_outerVertices_items_east"></a>2.1.12.1.2.1.1. Property `east`

|              |          |
| ------------ | -------- |
| **Type**     | `number` |
| **Required** | Yes      |

##### <a name="manholes_items_circumference_items_outerVertices_items_north"></a>2.1.12.1.2.1.2. Property `north`

|              |          |
| ------------ | -------- |
| **Type**     | `number` |
| **Required** | Yes      |

##### <a name="manholes_items_circumference_items_outerVertices_items_elevation"></a>2.1.12.1.2.1.3. Property `elevation`

|              |          |
| ------------ | -------- |
| **Type**     | `number` |
| **Required** | Yes      |

----------------------------------------------------------------------------------------------------------------------------
Generated using [json-schema-for-humans](https://github.com/coveooss/json-schema-for-humans) on 2024-01-18 at 00:12:37 +0100
