import React, { useState, useEffect } from "react";
import "../../pages/WellbeingPage.css";
import "./Physical.css";

// Import exercise GIFs
import neckStretch from "../../assets/neck-stretch.gif";
import wristRotation from "../../assets/wrist-rotation.gif";
import chairSquat from "../../assets/chair-squat.gif";

const Physical = () => {
  const [timeLeft, setTimeLeft] = useState(180);
  const [active, setActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);

  const exercises = [
    { name: "Neck Stretch", img: neckStretch },
    { name: "Wrist Rotations", img: wristRotation },
    { name: "Chair Squats", img: chairSquat },
  ];

  // Countdown timer
  useEffect(() => {
    let interval;
    if (active && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [active, timeLeft]);

  // Cycle exercises every 10 seconds
  useEffect(() => {
    let exerciseInterval;
    if (active) {
      exerciseInterval = setInterval(() => {
        setCurrentExercise((prev) => (prev + 1) % exercises.length);
      }, 10000); // switch every 10 seconds
    }
    return () => clearInterval(exerciseInterval);
  }, [active]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="menu-content">
      <h3>💪 Physical Well-Being</h3>
      <p>Do a quick stretch while the countdown runs.</p>

      <div className={`timer-card ${active ? "active" : ""}`}>
        <p className={`timer-display ${active ? "pulse" : ""}`}>{formatTime(timeLeft)}</p>
        <div className="btn-group">
          <button className="option-card small" onClick={() => setActive(true)}>
            Start
          </button>
          <button className="option-card small" onClick={() => setActive(false)}>
            Pause
          </button>
          <button
            className="option-card small"
            onClick={() => {
              setTimeLeft(180);
              setActive(false);
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Exercise GIF animation */}
      <div className="exercise-animation">
        <h4>{exercises[currentExercise].name}</h4>
        <img
          src={exercises[currentExercise].img}
          alt={exercises[currentExercise].name}
          className="exercise-gif"
        />
      </div>

      <div className="exercise-list">
        <p>Suggested Exercises:</p>
        <ul>
          <li>🙆 Neck Stretch</li>
          <li>🖐 Wrist Rotations</li>
          <li>🪑 Chair Squats</li>
        </ul>
      </div>
    </div>
  );
};

export default Physical;
