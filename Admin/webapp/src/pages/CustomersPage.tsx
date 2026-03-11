import { useEffect, useState } from "react";
import { getCustomers } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Repeat, Crown, User } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  email: string;
  licenses: number;
  created_at: string;
  monthly?: number;
  lifetime?: number;
  active?: number;
}

export default function CustomersPage() {

  const [customers, setCustomers] = useState<Customer[]>([]);

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data || []);
    } catch {
      toast.error("Failed to load customers");
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // ===============================
  // Metrics
  // ===============================

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(c => (c.active || 0) > 0).length;

  const monthlySubscribers = customers.reduce(
    (acc, c) => acc + (c.monthly || 0),
    0
  );

  const lifetimeBuyers = customers.reduce(
    (acc, c) => acc + (c.lifetime || 0),
    0
  );

  return (
    <div className="space-y-6">

      {/* Page Header */}

      <div>
        <h2 className="text-2xl font-bold text-white">Customers</h2>
        <p className="text-slate-400 mt-1">Platform customer overview</p>
      </div>


      {/* ===============================
          Metrics Dashboard
      =============================== */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-slate-400 text-sm">Total Customers</p>
              <p className="text-2xl font-bold text-white">{totalCustomers}</p>
            </div>
            <Users className="text-blue-500"/>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-slate-400 text-sm">Active Customers</p>
              <p className="text-2xl font-bold text-white">{activeCustomers}</p>
            </div>
            <UserCheck className="text-green-500"/>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-slate-400 text-sm">Monthly Subscribers</p>
              <p className="text-2xl font-bold text-white">{monthlySubscribers}</p>
            </div>
            <Repeat className="text-purple-500"/>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-slate-400 text-sm">Lifetime Buyers</p>
              <p className="text-2xl font-bold text-white">{lifetimeBuyers}</p>
            </div>
            <Crown className="text-yellow-500"/>
          </CardContent>
        </Card>

      </div>


      {/* ===============================
          Customer Table
      =============================== */}

      <Card className="bg-slate-900 border-slate-800">

        <CardHeader>
          <h3 className="text-white">Customer List</h3>
        </CardHeader>

        <CardContent>

          <Table>

            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead>Email</TableHead>
                <TableHead>Licenses</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>

              {customers.map((c) => (

                <TableRow key={c.email} className="border-slate-800">

                  <TableCell className="text-white flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500"/>
                    {c.email}
                  </TableCell>

                  <TableCell>
                    <Badge>{c.licenses}</Badge>
                  </TableCell>

                  <TableCell className="text-slate-400">
                    {new Date(c.created_at).toLocaleDateString()}
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
