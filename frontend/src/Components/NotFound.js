// src/Components/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import './styles/NotFound.css'; // Import the CSS file for styling

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Oop's sorry we can't find that page!</h2>
      <p>
        Aenean eget sollicitudin lorem, et pretium felis. Nullam euismod diam libero, sed dapibus
        leo laoreet ut. Suspendisse potenti. Phasellus urna lacus.
      </p>
      <div className="search-container">
        <input type="text" placeholder="Search from Here" />
        <button>Search</button>
      </div>
      <Link to="/" className="home-link">
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFound;