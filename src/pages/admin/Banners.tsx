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
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Loader2, Image } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  image_url: string | null;
  link: string | null;
  published: boolean;
  sort_order: number;
}

export default function AdminBanners() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState({ title: "", image_url: "", link: "", published: true });

  useEffect(() => {
    if (profile?.tenant_id) fetchBanners();
  }, [profile]);

  const fetchBanners = async () => {
    const { data } = await supabase
      .from("banners")
      .select("*")
      .eq("tenant_id", profile!.tenant_id)
      .order("sort_order");
    
    setBanners((data || []) as Banner[]);
    setLoading(false);
  };

  const openDialog = (banner?: Banner) => {
    setEditing(banner || null);
    setForm({
      title: banner?.title || "",
      image_url: banner?.image_url || "",
      link: banner?.link || "",
      published: banner?.published ?? true
    });
    setDialogOpen(true);
  };

  const saveBanner = async () => {
    if (!form.title.trim()) return;

    if (editing) {
      await supabase.from("banners").update({
        title: form.title,
        image_url: form.image_url || null,
        link: form.link || null,
        published: form.published
      }).eq("id", editing.id);
    } else {
      await supabase.from("banners").insert({
        title: form.title,
        image_url: form.image_url || null,
        link: form.link || null,
        published: form.published,
        tenant_id: profile!.tenant_id,
        sort_order: banners.length
      });
    }

    toast({ title: editing ? "Banner atualizado!" : "Banner criado!" });
    setDialogOpen(false);
    fetchBanners();
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Excluir este banner?")) return;
    await supabase.from("banners").delete().eq("id", id);
    toast({ title: "Banner excluído!" });
    fetchBanners();
  };

  const togglePublished = async (banner: Banner) => {
    await supabase.from("banners").update({ published: !banner.published }).eq("id", banner.id);
    fetchBanners();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Banners</h2>
          <Button onClick={() => openDialog()} className="gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            Novo Banner
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : banners.length === 0 ? (
          <Card className="bg-sidebar border-sidebar-border">
            <CardContent className="py-12 text-center text-sidebar-foreground/50">
              <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
              Nenhum banner cadastrado
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {banners.map((banner) => (
              <Card key={banner.id} className={`bg-sidebar border-sidebar-border overflow-hidden ${!banner.published ? "opacity-60" : ""}`}>
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-64 h-32 bg-sidebar-accent flex-shrink-0">
                    {banner.image_url ? (
                      <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sidebar-foreground/30">
                        <Image className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <CardContent className="flex-1 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-sidebar-foreground/30 cursor-move hidden sm:block" />
                      <div>
                        <h3 className="font-semibold text-sidebar-foreground">{banner.title}</h3>
                        {banner.link && (
                          <p className="text-sm text-sidebar-foreground/60 truncate max-w-xs">{banner.link}</p>
                        )}
                        {!banner.published && (
                          <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500">Oculto</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => togglePublished(banner)} className="text-sidebar-foreground">
                        {banner.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => openDialog(banner)} className="text-sidebar-foreground">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteBanner(banner.id)} className="text-red-500 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Banner Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-sidebar border-sidebar-border">
            <DialogHeader>
              <DialogTitle className="text-sidebar-foreground">{editing ? "Editar" : "Novo"} Banner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sidebar-foreground">Título *</Label>
                <Input 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" 
                />
              </div>
              <div>
                <Label className="text-sidebar-foreground">URL da Imagem</Label>
                <Input 
                  value={form.image_url} 
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })} 
                  className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" 
                  placeholder="https://..."
                />
                {form.image_url && (
                  <img src={form.image_url} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                )}
              </div>
              <div>
                <Label className="text-sidebar-foreground">Link (opcional)</Label>
                <Input 
                  value={form.link} 
                  onChange={(e) => setForm({ ...form, link: e.target.value })} 
                  className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" 
                  placeholder="/r/inovafood-demo"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sidebar-foreground">Publicado</Label>
                <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
              </div>
              <Button onClick={saveBanner} className="w-full gradient-primary">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
