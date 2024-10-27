import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, message, Typography, Tag, Select } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const NFLPicks = () => {
  const [users, setUsers] = useState([]); // Unique users who have submitted picks
  const [userPicks, setUserPicks] = useState({}); // Picks for each user
  const [selectedGames, setSelectedGames] = useState([]); // Store games combined with scores
  const [week, setWeek] = useState(5); // Default week for NFL
  const weeks = [...Array(18).keys()].map(i => i + 1); // NFL has 18 weeks

  // Fetch games and scores for NFL
  useEffect(() => {
    const fetchGamesAndScores = async () => {
      try {
        const selectedGamesResponse = await axios.get(
          `http://localhost:5000/api/admin/getSelectedGames?week=${week}&league=NFL`
        );

        // Filter to ensure only NFL games are processed
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

  // Fetch user picks
  useEffect(() => {
    const fetchPicks = async () => {
      try {
        const picksResponse = await axios.get(
          `http://localhost:5000/api/picks/picks?week=${week}&league=NFL`
        );
        const picks = picksResponse.data;

        // Filter picks by the selected week and league (if not already filtered by the backend)
        const picksForWeek = picks.filter(
          (pick) => Number(pick.week) === week && pick.league === 'NFL'
        );

        // Group picks by user
        const groupedPicks = picksForWeek.reduce((acc, pick) => {
          const username = pick.username || pick.name;
          if (!acc[username]) {
            acc[username] = [];
          }
          acc[username].push(pick);
          return acc;
        }, {});

        setUsers(Object.keys(groupedPicks));
        setUserPicks(groupedPicks);
      } catch (error) {
        console.error("Error fetching picks:", error);
        message.error("Error fetching picks");
      }
    };

    fetchPicks();
  }, [week]);

  const calculateWinner = (homeTeam, awayTeam, homeScore, awayScore, spread) => {
    const parsedSpread = parseFloat(spread.split(" ")[1]) || 0;
    const adjustedHomeScore = homeScore + (parsedSpread > 0 ? 0 : Math.abs(parsedSpread));
    const adjustedAwayScore = awayScore + (parsedSpread > 0 ? parsedSpread : 0);

    if (adjustedHomeScore > adjustedAwayScore) {
      return homeTeam;
    } else if (adjustedAwayScore > adjustedHomeScore) {
      return awayTeam;
    } else {
      return "Tie";
    }
  };

  const columns = [
    {
      title: "Game Info",
      dataIndex: "gameInfo",
      key: "gameInfo",
      render: (text, record) => (
        <div>
          <strong>{record.awayTeam} @ {record.homeTeam}</strong>
          <div>Score: {record.awayScore || 0} - {record.homeScore || 0}</div>
          <div>Spread: {record.spread || "N/A"}</div>
        </div>
      ),
    },
    ...users.map((user) => ({
      title: user,
      key: user,
      render: (text, record) => {
        const userPick = userPicks[user]?.find(
          (pick) => 
            pick.homeTeam === record.homeTeam && 
            pick.awayTeam === record.awayTeam &&
            Number(pick.week) === week && 
            pick.league === 'NFL'
        );

        const winner = calculateWinner(
          record.homeTeam,
          record.awayTeam,
          record.homeScore || 0,
          record.awayScore || 0,
          record.spread || "0"
        );
        const isFinal = record.gameStatus === "Final" || record.gameStatus === "Final/OT";
        const isCorrect = isFinal && userPick?.pick === winner;

        return (
          <Tag color={isFinal ? (isCorrect ? "green" : "red") : "default"}>
            {userPick?.pick || "No Pick"} {isCorrect && <CheckCircleOutlined />}
          </Tag>
        );
      },
    })),
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2} style={{ color: "white" }}>NFL Pick Tracker</Title>

      <Select value={week} onChange={setWeek} style={{ width: 200, marginBottom: 20 }}>
        {weeks.map(weekNum => (
          <Option key={weekNum} value={weekNum}>{`Week ${weekNum}`}</Option>
        ))}
      </Select>

      {selectedGames.length > 0 ? (
        <Table
          dataSource={selectedGames}
          columns={columns}
          pagination={false}
          bordered
          scroll={{ x: "max-content" }}
          rowKey={(record) => `${record.homeTeam}-${record.awayTeam}`}
        />
      ) : (
        <h3 style={{ color: "white" }}>No games have been selected for this week.</h3>
      )}
    </div>
  );
};

export default NFLPicks;
