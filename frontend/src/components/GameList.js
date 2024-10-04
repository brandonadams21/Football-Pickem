import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Modal, Input, message, Select, Space, Card, Row, Col } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import './GameList.css'; // We'll use this for additional custom styling

const { Option } = Select;

const GameList = () => {
  const [selectedGames, setSelectedGames] = useState([]);
  const [picks, setPicks] = useState({});
  const [name, setName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [week, setWeek] = useState(5); // Default week for NFL
  const [activeTab, setActiveTab] = useState("NFL"); // Default active tab (NFL)
  const [weeks, setWeeks] = useState([]); // To handle multiple weeks
  const [loadingScores, setLoadingScores] = useState(false);

  const defaultNFLWeek = 5;
  const defaultCFBWeek = 6;

  useEffect(() => {
    const fetchWeeks = () => {
      const weekRange = activeTab === "NFL" ? [...Array(18).keys()].map(i => i + defaultNFLWeek) : [...Array(15).keys()].map(i => i + defaultCFBWeek);
      setWeeks(weekRange);
      setWeek(activeTab === "NFL" ? defaultNFLWeek : defaultCFBWeek);
    };
    fetchWeeks();
  }, [activeTab]);

  useEffect(() => {
    const fetchGamesAndScores = async () => {
      try {
        // Fetch selected games
        const selectedGamesResponse = await axios.get(`http://localhost:5000/api/admin/getSelectedGames?week=${week}&league=${activeTab}`);
        const selectedGames = selectedGamesResponse.data.selectedGames;
  
        // Fetch scores
        const scoresResponse = await axios.get(`http://localhost:5000/api/${activeTab === 'NFL' ? 'nfl' : 'college'}`);
        const scores = scoresResponse.data;
  
        // Combine selected games and scores based on homeTeam and awayTeam
        const combinedData = selectedGames.map((game) => {
          const scoreData = scores.find(score => 
            score.homeTeam === game.homeTeam && score.awayTeam === game.awayTeam
          );
  
          // If score data exists, merge it into the game object
          return { ...game, ...scoreData };
        });
  
        // Sort games: Completed games first, then scheduled games ordered by gameStatusDate
        const sortedData = combinedData.sort((a, b) => {
          // Handle completed games first
          if ((a.gameStatus === 'Final' || a.gameStatus === 'Final/OT') &&
              (b.gameStatus === 'Final' || b.gameStatus === 'Final/OT')) {
            return 0; // If both are completed, leave them as is
          }
  
          // Completed games come before non-completed games
          if (a.gameStatus === 'Final' || a.gameStatus === 'Final/OT') {
            return -1;
          }
          if (b.gameStatus === 'Final' || b.gameStatus === 'Final/OT') {
            return 1;
          }
          
          // Both are scheduled games, sort by gameStatusDate
          const aDate = a.gameStatus;
          const bDate = b.gameStatus;
          console.log('aDate:', aDate, 'bDate:', bDate);
  
          // If gameStatusDate is invalid, treat it as an ongoing game
          if (isNaN(aDate)) return 1;
          if (isNaN(bDate)) return -1;
          
          return aDate - bDate;
        });
  
        setSelectedGames(sortedData);
      } catch (error) {
        console.error('Error fetching games and scores:', error);
        message.error('Error fetching games and scores');
      }
    };
  
    fetchGamesAndScores();
  }, [week, activeTab]);  
  

  // Function to calculate winning spread
  const calculateWinner = (homeTeam, awayTeam, homeScore, awayScore, spread) => {
    const parsedSpread = parseFloat(spread.split(" ")[1]);

    // Adjust the scores based on the spread
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

  // Handle team selection by clicking the card
  const handlePickChange = (gameId, team) => {
    setPicks({ ...picks, [gameId]: team });
  };

  // Handle form submission (sending picks to backend)
  const handleSubmitPicks = async () => {
    if (!name) {
      message.error('Please enter your name before submitting picks');
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
        name,
        picks: formattedPicks,
        week,
        league: activeTab,
        gameId: selectedGames.map((game) => game.gameId)
      });

      message.success('Picks submitted successfully');
      setIsModalVisible(false); // Close modal after submission
    } catch (error) {
      console.error('Error submitting picks:', error);
      message.error('Error submitting picks');
    }
  };

  return (
    <div className="game-list-container">
      <h1 style={{color: 'white'}}>Pick'em Games & Scores</h1>

      {/* Button group to toggle between NFL and College Football */}
      <Space style={{ marginBottom: 20 }}>
        <Button
          type={activeTab === "NFL" ? "primary" : "default"}
          onClick={() => setActiveTab("NFL")}
        >
          NFL
        </Button>
        <Button
          type={activeTab === "CFB" ? "primary" : "default"}
          onClick={() => setActiveTab("CFB")}
        >
          College Football
        </Button>
      </Space>

      {/* Dropdown to select week */}
      <Select
        value={week}
        onChange={setWeek}
        style={{ width: 200, marginBottom: 20 }}
      >
        {weeks.map((week) => (
          <Option key={week} value={week}>
            {`Week ${week}`}
          </Option>
        ))}
      </Select>

      {/* Display games in stacked card layout */}
      <Row gutter={[16, 16]} className="game-cards-container">
        {selectedGames.map((game) => {
          const winner = calculateWinner(game.homeTeam, game.awayTeam, game.homeScore, game.awayScore, game.spread);

          // Check if the game status is Final or Final/OT to blur and disable
          const isFinal = game.gameStatus === 'Final' || game.gameStatus === 'Final/OT';

          return (
            <Col xs={24} key={game._id} className="game-card-col">
              <Card className={`game-card ${isFinal ? 'blur' : ''}`} bordered={false}>
                <div className="game-card-content">
                  {/* Team Card - Home */}
                  <div
                    className={`team-box ${isFinal ? 'disabled' : ''} ${picks[game._id] === game.homeTeam ? 'selected' : ''}`}
                    onClick={() => !isFinal && handlePickChange(game._id, game.homeTeam)}
                    style={{ cursor: isFinal ? 'not-allowed' : 'pointer' }}
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

                  {/* Spread Info */}
                  <div className="spread-info">
                    <p><strong>{game.spread}</strong></p>
                    <p>{game.gameStatus === 'Final/OT' ? 'Final/OT' : game.gameStatus || 'Scheduled'}</p>
                  </div>

                  {/* Team Card - Away */}
                  <div
                    className={`team-box ${isFinal ? 'disabled' : ''} ${picks[game._id] === game.awayTeam ? 'selected' : ''}`}
                    onClick={() => !isFinal && handlePickChange(game._id, game.awayTeam)}
                    style={{ cursor: isFinal ? 'not-allowed' : 'pointer' }}
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

      {/* Button to open modal for submitting picks */}
      <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ marginTop: 20 }}>
        Submit Picks
      </Button>

      {/* Modal for entering name and submitting picks */}
      <Modal
        title="Enter Your Name"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmitPicks}
        okText="Submit Picks"
        cancelText="Cancel"
      >
        <Input
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginBottom: '20px' }}
        />
      </Modal>
    </div>
  );
};

export default GameList;
