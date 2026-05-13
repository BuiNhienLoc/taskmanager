import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import { auth, db, logout } from "../../../firebase";
import { query, collection, getDocs, where } from "firebase/firestore";
import icon from '../../../components/assets/icon.png';
import { GiChart } from 'react-icons/gi';
 import { HiOutlineUserAdd } from 'react-icons/hi'
import { RiMessage2Line } from 'react-icons/ri'
import { AiOutlineUnorderedList } from 'react-icons/ai';
import { CgImport } from 'react-icons/cg';
 import { TbReportMoney } from 'react-icons/tb'
import { Link } from "react-router-dom";

import AdminSideMenu from "../../../components/AdminNavbar/sideMenu";
import TopBar from "../../../components/Topbar/topBar";
import Slider from "../../../components/Slider/slider";

function Dashboard() {
  const [user, loading, error] = useAuthState(auth);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const dashboardItems = [
    {
      title: "Manage accounts",
      description: "Checkout and manage your accounts.",
      icon: <AiOutlineUnorderedList />,
      path: "/owner/user-management",
    },
    {
      title: "Message",
      description: "Contact your employees.",
      icon: <RiMessage2Line />,
      path: "/employee/messages",
    },
    {
      title: "Tasks",
      description: "Assign tasks to your employees.",
      icon: <GiChart />,
      path: "/report/overview",
    },
  ];

  const fetchUserName = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));
      const doc = await getDocs(q);
      const data = doc.docs[0].data();
      setName(data.name);
      setRole(data.role);
      console.log("User role:", data.role);
    } catch (error) {
      console.log(error);
    }
  };

  
   useEffect(() => {
     if (loading) return;
     if (!user) return navigate("/");
    //  if (role != "owner") return navigate("/employee/dashboard");
     fetchUserName();
   }, [user, loading]);
  return (
     <>
     <TopBar className="top-bar" />
      <AdminSideMenu />

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
     {/* <TopBar></TopBar>
       <div className='dashboard_header'>
         <h1>Dashboard</h1>
       </div>
       <Slider />
       <Link to="/owner/messages">
         <div className='container2'>
           <div className='header'>Message</div>
           <RiMessage2Line className='icon' />
           <div className='description'>
             Contact employees.
           </div>
         </div>
       </Link>
       <Link to="/owner/user-management">
         <div className='container1'>
           <div className='header'>Manage accounts</div>
           <AiOutlineUnorderedList className="icon" />
           <div className='description'>
             Checkout branches and manage their accounts.
           </div>
         </div>
       </Link>
       <Link to="/storage">
         <div className='container3'>
           <div className='header'>Import</div>
           <CgImport className="icon" />
           <div className='description'>
             Supplies can get low sometimes.
             <div />
             Import more here.
           </div>
         </div>
       </Link> */}
       {/* <Link to="/report/details">
         <div className='container4'>
           <div className='header'>Detail Report</div> */}
           {/* <TbReportMoney className="icon" /> */}
           {/* <div className='description'>
             See how branches are doing.
           </div>
         </div>
       </Link> */}
       {/* <AdminSideMenu></AdminSideMenu> */}
    </>
  );
}
export default Dashboard;
