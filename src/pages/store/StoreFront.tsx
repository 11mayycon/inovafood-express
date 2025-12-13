import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Star, UtensilsCrossed } from "lucide-react";

export default function StoreFront() {
  const { slug } = useParams();
  const { itemCount } = useCart();
  const [tenant, setTenant] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    if (slug) fetchData();
  }, [slug]);

  const fetchData = async () => {
    const { data: t } = await supabase.from("tenants").select("*").eq("slug", slug).single();
    if (t) {
      setTenant(t);
      const [cats, prods, bans, sets] = await Promise.all([
        supabase.from("categories").select("*").eq("tenant_id", t.id).eq("published", true).order("sort_order"),
        supabase.from("products").select("*").eq("tenant_id", t.id).eq("active", true).not("published_at", "is", null),
        supabase.from("banners").select("*").eq("tenant_id", t.id).eq("published", true).order("sort_order"),
        supabase.from("settings").select("*").eq("tenant_id", t.id).maybeSingle()
      ]);
      setCategories(cats.data || []);
      setProducts(prods.data || []);
      setBanners(bans.data || []);
      setSettings(sets.data);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || p.category_id === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (!tenant) return <div className="min-h-screen gradient-dark flex items-center justify-center text-sidebar-foreground">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">{tenant.name}</span>
          </div>
          <Link to={`/r/${slug}/cart`}>
            <Button variant="outline" className="relative">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full gradient-primary text-xs flex items-center justify-center text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </header>

      {!settings?.is_open && (
        <div className="bg-destructive/20 text-destructive text-center py-3 font-medium">
          Loja fechada no momento
        </div>
      )}

      {/* Banners */}
      {banners.length > 0 && (
        <div className="overflow-x-auto flex gap-4 p-4">
          {banners.map(b => (
            <div key={b.id} className="flex-shrink-0 w-80 h-40 rounded-xl overflow-hidden">
              <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="container py-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar produtos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {/* Categories */}
      <div className="container overflow-x-auto flex gap-2 pb-4">
        <Button variant={!activeCategory ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(null)}>Todos</Button>
        {categories.map(c => (
          <Button key={c.id} variant={activeCategory === c.id ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(c.id)}>
            {c.name}
          </Button>
        ))}
      </div>

      {/* Products */}
      <div className="container pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(p => (
            <Link key={p.id} to={`/r/${slug}/product/${p.id}`} className="group">
              <div className="bg-card rounded-xl overflow-hidden border hover:shadow-lg transition-shadow">
                <div className="relative h-32 bg-muted">
                  {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                  {p.featured && (
                    <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <Star className="w-3 h-3" /> Destaque
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium truncate">{p.name}</h3>
                  <p className="text-lg font-bold text-primary">R$ {Number(p.price).toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
