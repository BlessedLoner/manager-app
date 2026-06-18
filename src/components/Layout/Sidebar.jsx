// src/components/Layout/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

// Define navigation items with role requirements
const navigationItems = [
  {
    name: "Dashboard",
    href: "/manager/dashboard",
    icon: "📊",
    roles: ["admin", "manager", "viewer"],
  },
  {
    name: "Conversations",
    href: "/manager/conversations",
    icon: "💬",
    roles: ["admin", "manager", "viewer"],
  },
  {
    name: "Message Analytics",
    href: "/manager/message-analytics",
    icon: "📨",
    roles: ["admin", "manager"],
  }, // NEW
  { name: "Managers", href: "/manager/managers", icon: "👨‍💼", roles: ["admin"] },
  {
    name: "Operators",
    href: "/manager/operators",
    icon: "👥",
    roles: ["admin", "manager"],
  },
  { name: "Reports", href: "/manager/reports", icon: "🚨", roles: ["admin"] },
  {
    name: "Blocked Profiles",
    href: "/manager/blocked-profiles",
    icon: "🚫",
    roles: ["admin"],
  },
  { name: "Settings", href: "/manager/settings", icon: "⚙️", roles: ["admin"] },
];

export default function Sidebar({ isOpen, onClose }) {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current logged-in manager from localStorage
    const manager = JSON.parse(localStorage.getItem("manager") || "{}");
    setUserRole(manager.role || "viewer");
    setLoading(false);
  }, []);

  // Filter navigation items based on user role
  const filteredNavigation = navigationItems.filter((item) =>
    item.roles.includes(userRole),
  );

  if (loading) {
    return null;
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary">Manager Portal</h1>
          <p className="text-xs text-gray-500 mt-1 capitalize">
            Role: {userRole}
          </p>
        </div>
        <nav className="p-4 space-y-1">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-900 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}
