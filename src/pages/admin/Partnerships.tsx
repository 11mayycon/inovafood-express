import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Loader2, ExternalLink, Check, Handshake } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

interface Partnership {
  id: string;
  name: string;
  logo_url: string | null;
  external_link: string | null;
  published: boolean;
  sort_order: number;
}

export default function AdminPartnerships() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partnership | null>(null);
  const [form, setForm] = useState({ 
    name: "", 
    logo_url: "", 
    external_link: "",
    published: true 
  });

  useEffect(() => {
    if (profile?.tenant_id) fetchPartnerships();
  }, [profile]);

  const fetchPartnerships = async () => {
    const { data } = await supabase
      .from("partnerships")
      .select("*")
      .eq("tenant_id", profile!.tenant_id)
      .order("sort_order");
    
    setPartnerships((data || []) as Partnership[]);
    setLoading(false);
  };

  const openDialog = (partnership?: Partnership) => {
    setEditing(partnership || null);
    setForm({
      name: partnership?.name || "",
      logo_url: partnership?.logo_url || "",
      external_link: partnership?.external_link || "",
      published: partnership?.published ?? true
    });
    setDialogOpen(true);
  };

  const savePartnership = async () => {
    if (!form.name.trim()) return;
    setSaving(true);

    if (editing) {
      await supabase.from("partnerships").update({
        name: form.name,
        logo_url: form.logo_url || null,
        external_link: form.external_link || null,
        published: form.published
      }).eq("id", editing.id);
    } else {
      await supabase.from("partnerships").insert({
        name: form.name,
        logo_url: form.logo_url || null,
        external_link: form.external_link || null,
        published: form.published,
        tenant_id: profile!.tenant_id,
        sort_order: partnerships.length
      });
    }

    toast({ title: editing ? "Parceria atualizada!" : "Parceria criada!" });
    setDialogOpen(false);
    setSaving(false);
    fetchPartnerships();
  };

  const deletePartnership = async (id: string) => {
    if (!confirm("Excluir esta parceria?")) return;
    await supabase.from("partnerships").delete().eq("id", id);
    toast({ title: "Parceria excluída!" });
    fetchPartnerships();
  };

  const togglePublished = async (partnership: Partnership) => {
    await supabase.from("partnerships").update({ published: !partnership.published }).eq("id", partnership.id);
    fetchPartnerships();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Handshake className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-sidebar-foreground">Parcerias</h2>
              <p className="text-sidebar-foreground/60 text-sm">Gerencie as logos de integrações</p>
            </div>
          </div>
          <Button onClick={() => openDialog()} className="gradient-primary hover:scale-105 transition-transform">
            <Plus className="w-4 h-4 mr-2" />
            Nova Parceria
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : partnerships.length === 0 ? (
          <Card className="bg-sidebar border-sidebar-border">
            <CardContent className="py-16 text-center text-sidebar-foreground/50">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-sidebar-accent flex items-center justify-center">
                <Handshake className="w-10 h-10 opacity-50" />
              </div>
              <p className="text-lg font-medium mb-2">Nenhuma parceria cadastrada</p>
              <p className="text-sm">Adicione logos de plataformas integradas</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partnerships.map((partnership) => (
              <Card 
                key={partnership.id} 
                className={`bg-sidebar border-sidebar-border overflow-hidden group hover:border-primary/50 transition-all duration-300 ${!partnership.published ? "opacity-60" : ""}`}
              >
                <div className="relative h-32 bg-sidebar-accent flex items-center justify-center overflow-hidden">
                  {partnership.logo_url ? (
                    <img 
                      src={partnership.logo_url} 
                      alt={partnership.name} 
                      className="max-w-full max-h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="text-2xl font-bold text-gradient">{partnership.name}</div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => togglePublished(partnership)}>
                      {partnership.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </Button>
                    <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => openDialog(partnership)}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => deletePartnership(partnership.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sidebar-foreground">{partnership.name}</h3>
                    {partnership.external_link && (
                      <a href={partnership.external_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {partnership.published ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">Visível</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500">Oculto</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Partnership Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-sidebar border-sidebar-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-sidebar-foreground">{editing ? "Editar" : "Nova"} Parceria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sidebar-foreground">Nome da Parceria *</Label>
                <Input 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" 
                  placeholder="Ex: iFood, Rappi, Uber Eats"
                />
              </div>
              
              <div>
                <Label className="text-sidebar-foreground mb-2 block">Logo da Parceria</Label>
                <ImageUpload 
                  value={form.logo_url} 
                  onChange={(url) => setForm({ ...form, logo_url: url })}
                  folder="partnerships"
                />
              </div>

              <div>
                <Label className="text-sidebar-foreground">Link Externo (opcional)</Label>
                <Input 
                  value={form.external_link} 
                  onChange={(e) => setForm({ ...form, external_link: e.target.value })} 
                  className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" 
                  placeholder="https://www.ifood.com.br"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label className="text-sidebar-foreground">Exibir na Landing Page</Label>
                <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
              </div>

              <Button onClick={savePartnership} disabled={saving} className="w-full gradient-primary">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                Salvar Parceria
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
