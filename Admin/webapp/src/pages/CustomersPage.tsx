import { useEffect, useState } from "react";
import { getCustomers, createLicense } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, User } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  email: string;
  licenses: number;
  created_at: string;
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

  const handleCreateLicense = async (email: string) => {
    try {
      await createLicense({
        email,
        type: "lifetime",
      });

      toast.success("License generated for customer");
    } catch {
      toast.error("Failed to create license");
    }
  };

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-white">Customers</h2>
        <p className="text-slate-400 mt-1">Manage platform customers</p>
      </div>

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
                <TableHead className="text-right">Actions</TableHead>
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

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleCreateLicense(c.email)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-1"/>
                      Generate License
                    </Button>
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
