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


# Other parser repos

The project roadmap describes a goal of establishing open-source parsers for the
JKUM-file format for lots of different programming languages. Currently, only a few
are established.

| Language | Supported? | Status | Repo |
| ------------ | ------------- | ------------ | ------------ |
| C# | :material-check-circle:{ .success } Yes | Completed | [:material-github: JkumParser](https://github.com/hansmei/JkumParser) |
| python | :material-close-circle:{ .error } No |  |  |

If you are familiar with any of the non-supported languages and want to contribute,
feel free to drop an email to `kontakt@vavisjon.no` about it or submit a pull request, and
we will add it here.