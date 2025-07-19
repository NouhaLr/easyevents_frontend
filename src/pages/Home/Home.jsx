import React from 'react';
import './Home.css';

function Home() {
  return (
    <section id="home" className="home-section">
      <div className="home-video-wrapper">
        <div className="video-overlay">
          <iframe
            src="https://www.youtube.com/embed/mym8RVMFo4o"
            title="YouTube Video"
            allowFullScreen
            frameBorder="0"
          ></iframe>
          <div className="video-info">
            <h3>June 6</h3>
            <p>2:00 pm PT / 5:00 pm ET</p>
            <p>Live from YouTube Theater, join Geoff Keighley and thousands of fans for a look at what's next in video games.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
