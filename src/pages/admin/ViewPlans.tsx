import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  SparklesIcon,
  ArrowLeftIcon,
  PlusIcon,
  DevicePhoneMobileIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
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

const ViewPlans: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "sms" | "email" | "whatsapp">(
    "all"
  );

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_CONFIG.BASE_URL}/plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        setError(`Failed to fetch plans (Status: ${response.status})`);
        return;
      }
      const data = await response.json();

      setPlans(data.plans || []);
    } catch (err: any) {
      console.error("Error fetching plans:", err);
      setError("Error fetching plans");
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel?.toLowerCase()) {
      case "sms":
        return <DevicePhoneMobileIcon className="w-4 h-4" />;
      case "email":
        return <EnvelopeIcon className="w-4 h-4" />;
      case "whatsapp":
        return <ChatBubbleLeftRightIcon className="w-4 h-4" />;
      default:
        return <DevicePhoneMobileIcon className="w-4 h-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel?.toLowerCase()) {
      case "sms":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "email":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "whatsapp":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const filteredPlans =
    filter === "all"
      ? plans
      : plans.filter((p) => p.Channel?.toLowerCase() === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading plans...</p>
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
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  All Plans
                </h1>
                <p className="text-gray-400 mt-1">
                  Manage messaging plans for your clients
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/admin/create-plan")}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition-all font-semibold"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Plan</span>
            </motion.button>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "all"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              All ({plans.length})
            </button>
            <button
              onClick={() => setFilter("sms")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "sms"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              SMS (
              {plans.filter((p) => p.Channel?.toLowerCase() === "sms").length})
            </button>
            <button
              onClick={() => setFilter("email")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "email"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              Email (
              {plans.filter((p) => p.Channel?.toLowerCase() === "email").length}
              )
            </button>
            <button
              onClick={() => setFilter("whatsapp")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === "whatsapp"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              WhatsApp (
              {
                plans.filter((p) => p.Channel?.toLowerCase() === "whatsapp")
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

        {filteredPlans.length === 0 ? (
          <div className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <SparklesIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Plans Found
            </h3>
            <p className="text-gray-400 mb-6">
              {filter === "all"
                ? "Create your first plan to get started"
                : `No ${filter} plans available`}
            </p>
            {filter === "all" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/admin/create-plan")}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:opacity-90 transition-all font-semibold"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create Plan</span>
              </motion.button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPlans.map((plan, index) => (
              <motion.div
                key={plan.ID}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all shadow-lg overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {plan.Name}
                      </h3>
                      <div
                        className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold border ${getChannelColor(
                          plan.Channel
                        )}`}
                      >
                        {getChannelIcon(plan.Channel)}
                        <span>{plan.Channel?.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-6 line-clamp-3">
                    {plan.Description}
                  </p>

                  <div className="space-y-4 bg-white/5 rounded-xl p-4 mb-6">
                    <div>
                      <p className="text-gray-400 text-xs font-medium mb-1">
                        Quota
                      </p>
                      <p className="text-white font-bold text-lg">
                        {plan.Quota.toLocaleString()} Units
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-xs font-medium mb-1">
                          Price
                        </p>
                        <p className="text-white font-bold">
                          ₹{plan.Price.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs font-medium mb-1">
                          Validity
                        </p>
                        <p className="text-white font-bold">
                          {plan.Duration === 0
                            ? "Unlimited"
                            : `${plan.Duration} days`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      Created {new Date(plan.CreatedAt).toLocaleDateString()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded ${
                        plan.IsActive
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {plan.IsActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewPlans;
