import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Events from './pages/Events/Events';
import About from './pages/About/About';
import './App.css';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import Wallet from './pages/wallet/wallet';
import { Route, Routes } from 'react-router-dom';

function App() {
  const [popupVisible, setPopupVisible] = useState(false);
  const [isSignIn, setIsSignIn] = useState(true);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const showAlert = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ username: decoded.username, email: decoded.email, role: decoded.role });
      } catch (err) {
        console.error("Token decode failed:", err);
        setUser(null);
      }
    }
  }, []);

  function togglePopup() {
    setPopupVisible(!popupVisible);
    setUsername('');
    setEmail('');
    setPassword('');
  }

  function scrollToSection(id) {
    const section = document.getElementById(id);
    section.scrollIntoView({ behavior: 'smooth' });

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (id === 'home') document.querySelectorAll('.nav-btn')[0].classList.add('active');
    if (id === 'events') document.querySelectorAll('.nav-btn')[1].classList.add('active');
  }

  function expandEvent(card, event) {
    if (event.target.closest('.ticket-form') || event.target.closest('.ticket-btn')) return;
    const allCards = document.querySelectorAll('.event-card');
    allCards.forEach(c => { if (c !== card) c.classList.remove('expanded'); });
    card.classList.toggle('expanded');
  }

  function showTicketForm() {
    showAlert("Ticket form popup coming soon!");
  }

  async function handleSignUp() {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/register/", {
        username,
        email,
        password
      });
      showAlert("User registered successfully!");
      togglePopup();
      window.location.reload();
    } catch (error) {
      console.error("Registration error:", error.response?.data || error);
      showAlert("Registration failed. Check console for details.");
    }
  }

  async function handleSignIn() {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        email,
        password
      });
      const decoded = jwtDecode(response.data.access);
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      localStorage.setItem("user_role", decoded.role);
      localStorage.setItem("username", decoded.username);
      setUser({ username: decoded.username, email: decoded.email, role: decoded.role });
      showAlert("Logged in successfully!");
      togglePopup();
      window.location.reload();
    } catch (error) {
      console.error("Login error:", error.response?.data || error);
      showAlert("Login failed. Check your email/password.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    showAlert("Logged out successfully.");
    window.location.reload();
  }

  return (
    <>
      <Navbar
        user={user}
        handleLogout={handleLogout}
        togglePopup={() => { setIsSignIn(true); togglePopup(); }}
        scrollToSection={scrollToSection}
      />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Home />
              <Events user={user} showTicketForm={showTicketForm} expandEvent={expandEvent} />
              <About />
            </>
          }
        />
        <Route path="/wallet" element={<Wallet />} />
      </Routes>

      {popupVisible && (
        <div className="popup">
          <div className="popup-content">
            <span className="close-btn" onClick={togglePopup}>&times;</span>
            {isSignIn ? (
              <>
                <h2>Sign In</h2>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button className="popup-btn" onClick={handleSignIn}>Sign In</button>
                <p>Don't have an account?
                  <span
                    style={{ color: '#007bff', cursor: 'pointer', marginLeft: '5px' }}
                    onClick={() => setIsSignIn(false)}
                  >
                    Sign Up
                  </span>
                </p>
              </>
            ) : (
              <>
                <h2>Sign Up</h2>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button className="popup-btn" onClick={handleSignUp}>Sign Up</button>
                <p>Already have an account?
                  <span
                    style={{ color: '#007bff', cursor: 'pointer', marginLeft: '5px' }}
                    onClick={() => setIsSignIn(true)}
                  >
                    Sign In
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-form">
            <h3>Notification</h3>
            <p>{popupMessage}</p>
            <div className="popup-buttons">
              <button onClick={() => setShowPopup(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <Footer togglePopup={() => { setIsSignIn(true); togglePopup(); }} />
    </>
  );
}

export default App;
