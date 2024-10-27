import React, { useState } from 'react';
import { Button, Space } from 'antd';
import NFLComponent from './NFLComponent';
import CollegeFootballComponent from './CollegeFootballComponent';

const GameList = () => {
  const [activeTab, setActiveTab] = useState('NFL');

  return (
    <div>
      <Space style={{ marginBottom: 20 }}>
        <Button
          type={activeTab === 'NFL' ? 'primary' : 'default'}
          onClick={() => setActiveTab('NFL')}
        >
          NFL
        </Button>
        <Button
          type={activeTab === 'CFB' ? 'primary' : 'default'}
          onClick={() => setActiveTab('CFB')}
        >
          College Football
        </Button>
      </Space>

      {activeTab === 'NFL' ? <NFLComponent /> : <CollegeFootballComponent />}
    </div>
  );
};

export default GameList;
