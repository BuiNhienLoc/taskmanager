import React, { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "../../../api/taskApi";

import "./TaskManager.css";

import SideMenu from "../../../components/AdminNavbar/sideMenu";
import TopBar from "../../../components/Topbar/topBar";

function TaskManagement() {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [taskError, setTaskError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "employee"));
    const unsub = onSnapshot(q, (snap) => {
      setEmployees(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const loadTasks = async () => {
    try {
      setTaskError("");
      const data = await getTasks();
      setTasks(data?.tasks ?? []);
    } catch (e) {
      setTaskError("Could not load tasks. Please check your connection.");
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!title.trim() || !assignedTo) {
      setTaskError("Please fill in a title and select an employee.");
      return;
    }

    try {
      setSubmitting(true);
      setTaskError("");
      const employee = employees.find((emp) => emp.uid === assignedTo);

      await createTask({
        title,
        description,
        assignedTo,
        assignedToName: employee?.name || "",
        createdBy: auth.currentUser.uid,
        priority,
        dueDate,
      });

      setTitle("");
      setDescription("");
      setAssignedTo("");
      setPriority("medium");
      setDueDate("");

      await loadTasks();
    } catch (e) {
      setTaskError("Failed to create task. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    if (updatingId) return;
    try {
      setUpdatingId(taskId);
      await updateTask(taskId, { status });
      await loadTasks();
    } catch (e) {
      setTaskError("Failed to update task status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
      await loadTasks();
    } catch (e) {
      setTaskError("Failed to delete task.");
    }
  };

  return (
    <>
      <TopBar />
      <SideMenu />
      <div className="task-page">
        <div className='dashboard-header'>
          <h1>Task Management</h1>
        </div>

        {taskError && (
          <p style={{ color: "red", marginBottom: 16 }}>{taskError}</p>
        )}

        <div className="task-layout">
          <form onSubmit={handleCreateTask} className="task-form">
            <input
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              required
            >
              <option value="">Assign to employee</option>
              {employees.map((employee) => (
                <option value={employee.uid} key={employee.uid}>
                  {employee.name}
                </option>
              ))}
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Task"}
            </button>
          </form>

          <div className="task-list">
            {loadingTasks && (
              <p style={{ color: "#888" }}>Loading tasks...</p>
            )}
            {!loadingTasks && tasks.length === 0 && (
              <p style={{ color: "#888" }}>No tasks yet. Create one to get started.</p>
            )}
            {tasks.map((task) => (
              <div className="task-card" key={task.id}>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p>Assigned to: {task.assignedToName}</p>
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

                <button onClick={() => handleDelete(task.id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default TaskManagement;