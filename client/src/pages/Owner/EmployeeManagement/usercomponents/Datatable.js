import React, { useContext, useEffect, useState } from "react";
import "./Datatable.css";
import { DataGrid } from "@mui/x-data-grid";
import { userColumns } from "./datatablesource";
import { db } from "../../../../firebase";
import { deleteEmployee, updateEmployee } from "../../../../api/employeeApi";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { UserContext } from "../UserContext/UserContextProvider";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import MemberCard from "../MemberCard";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const DEFAULT_SCHEDULE = DAYS.reduce((acc, day) => {
  acc[day] = {
    enabled: ["monday", "tuesday", "wednesday", "thursday", "friday"].includes(day),
    start: "09:00",
    end: "17:00",
  };
  return acc;
}, {});

function Datatable() {
  const [data, setData] = useState([]);

  const [isUpdateVisible, setIsUpdateVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [editRole, setEditRole] = useState("");

  const [isScheduleVisible, setIsScheduleVisible] = useState(false);
  const [scheduleEmployee, setScheduleEmployee] = useState(null);
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  const {
    userName, avatar, setUserAvatar, email, setUserEmail,
    role, setRole, setUserId, name, setName,
    isUserInfoVisible, setIsUserInfoVisible,
    phoneNumber, setPhoneNumber,
  } = useContext(UserContext);

  const { confirm } = Modal;

  const showConfirm = async (id) => {
    confirm({
      title: "Do you want to delete this user?",
      icon: <ExclamationCircleOutlined />,
      content: "The information of the user will be removed permanently",
      async onOk() {
        try {
          await deleteEmployee(id);
          setData((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
          console.error("Delete employee error:", err);
        }
      },
    });
  };

  useEffect(() => {
    const q = userName
      ? query(collection(db, "users"), where("name", "==", userName))
      : collection(db, "users");

    const unsub = onSnapshot(q, (snap) => {
      setData(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [userName]);

  const handleViewClick = (user) => {
    setIsUserInfoVisible(true);
    setName(user.name);
    setUserEmail(user.email);
    setUserAvatar(user.avatar || null);
    setUserId(user.uid);
    setRole(user.role);
    setPhoneNumber(user.phoneNumber);
  };

  const handleUpdateClick = (user) => {
    setSelectedEmployee(user);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditPhoneNumber(user.phoneNumber || "");
    setEditRole(user.role || "employee");
    setIsUpdateVisible(true);
  };

  const handleUpdateSubmit = async () => {
    try {
      if (!selectedEmployee) return;
      await updateEmployee(selectedEmployee.id, {
        name: editName,
        email: editEmail,
        phoneNumber: editPhoneNumber,
        role: editRole,
      });
      setIsUpdateVisible(false);
      setSelectedEmployee(null);
    } catch (err) {
      console.error("Update employee error:", err);
    }
  };


  const handleScheduleClick = async (user) => {
    setScheduleEmployee(user);

    // Load any existing schedule from Firestore
    const snap = await getDoc(doc(db, "users", user.id));
    const existing = snap.data()?.workSchedule;
    setSchedule(existing ? { ...DEFAULT_SCHEDULE, ...existing } : { ...DEFAULT_SCHEDULE });
    setIsScheduleVisible(true);
  };

  const handleScheduleToggle = (day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleScheduleSave = async () => {
    if (!scheduleEmployee) return;
    try {
      setScheduleSaving(true);
      await updateDoc(doc(db, "users", scheduleEmployee.id), {
        workSchedule: schedule,
      });
      setIsScheduleVisible(false);
      setScheduleEmployee(null);
    } catch (err) {
      console.error("Save schedule error:", err);
    } finally {
      setScheduleSaving(false);
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 340,
      renderCell: (params) => (
        <div className="cellAction">
          <div className="viewButton" onClick={() => handleViewClick(params.row)}>
            View
          </div>
          <div className="viewButton" onClick={() => handleUpdateClick(params.row)}>
            Update
          </div>
          <div className="scheduleButton" onClick={() => handleScheduleClick(params.row)}>
            Schedule
          </div>
          <div className="deleteButton" onClick={() => showConfirm(params.row.id)}>
            Delete
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="datatable">
      <DataGrid
        className="datagrid"
        rows={data}
        columns={userColumns.concat(actionColumn)}
        pageSize={9}
        rowsPerPageOptions={[9]}
        checkboxSelection
      />

      <div className="card_user_info">
        {isUserInfoVisible && (
          <MemberCard avatar={avatar} role={role} name={name} email={email} phoneNumber={phoneNumber} />
        )}
      </div>

      <Modal
        title="Update User"
        open={isUpdateVisible}
        onOk={handleUpdateSubmit}
        onCancel={() => setIsUpdateVisible(false)}
      >
        <div className="create_form">
          <div>
            <label>Name</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
          </div>
          <div>
            <label>Phone Number</label>
            <input type="tel" value={editPhoneNumber} onChange={(e) => setEditPhoneNumber(e.target.value)} />
          </div>
          <div>
            <label>Role</label>
            <select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
              <option value="employee">Employee</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        title={`Work Schedule — ${scheduleEmployee?.name || ""}`}
        open={isScheduleVisible}
        onOk={handleScheduleSave}
        onCancel={() => setIsScheduleVisible(false)}
        confirmLoading={scheduleSaving}
        okText="Save Schedule"
        width={520}
      >
        <div className="schedule-form">
          {DAYS.map((day) => (
            <div key={day} className="schedule-row">
              <label className="schedule-day-label">
                <input
                  type="checkbox"
                  checked={schedule[day]?.enabled ?? false}
                  onChange={() => handleScheduleToggle(day)}
                  style={{ marginRight: 8 }}
                />
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </label>

              <div className={`schedule-times ${!schedule[day]?.enabled ? "disabled" : ""}`}>
                <input
                  type="time"
                  value={schedule[day]?.start ?? "09:00"}
                  disabled={!schedule[day]?.enabled}
                  onChange={(e) => handleTimeChange(day, "start", e.target.value)}
                  className="schedule-time-input"
                />
                <span style={{ margin: "0 8px", color: "#666" }}>to</span>
                <input
                  type="time"
                  value={schedule[day]?.end ?? "17:00"}
                  disabled={!schedule[day]?.enabled}
                  onChange={(e) => handleTimeChange(day, "end", e.target.value)}
                  className="schedule-time-input"
                />
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

export default Datatable;