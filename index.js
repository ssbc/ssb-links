var pull = require('pull-stream')
var Links = require('streamview-links')
var path = require('path')

var extractLinks = require('./links')

//we could have up to six indexes for links,
//but these are the three that we really need.
//(queries are fast if the fields you already know
//are left most, and the ranges are to the right of that.

var indexes = [
  { key: 'SRD', value: ['source', 'rel', 'dest', 'ts'] },
  { key: 'DRS', value: ['dest', 'rel', 'source', 'ts'] },
  { key: 'RDS', value: ['rel', 'dest', 'source', 'ts'] }
]

exports.name = 'links2'
exports.version = require('./package.json').version
exports.manifest = {
  read: 'source',
  dump: 'source'
}
exports.init = function (ssb, config) {

  var dir = path.join(config.path, 'links')

  var version = 5
  //it's really nice to tweak a few things
  //and then change the version number,
  //restart the server and have it regenerate the indexes,
  //all consistent again.
  var links = Links(dir, indexes, extractLinks, version)

  links.init(function (err, since) {
    console.error('LOAD LINKS SINCE', err, since)
    pull(
      ssb.createLogStream({gt: since || 0, live: true, limit: -1}),
      pull.through(function (e) {
        process.stderr.write('.')
      }),
      links.write(function (err) {
        if(err) throw err
      })
    )
  })

  return {
    dump: function () {
      return links.dump()
    },
    read: function (opts) {
      if(opts && 'string' == typeof opts)
        try { opts = {query: JSON.parse(opts) } } catch (err) {
        return pull.error(err)
      }
      return links.read(opts)
    }
  }
}


