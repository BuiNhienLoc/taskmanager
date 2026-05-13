import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate, Link } from "react-router-dom";
import "./dashboard.css";
import { auth, db } from "../../../firebase";
import { query, collection, getDocs, where } from "firebase/firestore";

import { GiHealthNormal, GiChart } from "react-icons/gi";
import { TbReportMoney } from "react-icons/tb";
import { RiMessage2Line } from "react-icons/ri";

import SideMenu from "../../../components/Navbar/sideMenu";
import TopBar from "../../../components/Topbar/topBar";
import Slider from "../../../components/Slider/slider";

function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const dashboardItems = [
    // {
    //   title: "Storage",
    //   description: "Check what's still in stock.",
    //   icon: <GiHealthNormal />,
    //   path: "/storage",
    // },
    {
      title: "Message",
      description: "Having trouble? Ask your colleague for help.",
      icon: <RiMessage2Line />,
      path: "/employee/messages",
    },
    // {
    //   title: "Detail Report",
    //   description: "Get daily detail report here.",
    //   icon: <TbReportMoney />,
    //   path: "/report/details",
    // },
    {
      title: "Tasks",
      description: "Check your assigned tasks and update their status.",
      icon: <GiChart />,
      path: "/employee/tasks",
    },
  ];

  const fetchUserName = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const data = snap.docs[0].data();
        setName(data.name);
        setRole(data.role);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) return navigate("/");
    fetchUserName();
  }, [user, loading]);

  return (
    <>
      <TopBar className="top-bar" />
      <SideMenu />

      <main className="dashboard-page">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
        </div>

        <Slider />

        <div className="dashboard-grid">
          {dashboardItems.map((item) => (
            <Link to={item.path} className="dashboard-card" key={item.title}>
              <div className="dashboard-card-icon">{item.icon}</div>

              <div className="dashboard-card-content">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

export default Dashboard;