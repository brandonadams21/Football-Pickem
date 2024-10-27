const Pick = require('../models/Pick');
const SelectedGames = require('../models/SelectedGames');
const { fetchGameScores } = require('../helpers/espnApiHelper');

// Controller to handle adding picks (creating or updating)
const addPick = async (req, res) => {
  const { username, picks, week, league } = req.body;
  try {
    // Fetch selected games for the week and league
    const selectedGamesData = await SelectedGames.findOne({ week: Number(week), league }).populate('selectedGames');
    if (!selectedGamesData) {
      return res.status(400).json({ message: 'No selected games found for this week and league' });
    }

    const selectedGames = selectedGamesData.selectedGames;

    // Find the earliest game on Sunday
    const sundayGames = selectedGames.filter((game) => {
      const gameDate = new Date(game.gameTime);
      return gameDate.getDay() === 0; // Sunday is 0
    });

    let earliestSundayGameTime = null;
    if (sundayGames.length > 0) {
      earliestSundayGameTime = sundayGames.reduce((earliest, game) => {
        const gameDate = new Date(game.gameTime);
        return !earliest || gameDate < earliest ? gameDate : earliest;
      }, null);
    }

    // If there is an earliest Sunday game, check if current time is before it
    if (earliestSundayGameTime && new Date() >= earliestSundayGameTime) {
      return res.status(400).json({ message: 'Picks cannot be modified after the first game on Sunday has started' });
    }

    // Proceed to create or update picks
    const pickPromises = picks.map(async (pick) => {
      const existingPick = await Pick.findOne({
        name: username,
        homeTeam: pick.homeTeam,
        awayTeam: pick.awayTeam,
        week,
        league,
      });

      if (existingPick) {
        // Update the existing pick
        existingPick.pick = pick.selectedTeam;
        existingPick.spread = pick.spread;
        await existingPick.save();
        return existingPick;
      } else {
        // Create a new pick
        return Pick.create({
          name: username,
          homeTeam: pick.homeTeam,
          awayTeam: pick.awayTeam,
          pick: pick.selectedTeam,
          spread: pick.spread,
          week,
          league,
          gameId: pick.gameId,
        });
      }
    });

    await Promise.all(pickPromises);

    res.status(201).json({ message: 'Picks added/updated successfully' });
  } catch (error) {
    console.error('Error adding/updating picks:', error);
    res.status(500).json({ message: 'Failed to add/update picks', error: error.message });
  }
};

// Controller to handle fetching picks by week and username
const getPicks = async (req, res) => {
  const { week, league, username } = req.query;
  try {
    let query = {};
    if (week) query.week = Number(week);
    if (league) query.league = league;
    if (username) query.name = username;

    const picks = await Pick.find(query);
    res.json(picks);
  } catch (error) {
    console.error('Error fetching picks:', error);
    res.status(500).send('Server Error');
  }
};

// Controller to handle fetching all picks
const getAllPicks = async (req, res) => {
  try {
    const picks = await Pick.find();
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
  try {
    // Fetch all picks for the given week and league
    const picks = await Pick.find({ week, league });

    // Iterate through each pick, fetch the game result, and compare it with the user's pick
    for (let pick of picks) {
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
        await pick.save();
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
