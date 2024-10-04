import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, message } from 'antd';

const Scoreboard = ({ league }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/${league}`); // API route based on the league (nfl/college)
        setScores(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching scores:', error);
        message.error('Error fetching scores');
        setLoading(false);
      }
    };

    fetchScores();
  }, [league]);

  const columns = [
    {
      title: 'Home Team',
      dataIndex: 'homeTeam',
      key: 'homeTeam',
      render: (text, record) => (
        <div>
          <img src={record.homeLogo} alt={record.homeTeam} style={{ width: '30px', marginRight: '10px' }} />
          {text}
        </div>
      ),
    },
    {
      title: 'Away Team',
      dataIndex: 'awayTeam',
      key: 'awayTeam',
      render: (text, record) => (
        <div>
          <img src={record.awayLogo} alt={record.awayTeam} style={{ width: '30px', marginRight: '10px' }} />
          {text}
        </div>
      ),
    },
    {
      title: 'Home Score',
      dataIndex: 'homeScore',
      key: 'homeScore',
    },
    {
      title: 'Away Score',
      dataIndex: 'awayScore',
      key: 'awayScore',
    },
    {
      title: 'Game Status',
      dataIndex: 'gameStatus',
      key: 'gameStatus',
    },
    {
      title: 'Odds/Spread',
      dataIndex: 'odds',
      key: 'odds',
    },
  ];

  return (
    <div>
      <h1>{league === 'nfl' ? 'NFL Scoreboard' : 'College Football Scoreboard'}</h1>
      <Table
        dataSource={scores}
        columns={columns}
        rowKey={(record) => `${record.homeTeam}-${record.awayTeam}`}
        loading={loading}
        pagination={false}
      />
    </div>
  );
};

export default Scoreboard;
