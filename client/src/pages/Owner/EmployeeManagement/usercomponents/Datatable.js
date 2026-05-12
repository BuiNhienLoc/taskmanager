import React, { useContext, useEffect, useState } from "react";
import "./Datatable.css";
import { DataGrid } from "@mui/x-data-grid";
import { userColumns } from "./datatablesource";
import { db } from "../../../../firebase";
import {
  deleteEmployee,
  updateEmployee,
} from "../../../../api/employeeApi";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { UserContext } from "../UserContext/UserContextProvider";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import MemberCard from "../MemberCard";

function Datatable() {
  const [data, setData] = useState([]);
  const [isUpdateVisible, setIsUpdateVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [editRole, setEditRole] = useState("");

  const {
    userName,
    avatar,
    setUserAvatar,
    email,
    setUserEmail,
    role,
    setRole,
    setUserId,
    name,
    setName,
    isUserInfoVisible,
    setIsUserInfoVisible,
    phoneNumber,
    setPhoneNumber,
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
          setData((prevData) => prevData.filter((item) => item.id !== id));
        } catch (err) {
          console.log("Delete employee error:", err);
        }
      },

      onCancel() {
        console.log("Cancel");
      },
    });
  };

  useEffect(() => {
    if (userName) {
      const unsub = onSnapshot(
        query(collection(db, "users"), where("name", "==", userName)),
        (snapShot) => {
          const list = [];
          snapShot.docs.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() });
          });
          setData(list);
        },
        (error) => {
          console.log(error);
        }
      );

      return () => unsub();
    }

    const unsub = onSnapshot(
      collection(db, "users"),
      (snapShot) => {
        const list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setData(list);
      },
      (error) => {
        console.log(error);
      }
    );

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
      console.log("Update employee error:", err);
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 260,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <div
              className="viewButton"
              onClick={() => handleViewClick(params.row)}
            >
              View
            </div>

            <div
              className="viewButton"
              onClick={() => handleUpdateClick(params.row)}
            >
              Update
            </div>

            <div
              className="deleteButton"
              onClick={() => showConfirm(params.row.id)}
            >
              Delete
            </div>
          </div>
        );
      },
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
          <MemberCard
            avatar={avatar}
            role={role}
            name={name}
            email={email}
            phoneNumber={phoneNumber}
          />
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
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />
          </div>

          <div>
            <label>Phone Number</label>
            <input
              type="tel"
              value={editPhoneNumber}
              onChange={(e) => setEditPhoneNumber(e.target.value)}
            />
          </div>

          <div>
            <label>Role</label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
            >
              <option value="employee">Employee</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Datatable;