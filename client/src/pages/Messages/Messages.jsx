import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { query, collection, getDocs, where } from "firebase/firestore";

import SideMenu from "../../components/Navbar/sideMenu";
import TopBar from "../../components/Topbar/topBar";
import AppProvider from "./Context/AppProvider";
import UserList from "./UserList";
import ChatWindow from "./ChatWindow";
import UserInfo from "./UserInfo";

import "./Messages.css";

function Messages() {
  const [user, loading] = useAuthState(auth);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const fetchUserName = async () => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user?.uid));
      const snap = await getDocs(q);

      if (!snap.empty) {
        setName(snap.docs[0].data().name);
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

      <div className='messages_header'>
        <h1>Messages</h1>
      </div>

      <AppProvider>
        <div className="grid_container">
          <div className="item1">
            <SideMenu />
          </div>

          <div className="item2">
            <UserList />
          </div>

            <div className="item3">
              <ChatWindow />
            </div>
          

          <div className="item4">
            <UserInfo />
          </div>
        </div>
      </AppProvider>
    </>
  );
}

export default Messages;