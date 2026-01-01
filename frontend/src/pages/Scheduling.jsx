import React, { useMemo, useState } from "react";
import "./Scheduling.css";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// build a 6x7 grid (Mon-first) for a given month
function buildMonthGrid(year, monthIndex /* 0=Jan */) {
  // JS getDay(): 0=Sun..6=Sat, but we want Mon-first
  const first = new Date(year, monthIndex, 1);
  const firstDow = (first.getDay() + 6) % 7; // 0..6 with 0 = Monday
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells = [];
  // days from previous month to fill leading
  for (let i = 0; i < firstDow; i++) {
    const d = new Date(year, monthIndex, -i);
    cells.unshift({ date: d, inMonth: false });
  }
  // current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, monthIndex, d), inMonth: true });
  }
  // trailing cells to make 42 cells total
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last);
    d.setDate(d.getDate() + 1);
    cells.push({ date: d, inMonth: false });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const d = new Date(last);
    d.setDate(d.getDate() + 1);
    cells.push({ date: d, inMonth: false });
  }
  return cells;
}

function fmtISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Scheduling() {
  // default to **August of the current year**
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(7); // 0=Jan, **7 = August**

  // ---- EVENTS (you can edit freely) ----
  const events = useMemo(() => {
    const y = year; // keep same year as the view
    return [
      { date: `${y}-08-01`, title: "Sent Karasek Assessment", type: "assessment" },
      { date: `${y}-08-03`, title: "One-on-one check-ins", type: "coaching" },
      { date: `${y}-08-05`, title: "Sent Maslach Assessment", type: "assessment" },
      { date: `${y}-08-07`, title: "Mindfulness micro-workshop", type: "workshop" },
      { date: `${y}-08-10`, title: "Follow-up emails (Karasek)", type: "reminder" },
      { date: `${y}-08-12`, title: "Burnout pulse survey", type: "survey" },
      { date: `${y}-08-15`, title: "Big Five Assessment", type: "assessment" },
      { date: `${y}-08-18`, title: "Manager coaching clinic", type: "coaching" },
      { date: `${y}-08-20`, title: "Leadership lunch-and-learn", type: "workshop" },
      { date: `${y}-08-22`, title: "Health webinar: Sleep & Stress", type: "workshop" },
      { date: `${y}-08-25`, title: "Team-building: ‘Deep AI’", type: "team" },
      { date: `${y}-08-27`, title: "Retrospective: Q&A on results", type: "retro" },
      { date: `${y}-08-29`, title: "Reminders: complete pending tests", type: "reminder" },
      { date: `${y}-08-31`, title: "End-of-month report draft", type: "report" },
    ];
  }, [year]);

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const monthLabel = new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const e of events) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date).push(e);
    }
    return map;
  }, [events]);

  function go(delta) {
    const m = month + delta;
    if (m < 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else if (m > 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth(m);
    }
  }

  return (
    <div className="b5-container">
      <div className="sched-header">
        <div className="sched-title">
          <Calendar size={20} />
          <h2>{monthLabel}</h2>
        </div>
        <div className="sched-actions">
          <button className="b5-btn" onClick={() => go(-1)}>
            <ArrowLeft size={18} /> Prev
          </button>
          <button
            className="b5-btn"
            onClick={() => {
              setYear(currentYear);
              setMonth(7);
            }}
          >
            Today (Aug)
          </button>
          <button className="b5-btn" onClick={() => go(1)}>
            Next <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="sched-grid">
        {WEEKDAYS.map((w) => (
          <div key={w} className="sched-weekday">
            {w}
          </div>
        ))}

        {grid.map((cell, idx) => {
          const iso = fmtISO(cell.date);
          const day = cell.date.getDate();
          const dayEvents = eventsByDay.get(iso) || [];
          return (
            <div key={idx} className={`sched-cell ${cell.inMonth ? "" : "is-out"}`}>
              <div className="sched-day">{day}</div>
              <div className="sched-events">
                {dayEvents.map((e, i) => (
                  <div key={i} className={`sched-event tag-${e.type}`} title={e.title}>
                    {e.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Simple legend */}
      <div className="sched-legend">
        <span className="sched-pill tag-assessment">Assessment</span>
        <span className="sched-pill tag-workshop">Workshop</span>
        <span className="sched-pill tag-coaching">Coaching</span>
        <span className="sched-pill tag-team">Team</span>
        <span className="sched-pill tag-survey">Survey</span>
        <span className="sched-pill tag-reminder">Reminder</span>
        <span className="sched-pill tag-retro">Retro</span>
        <span className="sched-pill tag-report">Report</span>
      </div>
    </div>
  );
}
