import { useEffect, useState } from "react";
import { getSecurityLogs } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { toast } from "sonner";

interface SecurityLog {
  license_key: string
  device_id: string
  ip: string
  event: string
  device_count: number
  created_at: string
}

export default function SecurityPage() {

  const [logs, setLogs] = useState<SecurityLog[]>([]);

  const loadLogs = async () => {
    try {
      const data = await getSecurityLogs();
      setLogs(data || []);
    } catch {
      toast.error("Failed to load security logs");
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-white">Security Analytics</h2>
        <p className="text-slate-400 mt-1">
          Device activations and license usage
        </p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <h3 className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5"/>
            License Activity
          </h3>
        </CardHeader>

        <CardContent>

          <Table>

            <TableHeader>
              <TableRow className="border-slate-800">
               <TableHead>License</TableHead>
<TableHead>Device</TableHead>
<TableHead>Devices Used</TableHead>
<TableHead>IP</TableHead>
<TableHead>Event</TableHead>
<TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {logs.map((log, i) => (
                <TableRow key={i} className="border-slate-800">

                  <TableCell className="text-white font-mono">
                    {log.license_key}
                  </TableCell>

                  <TableCell>
                    {log.device_id}
                  </TableCell>
                  <TableCell>
  <Badge className="bg-purple-500/10 text-purple-400">
    {log.device_count} / 3
  </Badge>
</TableCell>

                  <TableCell>
                    {log.ip}
                  </TableCell>

                  <TableCell>
                    <Badge className="bg-blue-500/10 text-blue-400">
                      {log.event}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-slate-400">
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>

          </Table>

        </CardContent>
      </Card>

    </div>
  );
}
