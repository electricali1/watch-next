const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
    tmdbId: {
        type: Number,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    overview: {
        type: String
    },
    posterPath: {
        type: String
    }
}, { timestamps: true })

const Movie = mongoose.model('Movie', movieSchema)

module.exports = Movie
