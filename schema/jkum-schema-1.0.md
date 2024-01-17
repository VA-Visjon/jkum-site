# JKUM 1.0

## Properties

- **`head`**: Refer to *[#/definitions/head](#definitions/head)*.
- **`manholes`** *(['array', 'null'])*
  - **Items**: Refer to *[#/definitions/manhole](#definitions/manhole)*.
## Definitions

- <a id="definitions/head"></a>**`head`** *(object)*
  - **`epsg`** *(string, required)*: Default: `""`.

    Examples:
    ```json
    "25832"
    ```

  - **`date`** *(string)*: Default: `""`.

    Examples:
    ```json
    "2020-01-22"
    ```

  - **`author`** *(string)*: Default: `""`.

    Examples:
    ```json
    "Hans Martin Eikerol"
    ```

- <a id="definitions/location"></a>**`location`** *(object)*
  - **`east`** *(number, required)*
  - **`north`** *(number, required)*
  - **`elevation`** *(number, required)*
- <a id="definitions/guid"></a>**`guid`** *(string)*

  Examples:
  ```json
  "cc984777-f7fc-475b-9f32-7cafd70a09cb"
  ```

- <a id="definitions/lid"></a>**`lid`** *(object)*
  - **`guid`** *(['string', 'null'])*
  - **`position`**: Refer to *[#/definitions/location](#definitions/location)*.
  - **`diameter`** *(integer, required)*

    Examples:
    ```json
    650
    ```

  - **`ladder`** *(string)*: Must be one of: `["Unspecified", "Yes", "No"]`. Default: `"Unspecified"`.

    Examples:
    ```json
    "Yes"
    ```

  - **`classification`** *(string)*: Must be one of: `["Unspecified", "D400", "D700"]`. Default: `"Unspecified"`.

    Examples:
    ```json
    "D400"
    ```

- <a id="definitions/manhole"></a>**`manhole`** *(object)*
  - **`guid`**: Refer to *[#/definitions/guid](#definitions/guid)*.
  - **`elementId`** *(string)*: Default: `""`.

    Examples:
    ```json
    "556001"
    ```

  - **`bottomCenter`**: Refer to *[#/definitions/location](#definitions/location)*.
  - **`shape`** *(string)*: Must be one of: `["Circular", "Rectangular", "Polygon"]`. Default: `"Circular"`.

    Examples:
    ```json
    "Rectangular"
    ```

  - **`material`** *(string)*: Must be one of: `["Concrete", "Bricks", "Plastic", "Rehabilitated", "Other"]`. Default: `"Concrete"`.

    Examples:
    ```json
    "Concrete"
    ```

  - **`diameter`** *(integer)*

    Examples:
    ```json
    1600
    ```

  - **`width`** *(integer)*

    Examples:
    ```json
    1200
    ```

  - **`length`** *(integer)*

    Examples:
    ```json
    1600
    ```

  - **`rotation`** *(integer)*: The rotation on a clock dial in degrees (0 - 360), starting at 12 O'clock, with positive numbers going clockwise. Default: `0`.

    Examples:
    ```json
    120
    ```

  - **`lids`** *(array, required)*
    - **Items**: Refer to *[#/definitions/lid](#definitions/lid)*.
  - **`links`** *(array)*
    - **Items**: Refer to *[#/definitions/manholeLink](#definitions/manholeLink)*.
  - **`circumference`** *(array)*
    - **Items**: Refer to *[#/definitions/manholeCircumference](#definitions/manholeCircumference)*.
- <a id="definitions/manholeCircumference"></a>**`manholeCircumference`** *(['object', 'null'])*
  - **`innerVertices`** *(['array', 'null'])*
    - **Items**: Refer to *[#/definitions/location](#definitions/location)*.
  - **`outerVertices`** *(['array', 'null'])*
    - **Items**: Refer to *[#/definitions/location](#definitions/location)*.
- <a id="definitions/manholeLink"></a>**`manholeLink`** *(['object', 'null'])*
  - **`guid`**: Refer to *[#/definitions/guid](#definitions/guid)*.
  - **`elementId`** *(string)*

    Examples:
    ```json
    "548861"
    ```

  - **`medium`** *(string)*

    Examples:
    ```json
    "Water"
    ```

  - **`direction`** *(string)*: Must be one of: `["Ingoing", "Outgoing"]`.

    Examples:
    ```json
    "Ingoing"
    ```

  - **`pressurized`** *(boolean, required)*: Default: `false`.

    Examples:
    ```json
    false
    ```

  - **`elevation`** *(number, required)*

    Examples:
    ```json
    53.11
    ```

  - **`clockPosition`** *(integer, required)*

    Examples:
    ```json
    20
    ```

  - **`diameter`** *(integer, required)*

    Examples:
    ```json
    150
    ```

