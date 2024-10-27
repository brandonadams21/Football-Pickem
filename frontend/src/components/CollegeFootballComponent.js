import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Modal, Input, message, Select, Card, Row, Col } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import './GameList.css'; // Add your custom styles here

const { Option } = Select;

const CollegeFootballComponent = () => {
  const [selectedGames, setSelectedGames] = useState([]);
  const [picks, setPicks] = useState({});
  const [name, setName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [week, setWeek] = useState(6); // Default week for College Football
  const weeks = [...Array(15).keys()].map(i => i + 6); // College Football has 15 weeks

  useEffect(() => {
    const fetchGamesAndScores = async () => {
      try {
        const selectedGamesResponse = await axios.get(
          `http://localhost:5000/api/admin/getSelectedGames?week=${week}&league=CFB`
        );

        // Filter to ensure only CFB games are processed
        const selectedGames = selectedGamesResponse.data.selectedGames.filter(
          game => game.league === 'CFB'
        );

        const scoresResponse = await axios.get(`http://localhost:5000/api/college?week=${week}`);
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

  const calculateWinner = (homeTeam, awayTeam, homeScore, awayScore, spread) => {
    const parsedSpread = parseFloat(spread.split(" ")[1]);
    const adjustedHomeScore = homeScore + (parsedSpread > 0 ? 0 : Math.abs(parsedSpread));
    const adjustedAwayScore = awayScore + (parsedSpread > 0 ? parsedSpread : 0);

    if (adjustedHomeScore > adjustedAwayScore) return homeTeam;
    else if (adjustedAwayScore > adjustedHomeScore) return awayTeam;
    else return 'Tie';
  };

  const handlePickChange = (gameId, team) => {
    setPicks({ ...picks, [gameId]: team });
  };

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
        league: 'CFB',
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
      <h1 style={{ color: 'white' }}>College Football Pick'em Games & Scores</h1>

      <Select value={week} onChange={setWeek} style={{ width: 200, marginBottom: 20 }}>
        {weeks.map(week => (
          <Option key={week} value={week}>{`Week ${week}`}</Option>
        ))}
      </Select>

      {/* Check if there are selected games, if not show a message */}
      {selectedGames.length > 0 ? (
        <Row gutter={[16, 16]}>
          {selectedGames.map((game) => {
            const winner = calculateWinner(game.homeTeam, game.awayTeam, game.homeScore, game.awayScore, game.spread);
            const isFinal = game.gameStatus === 'Final' || game.gameStatus === 'Final/OT';

            return (
              <Col xs={24} key={game._id}>
                <Card className={`game-card ${isFinal ? 'blur' : ''}`} bordered={false}>
                  <div className="game-card-content">
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

                    <div className="spread-info">
                      <p><strong>{game.spread}</strong></p>
                      <p>{isFinal ? game.gameStatus : 'Scheduled'}</p>
                    </div>

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
      ) : (
        <h3 style={{ color: 'white' }}>No games have been selected for this week.</h3>
      )}

      <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ marginTop: 20 }}>
        Submit Picks
      </Button>

      <Modal
        title="Enter Your Name"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmitPicks}
        okText="Submit Picks"
        cancelText="Cancel"
      >
        <Input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: '20px' }} />
      </Modal>
    </div>
  );
};

export default CollegeFootballComponent;
