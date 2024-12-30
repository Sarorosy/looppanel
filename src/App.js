import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import DecryptPage from "./DecryptPage";
import Layout from './components/Layout';
import ManageContactMadeQueries from "./pages/ManageContactMadeQueries";
import ManageQuery from './pages/ManageQuery';
import './output.css';
import './index.css';

// basename="/askforscope"

function App() {
  return (
    <Router > 
      <Routes>
        {/* Public route */}
        <Route path="/:email/:token" element={<DecryptPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={<Layout />}
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
