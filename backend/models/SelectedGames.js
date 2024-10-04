const mongoose = require('mongoose');

const selectedGamesSchema = new mongoose.Schema({
  week: {
    type: Number,
    required: true,
  },
  league: {
    type: String,
    enum: ['NFL', 'CFB'],
    required: true,
  },
  selectedGames: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game', // This should refer to the Game model
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SelectedGames', selectedGamesSchema);
