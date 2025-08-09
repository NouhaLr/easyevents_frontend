// import React from 'react';
// import './Navbar.css';
// const role = localStorage.getItem("user_role");
// function Navbar({ scrollToSection, togglePopup ,user ,handleLogout }) {
//   return (
//      <nav className="navbar">
//       <div className="nav-left">
//         <button className="nav-btn active" onClick={() => scrollToSection('home')}>Home</button>
//         <button className="nav-btn" onClick={() => scrollToSection('events')}>Events</button>
//         <button className="nav-btn" onClick={() => scrollToSection('about')}>About Us</button>
//         {user?.role === "admin" && (
//           <button className="nav-btn" onClick={() => scrollToSection('admin')}>Admin Dashboard</button>
//         )}
//       </div>
//       <div className="nav-center">EasyEvents</div>
//       <div className="nav-right">
//         {user ? (
//           <>
//             {(user?.role === "attender"||"admin") && (
//           <button className="nav-btn" onClick={() => scrollToSection('my-wallet')}>
//   <span className="username-display">{user.email.split('@')[0]}</span>'s Wallet
// </button>
//         )}
//             <button className="sign-btn" onClick={handleLogout}>Logout</button>
//           </>
//         ) : (
//           <button className="sign-btn" onClick={togglePopup}>Sign In / Sign Up</button>
//         )}
//       </div>
//     </nav>
//   );
// }

// export default Navbar;
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, handleLogout, togglePopup, scrollToSection }) {
  const navigate = useNavigate();
  const location = useLocation();

  // scroll if on homepage (path = '/'), else navigate then scroll
  const handleScrollOrNavigate = (section) => {
    if (location.pathname === '/') {
      scrollToSection(section);
    } else {
      navigate('/');
      // wait a bit to allow page to render then scroll
      setTimeout(() => {
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <button className="nav-btn active" onClick={() => handleScrollOrNavigate('home')}>Home</button>
        <button className="nav-btn" onClick={() => handleScrollOrNavigate('events')}>Events</button>
        <button className="nav-btn" onClick={() => handleScrollOrNavigate('about')}>About Us</button>
        {user?.role === "admin" && (
          <button className="nav-btn" onClick={() => navigate('/admin')}>Admin Dashboard</button>
        )}
      </div>
      <div className="nav-center">EasyEvents</div>
      <div className="nav-right">
        {user ? (
          <>
            {(user.role === "attender" || user.role === "admin") && (
              <button className="nav-btn" onClick={() => navigate('/wallet')}>
                <span className="username-display">{user.email.split('@')[0]}</span>'s Wallet
              </button>
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
