// src/components/Layout/Layout.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inactivityTimerRef = useRef(null);
  const [manager, setManager] = useState(null);
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  useEffect(() => {
    const managerData = localStorage.getItem("manager");
    if (!managerData) {
      navigate("/manager/login");
      return;
    }
    setManager(JSON.parse(managerData));
  }, []);

  // Check if account is still active (for deactivation)
  const checkIfActive = async () => {
    const managerData = localStorage.getItem("manager");
    if (!managerData) return;

    const manager = JSON.parse(managerData);

    try {
      const { data, error } = await supabase
        .from("managers")
        .select("is_active")
        .eq("id", manager.id)
        .single();

      if (error) throw error;

      if (!data?.is_active) {
        alert("Your account has been deactivated. Please contact support.");
        localStorage.removeItem("manager");
        navigate("/manager/login");
      }
    } catch (err) {
      console.error("Error checking account status:", err);
    }
  };

  // Inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      console.log("⏰ Inactivity timeout - logging out");
      alert("You have been logged out due to 30 minutes of inactivity.");
      localStorage.removeItem("manager");
      navigate("/manager/login");
    }, INACTIVITY_TIMEOUT);
  };

  const handleUserActivity = () => {
    resetInactivityTimer();
  };

  useEffect(() => {
    if (!manager) return;

    // Start inactivity timer
    resetInactivityTimer();

    // Check account status every 30 seconds
    const statusCheckInterval = setInterval(() => {
      checkIfActive();
    }, 30000);

    // Track user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      clearInterval(statusCheckInterval);
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [manager]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="pt-16">{children}</main>
      </div>
    </div>
  );
}

// // src/components/Layout/Layout.jsx (if you need to pass role from parent)
// import { useState, useEffect } from "react";
// import Sidebar from "./Sidebar";
// import Header from "./Header";

// export default function Layout({ children }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
//       <div className="lg:pl-64">
//         <Header onMenuClick={() => setSidebarOpen(true)} />
//         <main className="pt-16">{children}</main>
//       </div>
//     </div>
//   );
// }
