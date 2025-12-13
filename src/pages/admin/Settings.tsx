import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Store, Clock, Truck, Save, Loader2 } from "lucide-react";

interface Settings {
  is_open: boolean;
  delivery_fee: number;
  pickup_enabled: boolean;
  opening_hours: Record<string, { open: string; close: string }>;
}

interface Tenant {
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
}

const DAYS = [
  { key: "monday", label: "Segunda" },
  { key: "tuesday", label: "Terça" },
  { key: "wednesday", label: "Quarta" },
  { key: "thursday", label: "Quinta" },
  { key: "friday", label: "Sexta" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

export default function AdminSettings() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenant, setTenant] = useState<Tenant>({ name: "", slug: "", phone: "", address: "" });
  const [settings, setSettings] = useState<Settings>({
    is_open: true,
    delivery_fee: 0,
    pickup_enabled: true,
    opening_hours: {}
  });

  useEffect(() => {
    if (profile?.tenant_id) fetchData();
  }, [profile]);

  const fetchData = async () => {
    const [tenantRes, settingsRes] = await Promise.all([
      supabase.from("tenants").select("*").eq("id", profile!.tenant_id).single(),
      supabase.from("settings").select("*").eq("tenant_id", profile!.tenant_id).maybeSingle()
    ]);

    if (tenantRes.data) {
      setTenant({
        name: tenantRes.data.name,
        slug: tenantRes.data.slug,
        phone: tenantRes.data.phone,
        address: tenantRes.data.address
      });
    }

    if (settingsRes.data) {
      setSettings({
        is_open: settingsRes.data.is_open ?? true,
        delivery_fee: Number(settingsRes.data.delivery_fee) || 0,
        pickup_enabled: settingsRes.data.pickup_enabled ?? true,
        opening_hours: (settingsRes.data.opening_hours as Record<string, { open: string; close: string }>) || {}
      });
    }

    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);

    // Update tenant
    await supabase.from("tenants").update({
      name: tenant.name,
      phone: tenant.phone,
      address: tenant.address
    }).eq("id", profile!.tenant_id);

    // Upsert settings
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("tenant_id", profile!.tenant_id)
      .maybeSingle();

    if (existing) {
      await supabase.from("settings").update({
        is_open: settings.is_open,
        delivery_fee: settings.delivery_fee,
        pickup_enabled: settings.pickup_enabled,
        opening_hours: settings.opening_hours
      }).eq("tenant_id", profile!.tenant_id);
    } else {
      await supabase.from("settings").insert({
        tenant_id: profile!.tenant_id,
        is_open: settings.is_open,
        delivery_fee: settings.delivery_fee,
        pickup_enabled: settings.pickup_enabled,
        opening_hours: settings.opening_hours
      });
    }

    toast({ title: "Configurações salvas!" });
    setSaving(false);
  };

  const updateHours = (day: string, field: "open" | "close", value: string) => {
    setSettings(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: { ...prev.opening_hours[day], [field]: value }
      }
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Store Info */}
        <Card className="bg-sidebar border-sidebar-border">
          <CardHeader>
            <CardTitle className="text-sidebar-foreground flex items-center gap-2">
              <Store className="w-5 h-5" />
              Informações da Loja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sidebar-foreground">Nome do Restaurante</Label>
              <Input 
                value={tenant.name} 
                onChange={(e) => setTenant({ ...tenant, name: e.target.value })}
                className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" 
              />
            </div>
            <div>
              <Label className="text-sidebar-foreground">Slug (URL)</Label>
              <Input 
                value={tenant.slug} 
                disabled
                className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground/50" 
              />
              <p className="text-xs text-sidebar-foreground/50 mt-1">
                URL: /r/{tenant.slug}
              </p>
            </div>
            <div>
              <Label className="text-sidebar-foreground">Telefone</Label>
              <Input 
                value={tenant.phone || ""} 
                onChange={(e) => setTenant({ ...tenant, phone: e.target.value })}
                className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" 
              />
            </div>
            <div>
              <Label className="text-sidebar-foreground">Endereço</Label>
              <Input 
                value={tenant.address || ""} 
                onChange={(e) => setTenant({ ...tenant, address: e.target.value })}
                className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery */}
        <Card className="bg-sidebar border-sidebar-border">
          <CardHeader>
            <CardTitle className="text-sidebar-foreground flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sidebar-foreground">Loja Aberta</Label>
                <p className="text-sm text-sidebar-foreground/60">Aceitar pedidos agora</p>
              </div>
              <Switch 
                checked={settings.is_open} 
                onCheckedChange={(v) => setSettings({ ...settings, is_open: v })} 
              />
            </div>
            <div>
              <Label className="text-sidebar-foreground">Taxa de Entrega (R$)</Label>
              <Input 
                type="number"
                step="0.01"
                value={settings.delivery_fee} 
                onChange={(e) => setSettings({ ...settings, delivery_fee: parseFloat(e.target.value) || 0 })}
                className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sidebar-foreground">Permitir Retirada</Label>
                <p className="text-sm text-sidebar-foreground/60">Cliente retira no local</p>
              </div>
              <Switch 
                checked={settings.pickup_enabled} 
                onCheckedChange={(v) => setSettings({ ...settings, pickup_enabled: v })} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Opening Hours */}
        <Card className="bg-sidebar border-sidebar-border">
          <CardHeader>
            <CardTitle className="text-sidebar-foreground flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horários de Funcionamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {DAYS.map((day) => (
              <div key={day.key} className="flex items-center gap-4">
                <span className="w-20 text-sm text-sidebar-foreground">{day.label}</span>
                <Input
                  type="time"
                  value={settings.opening_hours[day.key]?.open || "09:00"}
                  onChange={(e) => updateHours(day.key, "open", e.target.value)}
                  className="w-28 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                />
                <span className="text-sidebar-foreground/50">às</span>
                <Input
                  type="time"
                  value={settings.opening_hours[day.key]?.close || "22:00"}
                  onChange={(e) => updateHours(day.key, "close", e.target.value)}
                  className="w-28 bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button onClick={saveSettings} disabled={saving} className="w-full gradient-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </AdminLayout>
  );
}
