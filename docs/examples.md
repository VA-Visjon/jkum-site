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

## More complete sample file


``` json
{
  "head": {
    "epsg": 25832,
    "date": "2024-01-22",
    "author": "Hans Martin Eikerol"
  },
  "manholes": [
    {
      "guid": "a62b144e-7ce4-4e77-92a3-e1c1e07a06c9",
      "sid": "556001",
      "bottomCenter": {
        "east": 588447.155,
        "north": 6642743.891,
        "elevation": 52.714
      },
      "shape": "Circular",
      "diameter": 1600,
      "width": 0,
      "length": 0,
      "lids": [
        {
          "position": {
            "east": 588447.155,
            "north": 6642743.826,
            "elevation": 55.145
          },
          "diameter": 650
        }
      ],
      "pipeConnections": [
        {
          "guid": "e11c0db4-af2e-4709-abff-549faf0cdec4",
          "sid": "548861",
          "medium": "Water",
          "pressurized": true,
          "elevation": 53.11,
          "clockPosition": 20,
          "diameter": 150
        },
        {
          "guid": "e273cc77-4e02-4f41-9ac4-23de436636fb",
          "sid": "548862",
          "medium": "Water",
          "pressurized": true,
          "elevation": 53.11,
          "clockPosition": 200,
          "diameter": 150
        },
        {
          "guid": "f3b02279-8fd6-4d42-aa57-fdaa3f628af7",
          "sid": "548864",
          "medium": "Water",
          "pressurized": true,
          "elevation": 53.11,
          "clockPosition": 110,
          "diameter": 150
        }
      ]
    },
    {
      "guid": "35c2ddec-a812-4045-a1aa-147c30e33511",
      "sid": "522431",
      "bottomCenter": {
        "east": 588429.23,
        "north": 6642811.51,
        "elevation": 53.218
      },
      "shape": "Rectangular",
      "diameter": 0,
      "width": 3000,
      "length": 1200,
      "lids": [
        {
          "position": {
            "east": 588428.23,
            "north": 6642811.71,
            "elevation": 55.16
          },
          "diameter": 650,
          "ladder": "Yes",
          "classification": "D400"
        },
        {
          "position": {
            "east": 588430.23,
            "north": 6642811.31,
            "elevation": 55.16
          },
          "diameter": 650
        }
      ],
      "pipeConnections": [
        {
          "guid": "90689770-9f02-4696-9a14-2eb4aab73cc1",
          "medium": "Water",
          "pressurized": true,
          "elevation": 53.65,
          "clockPosition": 20,
          "diameter": 150
        },
        {
          "guid": "54b19888-ed03-41bb-8828-3ad6cf47390e",
          "medium": "Water",
          "pressurized": true,
          "elevation": 53.65,
          "clockPosition": 200,
          "diameter": 150
        },
        {
          "guid": "49650b66-fc06-4bed-b785-72fd96453fe4",
          "medium": "Water",
          "pressurized": true,
          "elevation": 53.65,
          "clockPosition": 110,
          "diameter": 150
        },
        {
          "guid": "39fc5c19-c0e9-467b-b523-f9703b524dd0",
          "medium": "StormWater",
          "direction": "Ingoing",
          "pressurized": false,
          "elevation": 53.11,
          "clockPosition": 110,
          "diameter": 160
        },
        {
          "guid": "420cfd6b-beea-4ee9-9a14-51a7c4258af4",
          "medium": "StormWater",
          "direction": "Outgoing",
          "pressurized": false,
          "elevation": 53.07,
          "clockPosition": 230,
          "diameter": 300
        }
      ]
    }
  ]
}
```