import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Search, User, Phone, MapPin, ShoppingBag, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  orders?: { total: number; status: string }[];
}

export default function AdminCustomers() {
  const { profile } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.tenant_id) fetchCustomers();
  }, [profile]);

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from("customers")
      .select("*, orders(total, status)")
      .eq("tenant_id", profile!.tenant_id)
      .order("created_at", { ascending: false });
    
    setCustomers((data || []) as Customer[]);
    setLoading(false);
  };

  const openDetails = async (customer: Customer) => {
    setSelected(customer);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });
    setCustomerOrders(data || []);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const getCustomerStats = (customer: Customer) => {
    const orders = customer.orders || [];
    const totalSpent = orders.filter(o => o.status === "DONE").reduce((sum, o) => sum + Number(o.total), 0);
    return { orderCount: orders.length, totalSpent };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-sidebar-foreground/50" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-sidebar border-sidebar-border text-sidebar-foreground"
          />
        </div>

        <Card className="bg-sidebar border-sidebar-border">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-sidebar-foreground/50">
                Nenhum cliente encontrado
              </div>
            ) : (
              <div className="divide-y divide-sidebar-border">
                {filteredCustomers.map((customer) => {
                  const stats = getCustomerStats(customer);
                  return (
                    <div 
                      key={customer.id} 
                      className="p-4 flex items-center justify-between hover:bg-sidebar-accent/50 cursor-pointer transition-colors"
                      onClick={() => openDetails(customer)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                          <User className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sidebar-foreground">{customer.name}</p>
                          <div className="flex items-center gap-3 text-sm text-sidebar-foreground/60">
                            {customer.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {customer.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sidebar-foreground">R$ {stats.totalSpent.toFixed(2)}</p>
                        <p className="text-sm text-sidebar-foreground/60">{stats.orderCount} pedidos</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Details Dialog */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="bg-sidebar border-sidebar-border max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-sidebar-foreground flex items-center gap-2">
                <User className="w-5 h-5" />
                {selected?.name}
              </DialogTitle>
            </DialogHeader>
            
            {selected && (
              <div className="space-y-6">
                <div className="space-y-3">
                  {selected.phone && (
                    <div className="flex items-center gap-2 text-sidebar-foreground">
                      <Phone className="w-4 h-4 text-sidebar-foreground/50" />
                      {selected.phone}
                    </div>
                  )}
                  {selected.address && (
                    <div className="flex items-center gap-2 text-sidebar-foreground">
                      <MapPin className="w-4 h-4 text-sidebar-foreground/50" />
                      {selected.address}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-sidebar-foreground mb-3 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Histórico de Pedidos
                  </h4>
                  {customerOrders.length === 0 ? (
                    <p className="text-sidebar-foreground/50 text-center py-4">Nenhum pedido</p>
                  ) : (
                    <div className="space-y-2">
                      {customerOrders.map((order) => (
                        <div key={order.id} className="flex justify-between p-3 rounded-lg bg-sidebar-accent">
                          <div>
                            <p className="font-medium text-sidebar-foreground">#{order.code}</p>
                            <p className="text-xs text-sidebar-foreground/50">
                              {format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sidebar-foreground">R$ {Number(order.total).toFixed(2)}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.status === "DONE" ? "bg-green-500/20 text-green-500" :
                              order.status === "CANCELED" ? "bg-red-500/20 text-red-500" :
                              "bg-yellow-500/20 text-yellow-500"
                            }`}>
                              {order.status === "DONE" ? "Concluído" : order.status === "CANCELED" ? "Cancelado" : "Pendente"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
