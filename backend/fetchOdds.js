const axios = require('axios');
const mongoose = require('mongoose');
const Game = require('./models/Game');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

connectDB();

// API details
const API_KEY = 'be7e342bc4c432c22d508bef8a782a63';
const ODDS_API_URL = 'https://api.the-odds-api.com/v4/sports';

// Get current week's start and end date in proper ISO format without milliseconds
const getWeekDates = () => {
  const now = new Date();

  // Get the start of the current week (Monday)
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
  startOfWeek.setUTCHours(0, 0, 0, 0);

  // Get the end of the current week (Sunday)
  const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 7));
  endOfWeek.setUTCHours(23, 59, 59, 999);

  // Remove milliseconds to conform to the expected format
  const formatDate = (date) => date.toISOString().split('.')[0] + 'Z';

  return {
    startOfWeek: formatDate(startOfWeek),
    endOfWeek: formatDate(endOfWeek),
  };
};

const { startOfWeek, endOfWeek } = getWeekDates();

console.log('Fetching games between:', startOfWeek, 'and', endOfWeek);

// Fetch odds data for NFL and College Football
const fetchOddsData = async () => {
  try {
    // Fetch NFL odds
    const nflResponse = await axios.get(`${ODDS_API_URL}/americanfootball_nfl/odds`, {
      params: {
        apiKey: API_KEY,
        regions: 'us',
        markets: 'spreads',
        oddsFormat: 'decimal',
        commenceTimeFrom: startOfWeek, // Filter by start of the current week
        commenceTimeTo: endOfWeek, // Filter by end of the current week
      },
    });

    // Fetch College Football odds
    const collegeResponse = await axios.get(`${ODDS_API_URL}/americanfootball_ncaaf/odds`, {
      params: {
        apiKey: API_KEY,
        regions: 'us',
        markets: 'spreads',
        oddsFormat: 'decimal',
        commenceTimeFrom: startOfWeek,
        commenceTimeTo: endOfWeek,
      },
    });

    const nflData = nflResponse.data;
    const collegeData = collegeResponse.data;

    console.log('NFL Data:', nflData.length, 'games fetched');
    console.log('College Data:', collegeData.length, 'games fetched');

    // Combine the data and save it to MongoDB
    const combinedData = [...nflData, ...collegeData];

    await saveGamesToDB(combinedData);
  } catch (error) {
    console.error('Error fetching odds data:', error.response.data);
  }
};

// Function to transform and save games to MongoDB
const saveGamesToDB = async (games) => {
  try {
    for (const game of games) {
      // Check if the game already exists in the database
      const existingGame = await Game.findOne({ id: game.id });

      if (!existingGame) {
        // Create a new game entry
        const newGame = new Game({
          homeTeam: game.home_team,
          awayTeam: game.away_team,
          spread: game.bookmakers[0]?.markets[0]?.outcomes[0]?.point || 0,
          date: game.commence_time,
          league: game.sport_key.includes('nfl') ? 'NFL' : 'NCAAF',
        });

        await newGame.save();
        console.log(`Game ${newGame.homeTeam} vs ${newGame.awayTeam} saved.`);
      }
    }
    console.log('Games have been saved to the database.');
  } catch (error) {
    console.error('Error saving games to the database:', error);
  }
};

// Run the script
fetchOddsData();
