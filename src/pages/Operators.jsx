// src/pages/Operators.jsx
import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";

export default function Operators() {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOperator, setEditingOperator] = useState(null);
  const [currentManager, setCurrentManager] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    operator_type: "regular",
    role: "operator",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ NEW: search state
  const [operatorTypeFilter, setOperatorTypeFilter] = useState("all");
  const limit = 20;

  // Get current logged-in manager
  useEffect(() => {
    const manager = JSON.parse(localStorage.getItem("manager") || "{}");
    setCurrentManager(manager);
  }, []);

  const userRole = currentManager?.role;

  // ✅ Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    fetchOperators();
  }, [currentPage, searchTerm, operatorTypeFilter]); // ✅ Add operatorTypeFilter here

  // const fetchOperators = async () => {
  //   setLoading(true);
  //   try {
  //     // ✅ Add search term to API call
  //     const params = new URLSearchParams({
  //       page: currentPage,
  //       limit: limit,
  //     });
  //     if (searchTerm) {
  //       params.append("search", searchTerm);
  //     }

  //     const res = await fetch(
  //       `http://localhost:4000/manager/operators?${params.toString()}`,
  //     );
  //     const data = await res.json();
  //     if (res.ok) {
  //       setOperators(data.operators || []);
  //       setTotalPages(data.totalPages || 1);
  //       setTotal(data.total || 0);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching operators:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchOperators = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
      });
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      if (operatorTypeFilter && operatorTypeFilter !== "all") {
        params.append("operator_type", operatorTypeFilter);
      }

      const res = await fetch(
        `https://operator-api-production-de23.up.railway.app/manager/operators?${params.toString()}`,
      );
      const data = await res.json();
      if (res.ok) {
        setOperators(data.operators || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Error fetching operators:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("📤 Submitting operator:", {
      ...formData,
      password: "***HIDDEN***",
    });

    if (userRole !== "admin") {
      alert("Only admins can create or edit operators");
      return;
    }

    try {
      const url = editingOperator
        ? `https://operator-api-production-de23.up.railway.app/manager/operators/${editingOperator.id}`
        : `https://operator-api-production-de23.up.railway.app/manager/operators`;

      const method = editingOperator ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-Manager-Id": currentManager?.id,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingOperator(null);
        setFormData({
          username: "",
          email: "",
          full_name: "",
          password: "",
          operator_type: "regular",
          role: "operator",
        });
        fetchOperators();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save operator");
      }
    } catch (err) {
      console.error("Error saving operator:", err);
      alert("Error saving operator");
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    if (userRole !== "admin") {
      alert("Only admins can activate or deactivate operators");
      return;
    }

    try {
      const res = await fetch(
        `https://operator-api-production-de23.up.railway.app/manager/operators/${id}/toggle-active`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: !currentStatus }),
        },
      );

      if (res.ok) {
        fetchOperators();
      }
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (userRole !== "admin") {
      alert("Only admins can delete operators");
      return;
    }

    if (!confirm("Are you sure you want to delete this operator?")) return;

    try {
      const res = await fetch(
        `https://operator-api-production-de23.up.railway.app/manager/operators/${id}`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        fetchOperators();
      }
    } catch (err) {
      console.error("Error deleting operator:", err);
    }
  };

  // Check permissions
  const canEdit = userRole === "admin";
  const canDelete = userRole === "admin";
  const canBlock = userRole === "admin";
  const canAdd = userRole === "admin";

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Operators</h1>
            <p className="text-gray-500 mt-1">Manage operator accounts</p>
            {userRole && (
              <p className="text-sm text-gray-400 mt-1">
                Your role:{" "}
                <span className="capitalize font-medium">{userRole}</span>
              </p>
            )}
          </div>
          {canAdd && (
            <button
              onClick={() => {
                setEditingOperator(null);
                setFormData({
                  username: "",
                  email: "",
                  full_name: "",
                  password: "",
                  operator_type: "regular",
                  role: "operator",
                });
                setShowModal(true);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Operator
            </button>
          )}
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search Input */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by username, email, or full name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* ✅ Operator Type Filter Dropdown */}
            <select
              value={operatorTypeFilter}
              onChange={(e) => {
                setOperatorTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Operators</option>
              <option value="regular">Regular Operators</option>
              <option value="poke">Poke Operators</option>
              <option value="stopped">Stopped Operators</option>
            </select>

            {/* Search Button */}
            <button
              onClick={() => fetchOperators()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <svg
                className="w-6 h-6 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Clear Button */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <p className="text-gray-600">
            Total Operators: <span className="font-semibold">{total}</span>
          </p>
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-1">
              Showing results for: "{searchTerm}"
            </p>
          )}
          {operatorTypeFilter !== "all" && (
            <p className="text-sm text-gray-500 mt-1">
              Filtered by:{" "}
              {operatorTypeFilter === "regular"
                ? "Regular"
                : operatorTypeFilter === "poke"
                  ? "Poke"
                  : "Stopped"}{" "}
              Operators
            </p>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Username
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Full Name
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Email
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Role
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Created
                  </th>
                  {canEdit && (
                    <th className="text-left p-4 font-semibold text-gray-600">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={canEdit ? 7 : 6} className="text-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </td>
                  </tr>
                ) : operators.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canEdit ? 7 : 6}
                      className="text-center p-8 text-gray-500"
                    >
                      {searchTerm
                        ? "No operators found matching your search"
                        : "No operators found"}
                    </td>
                  </tr>
                ) : (
                  operators.map((op) => (
                    <tr key={op.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">
                        {op.username}
                      </td>
                      <td className="p-4 text-gray-600">
                        {op.full_name || "-"}
                      </td>
                      <td className="p-4 text-gray-600">{op.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            op.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : op.role === "manager"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {op.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            op.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {op.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(op.created_at).toLocaleDateString()}
                      </td>
                      {canEdit && (
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingOperator(op);
                                setFormData({
                                  username: op.username,
                                  email: op.email,
                                  full_name: op.full_name || "",
                                  password: "",
                                  role: op.role,
                                });
                                setShowModal(true);
                              }}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              Edit
                            </button>
                            {canBlock && (
                              <button
                                onClick={() =>
                                  handleToggleActive(op.id, op.is_active)
                                }
                                className={
                                  op.is_active
                                    ? "text-yellow-500 hover:text-yellow-700"
                                    : "text-green-500 hover:text-green-700"
                                }
                              >
                                {op.is_active ? "Deactivate" : "Activate"}
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(op.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal - Only show if admin */}
      {showModal && canAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingOperator ? "Edit Operator" : "Add Operator"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingOperator
                    ? "New Password (leave empty to keep)"
                    : "Password *"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={!editingOperator}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {/* Operator Type - What queue they work from */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operator Type
                </label>
                <select
                  value={formData.operator_type}
                  onChange={(e) =>
                    setFormData({ ...formData, operator_type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="regular">
                    Regular (Reply to user messages)
                  </option>
                  <option value="poke">
                    Poke (Send first messages to new users)
                  </option>
                  <option value="stopped">
                    Stopped (Re-engage inactive users)
                  </option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Determines which message queue this operator works from
                </p>
              </div>

              {/* Permission Role - Hidden or fixed value */}
              <input type="hidden" name="role" value="operator" />
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingOperator ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
