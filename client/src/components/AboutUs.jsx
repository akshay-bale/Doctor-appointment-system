import React from "react";
import image from "../images/aboutus-doctor.png";
import "../styles/hero.css"

const AboutUs = () => {
  return (
    <>
      <section className="container">
        <h2 className="page-heading about-heading">About Us</h2>
        <div className="about">
          <div className="hero-img">
            <img
              src={image}
              alt="hero"
            />
          </div>
          <div className="hero-content">
            <p>We believe that everyone deserves easy access to compassionate, expert healthcare. Our mission is to make your journey to better health simple, safe, and personalized. With a dedicated team of professionals and a patient-first approach, we're here to support your well-being every step of the way. Because your health isn't just our priority — it's our promise.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUs;
