const axios = require('axios');
const Pick = require('../models/Pick');

// Helper function to fetch scores from ESPN API
const fetchGameScores = async (league, gameId) => {
    console.log(`Fetching game scores for ${league} game ID: ${gameId}`);
    try {
        // Fetch the game data from ESPN API
        const response = await axios.get(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${gameId}`);
        
        const gameData = response.data;
        // console.log(gameData.boxscore);
    
        // Extract relevant information
        const homeTeam = gameData.boxscore.teams[0].team.displayName;
        const awayTeam = gameData.boxscore.teams[1].team.displayName;
        const homeScore = parseInt(gameData.boxscore.teams[0].score);
        const awayScore = parseInt(gameData.boxscore.teams[1].score);
        const spread = parseFloat(gameData.odds[0]?.bettingOdds?.spread || 0); // fallback if no odds available
        console.log(`Game: ${homeTeam} vs ${awayTeam}, Home Score: ${homeScore}, Away Score: ${awayScore}, Spread: ${spread}`);
    
        // Determine if the home or away team covered the spread
        const homeCoversSpread = (homeScore + spread) > awayScore;
        const awayCoversSpread = (awayScore + spread) > homeScore;
    
        // Find all user picks for this game
        const userPicks = await Pick.find({ gameId });

        // Store updated picks to return to client later
        const updatedPicks = [];

        userPicks.forEach(async (pick) => {
          let correctPick = false;
    
          // Check if the user's pick was correct based on the spread result
          if ((pick.pick === homeTeam && homeCoversSpread) || (pick.pick === awayTeam && awayCoversSpread)) {
            correctPick = true;
          }

          // Log each user's pick correctness
          console.log(`User ${pick.name} picked ${pick.pick} - Correct: ${correctPick}`);

          // Update the user's pick with the result
          pick.correctPick = correctPick;
          await pick.save();

          // Add to the array to return the updated data
          updatedPicks.push({
            name: pick.name,
            homeTeam: pick.homeTeam,
            awayTeam: pick.awayTeam,
            pick: pick.pick,
            correctPick: pick.correctPick,
            spread: spread
          });
        });

        // Return updated picks back
        return updatedPicks;

      } catch (error) {
        console.error(`Error checking game result for game ID ${gameId}:`, error);
        throw new Error(`Failed to fetch and update scores for game ID ${gameId}`);
      }
};

module.exports = { fetchGameScores };
