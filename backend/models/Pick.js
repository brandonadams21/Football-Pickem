const mongoose = require('mongoose');

const pickSchema = new mongoose.Schema({
  name: { type: String, required: true }, // User's name
  homeTeam: { type: String, required: true }, // Home team name
  awayTeam: { type: String, required: true }, // Away team name
  pick: { type: String, required: true }, // Team the user picked
  spread: { type: String, required: true }, // Spread for the game
  week: { type: Number, required: true }, // Store the week number
  league: { type: String, required: true }, // NFL or CFB
  createdAt: { type: Date, default: Date.now }, // When the pick was made
  correctPick: { type: Boolean, default: null },
  gameId: { type: String, required: true }, // ESPN game ID
});

const Pick = mongoose.model('Pick', pickSchema);

module.exports = Pick;
