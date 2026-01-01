import React, { useState } from "react";
import "./EisenhowerMatrix.css";

const quadrants = [
  { id: 0, title: "Urgent & Important", description: "Do it now" },
  { id: 1, title: "Not Urgent & Important", description: "Schedule it" },
  { id: 2, title: "Urgent & Not Important", description: "Delegate it" },
  { id: 3, title: "Not Urgent & Not Important", description: "Eliminate it" },
];

const EisenhowerMatrix = () => {
  const [tasks, setTasks] = useState([[], [], [], []]);
  const [input, setInput] = useState("");
  const [selectedQuadrant, setSelectedQuadrant] = useState(0);

  const addTask = () => {
    if (!input.trim()) return;
    const newTasks = [...tasks];
    newTasks[selectedQuadrant].push(input);
    setTasks(newTasks);
    setInput("");
  };

  const removeTask = (quadIndex, taskIndex) => {
    const newTasks = [...tasks];
    newTasks[quadIndex].splice(taskIndex, 1);
    setTasks(newTasks);
  };

  return (
    <div className="matrix-page">
      <h2>📊 Eisenhower Matrix</h2>
      <p className="subtitle">Organize your tasks by urgency and importance</p>

      {/* Input */}
      <div className="matrix-input">
        <select
          value={selectedQuadrant}
          onChange={(e) => setSelectedQuadrant(Number(e.target.value))}
        >
          {quadrants.map((q, i) => (
            <option key={i} value={i}>
              {q.title}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Add a task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
        />
        <button onClick={addTask}>Add</button>
      </div>

      {/* Quadrants */}
      <div className="matrix-grid">
        {quadrants.map((q, i) => (
          <div key={i} className="matrix-quadrant">
            <h3>{q.title}</h3>
            <p className="desc">{q.description}</p>
            <ul>
              {tasks[i].map((task, idx) => (
                <li key={idx}>
                  {task} <button onClick={() => removeTask(i, idx)}>✖</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EisenhowerMatrix;
