import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLogin.css'; // Import custom styles if needed
import { useLoggedIn } from '../context/LoggedInContext'; // Import context

const { Title } = Typography;

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { login } = useLoggedIn(); // Get login function from context

  const handleLogin = async () => {
    try {
      // Make a POST request to login API
      const response = await axios.post('http://localhost:5000/api/admin-auth/login', {
        username,
        password,
      });

      if (response.status === 200) {
        const user = response.data; // Assuming the response contains the user details including usertype
        // Call the login function from context to update the state
        login(user);

        // Redirect based on usertype
        if (user.usertype === 'admin') {
          navigate('/admin-dashboard');
        } else if (user.usertype === 'Member') {
          navigate('/');
        }
      }
    } catch (error) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="admin-login-container">
      <Title level={2} className="admin-login-title">Pick'em Login</Title>
      
      <Form
        name="admin_login"
        layout="vertical"
        onFinish={handleLogin}
        className="admin-login-form"
      >
        <Form.Item
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
