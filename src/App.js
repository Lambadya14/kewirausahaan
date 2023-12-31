import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./containers/pages/Login/Login";
import Register from "./containers/pages/Register/Register";
import Home from "./containers/pages/Home/Home";
import NoTokenAccess from "./components/molecules/NoTokenAccess";
import Protected from "./components/molecules/Protected";
import DashBoard from "./containers/pages/Admin/DashBoard";
import HistoryUser from "./containers/pages/User/HistoryUser";
import AdminProtected from "./components/molecules/AdminProtected";
import { ToastContainer } from "react-toastify";
import Profile from "./containers/pages/Profile/Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <NoTokenAccess>
              <Login />
            </NoTokenAccess>
          }
        />
        <Route
          path="/register"
          element={
            <NoTokenAccess>
              <Register />
            </NoTokenAccess>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AdminProtected>
              <DashBoard />
            </AdminProtected>
          }
        />

        <Route
          path="/history-user"
          element={
            <Protected>
              <HistoryUser />
            </Protected>
          }
        />
        <Route
          path="/profile"
          element={
            <Protected>
              <Profile />
            </Protected>
          }
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
