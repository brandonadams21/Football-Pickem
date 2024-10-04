const Game = require('../models/Game');

// Add new game
const addGame = async (req, res) => {
  const { homeTeam, awayTeam, spread, date, league } = req.body;

  try {
    const newGame = new Game({
      homeTeam,
      awayTeam,
      spread,
      date,
      league,
    });

    const savedGame = await newGame.save();
    res.status(201).json(savedGame);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add game', error: err.message });
  }
};

module.exports = { addGame };
