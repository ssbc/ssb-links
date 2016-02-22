var pull = require('pull-stream')
var Links = require('streamview-links')
var path = require('path')

var msgs = require('ssb-msgs')

exports.name = 'links2'

var indexes = [
  { key: 'SRD', value: ['source', 'rel', 'dest', 'ts'] },
  { key: 'DRS', value: ['dest', 'rel', 'source', 'ts'] },
  { key: 'RDS', value: ['rel', 'dest', 'source', 'ts'] }
]

function extract(data, iter) {
  if(data.sync) return
  var content = data.value.content
  msgs.indexLinks(data.value, function (target, rel) {
    if(rel == 'vote')
      rel = ['vote', target.value]
    else if(rel == 'flag')
      rel = ['flag', target.reason]
    else if(rel == 'mentions') {
      if(target.link[0] === '@')
        rel = ['mentions', '@'+(target.name||'').toLowerCase()]
      else  if(target.link[0] == '&') {
        rel = ['mentions', target.filename || target.name, target.size]
      }
      else {
        console.error(target)
        rel = ['mentions']
      }
    }
    else if(rel == 'about') {
      rel = ['about', content.name]
    }
    else if(rel == 'image')
      rel = ['image', target.type, target.size]
    else if(rel == 'contact')
      rel = ['contact', content.following, content.blocking]
    else
      rel = [rel]

    iter({
      source: data.value.author,
      dest: target.link,
      rel: rel.join('!'),
      ts: data.timestamp
    })
  })
}
exports.manifest = {
  read: 'source'
}
exports.init = function (ssb, config) {

  var dir = path.join(config.path, 'links')

  var links = Links(dir, indexes, extract, 2)

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
    read: function (opts) {
      return links.read(opts)
    }
  }
}



