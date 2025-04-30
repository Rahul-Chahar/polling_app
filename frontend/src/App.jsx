import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate 
} from 'react-router-dom';
import './App.css';
import { useAuth } from './context/AuthContext.jsx'; 

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import HomePage from './pages/HomePage.jsx'; 
import CreatePollPage from './pages/CreatePollPage.jsx';
import PollDetailPage from './pages/PollDetailPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

const NotFoundPage = () => <div>404 - Page Not Found</div>;

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    
    return <Navigate to="/login" replace />;
  }

  return children;
};

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={{ background: '#eee', padding: '1rem', marginBottom: '1rem' }}>
      <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
      <Link to="/create" style={{ marginRight: '1rem' }}>Create Poll</Link>
      <div style={{ float: 'right' }}>
        {user ? (
          <>
            <Link to="/profile" style={{ marginRight: '1rem' }}>Profile ({user.username})</Link>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', padding: 0 }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer style={{ background: '#eee', padding: '1rem', marginTop: '2rem', textAlign: 'center' }}>
    Polling App &copy; 2025
  </footer>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main style={{ padding: '0 1rem', minHeight: '70vh' }}> 
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/create" 
              element={
                <ProtectedRoute>
                  <CreatePollPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/poll/:id" element={<PollDetailPage />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFoundPage />} /> 
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

