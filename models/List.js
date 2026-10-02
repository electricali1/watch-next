const mongoose = require('mongoose')

const listMovieSchema = new mongoose.Schema({
  movie_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  priority: {
    type: Number,
    default: 1
  },
  order: {
    type: Number,
    default: 1
  },
  watchDate: {
    type: Date
  },
  watchTime: {
    type: String
  },
  isWatched: {
    type: Boolean,
    default: false
  }
})

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  isMainWatchlist: {
    type: Boolean,
    default: false
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  movies: [listMovieSchema]
}, { timestamps: true })

const List = mongoose.model('List', listSchema)

module.exports = List
