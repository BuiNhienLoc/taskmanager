// client/src/api/employeeApi.js
import axios from "axios";

// const API_URL = "http://localhost:5000/api/employees";
const API_URL = "http://127.0.0.1:5000/api/employees";

export const createEmployeeInvite = async (employeeData) => {
  const res = await axios.post(API_URL, employeeData);
  return res.data;
};

export const setupEmployeeAccount = async (setupData) => {
  const res = await axios.post(`${API_URL}/setup-account`, setupData);
  return res.data;
};

export const deleteEmployee = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

export const updateEmployee = async (id, employeeData) => {
  const res = await axios.put(`${API_URL}/${id}`, employeeData);
  return res.data;
};