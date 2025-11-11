import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  DevicePhoneMobileIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { API_CONFIG } from "../../config/api";

interface Plan {
  ID: string;
  Name: string;
  Description: string;
  Channel: string;
  Quota: number;
  Price: number;
  Duration: number;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

interface Client {
  ID: string;
  Name: string;
  Description: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

interface Membership {
  ID: string;
  ClientID: string;
  PlanID: string;
  QuotaUsed: number;
  QuotaTotal: number;
  ValidTill: string;
  Status: string;
  CreatedAt: string;
  UpdatedAt: string;
  Plan: Plan;
  Client: Client;
}

const SubscriptionManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get("filter");

  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [filteredMemberships, setFilteredMemberships] = useState<Membership[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "requested">(
    (filterParam as any) || "all"
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchMemberships();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, memberships]);

  const fetchMemberships = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/membership/get/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setMemberships(data.data || []);
      } else {
        setError(data.message || "Failed to fetch subscriptions");
      }
    } catch (err: any) {
      console.error("Error fetching subscriptions:", err);
      setError("Error fetching subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...memberships];

    if (filter === "active") {
      filtered = filtered.filter((m) => m.Status?.toLowerCase() === "active");
    } else if (filter === "requested") {
      filtered = filtered.filter(
        (m) => m.Status?.toLowerCase() === "requested"
      );
    }

    filtered.sort((a, b) => {
      if (
        a.Status?.toLowerCase() === "requested" &&
        b.Status?.toLowerCase() !== "requested"
      )
        return -1;
      if (
        a.Status?.toLowerCase() !== "requested" &&
        b.Status?.toLowerCase() === "requested"
      )
        return 1;
      return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
    });

    setFilteredMemberships(filtered);
  };

  const handleActivateMembership = async (membershipId: string) => {
    if (!confirm("Are you sure you want to activate this subscription?"))
      return;

    setActionLoading(membershipId);
    try {
      const token = localStorage.getItem("auth_token");
      const formData = new FormData();
      formData.append("status", "ACTIVE");

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/membership/status/${membershipId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setMemberships((prev) =>
          prev.map((m) =>
            m.ID === membershipId ? { ...m, Status: "ACTIVE" } : m
          )
        );
        alert("Subscription activated successfully!");
      } else {
        alert(data.message || "Failed to activate subscription");
      }
    } catch (err: any) {
      console.error("Error activating subscription:", err);
      alert("Error activating subscription");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                <DocumentTextIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Subscription Management
                </h1>
                <p className="text-gray-400 mt-1">
                  View and manage subscription requests
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "all"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              All ({memberships.length})
            </button>
            <button
              onClick={() => setFilter("requested")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "requested"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Pending (
              {
                memberships.filter(
                  (m) => m.Status?.toLowerCase() === "requested"
                ).length
              }
              )
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "active"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Active (
              {
                memberships.filter((m) => m.Status?.toLowerCase() === "active")
                  .length
              }
              )
            </button>
          </div>
        </motion.div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {filteredMemberships.length === 0 ? (
          <div className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <DocumentTextIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Subscriptions Found
            </h3>
            <p className="text-gray-400">
              {filter === "requested"
                ? "No pending subscription requests"
                : filter === "active"
                ? "No active subscriptions"
                : "No subscriptions available"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-white/10">
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">
                    Channel
                  </th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">
                    Quota
                  </th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">
                    Valid Till
                  </th>
                  <th className="px-6 py-4 text-center text-gray-300 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMemberships.map((membership, index) => (
                  <motion.tr
                    key={membership.ID}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-all"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">
                          {membership.Client?.Name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {membership.Client?.Description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">
                          {membership.Plan?.Name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          ₹{membership.Plan?.Price} for{" "}
                          {membership.Plan?.Duration} days
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${
                          membership.Plan?.Channel?.toLowerCase() === "sms"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : "bg-green-500/20 text-green-400 border border-green-500/30"
                        }`}
                      >
                        {membership.Plan?.Channel?.toLowerCase() === "sms" ? (
                          <DevicePhoneMobileIcon className="w-4 h-4" />
                        ) : (
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        )}
                        <span className="text-xs font-semibold">
                          {membership.Plan?.Channel?.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {membership.QuotaUsed.toLocaleString()} /{" "}
                      {membership.QuotaTotal.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {membership.Status?.toLowerCase() === "active" ? (
                          <>
                            <CheckCircleIcon className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-xs font-semibold">
                              Active
                            </span>
                          </>
                        ) : (
                          <>
                            <ClockIcon className="w-4 h-4 text-orange-400" />
                            <span className="text-orange-400 text-xs font-semibold">
                              Pending
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(membership.ValidTill).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {membership.Status?.toLowerCase() === "requested" && (
                        <button
                          onClick={() =>
                            handleActivateMembership(membership.ID)
                          }
                          disabled={actionLoading === membership.ID}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 text-xs font-semibold"
                        >
                          {actionLoading === membership.ID
                            ? "Activating..."
                            : "Activate"}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManagement;
