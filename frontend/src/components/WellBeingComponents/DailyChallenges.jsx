import React, { useState } from "react";
import "./DailyChallenges.css";

const DailyChallenges = () => {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([...tasks, { text: input, done: false }]);
    setInput("");
  };

  const toggleTask = (index) => {
    setTasks(tasks.map((t, i) => (i === index ? { ...t, done: !t.done } : t)));
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  return (
    <div className="daily-challenges-page">
      <div className="challenges-container">
        <header className="header">
          <h2>📆 Daily Challenges</h2>
          <p>Complete small wellness tasks daily to stay on track.</p>
        </header>

        {/* Input Section */}
        <div className="input-section">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a challenge..."
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <button onClick={addTask}>Add</button>
        </div>

        {/* Task List */}
        <ul className="task-list">
          {tasks.map((task, i) => (
            <li key={i} className={`task-item ${task.done ? "done" : ""}`}>
              <label>
                <input type="checkbox" checked={task.done} onChange={() => toggleTask(i)} />
                <span>{task.text}</span>
              </label>
              <button onClick={() => removeTask(i)}>✖</button>
            </li>
          ))}
        </ul>

        {/* Footer Encouragement */}
        {tasks.length > 0 && (
          <p className="footer-note">
            Keep going! Small steps every day lead to better wellness 🌿
          </p>
        )}
      </div>
    </div>
  );
};

export default DailyChallenges;
