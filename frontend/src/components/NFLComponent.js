import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Button, message, Card, Row, Col } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { LoggedInContext } from '../context/LoggedInContext';
import './GameList.css';

const NFLComponent = () => {
  const [selectedGames, setSelectedGames] = useState([]);
  const [picks, setPicks] = useState({});
  const [week, setWeek] = useState(null);
  const [weeksData, setWeeksData] = useState([]);
  const [firstSundayGameTime, setFirstSundayGameTime] = useState(null);
  const [canEditPicks, setCanEditPicks] = useState(true);

  const { loggedIn, username } = useContext(LoggedInContext);
  const navigate = useNavigate();

  // Define weeks and their respective date ranges
  const weeks = [
    { week: 1, start: '2024-09-05', end: '2024-09-10' },
    { week: 2, start: '2024-09-11', end: '2024-09-17' },
    { week: 3, start: '2024-09-18', end: '2024-09-24' },
    { week: 4, start: '2024-09-25', end: '2024-10-01' },
    { week: 5, start: '2024-10-02', end: '2024-10-08' },
    { week: 6, start: '2024-10-09', end: '2024-10-15' },
    { week: 7, start: '2024-10-16', end: '2024-10-22' },
    { week: 8, start: '2024-10-23', end: '2024-10-29' },
    { week: 9, start: '2024-10-30', end: '2024-11-05' },
    { week: 10, start: '2024-11-06', end: '2024-11-12' },
    { week: 11, start: '2024-11-13', end: '2024-11-19' },
    { week: 12, start: '2024-11-20', end: '2024-11-26' },
    { week: 13, start: '2024-11-27', end: '2024-12-03' },
    { week: 14, start: '2024-12-04', end: '2024-12-10' },
    { week: 15, start: '2024-12-11', end: '2024-12-17' },
    { week: 16, start: '2024-12-18', end: '2024-12-24' },
    { week: 17, start: '2024-12-25', end: '2024-12-31' },
    { week: 18, start: '2025-01-01', end: '2025-01-07' },
  ];

  // Function to determine the current week based on today's date
  const getCurrentWeek = () => {
    const today = new Date();
    const currentWeek = weeks.find(({ start, end }) => {
      const startDate = new Date(start);
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999); // Include the entire end day

      // Compare dates without time components
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

      return todayDate >= startDateOnly && todayDate <= endDateOnly;
    });
    return currentWeek ? currentWeek.week : null;
  };

  // On component mount, set the current week based on the date
  useEffect(() => {
    const currentWeek = getCurrentWeek();
    if (currentWeek) {
      setWeek(currentWeek);
    } else {
      setWeek(1); // Default to Week 1 if no current week is found
    }
    setWeeksData(weeks);
  }, []);

  // Fetch games and scores for the selected week
  useEffect(() => {
    if (!week) return;
    const fetchGamesAndScores = async () => {
      try {
        const selectedGamesResponse = await axios.get(
          `http://localhost:5000/api/admin/getSelectedGames?week=${week}&league=NFL`
        );

        const selectedGames = selectedGamesResponse.data.selectedGames.filter(
          game => game.league === 'NFL'
        );

        const scoresResponse = await axios.get(`http://localhost:5000/api/nfl?week=${week}`);
        const scores = scoresResponse.data;

        // Combine the games with their respective scores
        const combinedData = selectedGames.map((game) => {
          const scoreData = scores.find(
            (score) => score.homeTeam === game.homeTeam && score.awayTeam === game.awayTeam
          );
          return { ...game, ...scoreData };
        });

        setSelectedGames(combinedData);
      } catch (error) {
        console.error('Error fetching games and scores:', error);
        message.error('Error fetching games and scores');
      }
    };

    fetchGamesAndScores();
  }, [week]);

  // Fetch user's existing picks
  useEffect(() => {
    if (!username || !week || selectedGames.length === 0) return;

    const fetchUserPicks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/picks/getPicks', {
          params: {
            week,
            league: 'NFL',
            username,
          },
        });
        const userPicks = response.data;

        // Map the picks to the picks state
        const picksMap = {};
        userPicks.forEach((pick) => {
          const game = selectedGames.find(
            (g) => g.homeTeam === pick.homeTeam && g.awayTeam === pick.awayTeam
          );
          if (game) {
            picksMap[game._id] = pick.pick;
          }
        });
        setPicks(picksMap);
      } catch (error) {
        console.error('Error fetching user picks:', error);
        message.error('Error fetching your picks');
      }
    };

    fetchUserPicks();
  }, [username, week, selectedGames]);

  // Determine if picks can be edited
  useEffect(() => {
    if (selectedGames.length === 0) return;

    // Find the earliest game on Sunday
    const sundayGames = selectedGames.filter((game) => {
      const gameDate = new Date(game.gameTime);
      return gameDate.getDay() === 0; // Sunday is 0
    });

    if (sundayGames.length > 0) {
      const earliestSundayGame = sundayGames.reduce((earliest, game) => {
        const gameDate = new Date(game.gameTime);
        return !earliest || gameDate < earliest ? gameDate : earliest;
      }, null);

      setFirstSundayGameTime(earliestSundayGame);
    } else {
      setFirstSundayGameTime(null);
    }
  }, [selectedGames]);

  useEffect(() => {
    if (firstSundayGameTime) {
      const now = new Date();
      setCanEditPicks(now < firstSundayGameTime);
    } else {
      setCanEditPicks(true); // Allow editing if no Sunday games
    }
  }, [firstSundayGameTime]);

  // Calculate winner logic
  const calculateWinner = (homeTeam, awayTeam, homeScore, awayScore, spread) => {
    const parsedSpread = parseFloat(spread.split(" ")[1]) || 0;
    const adjustedHomeScore = homeScore + (parsedSpread > 0 ? 0 : Math.abs(parsedSpread));
    const adjustedAwayScore = awayScore + (parsedSpread > 0 ? parsedSpread : 0);

    if (adjustedHomeScore > adjustedAwayScore) {
      return homeTeam;
    } else if (adjustedAwayScore > adjustedHomeScore) {
      return awayTeam;
    } else {
      return 'Tie';
    }
  };

  const handlePickChange = (gameId, team) => {
    if (!canEditPicks) {
      message.warning('You cannot edit picks after the first game on Sunday has started');
      return;
    }
    setPicks({ ...picks, [gameId]: team });
  };

  const handleSubmitPicks = async () => {
    if (!username) {
      message.error('Please login to submit your picks');
      return;
    }

    try {
      const formattedPicks = Object.keys(picks).map((gameId) => {
        const game = selectedGames.find((g) => g._id === gameId);
        return {
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          selectedTeam: picks[gameId],
          spread: game.spread,
          gameId: game.gameId,
        };
      });

      await axios.post('http://localhost:5000/api/picks/addPicks', {
        username,
        picks: formattedPicks,
        week,
        league: 'NFL',
      });

      message.success('Picks submitted successfully');
    } catch (error) {
      console.log(username, picks, week);
      console.error('Error submitting picks:', error);
      message.error('Error submitting picks');
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: '/nfl' } });
  };

  return (
    <div className="game-list-container">
      <h1 style={{ color: 'white' }}>NFL Pick'em Games & Scores</h1>

      {!loggedIn ? (
        <Button type="primary" onClick={handleLoginRedirect} style={{ marginBottom: 20 }}>
          Please login to make your picks
        </Button>
      ) : (
        <Button
          type="primary"
          onClick={handleSubmitPicks}
          style={{ marginBottom: 20 }}
          disabled={!canEditPicks}
        >
          {canEditPicks ? 'Submit Picks' : 'Picks Locked'}
        </Button>
      )}

      {/* Week Selector */}
      <div className="week-selector">
        {weeksData.map(({ week: w, start, end }) => (
          <Button
            key={w}
            className={`week-button ${week === w ? 'selected' : ''}`}
            onClick={() => setWeek(w)}
            style={{ margin: '0 5px' }}
          >
            <div>Week {w}</div>
            <div>{start} - {end}</div>
          </Button>
        ))}
      </div>

      {selectedGames.length > 0 ? (
        <Row gutter={[16, 16]}>
          {selectedGames.map((game) => {
            const winner = calculateWinner(game.homeTeam, game.awayTeam, game.homeScore || 0, game.awayScore || 0, game.spread || "0");
            const isFinal = game.gameStatus === 'Final' || game.gameStatus === 'Final/OT';

            return (
              <Col xs={24} key={game._id}>
                <Card className={`game-card ${isFinal ? 'blur' : ''}`} bordered={false}>
                  <div className="game-card-content">
                    <div
                      className={`team-box ${!canEditPicks || isFinal ? 'disabled' : ''} ${picks[game._id] === game.homeTeam ? 'selected' : ''}`}
                      onClick={() => loggedIn && !isFinal && canEditPicks && handlePickChange(game._id, game.homeTeam)}
                      style={{ cursor: !canEditPicks || isFinal ? 'not-allowed' : 'pointer' }}
                    >
                      <div className="team-card">
                        <img src={game.homeLogo} alt={game.homeTeam} className="team-logo" />
                        <p><strong>{game.homeTeam}</strong></p>
                        <p className="team-score">{game.homeScore || 'N/A'}</p>
                        {isFinal && winner === game.homeTeam && (
                          <CheckCircleOutlined style={{ color: 'green', fontSize: '24px' }} />
                        )}
                      </div>
                    </div>

                    <div className="spread-info">
                      <p><strong>{game.spread}</strong></p>
                      <p>{isFinal ? game.gameStatus : 'Scheduled'}</p>
                    </div>

                    <div
                      className={`team-box ${!canEditPicks || isFinal ? 'disabled' : ''} ${picks[game._id] === game.awayTeam ? 'selected' : ''}`}
                      onClick={() => loggedIn && !isFinal && canEditPicks && handlePickChange(game._id, game.awayTeam)}
                      style={{ cursor: !canEditPicks || isFinal ? 'not-allowed' : 'pointer' }}
                    >
                      <div className="team-card">
                        <img src={game.awayLogo} alt={game.awayTeam} className="team-logo" />
                        <p><strong>{game.awayTeam}</strong></p>
                        <p className="team-score">{game.awayScore || 'N/A'}</p>
                        {isFinal && winner === game.awayTeam && (
                          <CheckCircleOutlined style={{ color: 'green', fontSize: '24px' }} />
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <h3 style={{ color: 'white' }}>No games have been selected for this week.</h3>
      )}
    </div>
  );
};

export default NFLComponent;
