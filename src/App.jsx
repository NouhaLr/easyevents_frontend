import React, { useState ,useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Events from './pages/Events/Events';
import About from './pages/About/About';
import './App.css';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";



function App() {
  const [popupVisible, setPopupVisible] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [user, setUser] = useState(null);


  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

    useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Expires at:", new Date(decoded.exp * 1000));
        console.log("Decoded on app load:", decoded);
        setUser({ username: decoded.username, email: decoded.email,role: decoded.role });
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
    alert("Ticket form popup coming soon!");
  }


async function handleUnifiedAuth() {
  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    const checkResponse = await axios.post("http://127.0.0.1:8000/api/check-email/", { email });

    const userExists = checkResponse.data.exists;

    if (userExists) {
      const loginResponse = await axios.post("http://127.0.0.1:8000/api/login/", {
        email,
        password,
      });

      const decoded = jwtDecode(loginResponse.data.access);
      localStorage.setItem("access_token", loginResponse.data.access);
      localStorage.setItem("refresh_token", loginResponse.data.refresh);
      setUser({ username: decoded.username, email: decoded.email, role: decoded.role });

      alert("Logged in successfully!");
      togglePopup();
      
    } else {
      const extractedUsername = email.split('@')[0];

      await axios.post("http://127.0.0.1:8000/api/register/", {
        username: extractedUsername,
        email,
        password,
      });

      alert("User registered successfully! Logging you in...");
      await new Promise((r) => setTimeout(r, 300)); 

      const loginResponse = await axios.post("http://127.0.0.1:8000/api/login/", {
        email,
        password,
      });

      const decoded = jwtDecode(loginResponse.data.access);
      localStorage.setItem("access_token", loginResponse.data.access);
      localStorage.setItem("refresh_token", loginResponse.data.refresh);
      setUser({ username: decoded.username, email: decoded.email, role: decoded.role });

      togglePopup();
    }

  } catch (err) {
    console.error("Authentication process failed:", err.response?.data || err);
    alert("Authentication failed: " + (err.response?.data?.detail || "Unknown error"));
  }
}



function handleLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  setUser(null);
  alert("Logged out successfully.");
}



  return (
    <>
      <Navbar
  scrollToSection={scrollToSection}
  togglePopup={() => { setIsSignUp(true); togglePopup(); }}
  user={user} 
   handleLogout={handleLogout} 
/>

      <Home />
      <Events user={user} showTicketForm={showTicketForm} expandEvent={expandEvent} />
      <About />

      {popupVisible && (
  <div className="popup">
    <div className="popup-content">
      <span className="close-btn" onClick={togglePopup}>&times;</span>
      <h2>Sign In / Sign Up</h2>
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
      <button className="popup-btn" onClick={handleUnifiedAuth}>Continue</button>
    </div>
  </div>
)}


      <Footer togglePopup={() => { setIsSignUp(true); togglePopup(); }} />
    </>
  );
}

export default App;
