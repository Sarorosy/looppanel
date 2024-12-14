import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import DecryptPage from "./DecryptPage"; // Create this component
import './output.css';
import ManageContactMadeQueries from "./pages/ManageContactMadeQueries";
import Layout from './components/Layout'; // Import Layout
import './output.css';
import './index.css';
import ManageQuery from './pages/ManageQuery';


function App() {
  return (
    <Router>
      <Routes>
        
        
      </Routes>

      <Routes>
        {/* Public route */}
        <Route path="/:email/:token" element={<DecryptPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <Layout  />
          }
        >
          <Route path="/assignquery" element={<ManageContactMadeQueries />} />
          <Route path="/query" element={<ManageQuery />} />
          
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
