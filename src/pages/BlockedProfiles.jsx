// src/pages/BlockedProfiles.jsx
import { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import CountryFilter from "../components/Filters/CountryFilter";
import { supabase } from "../lib/supabaseClient";

const COUNTRIES = [
  { code: "all", name: "All Countries" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "ZA", name: "South Africa" },
];

export default function BlockedProfiles() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [currentManager, setCurrentManager] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [unblocking, setUnblocking] = useState(false);
  const limit = 20;

  // Get current logged-in manager
  useEffect(() => {
    const manager = JSON.parse(localStorage.getItem("manager") || "{}");
    setCurrentManager(manager);
  }, []);

  useEffect(() => {
    fetchBlocks();
  }, [selectedCountry, currentPage]);

  const fetchBlocks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        country: selectedCountry,
        page: currentPage,
        limit,
      });

      const res = await fetch(
        `http://operator-api-production-de23.up.railway.app/manager/blocked-profiles?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Manager-Id": currentManager?.id,
          },
        },
      );
      const data = await res.json();

      if (res.ok) {
        setBlocks(data.blocks || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Error fetching blocked profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (block) => {
    setSelectedBlock(block);
    setShowDetailsModal(true);
  };

  const handleUnblock = async () => {
    if (!selectedBlock) return;

    if (
      !confirm(
        `Are you sure you want to unblock ${selectedBlock.fictional_profiles?.display_name}?`,
      )
    )
      return;

    setUnblocking(true);
    try {
      const { error } = await supabase
        .from("blocked_profiles")
        .delete()
        .eq("id", selectedBlock.id);

      if (error) throw error;

      alert("Profile unblocked successfully!");
      setShowDetailsModal(false);
      setSelectedBlock(null);
      fetchBlocks(); // Refresh the list
    } catch (err) {
      console.error("Error unblocking:", err);
      alert("Failed to unblock profile");
    } finally {
      setUnblocking(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Blocked Profiles</h1>
          <p className="text-gray-500 mt-1">
            Users who blocked fictional profiles
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex gap-4 items-center">
            <CountryFilter
              countries={COUNTRIES}
              value={selectedCountry}
              onChange={setSelectedCountry}
            />
            <button
              onClick={fetchBlocks}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <p className="text-gray-600">
            Total Blocks: <span className="font-semibold">{total}</span>
          </p>
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
                    Blocked Profile
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Country
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Blocked At
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </td>
                  </tr>
                ) : blocks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-8 text-gray-500">
                      No blocked profiles found
                    </td>
                  </tr>
                ) : (
                  blocks.map((block) => (
                    <tr key={block.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-medium text-gray-900">
                          {block.user_profiles?.display_name || "Unknown User"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {block.user_profiles?.email || "No email"}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-gray-900">
                          {block.fictional_profiles?.display_name ||
                            "Unknown Profile"}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {block.fictional_profiles?.country || "N/A"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {formatDate(block.blocked_at)}
                      </td>
                      <td className="p-4">
                        <button
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                          onClick={() => handleViewDetails(block)}
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

      {/* Block Details Modal */}
      {showDetailsModal && selectedBlock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Block Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* User Info */}
              <div>
                <p className="text-sm text-gray-500">User</p>
                <p className="font-medium">
                  {selectedBlock.user_profiles?.display_name || "Unknown User"}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedBlock.user_profiles?.email || "No email"}
                </p>
              </div>

              {/* Blocked Profile Info */}
              <div>
                <p className="text-sm text-gray-500">Blocked Profile</p>
                <p className="font-medium">
                  {selectedBlock.fictional_profiles?.display_name ||
                    "Unknown Profile"}
                </p>
                <p className="text-sm text-gray-500">
                  Country: {selectedBlock.fictional_profiles?.country || "N/A"}
                </p>
              </div>

              {/* Block Date */}
              <div>
                <p className="text-sm text-gray-500">Blocked At</p>
                <p className="text-sm">
                  {formatDate(selectedBlock.blocked_at)}
                </p>
              </div>

              {/* Unblock Button */}
              <div className="pt-4">
                <button
                  onClick={handleUnblock}
                  disabled={unblocking}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                >
                  {unblocking ? "Unblocking..." : "Unblock Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
