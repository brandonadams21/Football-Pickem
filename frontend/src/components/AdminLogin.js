import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLogin.css'; // Import custom styles if needed

const { Title } = Typography;

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/admin-auth/login', {
        username,
        password,
      });

      if (response.status === 200) {
        navigate('/admin-dashboard');
      }
    } catch (error) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="admin-login-container">
      <Title level={2} className="admin-login-title">Admin Login</Title>
      
      <Form
        name="admin_login"
        layout="vertical"
        onFinish={handleLogin}
        className="admin-login-form"
      >
        <Form.Item
          style={{color: 'white !important'}}
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please enter your username!' }]}
        >
          <Input
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter your password!' }]}
        >
          <Input.Password
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>

        {error && (
          <Alert
            message="Login Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '20px' }}
          />
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" block className="login-button">
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AdminLogin;
