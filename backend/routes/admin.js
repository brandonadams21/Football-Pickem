const express = require('express');
const Game = require('../models/Game');
const SelectedGames = require('../models/SelectedGames');
const router = express.Router();

// Admin route to select games for pick'em
router.post('/select-games', async (req, res) => {
    const { selectedGames, week, league } = req.body;
    console.log('Request Body:', req.body.selectedGames[0]);  // Log the entire request body
    
    try {
      // Remove existing selected games for the same week and league (if any)
      await SelectedGames.findOneAndDelete({ week, league });
  
      // Insert the new selected games for the current week and league
      const newSelectedGames = new SelectedGames({
        week,      // Week number (e.g., 5 for NFL or 6 for CFB)
        league,    // League (NFL or NCAAF)
        selectedGames, // Array of selected game IDs
      });
  
      console.log('New Selected Games:', selectedGames);  // Log the new selected games object
  
      await newSelectedGames.save();
  
      res.status(200).json({ message: `Games successfully updated for ${league} Week ${week}`, selectedGames });
    } catch (err) {
      res.status(500).json({ message: 'Failed to update games', error: err.message });
    }
  });

  router.post('/store-games', async (req, res) => {
    const { games, week, league } = req.body;
  
    try {
      // Iterate through the games and store them in your database
      for (let game of games) {
        const { homeTeam, awayTeam, spread, gameId } = game;
  
        // Use upsert (update if exists, insert if not)
        await Game.findOneAndUpdate(
          { gameId },
          { week, league, homeTeam, awayTeam, spread },
          { upsert: true }
        );
      }
  
      res.status(200).json({ message: 'Games stored successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error storing games', error: err.message });
    }
  });

  router.get('/getSelectedGames', async (req, res) => {
    const { week } = req.query;
    console.log('Week:', week);
    try {
      const selectedGames = await Game.find({ week });
      res.status(200).json({ selectedGames });
    } catch (error) {
      console.error('Error fetching selected games:', error);
      res.status(500).json({ message: 'Failed to fetch selected games' });
    }
  });
  

// Admin route to manually add a game
router.post('/add-game', async (req, res) => {
  const { homeTeam, awayTeam, spread, date, league } = req.body;
  console.log(req.body);

  try {
    // Create a new game entry
    const newGame = new Game({
      homeTeam,
      awayTeam,
      spread,
      date,
      league,
    });

    await newGame.save();
    res.status(201).json({ message: 'Game added successfully', game: newGame });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add game', error: err.message });
  }
});

module.exports = router;
