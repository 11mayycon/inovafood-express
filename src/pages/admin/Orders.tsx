import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Eye, Clock, ChefHat, CheckCircle, XCircle, Plus, Loader2 } from "lucide-react";

type OrderStatus = "PENDING" | "PREPARING" | "DONE" | "CANCELED";

interface Order {
  id: string;
  code: string;
  status: OrderStatus;
  channel: "WEB" | "MANUAL";
  total: number;
  subtotal: number;
  delivery: number;
  notes: string | null;
  created_at: string;
  customers: { name: string; phone: string; address: string } | null;
}

interface OrderItem {
  id: string;
  product_name: string;
  qty: number;
  unit_price: number;
  total: number;
}

export default function AdminOrders() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (profile?.tenant_id) fetchOrders();
  }, [profile]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, customers(name, phone, address)")
      .eq("tenant_id", profile!.tenant_id)
      .order("created_at", { ascending: false });
    
    if (data) setOrders(data as Order[]);
    setLoading(false);
  };

  const openDetails = async (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);

    const [itemsRes, historyRes] = await Promise.all([
      supabase.from("order_items").select("*").eq("order_id", order.id),
      supabase.from("order_status_history").select("*").eq("order_id", order.id).order("created_at", { ascending: true })
    ]);

    setOrderItems((itemsRes.data || []) as OrderItem[]);
    setStatusHistory(historyRes.data || []);
  };

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Status atualizado!" });
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
        const { data } = await supabase.from("order_status_history").select("*").eq("order_id", orderId).order("created_at", { ascending: true });
        setStatusHistory(data || []);
      }
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.code.toLowerCase().includes(search.toLowerCase()) || 
                          o.customers?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
    PENDING: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-500", icon: Clock },
    PREPARING: { label: "Preparando", color: "bg-blue-500/20 text-blue-500", icon: ChefHat },
    DONE: { label: "Concluído", color: "bg-green-500/20 text-green-500", icon: CheckCircle },
    CANCELED: { label: "Cancelado", color: "bg-red-500/20 text-red-500", icon: XCircle }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-sidebar-foreground/50" />
            <Input
              placeholder="Buscar por código ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-sidebar border-sidebar-border text-sidebar-foreground"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-sidebar border-sidebar-border text-sidebar-foreground">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-sidebar border-sidebar-border">
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="PENDING">Pendentes</SelectItem>
              <SelectItem value="PREPARING">Preparando</SelectItem>
              <SelectItem value="DONE">Concluídos</SelectItem>
              <SelectItem value="CANCELED">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        <Card className="bg-sidebar border-sidebar-border">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-sidebar-foreground/50">
                Nenhum pedido encontrado
              </div>
            ) : (
              <div className="divide-y divide-sidebar-border">
                {filteredOrders.map((order) => {
                  const StatusIcon = statusConfig[order.status].icon;
                  return (
                    <div key={order.id} className="p-4 flex items-center justify-between hover:bg-sidebar-accent/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${statusConfig[order.status].color}`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sidebar-foreground">#{order.code}</p>
                          <p className="text-sm text-sidebar-foreground/60">{order.customers?.name || "Cliente"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="font-medium text-sidebar-foreground">R$ {Number(order.total).toFixed(2)}</p>
                          <p className="text-xs text-sidebar-foreground/50">
                            {format(new Date(order.created_at), "dd/MM HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full hidden sm:inline ${order.channel === "WEB" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}`}>
                          {order.channel}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => openDetails(order)} className="text-sidebar-foreground">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="bg-sidebar border-sidebar-border max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sidebar-foreground">
                Pedido #{selectedOrder?.code}
              </DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="p-4 rounded-lg bg-sidebar-accent">
                  <h4 className="font-medium text-sidebar-foreground mb-2">Cliente</h4>
                  <p className="text-sidebar-foreground">{selectedOrder.customers?.name}</p>
                  <p className="text-sm text-sidebar-foreground/60">{selectedOrder.customers?.phone}</p>
                  <p className="text-sm text-sidebar-foreground/60">{selectedOrder.customers?.address}</p>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-medium text-sidebar-foreground mb-2">Itens</h4>
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between p-3 rounded-lg bg-sidebar-accent">
                        <span className="text-sidebar-foreground">{item.qty}x {item.product_name}</span>
                        <span className="text-sidebar-foreground">R$ {Number(item.total).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="p-4 rounded-lg bg-sidebar-accent space-y-2">
                  <div className="flex justify-between text-sidebar-foreground/70">
                    <span>Subtotal</span>
                    <span>R$ {Number(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sidebar-foreground/70">
                    <span>Entrega</span>
                    <span>R$ {Number(selectedOrder.delivery).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sidebar-foreground text-lg">
                    <span>Total</span>
                    <span>R$ {Number(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <h4 className="font-medium text-yellow-500 mb-1">Observações</h4>
                    <p className="text-sidebar-foreground">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Status History */}
                <div>
                  <h4 className="font-medium text-sidebar-foreground mb-2">Histórico</h4>
                  <div className="space-y-2">
                    {statusHistory.map((h, i) => (
                      <div key={h.id} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${statusConfig[h.status as OrderStatus].color.replace('/20', '')}`} />
                        <span className="text-sidebar-foreground">{statusConfig[h.status as OrderStatus].label}</span>
                        <span className="text-sm text-sidebar-foreground/50">
                          {format(new Date(h.created_at), "dd/MM HH:mm")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {selectedOrder.status !== "DONE" && selectedOrder.status !== "CANCELED" && (
                  <div className="flex gap-2 pt-4 border-t border-sidebar-border">
                    {selectedOrder.status === "PENDING" && (
                      <Button 
                        onClick={() => updateStatus(selectedOrder.id, "PREPARING")}
                        className="flex-1 bg-blue-500 hover:bg-blue-600"
                      >
                        <ChefHat className="w-4 h-4 mr-2" />
                        Em Preparo
                      </Button>
                    )}
                    {selectedOrder.status === "PREPARING" && (
                      <Button 
                        onClick={() => updateStatus(selectedOrder.id, "DONE")}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Concluir
                      </Button>
                    )}
                    <Button 
                      variant="outline"
                      onClick={() => updateStatus(selectedOrder.id, "CANCELED")}
                      className="border-red-500 text-red-500 hover:bg-red-500/10"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
