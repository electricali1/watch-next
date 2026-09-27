const mongoose = require('mongoose');

// Subdocument schema matching List.movies in your ERD
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
    poster: { 
    type: String,
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
}); //

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
}, { timestamps: true });

module.exports = mongoose.model('List', listSchema);