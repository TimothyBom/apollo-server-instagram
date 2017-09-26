import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import jwt from 'jsonwebtoken'

import typeDefs from './schema.gql'
import resolvers from './resolvers'
import models from './models'

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
})

const app = express()

mongoose.connect('mongodb://127.0.0.1/apollo', { useMongoClient: true })
mongoose.Promise = global.Promise

const PORT = process.env.PORT || 3000
const SECRET = 'apollo-server-instagram'

const authorization = async (req, res, next) => {
    const token = req.headers.authorization
    try {
        if (token) {
            const { user } = await jwt.verify(token, SECRET)
            req.user = user
        } else {
            req.user = null
        }
        next()
    } catch (err) {
        throw err
    }
}

app.use(cors('*'))
app.use(authorization)

app.use('/graphql',
    bodyParser.json(),
    graphqlExpress(req => ({
        schema,
        context: {
            models,
            SECRET,
            user: req.user
        }
    }))
)

app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql'
}))

app.listen(PORT, () => {
    console.log(`> Ready on http://127.0.0.1:${PORT}`)
})