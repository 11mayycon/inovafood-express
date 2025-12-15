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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Star, Eye, EyeOff, Loader2, GripVertical, Check } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

interface Category {
  id: string;
  name: string;
  sort_order: number;
  published: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  stock: number;
  active: boolean;
  featured: boolean;
  published_at: string | null;
  category_id: string | null;
}

export default function AdminMenu() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Category form
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [catPublished, setCatPublished] = useState(true);

  // Product form
  const [prodDialogOpen, setProdDialogOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [prodForm, setProdForm] = useState({
    name: "", description: "", price: "", image_url: "", stock: "0",
    category_id: "", active: true, featured: false, publish_now: true
  });

  useEffect(() => {
    if (profile?.tenant_id) fetchData();
  }, [profile]);

  const fetchData = async () => {
    const [catRes, prodRes] = await Promise.all([
      supabase.from("categories").select("*").eq("tenant_id", profile!.tenant_id).order("sort_order"),
      supabase.from("products").select("*").eq("tenant_id", profile!.tenant_id).order("created_at", { ascending: false })
    ]);
    setCategories((catRes.data || []) as Category[]);
    setProducts((prodRes.data || []) as Product[]);
    setLoading(false);
  };

  // Category CRUD
  const openCatDialog = (cat?: Category) => {
    setEditingCat(cat || null);
    setCatName(cat?.name || "");
    setCatPublished(cat?.published ?? true);
    setCatDialogOpen(true);
  };

  const saveCat = async () => {
    if (!catName.trim()) return;
    setSaving(true);
    
    if (editingCat) {
      await supabase.from("categories").update({ name: catName, published: catPublished }).eq("id", editingCat.id);
    } else {
      await supabase.from("categories").insert({ 
        name: catName, 
        published: catPublished, 
        tenant_id: profile!.tenant_id,
        sort_order: categories.length 
      });
    }
    
    toast({ title: editingCat ? "Categoria atualizada!" : "Categoria criada!" });
    setCatDialogOpen(false);
    setSaving(false);
    fetchData();
  };

  const deleteCat = async (id: string) => {
    if (!confirm("Excluir esta categoria?")) return;
    await supabase.from("categories").delete().eq("id", id);
    toast({ title: "Categoria excluída!" });
    fetchData();
  };

  // Product CRUD
  const openProdDialog = (prod?: Product) => {
    setEditingProd(prod || null);
    setProdForm({
      name: prod?.name || "",
      description: prod?.description || "",
      price: prod?.price?.toString() || "",
      image_url: prod?.image_url || "",
      stock: prod?.stock?.toString() || "0",
      category_id: prod?.category_id || "",
      active: prod?.active ?? true,
      featured: prod?.featured ?? false,
      publish_now: prod?.published_at ? true : false
    });
    setProdDialogOpen(true);
  };

  const saveProd = async () => {
    if (!prodForm.name.trim() || !prodForm.price) return;
    setSaving(true);

    const data = {
      name: prodForm.name,
      description: prodForm.description || null,
      price: parseFloat(prodForm.price),
      image_url: prodForm.image_url || null,
      stock: parseInt(prodForm.stock) || 0,
      category_id: prodForm.category_id || null,
      active: prodForm.active,
      featured: prodForm.featured,
      published_at: prodForm.publish_now ? new Date().toISOString() : null,
      tenant_id: profile!.tenant_id
    };

    if (editingProd) {
      await supabase.from("products").update(data).eq("id", editingProd.id);
    } else {
      await supabase.from("products").insert(data);
    }

    toast({ title: editingProd ? "Produto atualizado!" : "Produto criado!" });
    setProdDialogOpen(false);
    setSaving(false);
    fetchData();
  };

  const deleteProd = async (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "Produto excluído!" });
    fetchData();
  };

  const toggleProdActive = async (prod: Product) => {
    await supabase.from("products").update({ active: !prod.active }).eq("id", prod.id);
    fetchData();
  };

  return (
    <AdminLayout>
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="bg-sidebar border border-sidebar-border">
          <TabsTrigger value="products" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Produtos ({products.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Categorias ({categories.length})
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-sidebar-foreground">Produtos</h2>
            <Button onClick={() => openProdDialog()} className="gradient-primary hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((prod) => (
                <Card 
                  key={prod.id} 
                  className={`bg-sidebar border-sidebar-border overflow-hidden group hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 ${!prod.active ? "opacity-60" : ""}`}
                >
                  <div className="relative h-44 bg-sidebar-accent overflow-hidden">
                    {prod.image_url ? (
                      <img 
                        src={prod.image_url} 
                        alt={prod.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sidebar-foreground/30 text-6xl">
                        🍽️
                      </div>
                    )}
                    {prod.featured && (
                      <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg">
                        <Star className="w-3 h-3 fill-current" /> Destaque
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => openProdDialog(prod)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => toggleProdActive(prod)}>
                        {prod.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </Button>
                      <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => deleteProd(prod.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sidebar-foreground truncate">{prod.name}</h3>
                    <p className="text-sm text-sidebar-foreground/60 truncate">{prod.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-lg font-bold text-gradient">R$ {Number(prod.price).toFixed(2)}</span>
                      <span className="text-xs text-sidebar-foreground/50">Est: {prod.stock}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-sidebar-foreground">Categorias</h2>
            <Button onClick={() => openCatDialog()} className="gradient-primary hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 mr-2" />
              Nova Categoria
            </Button>
          </div>

          <Card className="bg-sidebar border-sidebar-border">
            <CardContent className="p-0">
              {categories.length === 0 ? (
                <div className="text-center py-12 text-sidebar-foreground/50">Nenhuma categoria</div>
              ) : (
                <div className="divide-y divide-sidebar-border">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-sidebar-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-5 h-5 text-sidebar-foreground/30 cursor-move" />
                        <span className="font-medium text-sidebar-foreground">{cat.name}</span>
                        {!cat.published && (
                          <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500">Oculta</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => openCatDialog(cat)} className="text-sidebar-foreground hover:text-primary">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteCat(cat.id)} className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Category Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="bg-sidebar border-sidebar-border">
          <DialogHeader>
            <DialogTitle className="text-sidebar-foreground">{editingCat ? "Editar" : "Nova"} Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sidebar-foreground">Nome</Label>
              <Input value={catName} onChange={(e) => setCatName(e.target.value)} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sidebar-foreground">Publicada</Label>
              <Switch checked={catPublished} onCheckedChange={setCatPublished} />
            </div>
            <Button onClick={saveCat} disabled={saving} className="w-full gradient-primary">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={prodDialogOpen} onOpenChange={setProdDialogOpen}>
        <DialogContent className="bg-sidebar border-sidebar-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sidebar-foreground">{editingProd ? "Editar" : "Novo"} Produto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sidebar-foreground">Nome *</Label>
              <Input value={prodForm.name} onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
            </div>
            <div>
              <Label className="text-sidebar-foreground">Descrição</Label>
              <Textarea value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sidebar-foreground">Preço *</Label>
                <Input type="number" step="0.01" value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
              </div>
              <div>
                <Label className="text-sidebar-foreground">Estoque</Label>
                <Input type="number" value={prodForm.stock} onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })} className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground" />
              </div>
            </div>
            <div>
              <Label className="text-sidebar-foreground mb-2 block">Imagem do Produto</Label>
              <ImageUpload 
                value={prodForm.image_url} 
                onChange={(url) => setProdForm({ ...prodForm, image_url: url })}
                folder="products"
              />
            </div>
            <div>
              <Label className="text-sidebar-foreground">Categoria</Label>
              <Select value={prodForm.category_id} onValueChange={(v) => setProdForm({ ...prodForm, category_id: v })}>
                <SelectTrigger className="bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-sidebar border-sidebar-border">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-sidebar-foreground">Ativo</Label>
                <Switch checked={prodForm.active} onCheckedChange={(v) => setProdForm({ ...prodForm, active: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sidebar-foreground">Destaque</Label>
                <Switch checked={prodForm.featured} onCheckedChange={(v) => setProdForm({ ...prodForm, featured: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sidebar-foreground">Publicar agora</Label>
                <Switch checked={prodForm.publish_now} onCheckedChange={(v) => setProdForm({ ...prodForm, publish_now: v })} />
              </div>
            </div>
            <Button onClick={saveProd} disabled={saving} className="w-full gradient-primary">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Salvar Produto
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
