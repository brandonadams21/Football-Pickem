import React, { useState } from 'react';
import { Form, Input, Button, Select, Typography, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

const { Title } = Typography;
const { Option } = Select;

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usertype, setUsertype] = useState('member'); // Default to member
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/admin-auth/signup', {
        username,
        email,
        password,
        usertype: 'Member', // Pass usertype to backend
      });
      console.log('Signup response:', response);
      if (response.status === 201) {
        setSuccess('Signup successful! You can now login.');
        setError('');
        navigate('/login'); // Redirect to login page after successful signup
      }
      console.log('Signup response:', response);
    } catch (error) {
      setError('Signup failed. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div className="signup-container">
      <Title level={2} className="signup-title">Pickem Signup</Title>
      
      <Form
        name="admin_signup"
        layout="vertical"
        onFinish={handleSignup}
        className="signup-form"
      >
        <Form.Item
          label="Name"
          name="username"
          rules={[{ required: true, message: 'Please enter your name!' }]}
        >
          <Input
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            message="Signup Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '20px' }}
          />
        )}

        {success && (
          <Alert
            message="Signup Success"
            description={success}
            type="success"
            showIcon
            style={{ marginBottom: '20px' }}
          />
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" block className="signup-button">
            Signup
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Signup;
