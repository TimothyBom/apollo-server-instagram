import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
    caption: {
        type: String
    },
    publicId: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    userId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export default mongoose.model('Post', postSchema)