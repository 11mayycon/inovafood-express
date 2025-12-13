import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Minus, ShoppingCart } from "lucide-react";

export default function StoreProduct() {
  const { slug, id } = useParams();
  const { addItem, items, updateQuantity } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => { if (id) fetchProduct(); }, [id]);

  const fetchProduct = async () => {
    const { data } = await supabase.from("products").select("*").eq("id", id).single();
    if (data) {
      setProduct(data);
      const { data: rel } = await supabase.from("products").select("*").eq("category_id", data.category_id).neq("id", id).limit(4);
      setRelated(rel || []);
    }
  };

  const cartItem = items.find(i => i.id === id);

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, price: Number(product.price), image_url: product.image_url }, slug!);
    toast({ title: "Adicionado ao carrinho!" });
  };

  if (!product) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container py-4 flex items-center gap-4">
          <Link to={`/r/${slug}`}><Button variant="ghost" size="icon"><ArrowLeft /></Button></Link>
          <span className="font-semibold">Detalhes</span>
        </div>
      </header>

      <div className="container py-6 space-y-6">
        <div className="h-64 rounded-xl overflow-hidden bg-muted">
          {product.image_url && <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground mt-2">{product.description}</p>
          <p className="text-3xl font-bold text-primary mt-4">R$ {Number(product.price).toFixed(2)}</p>
        </div>

        <div className="flex items-center gap-4">
          {cartItem ? (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => updateQuantity(id!, cartItem.quantity - 1)}><Minus /></Button>
              <span className="text-xl font-bold">{cartItem.quantity}</span>
              <Button variant="outline" size="icon" onClick={() => updateQuantity(id!, cartItem.quantity + 1)}><Plus /></Button>
            </div>
          ) : (
            <Button onClick={handleAdd} className="flex-1 gradient-primary"><ShoppingCart className="mr-2" /> Adicionar</Button>
          )}
        </div>

        {related.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 gap-4">
              {related.map(p => (
                <Link key={p.id} to={`/r/${slug}/product/${p.id}`} className="bg-card rounded-xl overflow-hidden border">
                  <div className="h-24 bg-muted">{p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}</div>
                  <div className="p-2"><h3 className="text-sm font-medium truncate">{p.name}</h3><p className="text-primary font-bold">R$ {Number(p.price).toFixed(2)}</p></div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
