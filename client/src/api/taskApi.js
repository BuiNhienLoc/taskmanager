import axios from "axios";
import { auth } from "../firebase";

const API_URL = "http://127.0.0.1:5000/api/tasks";

const authConfig = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");
  const token = await currentUser.getIdToken();
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const createTask = async (taskData) => {
  const config = await authConfig();
  const res = await axios.post(API_URL, taskData, config);
  return res.data;
};

export const getTasks = async () => {
  const config = await authConfig();
  const res = await axios.get(API_URL, config);
  return res.data;
};

export const getEmployeeTasks = async (uid) => {
  const config = await authConfig();
  const res = await axios.get(`${API_URL}/employee/${uid}`, config);
  return res.data;
};

export const updateTask = async (id, taskData) => {
  const config = await authConfig();
  const res = await axios.put(`${API_URL}/${id}`, taskData, config);
  return res.data;
};

export const deleteTask = async (id) => {
  const config = await authConfig();
  const res = await axios.delete(`${API_URL}/${id}`, config);
  return res.data;
};