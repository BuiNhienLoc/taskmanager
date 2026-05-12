import React, { useContext, useState } from "react";
import { Modal } from "antd";
import { UserContext } from "./UserContext/UserContextProvider";
import { createEmployeeInvite } from "../../../api/employeeApi";

function AddUsersModal() {
  const { isAddUsersVisible, setIsAddUsersVisible } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("employee");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail("");
    setName("");
    setPhoneNumber("");
    setRole("employee");
  };

  const handleOk = async () => {
    try {
        setLoading(true);

        console.log("Creating employee:", {
        name,
        email,
        phoneNumber,
        role,
        });

        const result = await createEmployeeInvite({
        name,
        email,
        phoneNumber,
        role,
        });

        console.log("Employee create result:", result);

        resetForm();
        setIsAddUsersVisible(false);
    } catch (err) {
        console.error("Failed to create employee invite:", err.response?.data || err);
    } finally {
        setLoading(false);
    }
    };

  const handleCancel = () => {
    resetForm();
    setIsAddUsersVisible(false);
  };

  return (
    <Modal
      title="Add Employee"
      open={isAddUsersVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
    >
      <form id="AddUserForm" className="create_form">
        <div>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter employee name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter employee email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="employee">Employee</option>
            <option value="owner">Owner</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}

export default AddUsersModal;