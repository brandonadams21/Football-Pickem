import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, message, Typography, Tag, Space, Select } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

const AdminViewPicks = () => {
  const [users, setUsers] = useState([]); // Unique users who have submitted picks
  const [userPicks, setUserPicks] = useState({}); // Picks for each user
  const [loading, setLoading] = useState(false);
  const [selectedGames, setSelectedGames] = useState([]); // Store games combined with scores
  const [week, setWeek] = useState(5); // Default week for NFL
  const [activeTab, setActiveTab] = useState("NFL"); // Toggle between NFL and College Football
  const [weeks, setWeeks] = useState([]); // Store weeks for selection

  // Fetch weeks when the tab is changed
  useEffect(() => {
    const fetchWeeks = () => {
      const defaultNFLWeek = 5;
      const defaultCFBWeek = 6;
      const weekRange = activeTab === "NFL" ? [...Array(18).keys()].map(i => i + defaultNFLWeek) : [...Array(15).keys()].map(i => i + defaultCFBWeek);
      setWeeks(weekRange);
      setWeek(activeTab === "NFL" ? defaultNFLWeek : defaultCFBWeek);
    };
    fetchWeeks();
  }, [activeTab]);

  // Fetch games and scores for the selected league (NFL or College Football)
  useEffect(() => {
    const fetchGamesAndScores = async () => {
      try {
        // Fetch selected games
        const selectedGamesResponse = await axios.get(
          `http://localhost:5000/api/admin/getSelectedGames?week=${week}&league=${activeTab}`
        );
        const selectedGames = selectedGamesResponse.data.selectedGames;

        // Fetch scores
        const scoresResponse = await axios.get(
          `http://localhost:5000/api/${activeTab === "NFL" ? "nfl" : "college"}`
        );
        const scores = scoresResponse.data;

        // Combine selected games and scores based on homeTeam and awayTeam
        const combinedData = selectedGames.map((game) => {
          const scoreData = scores.find(
            (score) =>
              score.homeTeam === game.homeTeam &&
              score.awayTeam === game.awayTeam
          );

          // If score data exists, merge it into the game object
          return { ...game, ...scoreData };
        });

        // Sort games: Completed games first, then scheduled games ordered by gameStatusDate
        const sortedData = combinedData.sort((a, b) => {
          if (
            (a.gameStatus === "Final" || a.gameStatus === "Final/OT") &&
            (b.gameStatus === "Final" || b.gameStatus === "Final/OT")
          ) {
            return 0; // If both are completed, leave them as is
          }

          // Completed games come before non-completed games
          if (a.gameStatus === "Final" || a.gameStatus === "Final/OT") {
            return -1;
          }
          if (b.gameStatus === "Final" || b.gameStatus === "Final/OT") {
            return 1;
          }

          // Both are scheduled games, sort by gameStatusDate
          const aDate = new Date(a.gameStatusDate);
          const bDate = new Date(b.gameStatusDate);
          return aDate - bDate;
        });

        setSelectedGames(sortedData);
      } catch (error) {
        console.error("Error fetching games and scores:", error);
        message.error("Error fetching games and scores");
      }
    };

    fetchGamesAndScores();
  }, [week, activeTab]);

  // Function to check the picks and determine correctness
  const handleCheckAndUpdatePicks = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/picks/check-picks", {
        week,
        league: activeTab,
      });

      message.success("Picks updated based on game results");
    } catch (error) {
      console.error("Error updating picks:", error);
      message.error("Failed to update picks");
    }
  };

  // Helper function to calculate the winner based on the score and spread
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
      return "Tie";
    }
  };

  // Fetch user picks and compare with game results
  useEffect(() => {
    const fetchPicks = async () => {
      setLoading(true);
      try {
        // Fetch picks
        const picksResponse = await axios.get("http://localhost:5000/api/picks/picks");
        const picks = picksResponse.data;

        // Group picks by user name
        const groupedPicks = picks.reduce((acc, pick) => {
          if (!acc[pick.name]) {
            acc[pick.name] = [];
          }
          acc[pick.name].push(pick);
          return acc;
        }, {});

        setUsers(Object.keys(groupedPicks));
        setUserPicks(groupedPicks);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Error fetching data");
        setLoading(false);
      }
    };

    fetchPicks();
  }, []);

  // Create columns dynamically for each user
  const columns = [
    {
      title: "Game Info",
      dataIndex: "gameInfo",
      key: "gameInfo",
      render: (text, record) => (
        <div>
          <strong>
            {record.homeTeam} vs {record.awayTeam}
          </strong>
          <div>Score: {record.homeScore} - {record.awayScore}</div>
          <div>Spread: {record.spread !== undefined ? `${record.spread} pts` : "N/A"}</div>
        </div>
      ),
    },
    ...users.map((user) => ({
      title: user,
      key: user,
      render: (text, record) => {
        const userPick = userPicks[user]?.find((pick) => pick.homeTeam === record.homeTeam && pick.awayTeam === record.awayTeam);
        const winner = calculateWinner(record.homeTeam, record.awayTeam, record.homeScore, record.awayScore, record.spread);
        const isFinal = record.gameStatus === "Final" || record.gameStatus === "Final/OT";
        const isCorrect = userPick?.pick === winner;

        // Determine tag color: green (correct), red (incorrect), orange (ongoing)
        let color = "orange"; // Default to ongoing (not final)
        if (isFinal) {
          color = isCorrect ? "green" : "red"; // Final and correct/incorrect
        }

        return (
          <Tag color={color}>
            {userPick?.pick || "No Pick"} {isCorrect && isFinal && <CheckCircleOutlined />}
          </Tag>
        );
      },
    })),
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2} style={{ marginBottom: "20px", color: 'white' }}>
        Pick Tracker - User Leaderboard
      </Title>

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

      {/* Table displaying picks in column-based format */}
      <Table
      className="table"
      theme="dark"
        dataSource={selectedGames} // Games data as rows
        columns={columns} // Users as dynamic columns
        pagination={false}
        bordered
        scroll={{ x: "max-content" }} // Allow horizontal scrolling for mobile users
      />
    </div>
  );
};

export default AdminViewPicks;
