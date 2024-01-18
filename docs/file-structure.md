# File structure

All JKUM-compatible files should have the extension `.jkum`. The
contents of the file is based on the [JSON-file standard], and should in general
follow all syntax regulations as described there.

  [JSON-file standard]: https://www.json.org/
  
The file should consist of two primary attributes: the `head` and the `manholes`. 
The structure should be similar to this:

``` json
{
  "head": {
    "epsg": 25832
  }
  "manholes": [...]
}
```

## Minumum file sample
In order to generate a minimal and valid file, the JKUM-contents should be like this:


``` json
{
  "head": {
    "epsg": 25832
  }
  "manholes": [
    {
      "guid": 
    }
  ]
}
```