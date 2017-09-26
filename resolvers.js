import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { isEmpty, pick } from 'lodash'

export default {
    Query: {
        allUsers: (_, args, { models }) => models.User.find(),
        allPosts: (_, args, { models }) => models.Post.find().sort({ createdAt: '-1' })
    },
    Mutation: {
        signup: async (_, args, { models }) => {
            const user = args
            user.password = await bcrypt.hash(args.password, 12)
            return models.User(user).save()
        },
        login: async (_, { username, password }, { models, SECRET }) => {
            const user = await models.User.findOne({ username: username })

            if (!user) {
                throw new Error('User not found.')
            }
            
            if (!isEmpty(user)) {
                const isMatch = await bcrypt.compare(password, user.password)

                if (!isMatch) {
                    throw new Error('Password was incorrect.')
                }

                const token = jwt.sign({
                    user: pick(user, ['_id', 'username'])
                }, SECRET)

                return token
            }
        },
        createPost: (_, args, { models, user }) => {
            const post = {
                caption: args.caption,
                publicId: args.publicId,
                imageUrl: args.imageUrl,
                userId: user._id
            }
            return models.Post(post).save()
        }
    },
    User: {
        posts: ({ _id }, args, { models }) => {
            return models.Post.find({ userId: _id })
        }
    },
    Post: {
        owner: ({ userId }, args, { models }) => {
            return models.User.findOne({ _id: userId })
        }
    }
}