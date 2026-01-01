import React, { useState, useEffect } from "react";
import "../../pages/WellbeingPage.css";
import "./Mindfulness.css";
import calmBackground from "../../assets/calm-background.jpg"; // your background image

const Mindfulness = () => {
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState("Inhale"); // text cue for breathing

  useEffect(() => {
    let interval;
    if (active && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [active, timeLeft]);

  useEffect(() => {
    let phaseInterval;
    if (active) {
      phaseInterval = setInterval(() => {
        setPhase((prev) => (prev === "Inhale" ? "Exhale" : "Inhale"));
      }, 3000);
    }
    return () => clearInterval(phaseInterval);
  }, [active]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      className="menu-content"
      style={{
        backgroundImage: `url(${calmBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        color: "#fff",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h3> Mindfulness Exercises</h3>
      <p>Tap the circle and follow the breathing rhythm as the timer runs.</p>

      <div className="mindfulness-container">
        <button
          className={`breathing-circle ${active ? "active" : ""}`}
          onClick={() => setActive(!active)}
        >
          {formatTime(timeLeft)}
        </button>
      </div>

      {active && <p className="breathing-phase">{phase}…</p>}
    </div>
  );
};

export default Mindfulness;
