import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { API_CONFIG } from "../../config/api";

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  requestedClients: number;
  totalMemberships: number;
  activeMemberships: number;
  requestedMemberships: number;
  totalPlans: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    requestedClients: 0,
    totalMemberships: 0,
    activeMemberships: 0,
    requestedMemberships: 0,
    totalPlans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("auth_token");

      const [clientsRes, membershipsRes, plansRes] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/clients/list/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_CONFIG.BASE_URL}/membership/get/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_CONFIG.BASE_URL}/plans`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const clientsData = await clientsRes.json();
      const membershipsData = await membershipsRes.json();
      const plansData = await plansRes.json();

      if (clientsData.status === "success") {
        const clients = clientsData.data || [];
        setStats((prev) => ({
          ...prev,
          totalClients: clients.length,
          activeClients: clients.filter((c: any) => c.IsActive).length,
          requestedClients: clients.filter((c: any) => !c.IsActive).length,
        }));
      }

      if (membershipsData.status === "success") {
        const memberships = membershipsData.data || [];
        setStats((prev) => ({
          ...prev,
          totalMemberships: memberships.length,
          activeMemberships: memberships.filter(
            (m: any) => m.Status?.toLowerCase() === "active"
          ).length,
          requestedMemberships: memberships.filter(
            (m: any) => m.Status?.toLowerCase() === "requested"
          ).length,
        }));
      }

      if (plansData.status === "success") {
        const plans = plansData.data || [];
        setStats((prev) => ({
          ...prev,
          totalPlans: plans.length,
        }));
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Clients",
      value: stats.totalClients,
      icon: <UsersIcon className="w-8 h-8 text-white" />,
      gradient: "from-blue-500 to-cyan-500",
      onClick: () => navigate("/admin/clients"),
    },
    {
      title: "Active Clients",
      value: stats.activeClients,
      icon: <CheckCircleIcon className="w-8 h-8 text-white" />,
      gradient: "from-green-500 to-emerald-500",
      onClick: () => navigate("/admin/clients?filter=active"),
    },
    {
      title: "Pending Clients",
      value: stats.requestedClients,
      icon: <ClockIcon className="w-8 h-8 text-white" />,
      gradient: "from-orange-500 to-red-500",
      onClick: () => navigate("/admin/clients?filter=requested"),
    },
    {
      title: "Total Subscriptions",
      value: stats.totalMemberships,
      icon: <DocumentTextIcon className="w-8 h-8 text-white" />,
      gradient: "from-purple-500 to-pink-500",
      onClick: () => navigate("/admin/subscriptions"),
    },
    {
      title: "Active Subscriptions",
      value: stats.activeMemberships,
      icon: <CheckCircleIcon className="w-8 h-8 text-white" />,
      gradient: "from-teal-500 to-cyan-500",
      onClick: () => navigate("/admin/subscriptions?filter=active"),
    },
    {
      title: "Pending Subscriptions",
      value: stats.requestedMemberships,
      icon: <ClockIcon className="w-8 h-8 text-white" />,
      gradient: "from-yellow-500 to-orange-500",
      onClick: () => navigate("/admin/subscriptions?filter=requested"),
    },
    {
      title: "Total Plans",
      value: stats.totalPlans,
      icon: <SparklesIcon className="w-8 h-8 text-white" />,
      gradient: "from-amber-500 to-orange-500",
      onClick: () => navigate("/admin/plans"),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl">
              <ChartBarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-400 mt-1">
                Manage clients and subscriptions
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={card.onClick}
              className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-6 cursor-pointer shadow-lg border border-white/10 relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    {card.icon}
                  </div>
                </div>
                <h3 className="text-white/80 text-sm font-medium mb-2">
                  {card.title}
                </h3>
                <p className="text-4xl font-bold text-white">{card.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => navigate("/admin/clients")}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Manage Clients
            </h2>
            <p className="text-gray-400 mb-4">
              View, approve, and manage client accounts
            </p>
            <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition-all">
              View All Clients
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            onClick={() => navigate("/admin/subscriptions")}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Manage Subscriptions
            </h2>
            <p className="text-gray-400 mb-4">
              View, approve, and manage subscription requests
            </p>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-all">
              View All Subscriptions
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            onClick={() => navigate("/admin/plans")}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
          >
            <h2 className="text-xl font-bold text-white mb-4">Manage Plans</h2>
            <p className="text-gray-400 mb-4">
              Create and manage messaging plans
            </p>
            <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:opacity-90 transition-all">
              View All Plans
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
