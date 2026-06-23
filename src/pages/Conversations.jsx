// src/pages/Conversations.jsx
import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import CountryFilter from "../components/Filters/CountryFilter";
import DateRangeFilter from "../components/Filters/DateRangeFilter";
import DefaultAvatar from "../assets/default-avatar-male.svg";

const COUNTRIES = [
  { code: "all", name: "All Countries" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "ZA", name: "South Africa" },
];

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [operatorTypeFilter, setOperatorTypeFilter] = useState("all"); // ✅ NEW: operator type filter
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [operatorStats, setOperatorStats] = useState(null);
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [operatorDateRange, setOperatorDateRange] = useState({
    startDate: "",
    endDate: "",
    preset: "all",
  });
  const [operatorMessages, setOperatorMessages] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const limit = 20;

  // ✅ Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCountry, startDate, endDate, searchTerm, operatorTypeFilter]);

  useEffect(() => {
    fetchConversations();
  }, [
    selectedCountry,
    startDate,
    endDate,
    searchTerm,
    operatorTypeFilter,
    currentPage,
  ]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        country: selectedCountry,
        page: currentPage,
        limit,
      });
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (searchTerm) params.append("search", searchTerm);
      if (operatorTypeFilter && operatorTypeFilter !== "all") {
        params.append("operator_type", operatorTypeFilter);
      }

      const res = await fetch(
        `https://operator-api-production-de23.up.railway.app/manager/conversations?${params.toString()}`,
      );
      const data = await res.json();

      console.log("📦 Full response:", data);
      console.log("📦 First conversation:", data.conversations?.[0]);

      if (res.ok) {
        setConversations(data.conversations || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOperatorStats = async (operatorId, operatorName, dateRange) => {
    setLoadingStats(true);
    try {
      const params = new URLSearchParams({
        operator_id: operatorId,
      });
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);

      const res = await fetch(
        `https://operator-api-production-de23.up.railway.app/manager/operator-stats?${params}`,
      );
      const data = await res.json();

      if (res.ok) {
        setOperatorStats(data.stats);
        setOperatorMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Error fetching operator stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleViewOperator = async (operator) => {
    setSelectedOperator(operator);
    setOperatorDateRange({ startDate: "", endDate: "", preset: "all" });
    await fetchOperatorStats(operator.id, operator.username, {
      startDate: "",
      endDate: "",
    });
    setShowOperatorModal(true);
  };

  const handleDateRangeChange = (preset) => {
    const today = new Date();
    let startDate = "";
    let endDate = "";

    switch (preset) {
      case "today":
        startDate = today.toISOString().split("T")[0];
        endDate = startDate;
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        startDate = yesterday.toISOString().split("T")[0];
        endDate = startDate;
        break;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        startDate = weekAgo.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        startDate = monthAgo.toISOString().split("T")[0];
        endDate = today.toISOString().split("T")[0];
        break;
      default:
        startDate = "";
        endDate = "";
    }

    const newRange = { startDate, endDate, preset };
    setOperatorDateRange(newRange);
    fetchOperatorStats(
      selectedOperator?.id,
      selectedOperator?.username,
      newRange,
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleViewDetails = (conversation) => {
    setSelectedConversation(conversation);
    setShowDetailsModal(true);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
          <p className="text-gray-500 mt-1">
            View all user-fictional conversations
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <CountryFilter
              countries={COUNTRIES}
              value={selectedCountry}
              onChange={setSelectedCountry}
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />

            {/* ✅ NEW: Operator Type Filter Dropdown */}
            <select
              value={operatorTypeFilter}
              onChange={(e) => {
                setOperatorTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Operators</option>
              <option value="regular">Regular Operators</option>
              <option value="poke">Poke Operators</option>
              <option value="stopped">Stopped Operators</option>
            </select>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={fetchConversations}
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
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <p className="text-gray-600">
            Total Conversations: <span className="font-semibold">{total}</span>
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
                    User
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Fictional Profile
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Operator
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Country
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Last Message
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
                ) : conversations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-gray-500">
                      No conversations found
                    </td>
                  </tr>
                ) : (
                  conversations.map((conv) => (
                    <tr key={conv.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {conv.user_profiles?.display_name || "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {conv.user_profiles?.email || "No email"}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-gray-900">
                          {conv.fictional_profiles?.display_name ||
                            "Unknown Profile"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {conv.fictional_profiles?.country || "N/A"}
                        </p>
                      </td>
                      <td className="p-4">
                        {conv.operator ? (
                          <button
                            onClick={() => handleViewOperator(conv.operator)}
                            className="px-3 py-1 text-sm bg-gray-500 text-white rounded-full hover:bg-blue-600 transition"
                          >
                            {conv.operator.username}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Not assigned
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {conv.user_profiles?.country ||
                            conv.fictional_profiles?.country ||
                            "N/A"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {conv.last_message_at
                          ? formatDate(conv.last_message_at)
                          : formatDate(conv.created_at)}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleViewDetails(conv)}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                          View Details
                        </button>
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

      {/* Operator Stats Modal */}
      {showOperatorModal && selectedOperator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Operator Statistics
                </h2>
                <p className="text-gray-500">{selectedOperator.username}</p>
              </div>
              <button
                onClick={() => setShowOperatorModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Operator Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Operator Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-medium">{selectedOperator.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">
                      {selectedOperator.full_name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">
                      {selectedOperator.email || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium capitalize">
                      {selectedOperator.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p
                      className={`font-medium ${selectedOperator.is_blocked ? "text-red-600" : "text-green-600"}`}
                    >
                      {selectedOperator.is_blocked ? "Blocked" : "Active"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="font-medium">
                      {new Date(
                        selectedOperator.created_at,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Message Activity
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => handleDateRangeChange("today")}
                    className={`px-3 py-1.5 text-sm rounded-lg transition ${
                      operatorDateRange.preset === "today"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => handleDateRangeChange("yesterday")}
                    className={`px-3 py-1.5 text-sm rounded-lg transition ${
                      operatorDateRange.preset === "yesterday"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Yesterday
                  </button>
                  <button
                    onClick={() => handleDateRangeChange("week")}
                    className={`px-3 py-1.5 text-sm rounded-lg transition ${
                      operatorDateRange.preset === "week"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => handleDateRangeChange("month")}
                    className={`px-3 py-1.5 text-sm rounded-lg transition ${
                      operatorDateRange.preset === "month"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Last 30 Days
                  </button>
                  <button
                    onClick={() => handleDateRangeChange("all")}
                    className={`px-3 py-1.5 text-sm rounded-lg transition ${
                      operatorDateRange.preset === "all"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Time
                  </button>
                </div>
                <div className="flex gap-3 items-center">
                  <input
                    type="date"
                    value={operatorDateRange.startDate}
                    onChange={(e) => {
                      const newRange = {
                        ...operatorDateRange,
                        startDate: e.target.value,
                        preset: "custom",
                      };
                      setOperatorDateRange(newRange);
                      fetchOperatorStats(
                        selectedOperator.id,
                        selectedOperator.username,
                        newRange,
                      );
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={operatorDateRange.endDate}
                    onChange={(e) => {
                      const newRange = {
                        ...operatorDateRange,
                        endDate: e.target.value,
                        preset: "custom",
                      };
                      setOperatorDateRange(newRange);
                      fetchOperatorStats(
                        selectedOperator.id,
                        selectedOperator.username,
                        newRange,
                      );
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Stats Cards */}
              {operatorStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {operatorStats.daily || 0}
                    </p>
                    <p className="text-sm text-gray-600">Today</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {operatorStats.weekly || 0}
                    </p>
                    <p className="text-sm text-gray-600">This Week</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {operatorStats.monthly || 0}
                    </p>
                    <p className="text-sm text-gray-600">This Month</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {operatorStats.allTime || 0}
                    </p>
                    <p className="text-sm text-gray-600">All Time</p>
                  </div>
                </div>
              )}

              {/* Messages Table */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Messages Processed
                </h3>
                {loadingStats ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </div>
                ) : operatorMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No messages found for the selected period
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-3 text-sm font-semibold text-gray-600">
                            Date
                          </th>
                          <th className="text-left p-3 text-sm font-semibold text-gray-600">
                            User
                          </th>
                          <th className="text-left p-3 text-sm font-semibold text-gray-600">
                            Fictional Profile
                          </th>
                          <th className="text-left p-3 text-sm font-semibold text-gray-600">
                            Message
                          </th>
                          <th className="text-left p-3 text-sm font-semibold text-gray-600">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {operatorMessages.map((msg) => (
                          <tr
                            key={msg.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="p-3 text-sm">
                              {new Date(msg.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-sm">
                              {msg.user?.display_name || "Unknown"}
                            </td>
                            <td className="p-3 text-sm">
                              {msg.fictional?.display_name || "Unknown"}
                            </td>
                            <td className="p-3 text-sm max-w-xs truncate">
                              {msg.content || "[Image]"}
                            </td>
                            <td className="p-3 text-sm">
                              {new Date(msg.created_at).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedConversation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Conversation Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* User Section */}
              <div className="mb-8">
                <div className=" mb-4 flex items-center gap-2">
                  <img
                    src={
                      selectedConversation.user_profiles?.profile_img ||
                      DefaultAvatar
                    }
                    alt={selectedConversation.user_profiles?.display_name}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-white/30"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null; // prevent infinite loop
                      e.currentTarget.src = DefaultAvatar;
                    }}
                  />
                  User Details
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Display Name</p>
                      <p className="font-medium">
                        {selectedConversation.user_profiles?.display_name ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">
                        {selectedConversation.user_profiles?.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Country</p>
                      <p className="font-medium">
                        {selectedConversation.user_profiles?.country || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">City</p>
                      <p className="font-medium">
                        {selectedConversation.user_profiles?.city || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium">
                        {selectedConversation.user_profiles?.age || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="font-medium capitalize">
                        {selectedConversation.user_profiles?.gender || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fictional Profile Section */}
              <div className="mb-8">
                <div className=" mb-4 flex items-center gap-2">
                  <img
                    src={
                      selectedConversation.fictional_profiles?.image_url ||
                      DefaultAvatar
                    }
                    alt={selectedConversation.user_profiles?.display_name}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-white/30"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null; // prevent infinite loop
                      e.currentTarget.src = DefaultAvatar;
                    }}
                  />
                  Fictional Profile Details
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Display Name</p>
                      <p className="font-medium">
                        {selectedConversation.fictional_profiles
                          ?.display_name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Country</p>
                      <p className="font-medium">
                        {selectedConversation.fictional_profiles?.country ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p className="font-medium">
                        {selectedConversation.fictional_profiles?.age || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bio</p>
                      <p className="font-medium">
                        {selectedConversation.fictional_profiles?.bio?.substring(
                          0,
                          100,
                        ) || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversation Info */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    💬
                  </span>
                  Conversation Info
                </h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Started</p>
                      <p className="font-medium">
                        {formatDate(selectedConversation.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Message</p>
                      <p className="font-medium">
                        {selectedConversation.last_message_at
                          ? formatDate(selectedConversation.last_message_at)
                          : "No messages"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Last Message Preview
                      </p>
                      <p className="font-medium">
                        {selectedConversation.last_message_preview ||
                          "No messages"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Assigned Operator</p>
                      <p className="font-medium">
                        {selectedConversation.operator?.username ||
                          "Not assigned"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                    📝
                  </span>
                  Message History
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                  {selectedConversation.messages?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedConversation.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_type === "real_user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.sender_type === "real_user"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            <p className="text-sm">{msg.content || "📷"}</p>
                            <div className="flex flex-col mt-1">
                              <p
                                className={`text-xs ${msg.sender_type === "real_user" ? "text-blue-100" : "text-gray-500"}`}
                              >
                                {formatDate(msg.created_at)}
                              </p>
                              {/* ✅ Show operator name for fictional messages */}
                              {msg.sender_type === "fictional" &&
                                msg.operator_accounts && (
                                  <p className="text-xs mt-0.5 flex items-center gap-1 text-gray-500">
                                    <span>👤</span>
                                    <span>
                                      {/* {msg.operator_accounts.full_name} */}
                                      {msg.operator_accounts.username}
                                    </span>
                                  </p>
                                )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No messages in this conversation
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
