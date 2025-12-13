import { useParams, Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";

export default function StoreCart() {
  const { slug } = useParams();
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Carrinho vazio</h2>
        <Link to={`/r/${slug}`}><Button>Ver Cardápio</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container py-4 flex items-center gap-4">
          <Link to={`/r/${slug}`}><Button variant="ghost" size="icon"><ArrowLeft /></Button></Link>
          <span className="font-semibold">Carrinho ({items.length})</span>
        </div>
      </header>

      <div className="container py-6 space-y-4">
        {items.map(item => (
          <div key={item.id} className="flex gap-4 p-4 bg-card rounded-xl border">
            <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden">
              {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-primary font-bold">R$ {(item.price * item.quantity).toFixed(2)}</p>
              <div className="flex items-center gap-2 mt-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="w-4 h-4" /></Button>
                <span>{item.quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(item.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-card rounded-xl border p-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <Link to={`/r/${slug}`} className="flex-1"><Button variant="outline" className="w-full">Continuar Comprando</Button></Link>
          <Link to={`/r/${slug}/checkout`} className="flex-1"><Button className="w-full gradient-primary">Finalizar Pedido</Button></Link>
        </div>
      </div>
    </div>
  );
}
