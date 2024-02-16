import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/Home';
import ReduxProvider from './store/redux-provider';
import Login from './components/Login';
import Proxy from './components/Proxy';

function App() {
  return (
    <Router>
      <ReduxProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/proxy/:proxy" element={<Proxy />} />
          </Routes>
        </div>
      </ReduxProvider>
    </Router>
  );
}

export default App;
