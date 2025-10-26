
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MemberDetailPage from './pages/MemberDetailPage';
import './App.css';

function App() {
  return (
    <div className="App">
      <main className="container pt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/member/:id" element={<MemberDetailPage />} />
        </Routes>
      </main>

      <footer className="bottom-nav" role="navigation">
        <h1 className="app-title">BTS</h1>
      </footer>
    </div>
  );
}

export default App;
