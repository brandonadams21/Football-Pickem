// AuthRedirect.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoggedIn } from './LoggedInContext'; // Import the context
import  AdminDashboard  from '../components/AdminDashboard'; // Import the admin dashboard

const AuthRedirect = () => {
  const { loggedIn, usertype } = useLoggedIn(); // Get logged in state and usertype
  const navigate = useNavigate();

  useEffect(() => {
    if (!loggedIn) {
      // If not logged in, redirect to the login page
      navigate('/login');
    } else if (usertype === 'admin') {
      // If admin, redirect to the admin dashboard
      navigate('/admin-dashboard');
   
    } else if (usertype === 'Member') {
      // If member, redirect to the member page
      console.log('member');
      navigate('/');
    }
  }, [loggedIn, usertype, navigate]);

  return null; // Render nothing, just handle redirects
};

export default AuthRedirect;
