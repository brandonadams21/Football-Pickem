import React from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom'; // Assuming you're using React Router for navigation
import './Navbar.css'; // Custom CSS for styling

const { Header } = Layout;

const Navbar = () => {
  return (
    <Layout>
      <Header className="navbar-header">
        <div className="logo">Pick'em</div>
        <Menu theme="dark" mode="horizontal" className="navbar-menu" selectable={false}>
          <Menu.Item key="1">
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link to="/picks">Picks</Link>
          </Menu.Item>
          <Menu.Item key="3">
            <Link to="/admin">Admin Panel</Link>
          </Menu.Item>
        </Menu>
      </Header>
    </Layout>
  );
};

export default Navbar;
