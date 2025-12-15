import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Loader2, Image, Check, Send } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

interface Banner {
  id: string;
  title: string;
  image_url: string | null;
  link: string | null;
  published: boolean;
  sort_order: number;
}

const linkOptions = [
  { value: "", label: "Nenhum link" },
  { value: "/", label: "Página Inicial" },
  { value: "/produtos", label: "Todos os Produtos" },
  { value: "/promocoes", label: "Promoções" },
  { value: "custom", label: "Link Personalizado" },
];

export default function AdminBanners() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState({ 
    title: "", 
    image_url: "", 
    link: "", 
    linkType: "",
    description: "",
    published: true 
  });

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
    const linkType = banner?.link ? (linkOptions.find(o => o.value === banner.link) ? banner.link : "custom") : "";
    setForm({
      title: banner?.title || "",
      image_url: banner?.image_url || "",
      link: banner?.link || "",
      linkType,
      description: "",
      published: banner?.published ?? true
    });
    setDialogOpen(true);
  };

  const saveBanner = async () => {
    if (!form.title.trim()) return;
    setSaving(true);

    const linkValue = form.linkType === "custom" ? form.link : form.linkType;

    if (editing) {
      await supabase.from("banners").update({
        title: form.title,
        image_url: form.image_url || null,
        link: linkValue || null,
        published: form.published
      }).eq("id", editing.id);
    } else {
      await supabase.from("banners").insert({
        title: form.title,
        image_url: form.image_url || null,
        link: linkValue || null,
        published: form.published,
        tenant_id: profile!.tenant_id,
        sort_order: banners.length
      });
    }

    toast({ title: editing ? "Banner atualizado!" : "Banner criado!" });
    setDialogOpen(false);
    setSaving(false);
    fetchBanners();
  };

  const publishNow = async () => {
    if (!form.title.trim()) return;
    setForm({ ...form, published: true });
    await saveBanner();
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
          <Button onClick={() => openDialog()} className="gradient-primary hover:scale-105 transition-transform">
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
            <CardContent className="py-16 text-center text-sidebar-foreground/50">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-sidebar-accent flex items-center justify-center">
                <Image className="w-10 h-10 opacity-50" />
              </div>
              <p className="text-lg font-medium mb-2">Nenhum banner cadastrado</p>
              <p className="text-sm">Crie banners para destacar promoções e novidades</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {banners.map((banner) => (
              <Card 
                key={banner.id} 
                className={`bg-sidebar border-sidebar-border overflow-hidden group hover:border-primary/50 transition-all duration-300 ${!banner.published ? "opacity-60" : ""}`}
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-72 h-36 bg-sidebar-accent flex-shrink-0 overflow-hidden">
                    {banner.image_url ? (
                      <img 
                        src={banner.image_url} 
                        alt={banner.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sidebar-foreground/30">
                        <Image className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <CardContent className="flex-1 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-sidebar-foreground/30 cursor-move hidden sm:block" />
                      <div>
                        <h3 className="font-semibold text-sidebar-foreground text-lg">{banner.title}</h3>
                        {banner.link && (
                          <p className="text-sm text-sidebar-foreground/60 truncate max-w-xs">{banner.link}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {banner.published ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-500">Publicado</span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500">Rascunho</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => togglePublished(banner)} 
                        className="text-sidebar-foreground hover:text-primary"
                      >
                        {banner.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => openDialog(banner)} 
                        className="text-sidebar-foreground hover:text-primary"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => deleteBanner(banner.id)} 
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      >
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
          <DialogContent className="bg-sidebar border-sidebar-border max-w-lg">
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
                  placeholder="Ex: Promoção de Verão"
                />
              </div>
              
              <div>
                <Label className="text-sidebar-foreground mb-2 block">Imagem do Banner</Label>
                <ImageUpload 
                  value={form.image_url} 
                  onChange={(url) => setForm({ ...form, image_url: url })}
                  folder="banners"
                />
              </div>

              <div>
                <Label className="text-sidebar-foreground">Descrição (opcional)</Label>
                <Textarea 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" 
                  placeholder="Descrição breve do banner..."
                  rows={2}
                />
              </div>

              <div>
                <Label className="text-sidebar-foreground">Link de Destino</Label>
                <Select value={form.linkType} onValueChange={(v) => setForm({ ...form, linkType: v, link: v === "custom" ? form.link : v })}>
                  <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                    <SelectValue placeholder="Selecione um destino..." />
                  </SelectTrigger>
                  <SelectContent className="bg-sidebar border-sidebar-border">
                    {linkOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value || "none"}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {form.linkType === "custom" && (
                  <Input 
                    value={form.link} 
                    onChange={(e) => setForm({ ...form, link: e.target.value })} 
                    className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground mt-2" 
                    placeholder="https://... ou /pagina"
                  />
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label className="text-sidebar-foreground">Publicado</Label>
                <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={saveBanner} disabled={saving} className="flex-1 gradient-primary">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Salvar
                </Button>
                {!form.published && (
                  <Button onClick={publishNow} disabled={saving} variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white">
                    <Send className="w-4 h-4 mr-2" />
                    Publicar Agora
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
