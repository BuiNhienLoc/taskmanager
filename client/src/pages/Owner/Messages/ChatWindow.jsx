import React, { useContext, useEffect, useState, useRef } from "react";
import { Form, Input, Button, Alert, Avatar, Badge, Typography } from "antd";
import { auth, db } from "../../../firebase";
import { socket } from "../../../socket";
import { AppContext } from "./Context/AppProvider";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import Mess from "./Mess";
import "./Chatwindow.css";

function Chatwindow() {
  const context = useContext(AppContext);

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [form] = Form.useForm();


  const socketHandlerRef = useRef(null);

  const messageListRef = useRef(null);
  const messagesEndRef = useRef(null);

  const currentUser = context?.currentUser;
  const selectedUser = context?.selectedUser;
  const selectedUserId = context?.selectedUserId;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, selectedUserId]);


  useEffect(() => {
    if (!auth.currentUser || !selectedUserId) return;

    const conversationId = [auth.currentUser.uid, selectedUserId]
      .sort()
      .join("_");

    const q = query(
      collection(db, "messages", conversationId, "msgs"),
      orderBy("createdAt", "asc"),
      limit(100)
    );

    const unsub = onSnapshot(q, (snap) => {
      const loaded = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(loaded);
    });

    return () => unsub();
  }, [selectedUserId]);

  useEffect(() => {
    if (!context || !auth.currentUser || !selectedUserId) return;

    if (!socket.connected) socket.connect();

    socket.emit("joinUserRoom", {
      currentUserId: auth.currentUser.uid,
      selectedUserId,
    });

    socketHandlerRef.current = (message) => {
      if (message.from !== auth.currentUser.uid) {
        setMessages((prev) => {
          // Deduplicate by checking the last message
          const last = prev[prev.length - 1];
          if (last?.text === message.text && last?.from === message.from) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on("receivePrivateMessage", socketHandlerRef.current);

    return () => {
      socket.off("receivePrivateMessage", socketHandlerRef.current);
    };
  }, [context, selectedUserId]);

  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    if (!auth.currentUser || !selectedUserId) return;

    const conversationId = [auth.currentUser.uid, selectedUserId]
      .sort()
      .join("_");

    const messageData = {
      text: inputValue,
      from: auth.currentUser.uid,
      to: selectedUserId,
      name: currentUser?.name || "User",
      avatar: currentUser?.avatar || null,
      createdAt: serverTimestamp(),
    };

    await addDoc(
      collection(db, "messages", conversationId, "msgs"),
      messageData
    );

    socket.emit("sendPrivateMessage", {
      ...messageData,
      createdAt: new Date(),
    });

    setInputValue("");
    form.resetFields(["message"]);
  };

  if (!context) {
    return <div>Chat context is not loaded. Check AppProvider wrapping.</div>;
  }

  if (!selectedUserId) {
    return (
      <Alert
        message="Please choose a recipient"
        type="info"
        showIcon
        style={{ margin: 5 }}
      />
    );
  }

  return (
    <>
      <div className="top">
        <Badge dot status={selectedUser?.isOnline ? "success" : "error"}>
          <Avatar src={selectedUser?.avatar}>
            {selectedUser?.avatar
              ? ""
              : selectedUser?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
        </Badge>
        <Typography.Text className="author">{selectedUser?.name}</Typography.Text>
      </div>

      <div className="message-list">
        <div className="messages-spacer"></div>

        {messages.map((mes, index) => (
          <Mess
            key={index}
            text={mes.text}
            photoURL={mes.avatar}
            displayName={mes.name}
            createdAt={mes.createdAt}
            uid={mes.from}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      <Form form={form}>
        <div className="bottom">
          <Form.Item name="message">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handleSendMessage}
              placeholder="Enter message..."
              autoComplete="off"
              className="input-message"
            />
          </Form.Item>
          <Button
            type="primary"
            onClick={handleSendMessage}
            className="btn-send"
          >
            Send
          </Button>
        </div>
      </Form>
    </>
  );
}

export default Chatwindow;
