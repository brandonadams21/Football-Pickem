const express = require('express');
const Pick = require('../models/Pick'); // Import the Pick model
const router = express.Router();

// Route to get available weeks (unique week timestamps)
router.get('/weeks', async (req, res) => {
  try {
    // Fetch distinct week timestamps from the picks
    const weeks = await Pick.distinct('weekTimestamp');
    
    // Sort the weeks by date
    const sortedWeeks = weeks.sort((a, b) => new Date(a) - new Date(b));

    res.json(sortedWeeks);
  } catch (error) {
    console.error('Error fetching weeks:', error);
    res.status(500).json({ message: 'Error fetching weeks' });
  }
});

module.exports = router;
