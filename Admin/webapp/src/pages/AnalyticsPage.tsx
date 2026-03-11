import { useState, useEffect } from "react";
import { getAdminStats } from "@/lib/api";
import type { AdminStats } from "@/types/api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  FileText,
  Key,
  TrendingUp,
  User,
  PieChart,
  RefreshCw
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AnalyticsPage() {

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStats();
  }, []);

  // Auto refresh every 15s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-400">Loading dashboard...</p>
      </div>
    );
  }

  const totalLicenses = stats?.totalLicenses || 0;
  const activeLicenses = stats?.activeLicenses || 0;
  const apiKeys = stats?.apiKeys || 0;
  const customers = stats?.customers || 0;

  const activationRate =
    totalLicenses > 0
      ? Math.round((activeLicenses / totalLicenses) * 100)
      : 0;

  const licensesPerCustomer =
    customers > 0
      ? (totalLicenses / customers).toFixed(1)
      : "0.0";

  const apiKeysPerCustomer =
    customers > 0
      ? (apiKeys / customers).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-slate-400 mt-1">Platform overview</p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-slate-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}

          <Button
            onClick={fetchStats}
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4 mr-2"/>
            Refresh
          </Button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Licenses</p>
              <p className="text-3xl font-bold text-white mt-1">
                {totalLicenses}
              </p>
            </div>
            <FileText className="h-6 w-6 text-blue-500"/>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Licenses</p>
              <p className="text-3xl font-bold text-green-400 mt-1">
                {activeLicenses}
              </p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-500"/>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Customers</p>
              <p className="text-3xl font-bold text-purple-400 mt-1">
                {customers}
              </p>
            </div>
            <User className="h-6 w-6 text-purple-500"/>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">API Keys</p>
              <p className="text-3xl font-bold text-orange-400 mt-1">
                {apiKeys}
              </p>
            </div>
            <Key className="h-6 w-6 text-orange-500"/>
          </CardContent>
        </Card>

      </div>

      {/* Platform Health */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-500"/>
            Platform Health
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div className="flex justify-between py-3 border-b border-slate-800">
            <span className="text-slate-400">License Activation Rate</span>
            <span className="text-white font-medium">
              {activationRate}%
            </span>
          </div>

          <div className="flex justify-between py-3 border-b border-slate-800">
            <span className="text-slate-400">Licenses per Customer</span>
            <span className="text-white font-medium">
              {licensesPerCustomer}
            </span>
          </div>

          <div className="flex justify-between py-3">
            <span className="text-slate-400">API Keys per Customer</span>
            <span className="text-white font-medium">
              {apiKeysPerCustomer}
            </span>
          </div>

        </CardContent>
      </Card>

    </div>
  );
}

