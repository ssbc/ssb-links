
module.exports = {
  description: 'query messages that link to other messages or feeds',
  commands: {
    read: {
      type: 'source',
      description: 'perform a query',
      args: {
        query: {
          type: 'MapFilterReduce',
          description: 'a map-filter-reduce query, see examples in ssb-links readme'
        }
      }
    }
  }
}
