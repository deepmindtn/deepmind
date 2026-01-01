import React, { useState, useEffect } from "react";
import "./Pomodoro.css";

const Pomodoro = () => {
  const WORK_TIME = 25 * 60; // 25 minutes
  const SHORT_BREAK = 5 * 60; // 5 minutes
  const LONG_BREAK = 15 * 60; // 15 minutes

  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [active, setActive] = useState(false);
  const [sessionType, setSessionType] = useState("Work"); // Work, Short Break, Long Break
  const [pomodoroCount, setPomodoroCount] = useState(0);

  // Countdown timer
  useEffect(() => {
    let interval;
    if (active && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (active && timeLeft === 0) {
      handleSessionEnd();
    }
    return () => clearInterval(interval);
  }, [active, timeLeft]);

  const handleSessionEnd = () => {
    if (sessionType === "Work") {
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);
      if (newCount % 4 === 0) {
        setSessionType("Long Break");
        setTimeLeft(LONG_BREAK);
      } else {
        setSessionType("Short Break");
        setTimeLeft(SHORT_BREAK);
      }
    } else {
      setSessionType("Work");
      setTimeLeft(WORK_TIME);
    }
  };

  const resetTimer = () => {
    setActive(false);
    setPomodoroCount(0);
    setSessionType("Work");
    setTimeLeft(WORK_TIME);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="pomodoro-page">
      <div className="pomodoro-container">
        <h2> Pomodoro Timer</h2>
        <p className={`session-type ${sessionType.replace(" ", "-").toLowerCase()}`}>
          {sessionType}
        </p>
        <div className="timer-display">{formatTime(timeLeft)}</div>

        <div className="btn-group">
          <button onClick={() => setActive(!active)}>{active ? "Pause" : "Start"}</button>
          <button onClick={resetTimer}>Reset</button>
        </div>

        <p className="pomodoro-count">Completed Pomodoros: {pomodoroCount}</p>
      </div>
    </div>
  );
};

export default Pomodoro;
