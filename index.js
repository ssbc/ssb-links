var pull = require('pull-stream')
var FlumeQueryLinks = require('flumeview-query/links')
var path = require('path')

var extractLinks = require('./links')

function isString (s) {
  return 'string' === typeof s
}

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
  read: 'source'
}

exports.init = function (ssb, config) {
  var s = ssb._flumeUse('links2', FlumeQueryLinks(indexes, extractLinks, 1))
  var read = s.read
  s.read = function (opts) {
    if(!opts) opts = {}
    //accept json, makes it easier to query from cli.
    if(isString(opts))
      opts = {query: JSON.parse(opts)}
    else if(isString(opts.query))
      opts.query = JSON.parse(opts.query)
    return read(opts)
  }
  return s
}










