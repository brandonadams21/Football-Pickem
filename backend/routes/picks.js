const express = require('express');
const { addPick, getPicks, getAllPicks, getSelectedGames, checkPicksAndUpdate } = require('../controllers/pickController'); // Import controller functions
const router = express.Router();

// Route to handle adding new picks for a given week
router.post('/addPicks', addPick);

// Route to handle fetching picks for a given week
router.get('/getPicks', getPicks);
router.get('/picks', getAllPicks);

// Route to handle fetching selected games for a given week
router.get('/getSelectedGames', async (req, res) => {
    const { week } = req.query;
    
    try {
      const selectedGames = await SelectedGames.findOne({ week }).populate('selectedGames');
      if (!selectedGames) {
        return res.status(404).json({ message: 'No selected games found for this week' });
      }
      res.status(200).json({ selectedGames: selectedGames.selectedGames });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching selected games', error: error.message });
    }
  });

// Route to check the results of games and update picks
router.post('/check-picks', checkPicksAndUpdate);
  

module.exports = router;
