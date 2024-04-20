# jkum-site

## Development
The main bulk of the documentation is built with mkdocs. In order to run development, use:
```
mkdocs serve
```

## Deployment

Run the following in order to push updates to the site:
```
mkdocs gh-deploy --force
```

## Building schema docs
Run the following in order to build all `.md`-contents for the current schemas:

```
generate-schema-doc --config-file .\jsfh-conf.yaml .\docs\assets\schemas\ .\docs\schemas\
```
