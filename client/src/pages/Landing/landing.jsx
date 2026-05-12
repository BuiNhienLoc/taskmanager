import { Link, useNavigate } from "react-router-dom";
import "./landing.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
        <div className="title">Welcome to Task Manager</div>
        <div className="subtitle">The number 1 solution to your task management needs.</div>
        <div className="buttons">
            <button className="employee-button" onClick={() => navigate("/employee/login")}>
                Employee Login
            </button>
            <button className="owner-button" onClick={() => navigate("/owner/login")}>
                Owner Login
            </button>
        </div>
    </div>
  );
}

export default Landing;