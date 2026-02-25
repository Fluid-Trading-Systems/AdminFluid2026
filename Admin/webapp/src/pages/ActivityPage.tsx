import { useState, useEffect, useCallback, useRef } from 'react';
import { getAdminActivity } from '@/lib/api';
import type { ActivityEvent } from '@/types/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Activity, Clock, User, FileText, Key, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const EVENT_ICONS: Record<string, React.ReactNode> = {
  verify: <Shield className="h-4 w-4" />,
  license_created: <FileText className="h-4 w-4" />,
  key_generated: <Key className="h-4 w-4" />,
  login: <User className="h-4 w-4" />,
};

const EVENT_COLORS: Record<string, string> = {
  verify: 'bg-cyan-500/10 text-cyan-400',
  license_created: 'bg-blue-500/10 text-blue-400',
  key_generated: 'bg-orange-500/10 text-orange-400',
  login: 'bg-green-500/10 text-green-400',
};

export function ActivityPage() {
  const [logs, setLogs] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLogs = useCallback(async (showToast = false) => {
    try {
      const data = await getAdminActivity();
      setLogs(data);
      setLastRefresh(new Date());
      if (showToast) {
        toast.success('Activity refreshed');
      }
    } catch (err) {
      if (showToast) {
        toast.error('Failed to refresh activity');
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchLogs();
      setIsLoading(false);
    };
    loadData();
  }, [fetchLogs]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchLogs();
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchLogs]);

  const handleManualRefresh = () => {
    fetchLogs(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getEventIcon = (type: string) => {
    return EVENT_ICONS[type] || <Zap className="h-4 w-4" />;
  };

  const getEventColor = (type: string) => {
    return EVENT_COLORS[type] || 'bg-slate-500/10 text-slate-400';
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-400">Fetching data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Activity</h2>
          <p className="text-slate-400 mt-1">Platform usage logs</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-sm">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button
            onClick={handleManualRefresh}
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <Clock className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-4">
          <div className="text-slate-400 text-sm">
            {logs.length} event{logs.length !== 1 ? 's' : ''}
            <span className="text-slate-600 ml-2">(auto-refreshes every 10s)</span>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300">No activity yet</h3>
              <p className="text-slate-500 mt-1">Activity will appear here when users interact with the platform</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Date</TableHead>
                    <TableHead className="text-slate-400">Event</TableHead>
                    <TableHead className="text-slate-400">Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, index) => (
                    <TableRow key={index} className="border-slate-800">
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-300 text-sm whitespace-nowrap">
                          <Clock className="h-4 w-4 text-slate-500" />
                          {formatDate(log.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getEventColor(log.event)} capitalize flex items-center gap-1.5`}>
                            {getEventIcon(log.event)}
                            {log.event.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-500" />
                          <span className="text-slate-300 text-sm">{log.email || 'Unknown'}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
