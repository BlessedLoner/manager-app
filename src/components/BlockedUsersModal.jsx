// src/components/BlockedUsersModal.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function BlockedUsersModal({ isOpen, onClose, onUnblock }) {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchBlockedUsers();
    }
  }, [isOpen]);

  const fetchBlockedUsers = async () => {
    setLoading(true);
    try {
      // Fetch blocked profiles with user and fictional profile details
      const { data, error } = await supabase
        .from("blocked_profiles")
        .select(
          `
          id,
          blocked_at,
          user_profiles!user_profile_id (
            id,
            display_name,
            email,
            country
          ),
          fictional_profiles!blocked_fictional_id (
            id,
            display_name,
            country,
            image_url
          )
        `,
        )
        .order("blocked_at", { ascending: false });

      if (error) throw error;
      setBlockedUsers(data || []);
    } catch (err) {
      console.error("Error fetching blocked users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (blockId, fictionalName) => {
    if (!confirm(`Are you sure you want to unblock ${fictionalName}?`)) return;

    setUnblockingId(blockId);
    try {
      const { error } = await supabase
        .from("blocked_profiles")
        .delete()
        .eq("id", blockId);

      if (error) throw error;

      // Refresh the list
      await fetchBlockedUsers();

      // Call parent callback if provided
      if (onUnblock) onUnblock();
    } catch (err) {
      console.error("Error unblocking:", err);
      alert("Failed to unblock user");
    } finally {
      setUnblockingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Blocked Users</h2>
            <p className="text-gray-500 text-sm mt-1">
              Users who have blocked fictional profiles
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              <p>No blocked users found</p>
              <p className="text-sm mt-1">
                Users will appear here when they block fictional profiles
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {blockedUsers.map((block) => (
                <div
                  key={block.id}
                  className="border rounded-xl p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {block.user_profiles?.display_name ||
                              "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {block.user_profiles?.email || "No email"}
                          </p>
                        </div>
                      </div>

                      <div className="ml-13 pl-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span className="font-medium">
                            Blocked fictional profile:
                          </span>
                          <div className="flex items-center gap-2">
                            {block.fictional_profiles?.image_url && (
                              <img
                                src={block.fictional_profiles.image_url}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            )}
                            <span className="font-medium text-gray-800">
                              {block.fictional_profiles?.display_name ||
                                "Unknown"}
                            </span>
                            <span className="text-gray-400 text-xs">
                              ({block.fictional_profiles?.country || "N/A"})
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">
                          Blocked on {formatDate(block.blocked_at)}
                        </p>
                      </div>
                    </div>

                    {/* Unblock Button */}
                    <button
                      onClick={() =>
                        handleUnblock(
                          block.id,
                          block.fictional_profiles?.display_name,
                        )
                      }
                      disabled={unblockingId === block.id}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 text-sm font-medium"
                    >
                      {unblockingId === block.id ? (
                        <div className="flex items-center gap-1">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          <span>Unblocking...</span>
                        </div>
                      ) : (
                        "Unblock"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
