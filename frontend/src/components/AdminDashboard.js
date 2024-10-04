import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Table,
  Input,
  Modal,
  Select,
  message,
  Typography,
  Space,
  Checkbox,
} from "antd";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const { Title } = Typography;

const AdminDashboard = () => {
  const [nflGames, setNflGames] = useState([]);
  const [collegeGames, setCollegeGames] = useState([]);
  const [selectedGames, setSelectedGames] = useState({});
  const [manualGame, setManualGame] = useState({
    homeTeam: "",
    awayTeam: "",
    spread: 0,
    date: "",
    league: "NFL", // Default to NFL
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("NFL"); // Tab to switch between NFL and CFB
  const navigate = useNavigate();

  const currentNFLWeek = 5; // Current week for NFL
  const currentCFBWeek = 6; // Current week for College Football

  // Fetch games from ESPN API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const NFL_API = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";
        const CFB_API = "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard?limit=100&groups=80";

        const nflResponse = await axios.get(NFL_API);
        const cfbResponse = await axios.get(CFB_API);

        // Parsing NFL games
        const nflGamesParsed = nflResponse.data.events.map((game) => ({
          gameId: game.id,
          homeTeam: game.competitions[0].competitors[0].team.displayName,
          awayTeam: game.competitions[0].competitors[1].team.displayName,
          spread: game.competitions[0].odds ? game.competitions[0].odds[0].details : "N/A",
        }));

        // Parsing College Football games
        const cfbGamesParsed = cfbResponse.data.events.map((game) => ({
          gameId: game.id,
          homeTeam: game.competitions[0].competitors[0].team.displayName,
          awayTeam: game.competitions[0].competitors[1].team.displayName,
          spread: game.competitions[0].odds ? game.competitions[0].odds[0].details : "N/A",
        }));

        setNflGames(nflGamesParsed);
        setCollegeGames(cfbGamesParsed);
      } catch (error) {
        console.error("Error fetching games:", error);
        message.error("Error fetching games");
      }
    };

    fetchGames();
  }, []);

  // Handle game selection
  const handleGameSelection = (gameId) => {
    setSelectedGames({
      ...selectedGames,
      [gameId]: !selectedGames[gameId], // Toggle selection
    });
  };

  // Submit selected games to the backend and store them
  const handleSubmitSelections = async () => {
    try {
      const selectedGameIds = Object.keys(selectedGames).filter(
        (gameId) => selectedGames[gameId]
      );

      const week = activeTab === "NFL" ? currentNFLWeek : currentCFBWeek; // Determine week

      // Prepare data to send to the backend
      const gamesToStore = selectedGameIds.map((gameId) => {
        const game = activeTab === "NFL"
          ? nflGames.find(g => g.gameId === gameId)
          : collegeGames.find(g => g.gameId === gameId);

        return {
          gameId: game.gameId,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          spread: game.spread,
          week,
          league: activeTab,
        };
      });

      // Send the selected games to the backend to store them
      await axios.post("http://localhost:5000/api/admin/store-games", {
        games: gamesToStore,
        week,
        league: activeTab,
      });

      message.success(`Games successfully stored for ${activeTab} Week ${week}`);
    } catch (error) {
      console.error("Error storing games:", error);
      message.error("Error storing games");
    }
  };

  // Handle manual game input change
  const handleInputChange = (e) => {
    setManualGame({
      ...manualGame,
      [e.target.name]: e.target.value,
    });
  };

  // Add a manual game
  const handleAddGame = async () => {
    try {
      await axios.post("http://localhost:5000/api/admin/add-game", manualGame);
      setIsModalVisible(false); // Close modal after successful addition
      message.success("Game added successfully");
    } catch (error) {
      console.error("Error adding game:", error);
      message.error("Error adding game");
    }
  };

  // Logout function
  const handleLogout = () => {
    navigate("/admin");
  };

  // Table columns configuration
  const columns = [
    {
      title: "Home Team",
      dataIndex: "homeTeam",
      key: "homeTeam",
    },
    {
      title: "Away Team",
      dataIndex: "awayTeam",
      key: "awayTeam",
    },
    {
      title: "Spread",
      dataIndex: "spread",
      key: "spread",
      render: (spread) => (spread ? spread : "N/A"), // Show N/A if no spread available
    },
    {
      title: "Select Game",
      render: (text, record) => (
        <Checkbox
          checked={selectedGames[record.gameId]}
          onChange={() => handleGameSelection(record.gameId)}
        />
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Admin Dashboard</Title>

      {/* Button group for switching between NFL and College Football */}
      <Space style={{ marginBottom: "20px" }}>
        <Button.Group>
          <Button
            type={activeTab === "NFL" ? "primary" : "default"}
            onClick={() => setActiveTab("NFL")}
          >
            NFL (Week {currentNFLWeek})
          </Button>
          <Button
            type={activeTab === "CFB" ? "primary" : "default"}
            onClick={() => setActiveTab("CFB")}
          >
            College Football (Week {currentCFBWeek})
          </Button>
        </Button.Group>

        {/* Submit Selected Games */}
        <Button
          type="primary"
          onClick={handleSubmitSelections}
          style={{ marginTop: "20px" }}
        >
          Submit Selected Games
        </Button>

        {/* Button to open modal to add manual game */}
        <Button
          type="dashed"
          onClick={() => setIsModalVisible(true)}
          style={{ marginTop: "20px" }}
        >
          Add Game Manually
        </Button>

        {/* Logout button */}
        <Button type="danger" onClick={handleLogout}>
          Logout
        </Button>
      </Space>

      {/* Conditional rendering based on the selected tab */}
      {activeTab === "NFL" ? (
        <>
          <Title level={3}>NFL Games (Week {currentNFLWeek})</Title>
          <Table
            dataSource={nflGames}
            rowKey="gameId"
            pagination={false}
            columns={columns}
          />
        </>
      ) : (
        <>
          <Title level={3}>College Football Games (Week {currentCFBWeek})</Title>
          <Table
            dataSource={collegeGames}
            rowKey="gameId"
            pagination={false}
            columns={columns}
          />
        </>
      )}

      {/* Modal for manual game entry */}
      <Modal
        title="Add Game Manually"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleAddGame}
      >
        <Input
          name="homeTeam"
          placeholder="Home Team"
          value={manualGame.homeTeam}
          onChange={handleInputChange}
          style={{ marginBottom: "10px" }}
        />
        <Input
          name="awayTeam"
          placeholder="Away Team"
          value={manualGame.awayTeam}
          onChange={handleInputChange}
          style={{ marginBottom: "10px" }}
        />
        <Input
          name="spread"
          placeholder="Spread"
          type="number"
          value={manualGame.spread}
          onChange={handleInputChange}
          style={{ marginBottom: "10px" }}
        />
        <Input
          name="date"
          placeholder="Date (e.g. 2024-10-05T14:30:00Z)"
          value={manualGame.date}
          onChange={handleInputChange}
          style={{ marginBottom: "10px" }}
        />
        <Select
          value={manualGame.league}
          onChange={(value) => setManualGame({ ...manualGame, league: value })}
          style={{ width: "100%" }}
        >
          <Option value="NFL">NFL</Option>
          <Option value="NCAAF">NCAAF</Option>
        </Select>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
