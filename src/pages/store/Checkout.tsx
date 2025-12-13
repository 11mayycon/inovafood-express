import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function StoreCheckout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });

  useEffect(() => {
    const fetchTenant = async () => {
      const { data } = await supabase.from("tenants").select("*").eq("slug", slug).single();
      if (data) {
        setTenant(data);
        const { data: s } = await supabase.from("settings").select("*").eq("tenant_id", data.id).maybeSingle();
        setSettings(s);
      }
    };
    fetchTenant();
  }, [slug]);

  const deliveryFee = Number(settings?.delivery_fee || 0);
  const grandTotal = total + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setLoading(true);

    // Create customer
    const { data: customer } = await supabase.from("customers").insert({
      tenant_id: tenant.id, name: form.name, phone: form.phone, address: form.address
    }).select().single();

    // Create order
    const { data: order } = await supabase.from("orders").insert({
      tenant_id: tenant.id, customer_id: customer?.id, channel: "WEB",
      subtotal: total, delivery: deliveryFee, total: grandTotal, notes: form.notes || null
    }).select().single();

    // Create order items
    if (order) {
      await supabase.from("order_items").insert(
        items.map(i => ({ order_id: order.id, product_id: i.id, product_name: i.name, qty: i.quantity, unit_price: i.price, total: i.price * i.quantity }))
      );
      clearCart();
      navigate(`/r/${slug}/confirmation/${order.code}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass border-b"><div className="container py-4"><h1 className="text-xl font-bold">Finalizar Pedido</h1></div></header>
      <form onSubmit={handleSubmit} className="container py-6 space-y-4 max-w-md">
        <div><Label>Nome *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
        <div><Label>Telefone *</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required /></div>
        <div><Label>Endereço *</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} required /></div>
        <div><Label>Observações</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
        <div className="bg-card rounded-xl border p-4 space-y-2">
          <div className="flex justify-between"><span>Subtotal</span><span>R$ {total.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Entrega</span><span>R$ {deliveryFee.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-primary">R$ {grandTotal.toFixed(2)}</span></div>
        </div>
        <Button type="submit" disabled={loading} className="w-full gradient-primary">
          {loading ? <Loader2 className="animate-spin mr-2" /> : null} {loading ? "Enviando..." : "Enviar Pedido"}
        </Button>
      </form>
    </div>
  );
}
