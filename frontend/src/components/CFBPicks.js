import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, message, Typography, Tag, Select } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const CFBPicks = () => {
  const [users, setUsers] = useState([]); // Unique users who have submitted picks
  const [userPicks, setUserPicks] = useState({}); // Picks for each user
  const [selectedGames, setSelectedGames] = useState([]); // Store games combined with scores
  const [week, setWeek] = useState(6); // Default week for College Football
  const weeks = [...Array(15).keys()].map(i => i + 6); // College Football has 15 weeks

  // Fetch games and scores for College Football
  useEffect(() => {
    const fetchGamesAndScores = async () => {
      try {
        // Fetch selected games for CFB
        const selectedGamesResponse = await axios.get(
          `http://localhost:5000/api/admin/getSelectedGames?week=${week}&league=CFB`
        );
        const selectedGames = selectedGamesResponse.data.selectedGames;

        // Fetch scores for CFB
        const scoresResponse = await axios.get(
          `http://localhost:5000/api/college?week=${week}`
        );
        const scores = scoresResponse.data;

        // Combine selected games and scores
        const combinedData = selectedGames.map((game) => {
          const scoreData = scores.find(
            (score) =>
              score.homeTeam === game.homeTeam &&
              score.awayTeam === game.awayTeam
          );
          return { ...game, ...scoreData };
        });

        setSelectedGames(combinedData);
      } catch (error) {
        console.error("Error fetching CFB games and scores:", error);
        message.error("Error fetching CFB games and scores");
      }
    };

    fetchGamesAndScores();
  }, [week]);

  // Fetch user picks
  useEffect(() => {
    const fetchPicks = async () => {
      try {
        const picksResponse = await axios.get(
          "http://localhost:5000/api/picks/picks"
        );
        const picks = picksResponse.data;

        const groupedPicks = picks.reduce((acc, pick) => {
          if (!acc[pick.name]) {
            acc[pick.name] = [];
          }
          acc[pick.name].push(pick);
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
  }, []);

  const calculateWinner = (homeTeam, awayTeam, homeScore, awayScore, spread) => {
    const parsedSpread = parseFloat(spread.split(" ")[1]);
    const adjustedHomeScore = homeScore + (parsedSpread > 0 ? 0 : Math.abs(parsedSpread));
    const adjustedAwayScore = awayScore + (parsedSpread > 0 ? parsedSpread : 0);

    return adjustedHomeScore > adjustedAwayScore ? homeTeam : awayTeam;
  };

  const columns = [
    {
      title: "Game Info",
      dataIndex: "gameInfo",
      key: "gameInfo",
      render: (text, record) => (
        <div>
          <strong>{record.homeTeam} vs {record.awayTeam}</strong>
          <div>Score: {record.homeScore} - {record.awayScore}</div>
          <div>Spread: {record.spread !== undefined ? `${record.spread} pts` : "N/A"}</div>
        </div>
      ),
    },
    ...users.map((user) => ({
      title: user,
      key: user,
      render: (text, record) => {
        const userPick = userPicks[user]?.find(
          (pick) => pick.homeTeam === record.homeTeam && pick.awayTeam === record.awayTeam
        );
        const winner = calculateWinner(
          record.homeTeam,
          record.awayTeam,
          record.homeScore,
          record.awayScore,
          record.spread
        );
        const isFinal = record.gameStatus === "Final" || record.gameStatus === "Final/OT";
        const isCorrect = userPick?.pick === winner;

        return (
          <Tag color={isCorrect && isFinal ? "green" : "red"}>
            {userPick?.pick || "No Pick"} {isCorrect && isFinal && <CheckCircleOutlined />}
          </Tag>
        );
      },
    })),
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2} style={{ color: "white" }}>College Football Pick Tracker</Title>

      <Select value={week} onChange={setWeek} style={{ width: 200, marginBottom: 20 }}>
        {weeks.map(week => (
          <Option key={week} value={week}>{`Week ${week}`}</Option>
        ))}
      </Select>

      {selectedGames.length > 0 ? (
        <Table
          dataSource={selectedGames}
          columns={columns}
          pagination={false}
          bordered
          scroll={{ x: "max-content" }}
        />
      ) : (
        <h3 style={{ color: "white" }}>No games have been selected for this week.</h3>
      )}
    </div>
  );
};

export default CFBPicks;
