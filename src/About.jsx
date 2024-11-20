// About.jsx
import React from "react";
import "./about.css"; // Import your CSS file

const About = () => {
  document.title = "CyanBase - About Me";

  return (
    <section className="about-us">
      <div className="about">
        <img src="girl.jpg" className="pic" alt="About Us" />
        <div className="text">
          <h2>About Me</h2>
          <h5>
            Front-end Developer & <span>Designer</span>
          </h5>
          <p>
            My name is Sai Tanuj Karavadi. I created CyanBase due to the inability to add TV shows in any major platform.
            CyanBase is my solution to that problem. I used to use Google Spreadsheets before CyanBase but that prehistoric
            way of doing things are gone.
          </p>
          <div className="data">
            <a href="https://www.linkedin.com/in/sai-tanuj-karavadi-0b6b54265/" target = "/" className="hire">
              Linkedin
            </a>
            <a href="https://github.com/CyanCheetah" target = "/" className="hire">
              Github
            </a>
          </div>
          <div className="data">
            <a href="https://letterboxd.com/CyanCheetah/" target = "/" className="hire">
              My Letterboxd
            </a>
            <a href="https://myanimelist.net/profile/CyanCheetah" target = "/" className="hire">
              My Anime List
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
