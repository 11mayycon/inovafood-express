import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Clock, ChefHat, CheckCircle, XCircle, Package } from "lucide-react";

export default function StoreTrack() {
  const { code } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [code]);

  const fetchOrder = async () => {
    const { data } = await supabase.from("orders").select("*, customers(name)").eq("code", code).maybeSingle();
    if (data) {
      setOrder(data);
      const { data: h } = await supabase.from("order_status_history").select("*").eq("order_id", data.id).order("created_at");
      setHistory(h || []);
    }
  };

  const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
    PENDING: { label: "Pendente", icon: Clock, color: "text-yellow-500" },
    PREPARING: { label: "Em Preparo", icon: ChefHat, color: "text-blue-500" },
    DONE: { label: "Concluído", icon: CheckCircle, color: "text-green-500" },
    CANCELED: { label: "Cancelado", icon: XCircle, color: "text-red-500" }
  };

  if (!order) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  const current = statusConfig[order.status];
  const CurrentIcon = current.icon;

  return (
    <div className="min-h-screen bg-background">
      <header className="glass border-b"><div className="container py-4"><h1 className="text-xl font-bold">Pedido #{code}</h1></div></header>
      <div className="container py-6 space-y-6 max-w-md">
        <div className="bg-card rounded-xl border p-6 text-center">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${current.color} bg-current/10`}>
            <CurrentIcon className="w-8 h-8" />
          </div>
          <h2 className={`text-xl font-bold ${current.color}`}>{current.label}</h2>
          <p className="text-muted-foreground">{order.customers?.name}</p>
        </div>

        <div className="bg-card rounded-xl border p-4">
          <h3 className="font-semibold mb-4">Histórico</h3>
          <div className="space-y-4">
            {history.map((h, i) => {
              const s = statusConfig[h.status];
              const Icon = s.icon;
              return (
                <div key={h.id} className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${s.color} bg-current/10`}><Icon className="w-4 h-4" /></div>
                  <div><p className="font-medium">{s.label}</p><p className="text-xs text-muted-foreground">{format(new Date(h.created_at), "dd/MM HH:mm")}</p></div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">Atualiza automaticamente a cada 5 segundos</p>
      </div>
    </div>
  );
}
