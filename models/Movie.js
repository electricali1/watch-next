const mongoose = require('mongoose');

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
  genres: [{ 
    type: String 
  }],
  runtime: { 
    type: Number 
  },
  ageRating: { 
    type: String 
  },
  posterPath: { 
    type: String 
  },
  directorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Director' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);