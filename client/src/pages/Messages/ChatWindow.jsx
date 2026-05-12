import React, { useContext, useEffect, useState } from "react";
import { Form, Input, Button, Alert, Avatar, Badge, Typography } from "antd";
import { auth } from "../../firebase";
import { socket } from "../../socket";
import { AppContext } from "./Context/AppProvider";
import Mess from "./Mess";
import "./Chatwindow.css";

function Chatwindow() {
  const context = useContext(AppContext);

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [form] = Form.useForm();

  const currentUser = context?.currentUser;
  const selectedUser = context?.selectedUser;
  const selectedUserId = context?.selectedUserId;

  useEffect(() => {
    if (!context) return;
    if (!auth.currentUser || !selectedUserId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("joinUserRoom", {
      currentUserId: auth.currentUser.uid,
      selectedUserId,
    });

    socket.on("receivePrivateMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("receivePrivateMessage");
    };
  }, [context, selectedUserId]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    if (!auth.currentUser || !selectedUserId) return;

    const messageData = {
      text: inputValue,
      from: auth.currentUser.uid,
      to: selectedUserId,
      name: currentUser?.name || "User",
      avatar: currentUser?.avatar || null,
    };

    socket.emit("sendPrivateMessage", messageData);

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

        <Typography.Text className="author">
          {selectedUser?.name}
        </Typography.Text>
      </div>

      <div className="message-list">
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