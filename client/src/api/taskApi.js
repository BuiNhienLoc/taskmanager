import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api/tasks";

export const createTask = async (taskData) => {
  const res = await axios.post(API_URL, taskData);
  return res.data;
};

export const getTasks = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const getEmployeeTasks = async (uid) => {
  const res = await axios.get(`${API_URL}/employee/${uid}`);
  return res.data;
};

export const updateTask = async (id, taskData) => {
  const res = await axios.put(`${API_URL}/${id}`, taskData);
  return res.data;
};

export const deleteTask = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};