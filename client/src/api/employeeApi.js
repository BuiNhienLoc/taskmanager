import axios from "axios";
import { auth } from "../firebase";

const API_URL = "http://127.0.0.1:5000/api/employees";

const authConfig = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");
  const token = await currentUser.getIdToken();
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const setupEmployeeAccount = async (setupData) => {
  const res = await axios.post(`${API_URL}/setup-account`, setupData);
  return res.data;
};

export const createEmployeeInvite = async (employeeData) => {
  const config = await authConfig();
  const res = await axios.post(API_URL, employeeData, config);
  return res.data;
};

export const deleteEmployee = async (id) => {
  const config = await authConfig();
  const res = await axios.delete(`${API_URL}/${id}`, config);
  return res.data;
};

export const updateEmployee = async (id, employeeData) => {
  const config = await authConfig();
  const res = await axios.put(`${API_URL}/${id}`, employeeData, config);
  return res.data;
};