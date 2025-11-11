import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { API_CONFIG } from "../../config/api";

interface Client {
  ID: string;
  Name: string;
  Description: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

const ClientManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get("filter");

  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "requested">(
    (filterParam as any) || "all"
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, clients]);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_CONFIG.BASE_URL}/clients/list/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.status === "success") {
        setClients(data.data || []);
      } else {
        setError(data.message || "Failed to fetch clients");
      }
    } catch (err: any) {
      console.error("Error fetching clients:", err);
      setError("Error fetching clients");
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...clients];

    if (filter === "active") {
      filtered = filtered.filter((c) => c.IsActive);
    } else if (filter === "requested") {
      filtered = filtered.filter((c) => !c.IsActive);
    }

    filtered.sort((a, b) => {
      if (!a.IsActive && b.IsActive) return -1;
      if (a.IsActive && !b.IsActive) return 1;
      return new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime();
    });

    setFilteredClients(filtered);
  };

  const handleActivateClient = async (clientId: string) => {
    if (!confirm("Are you sure you want to activate this client?")) return;

    setActionLoading(clientId);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/clients/activate/${clientId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setClients((prev) =>
          prev.map((c) => (c.ID === clientId ? { ...c, IsActive: true } : c))
        );
        alert("Client activated successfully!");
      } else {
        alert(data.message || "Failed to activate client");
      }
    } catch (err: any) {
      console.error("Error activating client:", err);
      alert("Error activating client");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading clients...</p>
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
              <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl">
                <UsersIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Client Management
                </h1>
                <p className="text-gray-400 mt-1">
                  View and manage client accounts
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "all"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              All ({clients.length})
            </button>
            <button
              onClick={() => setFilter("requested")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "requested"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Pending ({clients.filter((c) => !c.IsActive).length})
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "active"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Active ({clients.filter((c) => c.IsActive).length})
            </button>
          </div>
        </motion.div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {filteredClients.length === 0 ? (
          <div className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <UsersIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Clients Found
            </h3>
            <p className="text-gray-400">
              {filter === "requested"
                ? "No pending client requests"
                : filter === "active"
                ? "No active clients"
                : "No clients available"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b border-white/10">
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">
                    Client Name
                  </th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">
                    Created At
                  </th>
                  <th className="px-6 py-4 text-center text-gray-300 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client, index) => (
                  <motion.tr
                    key={client.ID}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-all"
                  >
                    <td className="px-6 py-4 text-white font-medium">
                      {client.Name}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {client.Description}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {client.IsActive ? (
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
                      {new Date(client.CreatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!client.IsActive && (
                        <button
                          onClick={() => handleActivateClient(client.ID)}
                          disabled={actionLoading === client.ID}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 text-xs font-semibold"
                        >
                          {actionLoading === client.ID
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

export default ClientManagement;
