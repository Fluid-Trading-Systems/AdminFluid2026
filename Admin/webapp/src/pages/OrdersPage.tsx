import { useEffect, useState } from "react";
import { getOrders } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

interface Order {
  email: string;
  product: string;
  amount: number;
  revenue: number;
  status: string;
  created_at: string;
}

export default function OrdersPage() {

  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data || []);
    } catch {
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-white">Orders</h2>
        <p className="text-slate-400 mt-1">Customer payments and purchases</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <h3 className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5"/>
            Orders
          </h3>
        </CardHeader>

        <CardContent>

          <Table>
            <TableHeader>
              <TableRow className="border-slate-800">
               <TableHead>Email</TableHead>
<TableHead>Product</TableHead>
<TableHead>Amount</TableHead>
<TableHead>Revenue</TableHead>
<TableHead>Status</TableHead>
<TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.map((o, i) => (
                <TableRow key={i} className="border-slate-800">

                  <TableCell className="text-white">{o.email}</TableCell>

                  <TableCell>{o.product}</TableCell>

                  <TableCell>${o.amount}</TableCell>

<TableCell className="text-green-400 font-medium">
  ${o.revenue}
</TableCell>

<TableCell>
  <Badge className="bg-green-500/10 text-green-400">
    {o.status}
  </Badge>
</TableCell>

                  <TableCell className="text-slate-400">
                    {new Date(o.created_at).toLocaleDateString()}
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
