// src/Components/Unauthorized.js
import React from 'react';
import { Link } from 'react-router-dom';
import './styles/unauthorised.css'; // Optional: Add styling for the component

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <h1>Unauthorised</h1>
      <p>You do not have permission to view this page.</p>
      <Link to="/login" className="home-link">
        Go to Login
      </Link>
      <Link to="/" className="home-link">
        Go to Home
      </Link>
    </div>
  );
};

export default Unauthorized;