import React from 'react';
import './Navbar.css';
const role = localStorage.getItem("user_role");
function Navbar({ scrollToSection, togglePopup ,user ,handleLogout }) {
  return (
     <nav className="navbar">
      <div className="nav-left">
        <button className="nav-btn active" onClick={() => scrollToSection('home')}>Home</button>
        <button className="nav-btn" onClick={() => scrollToSection('events')}>Events</button>
        <button className="nav-btn" onClick={() => scrollToSection('about')}>About Us</button>

        {user?.role === "admin" && (
          <button className="nav-btn" onClick={() => scrollToSection('admin')}>Admin Dashboard</button>
        )}

       
      </div>

      <div className="nav-center">EasyEvents</div>

      <div className="nav-right">
        {user ? (
          <>
            {user?.role === "attender" && (
          <button className="nav-btn" onClick={() => scrollToSection('my-events')}><span className="username-display">
  {user.email.split('@')[0]}
</span>'s Wallet</button>
        )}
            <button className="sign-btn" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <button className="sign-btn" onClick={togglePopup}>Sign In / Sign Up</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
