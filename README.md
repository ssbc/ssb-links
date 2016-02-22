# ssb-links

ssb-plugin that indexes all the links!

## Example

if you have a handle on the sbot server:
``` js
sbot.use(require('ssb-links')
sbot.links2.read({query: {rel: {prefix: 'mentions!d'}}})
```
OR if sbot is a client...

``` js
links2 = require('ssb-links').init(sbot, {path: '~/.ssb'})
links2.read({query: {rel: {prefix: 'mentions!d'}}})
```

## config

a leveldb instance will be created at `config.path+'/links'`

## api: links2.read ({query: {query}, live, reverse, limit})

### query syntax

this is likely to change, but currently you can match strings,
and prefixes of strings.

say, if you want to get all links from a given source to a diven dest

``` js
links2.read({query: {source: srcId, dest: dstId}})
```
or say, you want to see who has mentioned this dest,
(known dest and part of the rel)

``` js
links2.read({query: {dest: dstId, rel: {prefix: 'mentions!@'}}})
```

you can also do a query that is only a range, say to ask who has been mentioned with petnames starting with a given letter,
(as above in the first example)

``` js
links2.read({query: {rel: {prefix: 'mentions!d'}}})
```

query syntax is likely to sustain breaking changes!

## License

MIT



