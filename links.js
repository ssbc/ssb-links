var msgs = require('ssb-msgs')

function noObjects(value) {
  if (Array.isArray(value)) return value.map(noObjects)
  if (typeof value === 'object' && value !== null) return JSON.stringify(value)
  return value
}

module.exports = function (data, iter) {
  if(data.sync) return
  var content = data.value.content
  var source = data.value.author

  //TODO parse the links from markdown
  //and index those also. most of these are http links,
  //some ipfs.

  //it would be easy to tag another message,
  //and query that, once markdown links are ready
  //[#hashtag](msgId) would tag msg with #hashtag

  //TODO: what about a syntax for self-links?
  //interpret a lone hashtag in a message as a selflink,
  //and then that will work.

  msgs.indexLinks(data.value, function (ln, rel) {
    var dest = ln.link

    //take all the already existing links and put
    //the relevant aspects into the index,
    //as part of the rel, so that we don't need to lookup
    //the message to get them, and even better,
    //we can query by these attributes! enabling search.

    if(rel == 'vote')
      rel = ['vote', ln.value]
    else if(rel == 'flag')
      rel = ['flag', ln.reason]
    else if(rel == 'mentions') {
      if(ln.link[0] === '@')
        rel = ['mentions', '@'+(ln.name||'').toLowerCase()]
      else  if(ln.link[0] == '&') {
        rel = ['mentions', ln.filename || ln.name, ln.size]
      }
      else {
        //TODO: check whether they included some text in the markdown link.
        rel = ['mentions']
      }
    }
    else if(rel == 'about' && typeof content.name === 'string') {
      rel = ['about', content.name]
    }
    else if(rel == 'image')
      rel = ['image', ln.type, ln.size]
    else if(rel == 'contact')
      rel = ['contact', content.following, content.blocking]
    else
      rel = [rel]

    iter({
      source: source, dest: dest,
      rel: rel.map(noObjects),
      ts: data.timestamp
    })
  })
}





