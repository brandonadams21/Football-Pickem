const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  week: {
    type: Number,
    required: true,
  },
  league: {
    type: String,
    enum: ['NFL', 'NCAAF'],
    required: true,
  },
  homeTeam: {
    type: String,
    required: true,
  },
  awayTeam: {
    type: String,
    required: true,
  },
  spread: {
    type: String, // Spread as a string to allow values like +5.5, -3
    required: true,
  },
  gameId: {
    type: String,
    unique: true,
    required: true, // Store the ESPN game ID for consistency
  },
}, { timestamps: true });

module.exports = mongoose.model('Game', GameSchema);
