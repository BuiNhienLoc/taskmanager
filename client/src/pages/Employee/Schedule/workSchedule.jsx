import React, { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import "./workSchedule.css";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m} ${ampm}`;
}

function WorkSchedule() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "users"),
      where("uid", "==", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setSchedule(snap.docs[0].data().workSchedule || null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const activeDays = DAYS.filter((d) => schedule?.[d]?.enabled);

  return (
    <div className="work-schedule">
      <h2 className="ws-title">My Work Schedule</h2>

      {loading && <p className="ws-empty">Loading schedule...</p>}

      {!loading && !schedule && (
        <p className="ws-empty">No schedule assigned yet. Check with your manager.</p>
      )}

      {!loading && schedule && activeDays.length === 0 && (
        <p className="ws-empty">Your schedule has no active days yet.</p>
      )}

      {!loading && schedule && activeDays.length > 0 && (
        <div className="ws-grid">
          {DAYS.map((day) => {
            const entry = schedule[day];
            const active = entry?.enabled;
            return (
              <div key={day} className={`ws-day-card ${active ? "active" : "off"}`}>
                <div className="ws-day-name">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </div>
                {active ? (
                  <div className="ws-hours">
                    <span>{formatTime(entry.start)}</span>
                    <span className="ws-dash">–</span>
                    <span>{formatTime(entry.end)}</span>
                  </div>
                ) : (
                  <div className="ws-off-label">Day Off</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WorkSchedule;