# ssb-links

an [ssb-plugin](https://github.com/ssbc/secret-stack/blob/master/PLUGINS.md) that indexes all the links!

This plugin can perform queries about messages that refer to other messages or feeds.

## Example

if you have a handle on the sbot server:
``` js
sbot.use(require('ssb-links')
sbot.links2.read({query: [{$filter: {rel: ['mentions', {$prefix: '@d'}]}}]})
```
OR if sbot is a client...

``` js
links2 = require('ssb-links').init(sbot, {path: '~/.ssb'})
links2.read({query: [{$filter: {rel: ['mentions', {$prefix: '@d'}]}}]})
```

## Installation

Most clients will install ssb-links for you, check if the `ssb-server links2.read --help` command works
If not, to install it manually. Since ssb-links has the same name as a core feature, it actually exposes
it's api as `sbot.links2` it was [originally intended to replace ssb-db.links](https://hackmd.io/IM5_tWIfSFuNoe3jtrjrtQ?view#incomplete-intentions)
but that didn't end up happening. So after installing it you need to configure a different name.
see [the configuration for renaming a plugin](https://github.com/ssbc/ssb-plugins#load-user-configured-plugins).
This is not necessary if you are loading ssb-links directly in javascript code (as in the examples below).

to install `ssb-server plugins.install ssb-links` then to configure
`{"plugins":{"ssb-links": "links2"}}``` to your `~/.ssb/config`.

## database

A leveldb instance will be created in your ssb directory `~/.ssb/flume/links`.
Because of the size of a message id, this will be quite a large index.

## api: links2.read ({query: QUERY, live, reverse, limit})

If there is no query provided, a full scan of the links database
will be performed. this will return a stream of data that looks like

``` js
{
  source: @{author_of_link},
  rel: [{rel}, {rel_data}...],
  dest: @/%/&{link} //the dest can be any type of ssb object.
  ts: {local_timestamp}
}
```

this format will be the input to the query.

### relation data.

this module introduces the concept of "rel data",
the rel is now stored as an array, and the data associated
with the rel stored with it. by indexing it as an array,
it becomes easy to query it when that data is a sortable range
(for example, mention names, which may be alphabetically sorted)

see `./links.js` to see how data is mapped.

TODO: map all markdown links, including http links.

### query syntax

the query must be a valid [map-filter-reduce](https://github.com/dominictarr/map-filter-reduce)

## example queries

these queries are in JSON format so you can use them via the cli,
`ssb-server links2.read --query '{QUERY}'`
be sure to use single quotes around the query so that the json is property
escaped. otherwise, run these queries by passing them to `sbot.links2.read({query: QUERY})`
and taking the output as a [pull-stream](https://github.com/pull-stream/pull-stream).

### all feeds mentioned

counts the number of times each name is used by which feed.

returns a stream all  `{name, feed, uses}` 
``` js
[
  {"$filter": {
    "rel": ["mentions", {"$prefix": "@"}]
  }},

  {"$reduce":{
    "name": ["rel", 1], "feed": "dest", "uses": {"$count": true}
  }}
]
```

### thread contributors

returns feeds in each thread, and how many posts they have made.
return object in form of `{[thread_id]:{[poster]:count}}`
``` js
[
  {"$filter": {
    "rel": ["root"]
  }},
  {"$reduce":{
    "thread": "dest", "participant": "source", "posts": {"$count": true}
  }}
]
```

### names used for "@EMovhfIr...=.ed25519" and who mentioned them.

``` js
[
  {"$filter": {
    "rel": ["mentions", {"$prefix": "@"}],
    "dest": "@EMovhfIrFk4NihAKnRNhrfRaqIhBv1Wj8pTxJNgvCCY=.ed25519"
  }},
  {"$reduce": {
    "name": ["rel", 1], "by": "source", "uses": {"$count": true}
  }}
]
```

## License

MIT

