import React, { useEffect, useState } from "react";
import { auth } from "../../../firebase";
import { getEmployeeTasks, updateTask } from "../../../api/taskApi";
import "./MyTasks.css";
import WorkSchedule from "../Schedule/workSchedule";

import SideMenu from "../../../components/Navbar/sideMenu";
import TopBar from "../../../components/Topbar/topBar";

function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadTasks = async () => {
    if (!auth.currentUser) return;
    try {
      setError("");
      const data = await getEmployeeTasks(auth.currentUser.uid);
      setTasks(data?.tasks ?? []);
    } catch (e) {
      setError("Could not load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleStatusChange = async (taskId, status) => {
    if (updatingId) return; // prevent double-submit
    try {
      setUpdatingId(taskId);
      await updateTask(taskId, { status });
      await loadTasks();
    } catch (e) {
      setError("Failed to update task status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <TopBar className="top-bar" />
      <SideMenu />
      <div className='dashboard-header'>
        <h1>My Tasks</h1>
      </div>
      <div className="task-page">
        {loading && <p style={{ color: "#888" }}>Loading tasks...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && tasks.length === 0 && !error && (
          <p style={{ color: "#888", marginTop: 24 }}>
            No tasks assigned to you yet.
          </p>
        )}

        <div className="task-list">
          {tasks.map((task) => (
            <div className="task-card" key={task.id}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Priority: {task.priority}</p>
              <p>Status: {task.status}</p>
              <p>Due: {task.dueDate || "No due date"}</p>

              <select
                value={task.status}
                disabled={updatingId === task.id}
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          ))}
        </div>
        <WorkSchedule />
      </div>
    </>
  );
}

export default MyTasks;