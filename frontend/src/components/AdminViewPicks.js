import React, { useState } from "react";
import { Button, Space } from "antd";
import NFLPicks from "./NFLPicks"; // Import the NFL component
import CFBPicks from "./CFBPicks"; // Import the College Football component

const AdminViewPicks = () => {
  const [activeTab, setActiveTab] = useState("NFL"); // Toggle between NFL and College Football

  return (
    <div style={{ padding: "20px", marginBottom: "10vh" }}>
      <Space style={{ marginBottom: 20 }}>
        {/* Button group to toggle between NFL and College Football */}
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

      {/* Conditionally render the NFLPicks or CFBPicks component based on the activeTab */}
      {activeTab === "NFL" ? <NFLPicks /> : <CFBPicks />}
    </div>
  );
};

export default AdminViewPicks;
