import { useState, useEffect } from 'react';
import { getAdminStats } from '@/lib/api';
import type { AdminStats } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, Key, TrendingUp, User, PieChart } from 'lucide-react';

export function AnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        // Error handled silently, will show zeros
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-400">Fetching analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics</h2>
        <p className="text-slate-400 mt-1">Platform performance metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Licenses</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {stats?.totalLicenses || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Licenses</p>
                <p className="text-3xl font-bold text-green-400 mt-1">
                  {stats?.activeLicenses || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">API Keys</p>
                <p className="text-3xl font-bold text-orange-400 mt-1">
                  {stats?.apiKeys || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Key className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Customers</p>
                <p className="text-3xl font-bold text-purple-400 mt-1">
                  {stats?.customers || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <User className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Section */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-500" />
            Platform Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-800">
              <span className="text-slate-400">License Activation Rate</span>
              <span className="text-white font-medium">
                {stats?.totalLicenses 
                  ? Math.round((stats.activeLicenses / stats.totalLicenses) * 100) 
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-800">
              <span className="text-slate-400">API Keys per Customer</span>
              <span className="text-white font-medium">
                {stats?.customers 
                  ? (stats.apiKeys / stats.customers).toFixed(1) 
                  : '0.0'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-400">Licenses per Customer</span>
              <span className="text-white font-medium">
                {stats?.customers 
                  ? (stats.totalLicenses / stats.customers).toFixed(1) 
                  : '0.0'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
