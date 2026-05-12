import axios from "axios";

// const API_URL = "http://localhost:5000/api/auth";
const API_URL = "http://127.0.0.1:5000/api/auth";

export const checkOwnerPhone = async (phoneNumber) => {
  const normalizedPhoneNumber = phoneNumber.replace(/[^\d+]/g, "");

  const res = await axios.post(`${API_URL}/check-owner-phone`, {
    phoneNumber: normalizedPhoneNumber,
  });

  return res.data;
};