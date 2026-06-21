// src/pages/Reports.jsx
import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import BlockedUsersModal from "../components/BlockedUsersModal";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const limit = 20;

  const [currentManager, setCurrentManager] = useState(null);

  useEffect(() => {
    const manager = JSON.parse(localStorage.getItem("manager") || "{}");
    setCurrentManager(manager);
  }, []);

  useEffect(() => {
    fetchReports();
  }, [statusFilter, currentPage]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://operator-api-production-de23.up.railway.app/manager/reports?status=${statusFilter}&page=${currentPage}&limit=${limit}`,
      );
      const data = await res.json();
      if (res.ok) {
        setReports(data.reports || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (updating) return;

    setUpdating(true);
    try {
      const res = await fetch(
        `https://operator-api-production-de23.up.railway.app/manager/reports/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );

      if (res.ok) {
        // Refresh the list
        fetchReports();
        // Close modal if open
        setShowDetailsModal(false);
        setSelectedReport(null);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to update report");
      }
    } catch (err) {
      console.error("Error updating report:", err);
      alert("Network error. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      reviewed: "bg-green-100 text-green-700",
      dismissed: "bg-gray-100 text-gray-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Manage User Reports</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <button
              onClick={fetchReports}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <p className="text-gray-600">
            Total Reports: <span className="font-semibold">{total}</span>
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Reporter
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Reported Profile
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Reason
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Date
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-gray-500">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-medium text-gray-900">
                          {report.reporter_profile?.display_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {report.reporter_profile?.email}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-gray-900">
                          {report.reported_fictional?.display_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {report.reported_fictional?.country}
                        </p>
                      </td>
                      <td className="p-4 text-gray-600 max-w-xs">
                        <p className="truncate">{report.reason}</p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(report.status)}`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {formatDate(report.reported_at)}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {report.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(report.id, "reviewed")
                                }
                                disabled={updating}
                                className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateStatus(report.id, "dismissed")
                                }
                                disabled={updating}
                                className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleViewDetails(report)}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                          >
                            View Details
                          </button>
                        </div>
                      </td>
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

      {/* Report Details Modal */}
      {showDetailsModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Report Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Reporter</p>
                <p className="font-medium">
                  {selectedReport.reporter_profile?.display_name || "Unknown"}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedReport.reporter_profile?.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reported Profile</p>
                <p className="font-medium">
                  {selectedReport.reported_fictional?.display_name || "Unknown"}
                </p>
                <p className="text-sm text-gray-500">
                  Country: {selectedReport.reported_fictional?.country || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedReport.status)}`}
                >
                  {selectedReport.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reported At</p>
                <p className="text-sm">
                  {formatDate(selectedReport.reported_at)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Reason</p>
                <div className="bg-gray-50 rounded-lg p-3 mt-1">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedReport.reason}
                  </p>
                </div>
              </div>
              {selectedReport.status === "pending" && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedReport.id, "reviewed")
                    }
                    disabled={updating}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                  >
                    Approve Report
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(selectedReport.id, "dismissed")
                    }
                    disabled={updating}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
                  >
                    Dismiss Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
