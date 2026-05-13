import React, { useEffect, useState } from "react";
import { auth } from "../../../firebase";
import { getEmployeeTasks, updateTask } from "../../../api/taskApi";
import "./MyTasks.css";

import SideMenu from "../../../components/Navbar/sideMenu";
import TopBar from "../../../components/Topbar/topBar";

function MyTasks() {
  const [tasks, setTasks] = useState([]);

  const loadTasks = async () => {
    if (!auth.currentUser) return;

    const data = await getEmployeeTasks(auth.currentUser.uid);
    setTasks(data.tasks);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleStatusChange = async (taskId, status) => {
    await updateTask(taskId, { status });
    loadTasks();
  };

  return (
    <>
      <TopBar className="top-bar" />
      <SideMenu />
      <div className='dashboard-header'>
        <h1>My Tasks</h1>
      </div>
      <div className="task-page">
        
        

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
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default MyTasks;