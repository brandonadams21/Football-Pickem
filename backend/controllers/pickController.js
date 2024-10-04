const Pick = require('../models/Pick');
const SelectedGames = require('../models/SelectedGames');
const { fetchGameScores } = require('../helpers/espnApiHelper');

// Controller to handle adding picks
const addPick = async (req, res) => {
  const { name, picks, week, league } = req.body;
  console.log(req.body);
  try {
    // Iterate over the picks array and create new Pick entries
    const pickPromises = picks.map(async (pick) => {
      return Pick.create({
        name,
        homeTeam: pick.homeTeam,
        awayTeam: pick.awayTeam,
        pick: pick.selectedTeam, // The team the user picked
        spread: pick.spread, // Spread of the game
        week,
        league,
        gameId: pick.gameId,
      });
    });

    // Wait for all picks to be saved
    await Promise.all(pickPromises);

    res.status(201).json({ message: 'Picks added successfully' });
  } catch (error) {
    console.error('Error adding picks:', error);
    res.status(500).json({ message: 'Failed to add picks', error: error.message });
  }
};

// Controller to handle fetching picks by week
const getPicks = async (req, res) => {
  const { week, league } = req.query;
  try {
    const picks = await Pick.find({ week: Number(week), league });
    res.status(200).json(picks);
  } catch (error) {
    console.error('Error fetching picks:', error);
    res.status(500).json({ message: 'Error fetching picks', error: error.message });
  }
};

// Controller to handle fetching all picks
const getAllPicks = async (req, res) => {
  console.log('Get all picks');
  try {
    const picks = await Pick.find(); // Fetch all picks
    res.status(200).json(picks);
  } catch (error) {
    console.error('Error fetching picks:', error);
    res.status(500).json({ message: 'Error fetching picks', error: error.message });
  }
};

// Controller to handle fetching selected games for a given week
const getSelectedGames = async (req, res) => {
  const { week, league } = req.query;
  try {
    const selectedGames = await SelectedGames.findOne({ week: Number(week), league }).populate('selectedGames');
    if (!selectedGames) {
      return res.status(404).json({ message: 'No selected games found for this week' });
    }
    res.status(200).json({ selectedGames: selectedGames.selectedGames });
  } catch (error) {
    console.error('Error fetching selected games:', error);
    res.status(500).json({ message: 'Failed to fetch selected games', error: error.message });
  }
};

// Controller to check the results of games and update picks
const checkPicksAndUpdate = async (req, res) => {
    const { week, league } = req.body;
    console.log('Checking picks for week:', week, league);
  
    try {
      // Fetch all picks for the given week and league
      const picks = await Pick.find({ week, league });
      console.log('Picks:', picks);
  
      // Iterate through each pick, fetch the game result, and compare it with the user's pick
      for (let pick of picks) {
        console.log(`Processing pick for gameId: ${pick.gameId}`);
        if (!pick.gameId) {
          console.error(`Missing gameId for pick:`, pick);
          continue;
        }
        const gameResult = await fetchGameScores(league, pick.gameId); // Fetch game score using ESPN API
        if (gameResult && gameResult.gameStatus === 'completed') {
          const { homeTeamScore, awayTeamScore, homeTeamName, awayTeamName } = gameResult;
  
          // Calculate the spread result
          const spreadDifference = homeTeamScore - awayTeamScore;
  
          // Determine if the pick was correct
          let correctPick = false;
          if (pick.pick === homeTeamName && spreadDifference > pick.spread) {
            correctPick = true;
          } else if (pick.pick === awayTeamName && spreadDifference < -pick.spread) {
            correctPick = true;
          }
  
          // Update the pick to indicate whether it was correct
          pick.correctPick = correctPick;
          await pick.save(); // Save the updated pick
        }
      }
  
      res.status(200).json({ message: 'Picks updated successfully' });
    } catch (error) {
      console.error('Error checking and updating picks:', error);
      res.status(500).json({ message: 'Failed to update picks', error: error.message });
    }
  };
  

module.exports = {
  addPick,
  getPicks,
  getAllPicks,
  getSelectedGames,
  checkPicksAndUpdate,
};
