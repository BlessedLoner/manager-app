// src/pages/MessageAnalytics.jsx
import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import CountryFilter from "../components/Filters/CountryFilter";
import DefaultAvatar from "../assets/default-avatar-male.svg";

const COUNTRIES = [
  { code: "all", name: "All Countries" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "ZA", name: "South Africa" },
];

const OPERATOR_TYPES = [
  { value: "all", label: "All Operators" },
  { value: "regular", label: "Regular Operators" },
  { value: "poke", label: "Poke Operators" },
  { value: "stopped", label: "Stopped Operators" },
];

const MESSAGE_TYPES = [
  { value: "all", label: "All Messages" },
  { value: "user", label: "User Messages" },
  { value: "operator", label: "Operator Replies" },
];

export default function MessageAnalytics() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [operatorTypeFilter, setOperatorTypeFilter] = useState("all");
  const [messageTypeFilter, setMessageTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [currentManager, setCurrentManager] = useState(null);
  const [stats, setStats] = useState({
    totalMessages: 0,
    userMessages: 0,
    operatorReplies: 0,
    processedToday: 0,
  });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const limit = 20;

  // Get current logged-in manager
  useEffect(() => {
    const manager = JSON.parse(localStorage.getItem("manager") || "{}");
    setCurrentManager(manager);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCountry,
    startDate,
    endDate,
    searchTerm,
    operatorTypeFilter,
    messageTypeFilter,
  ]);

  useEffect(() => {
    fetchMessages();
  }, [
    selectedCountry,
    startDate,
    endDate,
    searchTerm,
    operatorTypeFilter,
    messageTypeFilter,
    currentPage,
  ]);

  const fetchMessages = async () => {
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
      if (messageTypeFilter && messageTypeFilter !== "all") {
        params.append("message_type", messageTypeFilter);
      }

      const res = await fetch(
        `https://operator-api-production-de23.up.railway.app/manager/messages?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Manager-Id": currentManager?.id,
          },
        },
      );
      const data = await res.json();

      if (res.ok) {
        setMessages(data.messages || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleViewDetails = (message) => {
    setSelectedMessage(message);
    setShowDetailsModal(true);
  };

  const getMessageTypeBadge = (senderType) => {
    if (senderType === "real_user") {
      return (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          User
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          Operator
        </span>
      );
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Message Analytics
          </h1>
          <p className="text-gray-500 mt-1">
            Track individual messages and operator replies
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Total Messages</p>
            <p className="text-2xl font-bold text-primary">
              {stats.totalMessages}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">User Messages</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.userMessages}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Operator Replies</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.operatorReplies}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-sm text-gray-500">Processed Today</p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.processedToday}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Country Filter */}
            <CountryFilter
              countries={COUNTRIES}
              value={selectedCountry}
              onChange={(value) => {
                console.log("Country changed to:", value);
                setSelectedCountry(value);
              }}
            />

            {/* Start Date */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                console.log("Start date changed to:", e.target.value);
                setStartDate(e.target.value);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {/* End Date */}
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                console.log("End date changed to:", e.target.value);
                setEndDate(e.target.value);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {/* Operator Type Filter */}
            {/* Operator Type Filter - Mobile friendly */}
            <select
              value={operatorTypeFilter}
              onChange={(e) => {
                console.log("Operator type changed to:", e.target.value);
                setOperatorTypeFilter(e.target.value);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white min-w-[120px]"
              style={{ WebkitAppearance: "menulist", appearance: "menulist" }}
            >
              {OPERATOR_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Message Type Filter - Mobile friendly */}
            <select
              value={messageTypeFilter}
              onChange={(e) => {
                console.log("Message type changed to:", e.target.value);
                setMessageTypeFilter(e.target.value);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white min-w-[120px]"
              style={{ WebkitAppearance: "menulist", appearance: "menulist" }}
            >
              {MESSAGE_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                console.log("Search term changed to:", e.target.value);
                setSearchTerm(e.target.value);
              }}
              placeholder="Search by username or message..."
              className="flex-1 min-w-50 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {/* Search Button */}
            <button
              onClick={fetchMessages}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              Search
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <p className="text-gray-600">
            Total Messages Found: <span className="font-semibold">{total}</span>
          </p>
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-1">
              Showing results for: "{searchTerm}"
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
                    Message
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Operator
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Processed (Today)
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Type
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Country
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Time
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </td>
                  </tr>
                ) : messages.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center p-8 text-gray-500">
                      No messages found
                    </td>
                  </tr>
                ) : (
                  messages.map((msg) => (
                    <tr key={msg.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {msg.user?.display_name || "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {msg.user?.email || "No email"}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-gray-900">
                          {msg.fictional?.display_name || "Unknown Profile"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {msg.fictional?.country || "N/A"}
                        </p>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="max-h-20 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap break-words">
                          {/* Check if there's an image URL */}
                          {msg.image_url ? (
                            // Has image
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-blue-500">
                                <svg
                                  className="w-4 h-4 shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <rect
                                    x="2"
                                    y="4"
                                    width="20"
                                    height="18"
                                    rx="2"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                  />
                                  <circle
                                    cx="8.5"
                                    cy="9.5"
                                    r="2.5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                  />
                                  <path
                                    d="M21 15l-5-4-3 3-4-4-5 5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <span className="text-xs text-gray-500">
                                  📷 Photo
                                </span>
                              </div>
                              {msg.content && (
                                <p className="text-gray-700 mt-1">
                                  {msg.content}
                                </p>
                              )}
                            </div>
                          ) : msg.content ? (
                            // No image, has text
                            <p className="text-gray-700">{msg.content}</p>
                          ) : (
                            // No image, no text (fallback)
                            <span className="text-gray-400 text-sm">
                              No content
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {msg.operator ? (
                          <div>
                            <p className="font-medium text-gray-900">
                              {msg.operator.username}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {msg.operator.operator_type}
                              {!msg.is_direct_operator &&
                                msg.sender_type === "real_user" && (
                                  <span className="text-yellow-500 ml-1 text-xs">
                                    (handled this conversation)
                                  </span>
                                )}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Not assigned yet
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {msg.operator ? (
                          <span className="font-semibold text-green-600">
                            {msg.processed_today || 0}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {getMessageTypeBadge(msg.sender_type)}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {msg.user?.country || msg.fictional?.country || "N/A"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {formatDate(msg.created_at)}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleViewDetails(msg)}
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
                className="px-4 py-2 text-sm bg-blue-600 rounded-lg disabled:opacity-50"
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
                className="px-4 py-2 text-sm bg-blue-600 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Message Details Modal */}
      {showDetailsModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Message Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">User</p>
                  <p className="font-medium">
                    {selectedMessage.user?.display_name || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedMessage.user?.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    City: {selectedMessage.user?.city || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fictional Profile</p>
                  <p className="font-medium">
                    {selectedMessage.fictional?.display_name || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Country: {selectedMessage.fictional?.country || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Operator</p>
                  <p className="font-medium">
                    {selectedMessage.operator?.username || "Not assigned"}
                  </p>
                  {selectedMessage.operator?.operator_type && (
                    <p className="text-sm text-gray-500 capitalize">
                      Type: {selectedMessage.operator.operator_type}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Processed Today</p>
                  <p className="font-medium text-green-600">
                    {selectedMessage.processed_today || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Message Type</p>
                  <p className="font-medium capitalize">
                    {selectedMessage.sender_type === "real_user"
                      ? "User Message"
                      : "Operator Reply"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sent At</p>
                  <p className="font-medium">
                    {formatDate(selectedMessage.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Conversation ID</p>
                  <p className="font-medium text-xs">
                    {selectedMessage.conversation_id}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Message Content</p>
                <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {selectedMessage.image_url && !selectedMessage.content && (
                    <div className="flex items-center gap-2">
                      <img
                        src={selectedMessage.image_url}
                        alt="Message"
                        className="max-w-full rounded-lg"
                      />
                      <p className="text-gray-500 text-sm">Sent a photo</p>
                    </div>
                  )}
                  {selectedMessage.image_url && selectedMessage.content && (
                    <div className="space-y-2">
                      <img
                        src={selectedMessage.image_url}
                        alt="Message"
                        className="max-w-full rounded-lg"
                      />
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {selectedMessage.content}
                      </p>
                    </div>
                  )}
                  {!selectedMessage.image_url && selectedMessage.content && (
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {selectedMessage.content}
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
