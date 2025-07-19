import React from 'react';
import './About.css';

function About() {
  return (
    <section id="about" className="about-section">
      <div className="about-content">
        <div className="about-text">
          <h2>About EasyEvents</h2>
          <p>At EasyEvents, we make booking tickets effortless and enjoyable. Our mission is to connect you with unforgettable experiences.</p>
          <p>Join our community and never miss out on the events that matter to you.</p>
        </div>
        <div className="about-image">
          <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80" alt="About Us" />
        </div>
      </div>
    </section>
  );
}

export default About;
