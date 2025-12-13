import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DollarSign, ShoppingBag, TrendingUp, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrderStats {
  total: number;
  pending: number;
  preparing: number;
  done: number;
  canceled: number;
  revenue: number;
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<OrderStats>({ total: 0, pending: 0, preparing: 0, done: 0, canceled: 0, revenue: 0 });
  const [chartData, setChartData] = useState<{ day: string; total: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.tenant_id) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    if (!profile?.tenant_id) return;
    
    // Fetch orders
    const { data: orders } = await supabase
      .from("orders")
      .select("*, customers(name)")
      .eq("tenant_id", profile.tenant_id)
      .order("created_at", { ascending: false });

    if (orders) {
      const stats: OrderStats = {
        total: orders.length,
        pending: orders.filter(o => o.status === "PENDING").length,
        preparing: orders.filter(o => o.status === "PREPARING").length,
        done: orders.filter(o => o.status === "DONE").length,
        canceled: orders.filter(o => o.status === "CANCELED").length,
        revenue: orders.filter(o => o.status === "DONE").reduce((sum, o) => sum + Number(o.total), 0)
      };
      setStats(stats);
      setRecentOrders(orders.slice(0, 5));

      // Chart data for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dayOrders = orders.filter(o => 
          format(new Date(o.created_at), "yyyy-MM-dd") === format(date, "yyyy-MM-dd") && o.status === "DONE"
        );
        return {
          day: format(date, "EEE", { locale: ptBR }),
          total: dayOrders.reduce((sum, o) => sum + Number(o.total), 0)
        };
      });
      setChartData(last7Days);
    }
    
    setLoading(false);
  };

  const statCards = [
    { title: "Faturamento", value: `R$ ${stats.revenue.toFixed(2)}`, icon: DollarSign, color: "text-green-500" },
    { title: "Total Pedidos", value: stats.total, icon: ShoppingBag, color: "text-blue-500" },
    { title: "Pendentes", value: stats.pending, icon: Clock, color: "text-yellow-500" },
    { title: "Concluídos", value: stats.done, icon: CheckCircle, color: "text-green-500" },
  ];

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-500",
    PREPARING: "bg-blue-500/20 text-blue-500",
    DONE: "bg-green-500/20 text-green-500",
    CANCELED: "bg-red-500/20 text-red-500"
  };

  const statusLabels: Record<string, string> = {
    PENDING: "Pendente",
    PREPARING: "Preparando",
    DONE: "Concluído",
    CANCELED: "Cancelado"
  };

  return (
    <AdminLayout>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, i) => (
              <Card key={i} className="bg-sidebar border-sidebar-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-sidebar-foreground/60">{stat.title}</p>
                      <p className="text-2xl font-bold text-sidebar-foreground">{stat.value}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Chart */}
            <Card className="bg-sidebar border-sidebar-border">
              <CardHeader>
                <CardTitle className="text-sidebar-foreground flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Vendas (7 dias)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="day" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} tickFormatter={(v) => `R$${v}`} />
                    <Tooltip 
                      contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8 }}
                      labelStyle={{ color: "#fff" }}
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, "Total"]}
                    />
                    <Bar dataKey="total" fill="url(#gradient)" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="bg-sidebar border-sidebar-border">
              <CardHeader>
                <CardTitle className="text-sidebar-foreground flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Pedidos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-sidebar-accent">
                      <div>
                        <p className="font-medium text-sidebar-foreground">#{order.code}</p>
                        <p className="text-sm text-sidebar-foreground/60">{order.customers?.name || "Cliente"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sidebar-foreground">R$ {Number(order.total).toFixed(2)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                  {recentOrders.length === 0 && (
                    <p className="text-center text-sidebar-foreground/50 py-8">Nenhum pedido ainda</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
