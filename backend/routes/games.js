const express = require('express');
const Game = require('../models/Game');
const router = express.Router();
const { addGame } = require('../controllers/gameController');

// Get all games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/weeks', async (req, res) => {
  try {
    // Assuming you have a `Game` model that includes a `week` field
    const weeks = await Game.distinct('week'); // Get distinct weeks from games
    res.status(200).json(weeks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch weeks', error: error.message });
  }
});


router.post('/', addGame);

module.exports = router;


