import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Select, message, Radio, Button } from 'antd';
import moment from 'moment';

const { Option } = Select;

const UserPicks = () => {
  const [selectedGames, setSelectedGames] = useState([]); // Store selected games for picks
  const [selectedWeek, setSelectedWeek] = useState('');
  const [weeks, setWeeks] = useState([]);
  const [userPicks, setUserPicks] = useState({}); // Store the user's picks
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all weeks (to show in dropdown)
    const fetchWeeks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/weeks/weeks');
        setWeeks(response.data);
      } catch (error) {
        console.error('Error fetching weeks:', error);
        message.error('Error fetching weeks');
      }
    };
    fetchWeeks();
  }, []);

  useEffect(() => {
    if (selectedWeek) {
      // Fetch selected games for the selected week
      const fetchSelectedGames = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/picks/getSelectedGames?week=${selectedWeek}`);
          setSelectedGames(response.data.selectedGames); // Assuming the API returns selectedGames array
        } catch (error) {
          console.error('Error fetching selected games:', error);
          message.error('Error fetching selected games');
        }
      };
      fetchSelectedGames();
    }
  }, [selectedWeek]);

  // Handle user's pick selection
  const handlePickChange = (gameId, value) => {
    setUserPicks({
      ...userPicks,
      gameId: value, // Update the pick for this game
    });
  };

  // Submit user picks
  const handleSubmitPicks = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/picks/submit', {
        picks: userPicks,
        week: selectedWeek,
        gameId: selectedGames.map((game) => game._id),
      });
      message.success('Picks submitted successfully!');
    } catch (error) {
      console.error('Error submitting picks:', error);
      message.error('Error submitting picks');
    } finally {
      setLoading(false);
    }
  };

  // Table columns for the available games to pick from
  const columns = [
    {
      title: 'Home Team',
      dataIndex: 'homeTeam',
      key: 'homeTeam',
    },
    {
      title: 'Away Team',
      dataIndex: 'awayTeam',
      key: 'awayTeam',
    },
    {
      title: 'Pick',
      key: 'pick',
      render: (text, record) => (
        <Radio.Group
          onChange={(e) => handlePickChange(record._id, e.target.value)}
          value={userPicks[record._id]}
        >
          <Radio.Button value="home">{record.homeTeam}</Radio.Button>
          <Radio.Button value="away">{record.awayTeam}</Radio.Button>
        </Radio.Group>
      ),
    },
  ];

  return (
    <div>
      <h1>User Picks</h1>

      {/* Dropdown for selecting week */}
      <Select
        value={selectedWeek}
        onChange={(value) => setSelectedWeek(value)}
        style={{ width: '200px', marginBottom: '20px' }}
        placeholder="Select a Week"
      >
        {weeks.map((week) => (
          <Option key={week} value={week}>
            {moment(week).format('MMMM Do YYYY')} {/* Display formatted date */}
          </Option>
        ))}
      </Select>

      {/* Table for displaying selected games */}
      <Table
        dataSource={selectedGames}
        columns={columns}
        rowKey="_id"
        pagination={false}
      />

      {/* Submit picks button */}
      <Button
        type="primary"
        onClick={handleSubmitPicks}
        disabled={!selectedWeek || Object.keys(userPicks).length === 0}
        loading={loading}
        style={{ marginTop: '20px' }}
      >
        Submit Picks
      </Button>
    </div>
  );
};

export default UserPicks;
