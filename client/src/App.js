import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import EmployeeLogin from "./pages/Employee/Login/login";
import OwnerLogin from "./pages/Owner/Login/login";
import EmployeeDashboard from "./pages/Employee/Dashboard/dashboard";
import OwnerDashboard from "./pages/Owner/Dashboard/dashboard";
import UserManagement from "./pages/Owner/EmployeeManagement/UserManagement";
import SetupAccount from "./pages/Employee/SetupAccount/SetupAccount";
import Landing from "./pages/Landing/landing";
import EmMessages from "./pages/Employee/Messages/Messages";
import OwMessages from "./pages/Owner/Messages/Messages";
import TaskManagement from "./pages/Owner/TaskManager/TaskManager";
import MyTasks from "./pages/Employee/Tasks/MyTasks";


import ProtectedOwnerRoute from "./routes/protectedOwnerRoute";


// Render 1 input field for the phone number, then take that phone number, then send an SMS to that phone number with a verification code, then render another input field for the user to enter the verification code, then verify that the code is correct, and if it is correct, then render a message that says "Phone number verified successfully".
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/setup-account" element={<SetupAccount />} />
        <Route path="/employee/login" element={<EmployeeLogin />} />
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/tasks" element={<MyTasks />} />
        <Route path="/employee/messages" element={
            <EmMessages />
        } />
        <Route path="/owner/login" element={<OwnerLogin />} />
        <Route path="/owner/dashboard" element={
          <ProtectedOwnerRoute>
            <OwnerDashboard />
          </ProtectedOwnerRoute>
        } />
        <Route path="/owner/user-management" element={
          <ProtectedOwnerRoute>
            <UserManagement />
          </ProtectedOwnerRoute>
        } />
        <Route path="/owner/messages" element={
          <ProtectedOwnerRoute>
            <OwMessages />
          </ProtectedOwnerRoute>
        } />
        <Route
          path="/owner/tasks"
          element={
            <ProtectedOwnerRoute>
              <TaskManagement />
            </ProtectedOwnerRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
