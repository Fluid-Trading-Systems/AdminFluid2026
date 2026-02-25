import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats } from '@/lib/api';
import type { AdminStats } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Key, 
  Loader2,
  Plus,
  Activity,
  BarChart3,
  TrendingUp,
  User,
  PieChart
} from 'lucide-react';
import { toast } from 'sonner';

export function DashboardHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Navigate to licenses page and auto-open create modal
  const handleCreateLicense = () => {
    navigate('/dashboard/licenses', { state: { openCreateModal: true } });
  };

  // Navigate to api-keys page and auto-open generate modal
  const handleGenerateApiKey = () => {
    navigate('/dashboard/api-keys', { state: { openGenerateModal: true } });
  };

  // Navigate to activity page
  const handleViewActivity = () => {
    navigate('/dashboard/activity');
  };

  // Navigate to analytics page
  const handleViewAnalytics = () => {
    navigate('/dashboard/analytics');
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-400">Fetching data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-slate-400 mt-1">Overview of your trading software platform</p>
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

      {/* Quick Actions */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleCreateLicense}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create License
            </Button>
            <Button 
              onClick={handleGenerateApiKey}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Key className="h-4 w-4 mr-2" />
              Generate API Key
            </Button>
            <Button 
              onClick={handleViewActivity}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Activity className="h-4 w-4 mr-2" />
              View Activity
            </Button>
            <Button 
              onClick={handleViewAnalytics}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <PieChart className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="bg-slate-900 border-slate-800 cursor-pointer hover:border-blue-500/50 hover:bg-slate-800/50 transition-all duration-200"
          onClick={() => navigate('/dashboard/licenses')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">License Keys</p>
                <p className="text-xs text-slate-500 mt-1">Manage all licenses</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-slate-900 border-slate-800 cursor-pointer hover:border-orange-500/50 hover:bg-slate-800/50 transition-all duration-200"
          onClick={() => navigate('/dashboard/api-keys')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">API Keys</p>
                <p className="text-xs text-slate-500 mt-1">Manage API access</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Key className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-slate-900 border-slate-800 cursor-pointer hover:border-green-500/50 hover:bg-slate-800/50 transition-all duration-200"
          onClick={() => navigate('/dashboard/activity')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">View Statistics</p>
                <p className="text-xs text-slate-500 mt-1">Platform activity</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-slate-900 border-slate-800 cursor-pointer hover:border-purple-500/50 hover:bg-slate-800/50 transition-all duration-200"
          onClick={() => navigate('/dashboard/analytics')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Analytics</p>
                <p className="text-xs text-slate-500 mt-1">Performance metrics</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <PieChart className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
