import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { getApiUrl, API_CONFIG } from "../config/api";

const AllSenders: React.FC = () => {
  const [senders, setSenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const clientId = localStorage.getItem("client_id");

  useEffect(() => {
    const fetchSenders = async () => {
      try {
        if (!clientId) {
          setError("Client ID not found. Please log in again.");
          setLoading(false);
          return;
        }

        const url = `${getApiUrl(
          API_CONFIG.ENDPOINTS.SENDERS
        )}/filter?client_id=${clientId}`;
        const token = localStorage.getItem("token");

        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.status === "success") {
          setSenders(res.data.data || []);
        } else {
          setError(res.data.message || "Failed to fetch senders.");
        }
      } catch (err: any) {
        console.error("Error fetching senders:", err);
        setError("Error fetching senders.");
      } finally {
        setLoading(false);
      }
    };

    fetchSenders();
  }, [clientId]);

  if (loading) return <p className="text-gray-400">Loading...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div className="min-h-screen p-6 lg:ml-[280px]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            All Senders
          </h2>
          <p className="text-gray-400">Manage your SMS sender IDs</p>
        </motion.div>

        {senders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10"
          >
            <p className="text-gray-400">No senders found.</p>
          </motion.div>
        ) : (
          <div className="overflow-x-auto bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b border-white/10">
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">
                    Sender ID
                  </th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">
                    DLT Entity
                  </th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {senders.map((sender, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-all duration-200"
                  >
                    <td className="px-6 py-4 text-white font-medium">
                      {sender.SenderId}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 capitalize">
                        {sender.Type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {sender.DLTEntityPrincipallID || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {sender.IsActive ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
                          Inactive
                        </span>
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

export default AllSenders;
