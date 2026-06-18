// src/App.jsx (Manager App)
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ManagerLogin from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Conversations from "./pages/Conversations";
import Operators from "./pages/Operators";
import Managers from "./pages/Managers";
import Reports from "./pages/Reports";
import BlockedProfiles from "./pages/BlockedProfiles";
import MessageAnalytics from "./pages/MessageAnalytics";

// Protected route wrapper
function ProtectedRoute({ children }) {
  const manager = localStorage.getItem("manager");
  if (!manager) {
    return <Navigate to="/manager/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/manager/login" element={<ManagerLogin />} />
        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/conversations"
          element={
            <ProtectedRoute>
              <Conversations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/message-analytics"
          element={
            <ProtectedRoute>
              {" "}
              <MessageAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/operators"
          element={
            <ProtectedRoute>
              <Operators />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/managers"
          element={
            <ProtectedRoute>
              <Managers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/blocked-profiles"
          element={
            <ProtectedRoute>
              <BlockedProfiles />
            </ProtectedRoute>
          }
        />
        <Route path="/manager" element={<Navigate to="/manager/dashboard" />} />
        <Route path="*" element={<Navigate to="/manager" />} />
      </Routes>
    </BrowserRouter>
  );
}
