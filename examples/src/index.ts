import { GraphQLServer } from 'graphql-yoga'

import { schema } from './schema'
import { hookedPrisma } from './hooks'
const server = new GraphQLServer({
  schema,
  context: { prisma: hookedPrisma },
})

server.start(() => console.log(`🚀 Server ready at http://localhost:4000`))
