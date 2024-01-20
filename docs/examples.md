# Examples
This page comprise a few sample files that will be counted as valid files within
the JKUM file format.


## Minumum file sample
In order to generate a minimal and valid file, the JKUM-contents should be like this:


``` json
{
  "head": {
    "epsg": 25832,
  },
  "manholes": [
    {
      "guid": "03de0a00-d6c0-4cb4-81bd-8f6ebdfad7a6",
      "shape": "Circular",
      "diameter": 1600,
      "lids": [
        {
          "guid": "216e1618-bdf4-4ade-8Bg9-h9BBs34df115",
          "position": {
            "east": 588447.155,
            "north": 6642743.826,
            "elevation": 55.145
          }
        }
      ]
    }
  ]
}
```