const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const axios = require('axios'); // Import axios
require('dotenv').config();

const app = express();

// Connect to the database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/games', require('./routes/games'));
app.use('/api/picks', require('./routes/picks'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin-auth', require('./routes/adminAuth'));
app.use('/api/weeks', require('./routes/weeks'));

// ESPN API endpoints
const NFL_API = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';

// Helper function to fetch and parse scores from ESPN API
const fetchScores = async (url, params) => {
    try {
        console.log(`Fetching data from: ${url} with params: ${JSON.stringify(params)}`);
        const response = await axios.get(url, { params });
        
        // Log the entire response to inspect for pagination or missing data
        console.log('Full Response:', JSON.stringify(response.data, null, 2));
    
        const games = response.data.events.map((game) => {
            const homeTeam = game.competitions[0].competitors[0].team.displayName;
            const awayTeam = game.competitions[0].competitors[1].team.displayName;
            const homeLogo = game.competitions[0].competitors[0].team.logo;
            const awayLogo = game.competitions[0].competitors[1].team.logo;
            const homeScore = game.competitions[0].competitors[0].score;
            const awayScore = game.competitions[0].competitors[1].score;
            const gameStatus = game.competitions[0].status.type.detail;
            const odds = game.competitions[0].odds ? game.competitions[0].odds[0].details : 'N/A';
    
            return {
                homeTeam,
                awayTeam,
                homeLogo,
                awayLogo,
                homeScore,
                awayScore,
                gameStatus,
                odds,
            };
        });
    
        return games;
    } catch (error) {
        console.error('Error fetching scores:', error.message);
        return [];
    }
};


// Route for NFL scores
// Route for NFL scores (with optional week parameter)
app.get('/api/nfl', async (req, res) => {
    const week = req.query.week || ''; // If no week is provided, default to current
    console.log(`Fetching NFL scores for week ${week}`);
    const params = { week }; // Add the week parameter to the request
    const nflScores = await fetchScores(NFL_API, params);
    res.json(nflScores);
});

// Route for College Football scores (with optional week parameter)
app.get('/api/college', async (req, res) => {
    const week = req.query.week || ''; // Default to current week
    const limit = req.query.limit || '100'; // Default limit
    const groups = req.query.groups || '80'; // Default group
    const CFB_API = 'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard';

    // Parameters for the ESPN API, including the week
    const params = {
        week,
        limit,
        groups,
    };

    console.log(`Fetching College Football scores for week ${week}`);
    const collegeScores = await fetchScores(CFB_API, params);
    res.json(collegeScores);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
