import React, { createContext, useState, useContext, useEffect } from 'react';

// Create a context for authentication
export const LoggedInContext = createContext(); // Export LoggedInContext

// Custom hook to use the context
export const useLoggedIn = () => useContext(LoggedInContext);

export const LoggedInProvider = ({ children }) => {
  // Check localStorage for the initial logged in state
  const initialLoggedInState = localStorage.getItem('usertype') ? true : false;

  // State to track if user is logged in and their usertype
  const [loggedIn, setLoggedIn] = useState(initialLoggedInState);
  const [usertype, setUsertype] = useState(localStorage.getItem('usertype') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || null);

  // Function to log the user in
  const login = (user) => {
    const { usertype, token } = user; // Assuming user has usertype and token
    console.log('User logged in:', user);
    
    setLoggedIn(true);
    setUsertype(usertype);
    setUsername(user.username);
    // Store usertype and token in localStorage
    localStorage.setItem('username', user.username);
    localStorage.setItem('usertype', usertype);
    localStorage.setItem('token', token); // Store token if necessary
  };

  // Function to log the user out
  const logout = () => {
    setLoggedIn(false);
    setUsertype(null);
    localStorage.removeItem('usertype'); // Clear localStorage
    localStorage.removeItem('token'); // Remove token if stored
  };

  // Re-check localStorage on component mount (initial load)
  useEffect(() => {
    const storedUsertype = localStorage.getItem('usertype');
    console.log()
    if (storedUsertype) {
      setLoggedIn(true);
      setUsertype(storedUsertype);
    }
  }, []);

  return (
    <LoggedInContext.Provider value={{ loggedIn, usertype, username, login, logout }}>
      {children}
    </LoggedInContext.Provider>
  );
};
