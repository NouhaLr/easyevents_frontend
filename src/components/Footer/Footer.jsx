import React from 'react';
import './Footer.css';

function Footer({ togglePopup }) {
  return (
    <footer className="footer">
      <div className="footer-sponsors">
        <h3>Our Sponsors</h3>
        <div className="sponsor-logos">
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" />
          <img src="https://blog.logomyway.com/wp-content/uploads/2022/05/amd-symbol.png" alt="AMD" />
          <img src="https://upload.wikimedia.org/wikipedia/sco/thumb/2/21/Nvidia_logo.svg/1024px-Nvidia_logo.svg.png" alt="NVIDIA" />
        </div>
      </div>
      <div className="footer-links">
        <a href="#about">About Us</a>
        <a href="#terms">Terms & Conditions</a>
        <a href="#signin" onClick={togglePopup}>Sign In / Sign Up</a>
      </div>
      <div className="footer-copy">&copy; 2025 EasyEvents. All rights reserved.</div>
    </footer>
  );
}

export default Footer;
