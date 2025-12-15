import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Star, UtensilsCrossed, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";

const categoryIcons: Record<string, string> = {
  "Hambúrgueres": "🍔",
  "Pizzas": "🍕",
  "Bebidas": "🥤",
  "Sobremesas": "🍰",
  "Porções": "🍟",
  "Combos": "🎁",
  "Açaí": "🍇",
  "Sushi": "🍣",
  "Massas": "🍝",
  "Saladas": "🥗",
};

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
  const [currentBanner, setCurrentBanner] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slug) fetchData();
  }, [slug]);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

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

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);

  if (!tenant) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <div className="animate-pulse text-sidebar-foreground flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary animate-spin" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b shadow-sm">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20 animate-fade-in">
              <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">{tenant.name}</span>
          </div>
          <Link to={`/r/${slug}/cart`}>
            <Button variant="outline" className="relative hover:scale-105 transition-transform">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full gradient-primary text-xs flex items-center justify-center text-primary-foreground animate-scale-in shadow-lg">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </header>

      {!settings?.is_open && (
        <div className="bg-destructive/20 text-destructive text-center py-3 font-medium animate-fade-in">
          🚫 Loja fechada no momento
        </div>
      )}

      {/* Banners Carousel */}
      {banners.length > 0 && (
        <div className="relative overflow-hidden" ref={bannerRef}>
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentBanner * 100}%)` }}
          >
            {banners.map((b) => (
              <div key={b.id} className="w-full flex-shrink-0">
                <div className="relative h-48 md:h-64 lg:h-80">
                  {b.image_url ? (
                    <img 
                      src={b.image_url} 
                      alt={b.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full gradient-primary flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary-foreground">{b.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-2xl font-bold text-white drop-shadow-lg">{b.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {banners.length > 1 && (
            <>
              <button 
                onClick={prevBanner}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              >
                <ChevronLeft className="w-6 h-6 text-foreground" />
              </button>
              <button 
                onClick={nextBanner}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
              >
                <ChevronRight className="w-6 h-6 text-foreground" />
              </button>
              
              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentBanner(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentBanner ? "w-6 bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Search */}
      <div className="container py-4">
        <div className="relative animate-fade-in">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Buscar produtos..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-12 h-12 rounded-xl border-2 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Categories - Circular Icons */}
      <div className="container overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex flex-col items-center gap-2 transition-all duration-300 ${
              !activeCategory ? "scale-110" : "opacity-70 hover:opacity-100"
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
              !activeCategory 
                ? "gradient-primary shadow-lg shadow-primary/30" 
                : "bg-muted hover:bg-muted/80"
            }`}>
              ✨
            </div>
            <span className={`text-sm font-medium ${!activeCategory ? "text-primary" : "text-muted-foreground"}`}>
              Todos
            </span>
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`flex flex-col items-center gap-2 transition-all duration-300 ${
                activeCategory === c.id ? "scale-110" : "opacity-70 hover:opacity-100"
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
                activeCategory === c.id 
                  ? "gradient-primary shadow-lg shadow-primary/30" 
                  : "bg-muted hover:bg-muted/80"
              }`}>
                {categoryIcons[c.name] || "🍽️"}
              </div>
              <span className={`text-sm font-medium max-w-16 truncate ${
                activeCategory === c.id ? "text-primary" : "text-muted-foreground"
              }`}>
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="container pb-24">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((p, i) => (
            <Link 
              key={p.id} 
              to={`/r/${slug}/product/${p.id}`} 
              className="group animate-fade-in"
              style={{ animationDelay: `${0.05 * i}s` }}
            >
              <div className="bg-card rounded-2xl overflow-hidden border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group-hover:-translate-y-1">
                <div className="relative h-36 md:h-44 bg-muted overflow-hidden">
                  {p.image_url ? (
                    <img 
                      src={p.image_url} 
                      alt={p.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
                  )}
                  {p.featured && (
                    <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg animate-pulse">
                      <Star className="w-3 h-3 fill-current" /> Destaque
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium truncate group-hover:text-primary transition-colors">{p.name}</h3>
                  <p className="text-lg font-bold text-gradient">R$ {Number(p.price).toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-6xl mb-4">🔍</div>
            <p>Nenhum produto encontrado</p>
          </div>
        )}
      </div>

      {/* WhatsApp Bot Mascot */}
      <div className="fixed bottom-6 right-6 z-50 animate-bounce">
        <button className="w-16 h-16 rounded-full gradient-primary shadow-xl shadow-primary/30 flex items-center justify-center hover:scale-110 transition-transform">
          <MessageCircle className="w-8 h-8 text-primary-foreground" />
        </button>
        <div className="absolute -top-12 right-0 bg-card rounded-lg px-3 py-2 shadow-lg text-sm whitespace-nowrap animate-fade-in">
          <span>Precisa de ajuda? 💬</span>
          <div className="absolute bottom-0 right-6 translate-y-1/2 rotate-45 w-2 h-2 bg-card" />
        </div>
      </div>
    </div>
  );
}
